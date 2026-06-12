"""
core/retrieval/hybrid.py — Hybrid BM25 + vector search with RRF fusion.

Reciprocal Rank Fusion (RRF) is a simple, parameter-free method to merge
two ranked lists.  It outperforms score normalisation in practice because
it's insensitive to the scale differences between BM25 scores (unbounded)
and cosine similarities (0-1).

Pipeline per query:
  1.  Fetch all corpus chunks for the collection from ChromaDB.
  2.  Build an in-memory BM25 index over those chunks.
  3.  Run BM25 retrieval → ranked list A.
  4.  Run vector similarity retrieval  → ranked list B.
  5.  Fuse A and B with RRF → final ranked list.
  6.  Return the top-k SearchResult objects.

The corpus is fetched fresh per query.  For large collections (>50k chunks)
consider caching the BM25 index; for this project scale it's fine as-is.
"""

from __future__ import annotations

import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor

from core.retrieval.vectorstore import ChromaStore, SearchResult

logger = logging.getLogger(__name__)

# RRF constant — standard value; higher = less emphasis on top ranks
_RRF_K = 60

# Thread pool for sync ChromaDB and BM25 calls
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="hybrid")


def _bm25_search(
    corpus_texts: list[str],
    corpus_meta: list[dict],
    query: str,
    n_results: int,
) -> list[tuple[int, float]]:
    """
    Run BM25 retrieval over *corpus_texts*.

    Returns:
        List of (corpus_index, bm25_score) sorted by descending score.
    """
    from rank_bm25 import BM25Okapi

    tokenised_corpus = [t.lower().split() for t in corpus_texts]
    bm25 = BM25Okapi(tokenised_corpus)
    scores = bm25.get_scores(query.lower().split())

    ranked = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)
    return ranked[:n_results]


def _rrf_fuse(
    vector_results: list[SearchResult],
    bm25_ranked: list[tuple[int, float]],
    corpus_texts: list[str],
    corpus_meta: list[dict],
    top_k: int,
) -> list[SearchResult]:
    """
    Merge two ranked lists using Reciprocal Rank Fusion.

    Args:
        vector_results:  Ordered list of vector SearchResults (rank 0 = best).
        bm25_ranked:     List of (corpus_index, score) from BM25 (rank 0 = best).
        corpus_texts:    Full corpus texts (for building BM25 results).
        corpus_meta:     Full corpus metadatas aligned with corpus_texts.
        top_k:           Number of results to return.

    Returns:
        Top-k fused SearchResult objects.
    """
    rrf_scores: dict[str, float] = {}

    # Build a text → SearchResult map from vector results
    vector_map: dict[str, SearchResult] = {r.chunk_text: r for r in vector_results}

    # Accumulate RRF from vector ranking
    for rank, result in enumerate(vector_results):
        key = result.chunk_text
        rrf_scores[key] = rrf_scores.get(key, 0.0) + 1.0 / (_RRF_K + rank + 1)

    # Accumulate RRF from BM25 ranking
    for rank, (idx, _score) in enumerate(bm25_ranked):
        text = corpus_texts[idx]
        rrf_scores[text] = rrf_scores.get(text, 0.0) + 1.0 / (_RRF_K + rank + 1)

    # Sort by fused score descending
    sorted_keys = sorted(rrf_scores, key=lambda k: rrf_scores[k], reverse=True)[:top_k]

    fused: list[SearchResult] = []
    for key in sorted_keys:
        if key in vector_map:
            sr = vector_map[key]
            fused.append(
                SearchResult(
                    chunk_text=sr.chunk_text,
                    source=sr.source,
                    page=sr.page,
                    score=rrf_scores[key],
                    doc_id=sr.doc_id,
                )
            )
        else:
            # BM25-only hit — reconstruct from corpus metadata
            idx = corpus_texts.index(key)
            meta = corpus_meta[idx]
            page_val = meta.get("page", -1)
            fused.append(
                SearchResult(
                    chunk_text=key,
                    source=meta.get("source", ""),
                    page=page_val if page_val != -1 else None,
                    score=rrf_scores[key],
                    doc_id=meta.get("doc_id", ""),
                )
            )
    return fused


async def hybrid_search(
    query: str,
    collection: str,
    query_embedding: list[float],
    persist_dir: str = "./chroma_db",
    top_k: int = 5,
    vector_fetch: int = 20,
) -> list[SearchResult]:
    """
    Perform hybrid BM25 + vector retrieval and return fused top-k results.

    Args:
        query:           Raw query string (used for BM25 tokenisation).
        collection:      ChromaDB collection name to search.
        query_embedding: Pre-computed embedding for vector retrieval.
        persist_dir:     Path to ChromaDB persistence directory.
        top_k:           Number of final fused results to return.
        vector_fetch:    How many candidates to pull from each retriever before
                         fusion (should be > top_k for good recall).

    Returns:
        List of SearchResult, sorted by descending RRF score.
    """
    loop = asyncio.get_event_loop()

    def _run_retrieval():
        store = ChromaStore(collection_name=collection, persist_dir=persist_dir)

        # Guard: if collection has fewer docs than vector_fetch, clamp
        n_docs = store.count()
        if n_docs == 0:
            return [], [], [], []

        effective_fetch = min(vector_fetch, n_docs)

        # ── Vector retrieval ──────────────────────────────────────────────────
        vector_results = store.query(query_embedding, n_results=effective_fetch)

        # ── Fetch full corpus for BM25 (all chunks in collection) ─────────────
        # We limit to 10k for safety; for larger collections a BM25 index cache
        # should be maintained separately.
        raw = store._col.get(
            limit=10_000,
            include=["documents", "metadatas"],
        )
        corpus_texts: list[str] = raw.get("documents") or []
        corpus_meta: list[dict] = raw.get("metadatas") or []

        if not corpus_texts:
            return vector_results, [], [], []

        # ── BM25 retrieval ────────────────────────────────────────────────────
        bm25_ranked = _bm25_search(corpus_texts, corpus_meta, query, n_results=effective_fetch)

        return vector_results, bm25_ranked, corpus_texts, corpus_meta

    vector_results, bm25_ranked, corpus_texts, corpus_meta = await loop.run_in_executor(
        _executor, _run_retrieval
    )

    if not vector_results and not bm25_ranked:
        logger.warning("hybrid_search: collection '%s' is empty", collection)
        return []

    fused = _rrf_fuse(
        vector_results=vector_results,
        bm25_ranked=bm25_ranked,
        corpus_texts=corpus_texts,
        corpus_meta=corpus_meta,
        top_k=top_k,
    )

    logger.info(
        "hybrid_search: collection='%s' query=%r → %d results",
        collection, query[:60], len(fused),
    )
    return fused
