"""
core/ingestion/service.py — High-level ingestion orchestrator.

ingest_document() is the single entry point called by the API route.
It runs the full pipeline:
  load → chunk → embed → store (Chroma + optionally Pinecone) → update DB

The function is async so it can be awaited in a FastAPI background task;
the CPU-heavy encode step is offloaded to a thread pool executor to avoid
blocking the event loop.
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from typing import Literal, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from config import get_settings
from core.embeddings.encoder import get_encoder
from core.ingestion.chunkers import Chunk, fixed_chunk, semantic_chunk
from core.ingestion.loaders import RawPage, load_pdf, load_text, load_url
from core.retrieval.vectorstore import ChromaStore
from db.models.document import Document

logger = logging.getLogger(__name__)
settings = get_settings()

# Thread pool for CPU-bound embedding work
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="embed")

ChunkStrategy = Literal["fixed", "semantic"]
SourceType = Literal["pdf", "url", "txt"]


async def ingest_document(
    *,
    db: AsyncSession,
    user_id: uuid.UUID,
    file_bytes: Optional[bytes],
    filename: str,
    source_type: SourceType,
    collection: str,
    chunk_strategy: ChunkStrategy,
    url: Optional[str] = None,
) -> Document:
    """
    Run the full ingestion pipeline and return the completed Document row.

    Steps:
      1. Create a Document row with status='processing'.
      2. Load raw text from the source.
      3. Chunk the text.
      4. Embed chunks (in a thread pool to keep the event loop free).
      5. Store embeddings in ChromaDB (and Pinecone if configured).
      6. Update Document.status → 'ready' and chunk_count.

    Args:
        db:             Async SQLAlchemy session.
        user_id:        Owning user's UUID.
        file_bytes:     Raw bytes for pdf/txt uploads; None for URL sources.
        filename:       Display name (original upload filename or derived URL name).
        source_type:    One of 'pdf', 'url', 'txt'.
        collection:     Collection name to store vectors under.
        chunk_strategy: 'fixed' or 'semantic'.
        url:            URL to scrape; required when source_type='url'.

    Returns:
        The finalised Document ORM instance.

    Raises:
        ValueError: On loader errors (bad PDF, unreachable URL, empty file).
    """
    doc_id = str(uuid.uuid4())

    # ── 1. Persist Document row (processing) ─────────────────────────────────
    doc = Document(
        id=uuid.UUID(doc_id),
        user_id=user_id,
        filename=filename,
        collection=collection,
        source_type=source_type,
        chunk_strategy=chunk_strategy,
        chunk_count=0,
        status="processing",
    )
    db.add(doc)
    await db.flush()

    try:
        # ── 2. Load ───────────────────────────────────────────────────────────
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

        # ── 3. Chunk ──────────────────────────────────────────────────────────
        if chunk_strategy == "fixed":
            chunks: list[Chunk] = fixed_chunk(pages)
        else:
            chunks = semantic_chunk(pages)

        if not chunks:
            raise ValueError("Chunking produced no output — check source content")

        chunk_texts = [c.text for c in chunks]

        # ── 4. Embed (thread pool) ────────────────────────────────────────────
        encoder = get_encoder()
        loop = asyncio.get_event_loop()
        embeddings: list[list[float]] = await loop.run_in_executor(
            _executor,
            partial(encoder.encode, chunk_texts),
        )

        # ── 5. Store in ChromaDB ──────────────────────────────────────────────
        store = ChromaStore(
            collection_name=collection,
            persist_dir=settings.chroma_persist_dir,
        )
        metadatas = [
            {
                "source": c.source,
                "page": c.page if c.page is not None else -1,
                "doc_id": doc_id,
                "user_id": str(user_id),
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

        # ── 6. Finalise Document row ──────────────────────────────────────────
        doc.chunk_count = len(chunks)
        doc.status = "ready"
        db.add(doc)
        await db.flush()

        logger.info(
            "Ingestion complete: doc_id=%s collection='%s' chunks=%d",
            doc_id,
            collection,
            len(chunks),
        )

    except Exception as exc:
        logger.error("Ingestion failed for doc_id=%s: %s", doc_id, exc)
        doc.status = "failed"
        db.add(doc)
        await db.flush()
        raise

    return doc


async def get_collections(user_id: uuid.UUID, db: AsyncSession) -> list[dict]:
    """
    Return aggregated collection stats for a user.

    Returns a list of dicts with keys: name, doc_count, chunk_count, created_at.
    """
    from sqlalchemy import func as sqlfunc

    result = await db.execute(
        select(
            Document.collection,
            sqlfunc.count(Document.id).label("doc_count"),
            sqlfunc.sum(Document.chunk_count).label("chunk_count"),
            sqlfunc.min(Document.ingested_at).label("created_at"),
        )
        .where(Document.user_id == user_id, Document.status == "ready")
        .group_by(Document.collection)
        .order_by(Document.collection)
    )

    return [
        {
            "name": row.collection,
            "doc_count": row.doc_count,
            "chunk_count": int(row.chunk_count or 0),
            "created_at": row.created_at,
        }
        for row in result.all()
    ]
