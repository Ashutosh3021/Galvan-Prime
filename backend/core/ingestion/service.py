"""
core/ingestion/service.py — High-level ingestion orchestrator.

ingest_document() is the single entry point called by the API route.
It runs the full pipeline:
  load → chunk → embed → store (Chroma + optionally Pinecone)

No database is used — document metadata lives only in ChromaDB vector
metadata and in the caller's response payload.
"""

from __future__ import annotations

import asyncio
import datetime
import logging
import uuid
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from typing import Literal, Optional

from config import get_settings
from core.embeddings.encoder import get_encoder
from core.ingestion.chunkers import Chunk, fixed_chunk, semantic_chunk
from core.ingestion.loaders import RawPage, load_pdf, load_text, load_url
from core.retrieval.vectorstore import ChromaStore
from schemas.ingest import CollectionOut, IngestOut

logger = logging.getLogger(__name__)
settings = get_settings()

_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="embed")

ChunkStrategy = Literal["fixed", "semantic"]
SourceType = Literal["pdf", "url", "txt"]


async def ingest_document(
    *,
    file_bytes: Optional[bytes],
    filename: str,
    source_type: SourceType,
    collection: str,
    chunk_strategy: ChunkStrategy,
    url: Optional[str] = None,
) -> IngestOut:
    """
    Run the full ingestion pipeline and return an IngestOut payload.

    Steps:
      1. Load raw text from the source.
      2. Chunk the text.
      3. Embed chunks (in a thread pool to keep the event loop free).
      4. Store embeddings in ChromaDB (and Pinecone if configured).

    Args:
        file_bytes:     Raw bytes for pdf/txt uploads; None for URL sources.
        filename:       Display name (original upload filename or derived URL name).
        source_type:    One of 'pdf', 'url', 'txt'.
        collection:     Collection name to store vectors under.
        chunk_strategy: 'fixed' or 'semantic'.
        url:            URL to scrape; required when source_type='url'.

    Returns:
        IngestOut with doc metadata and chunk count.

    Raises:
        ValueError: On loader errors (bad PDF, unreachable URL, empty file).
    """
    doc_id = str(uuid.uuid4())
    ingested_at = datetime.datetime.now(datetime.timezone.utc)

    # ── 1. Load ───────────────────────────────────────────────────────────────
    pages: list[RawPage]
    if source_type == "pdf":
        pages = load_pdf(file_bytes, filename)
    elif source_type == "url":
        if not url:
            raise ValueError("url is required for source_type='url'")
        pages = load_url(url)
    else:  # txt
        pages = load_text(file_bytes, filename)

    if not pages:
        raise ValueError("No text could be extracted from the provided source")

    # ── 2. Chunk ──────────────────────────────────────────────────────────────
    if chunk_strategy == "fixed":
        chunks: list[Chunk] = fixed_chunk(pages)
    else:
        chunks = semantic_chunk(pages)

    if not chunks:
        raise ValueError("Chunking produced no output — check source content")

    chunk_texts = [c.text for c in chunks]

    # ── 3. Embed (thread pool) ────────────────────────────────────────────────
    encoder = get_encoder()
    loop = asyncio.get_event_loop()
    embeddings: list[list[float]] = await loop.run_in_executor(
        _executor,
        partial(encoder.encode, chunk_texts),
    )

    # ── 4. Store in ChromaDB ──────────────────────────────────────────────────
    store = ChromaStore(
        collection_name=collection,
        persist_dir=settings.chroma_persist_dir,
    )
    metadatas = [
        {
            "source": c.source,
            "page": c.page if c.page is not None else -1,
            "doc_id": doc_id,
            "chunk_strategy": chunk_strategy,
        }
        for c in chunks
    ]
    store.add(embeddings=embeddings, texts=chunk_texts, metadatas=metadatas)

    # Pinecone (optional — only if key is configured)
    if settings.pinecone_api_key:
        try:
            from core.retrieval.vectorstore import PineconeStore

            pine = PineconeStore(
                index_name=collection,
                dimension=encoder.dimension,
            )
            pine.add(embeddings=embeddings, texts=chunk_texts, metadatas=metadatas)
        except Exception as exc:
            logger.warning("Pinecone ingestion failed (non-fatal): %s", exc)

    logger.info(
        "Ingestion complete: doc_id=%s collection='%s' chunks=%d",
        doc_id,
        collection,
        len(chunks),
    )

    return IngestOut(
        doc_id=uuid.UUID(doc_id),
        filename=filename,
        collection=collection,
        chunk_count=len(chunks),
        chunk_strategy=chunk_strategy,
        status="ready",
        ingested_at=ingested_at,
    )


def get_collections(persist_dir: str) -> list[dict]:
    """
    Return collection stats by querying ChromaDB directly.

    Returns a list of dicts with keys: name, doc_count, chunk_count, created_at.
    doc_count is approximated by counting distinct doc_id values in metadata.
    """
    import chromadb
    from chromadb.config import Settings as CS

    client = chromadb.PersistentClient(
        path=persist_dir,
        settings=CS(anonymized_telemetry=False),
    )

    result = []
    for col in client.list_collections():
        chroma_col = client.get_collection(col.name)
        data = chroma_col.get(include=["metadatas"])
        metadatas = data.get("metadatas") or []

        # Count distinct doc_ids
        doc_ids = {m.get("doc_id") for m in metadatas if m and m.get("doc_id")}

        result.append(
            {
                "name": col.name,
                "doc_count": len(doc_ids),
                "chunk_count": len(metadatas),
                "created_at": datetime.datetime.now(datetime.timezone.utc),
            }
        )

    return sorted(result, key=lambda x: x["name"])
