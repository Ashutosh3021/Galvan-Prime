"""
core/retrieval/vectorstore.py — Unified ChromaDB / Pinecone vector store interface.

VectorStore wraps both backends behind a single add() / query() API.
In development, only ChromaDB is used.  Pinecone is activated when
PINECONE_API_KEY is set in the environment.

Collections map 1-to-1 with user-defined document collections.
"""

from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass
from typing import Optional

logger = logging.getLogger(__name__)


@dataclass
class SearchResult:
    """A single ranked result from a vector similarity search."""

    chunk_text: str
    source: str
    page: Optional[int]
    score: float
    doc_id: str


# ── ChromaDB backend ──────────────────────────────────────────────────────────


class ChromaStore:
    """
    Thin wrapper around chromadb.Client for a single named collection.
    Each instance manages exactly one Chroma collection.
    """

    def __init__(self, collection_name: str, persist_dir: str = "./chroma_db") -> None:
        import chromadb
        from chromadb.config import Settings as ChromaSettings

        self._client = chromadb.PersistentClient(
            path=persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self._col = self._client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        self.collection_name = collection_name
        logger.info("ChromaStore ready — collection='%s'", collection_name)

    def add(
        self,
        embeddings: list[list[float]],
        texts: list[str],
        metadatas: list[dict],
        ids: Optional[list[str]] = None,
    ) -> list[str]:
        """
        Add vectors to the collection.

        Args:
            embeddings: One embedding per chunk.
            texts:      Corresponding chunk texts.
            metadatas:  Per-chunk metadata dicts (source, page, doc_id, …).
            ids:        Optional explicit IDs; auto-generated if omitted.

        Returns:
            The IDs actually stored.
        """
        if ids is None:
            ids = [str(uuid.uuid4()) for _ in texts]

        self._col.add(
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
            ids=ids,
        )
        return ids

    def query(
        self,
        query_embedding: list[float],
        n_results: int = 5,
    ) -> list[SearchResult]:
        """
        Retrieve the top-k most similar chunks.

        Args:
            query_embedding: Embedding of the query text.
            n_results:       Number of results to return.

        Returns:
            List of SearchResult sorted by descending similarity.
        """
        results = self._col.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            include=["documents", "metadatas", "distances"],
        )

        hits: list[SearchResult] = []
        docs = results["documents"][0]
        metas = results["metadatas"][0]
        dists = results["distances"][0]

        for doc, meta, dist in zip(docs, metas, dists):
            # Chroma uses cosine distance (0 = identical); convert to similarity
            score = 1.0 - dist
            hits.append(
                SearchResult(
                    chunk_text=doc,
                    source=meta.get("source", ""),
                    page=meta.get("page"),
                    score=score,
                    doc_id=meta.get("doc_id", ""),
                )
            )
        return hits

    def delete_by_doc_id(self, doc_id: str) -> None:
        """Remove all chunks that belong to a given document."""
        results = self._col.get(where={"doc_id": doc_id}, include=[])
        ids_to_delete = results.get("ids", [])
        if ids_to_delete:
            self._col.delete(ids=ids_to_delete)
            logger.info(
                "ChromaStore: deleted %d chunks for doc_id=%s",
                len(ids_to_delete),
                doc_id,
            )

    def count(self) -> int:
        """Return total number of vectors in this collection."""
        return self._col.count()


# ── Pinecone backend (optional) ───────────────────────────────────────────────


class PineconeStore:
    """
    Optional Pinecone backend, activated when PINECONE_API_KEY is set.
    Falls back gracefully if the package is unavailable.
    """

    def __init__(self, index_name: str, dimension: int = 384) -> None:
        try:
            from pinecone import Pinecone, ServerlessSpec  # type: ignore
        except ImportError as exc:
            raise ImportError(
                "Install the 'pinecone-client' package to use PineconeStore"
            ) from exc

        from config import get_settings

        s = get_settings()

        pc = Pinecone(api_key=s.pinecone_api_key)

        existing = [i.name for i in pc.list_indexes()]
        if index_name not in existing:
            pc.create_index(
                name=index_name,
                dimension=dimension,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws", region=s.pinecone_environment or "us-east-1"
                ),
            )
            logger.info("PineconeStore: created index '%s'", index_name)

        self._index = pc.Index(index_name)
        self.index_name = index_name
        logger.info("PineconeStore ready — index='%s'", index_name)

    def add(
        self,
        embeddings: list[list[float]],
        texts: list[str],
        metadatas: list[dict],
        ids: Optional[list[str]] = None,
    ) -> list[str]:
        if ids is None:
            ids = [str(uuid.uuid4()) for _ in texts]

        vectors = [
            {"id": vid, "values": emb, "metadata": {**meta, "text": txt}}
            for vid, emb, txt, meta in zip(ids, embeddings, texts, metadatas)
        ]
        self._index.upsert(vectors=vectors)
        return ids

    def query(
        self,
        query_embedding: list[float],
        n_results: int = 5,
    ) -> list[SearchResult]:
        resp = self._index.query(
            vector=query_embedding,
            top_k=n_results,
            include_metadata=True,
        )
        hits: list[SearchResult] = []
        for match in resp.get("matches", []):
            meta = match.get("metadata", {})
            hits.append(
                SearchResult(
                    chunk_text=meta.get("text", ""),
                    source=meta.get("source", ""),
                    page=meta.get("page"),
                    score=match.get("score", 0.0),
                    doc_id=meta.get("doc_id", ""),
                )
            )
        return hits

    def delete_by_doc_id(self, doc_id: str) -> None:
        self._index.delete(filter={"doc_id": {"$eq": doc_id}})
