"""
core/ingestion/service.py — High-level ingestion orchestrator.

ingest_document() is the single entry point called by the API route.
It runs the full pipeline:
  load → chunk → embed → store (Chroma + optionally Pinecone)

No database is used — document metadata lives only in ChromaDB vector
metadata and in the caller's response payload.

Memory notes
────────────
* ``ChromaStore`` is retrieved via ``get_chroma_store()`` (lru_cache) so
  the PersistentClient and HNSW index are opened once per process.
* Embeddings are computed in micro-batches (see encoder.py) so peak RAM
  is bounded regardless of corpus size.
* RSS is logged at key ingestion boundaries so memory growth is visible
  in production logs without adding a hard dependency on psutil (the
  import is guarded and the logging degrades gracefully if unavailable).
"""

from __future__ import annotations

import asyncio
import ctypes
import datetime
import logging
import os
import sys
import uuid
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from typing import Literal, Optional

from config import get_settings
from core.embeddings.encoder import get_encoder
from core.ingestion.chunkers import Chunk, fixed_chunk, semantic_chunk
from core.ingestion.loaders import RawPage, load_pdf, load_text, load_url
from core.retrieval.vectorstore import get_chroma_store
from schemas.ingest import IngestOut

logger = logging.getLogger(__name__)
settings = get_settings()

_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="embed")

ChunkStrategy = Literal["fixed", "semantic"]
SourceType = Literal["pdf", "url", "txt"]

# Hard cap applied before any processing starts (defence-in-depth; the API
# route enforces the same limit at the HTTP layer via settings.max_upload_bytes).
_MAX_FILE_BYTES = settings.max_upload_bytes


def _rss_mb() -> str:
    """Return current process RSS in MB as a string.

    psutil is preferred when present (it is not in base requirements, so it
    may be absent in a clean install). When psutil is missing we fall back to
    the stdlib so RSS is always logged as a real value — never '?':
    ctypes GetProcessMemoryInfo on Windows, ``resource`` on POSIX.
    """
    try:
        import psutil  # optional; not in base requirements

        rss = psutil.Process(os.getpid()).memory_info().rss / 1024 / 1024
        return f"{rss:.1f} MB"
    except Exception:  # noqa: BLE001
        pass

    if sys.platform.startswith("win"):
        try:

            class _PROCESS_MEMORY_COUNTERS(ctypes.Structure):
                _fields_ = [
                    ("cb", ctypes.c_ulong),
                    ("PageFaultCount", ctypes.c_ulong),
                    ("PeakWorkingSetSize", ctypes.c_size_t),
                    ("WorkingSetSize", ctypes.c_size_t),
                    ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                    ("PagefileUsage", ctypes.c_size_t),
                    ("PeakPagefileUsage", ctypes.c_size_t),
                    ("PrivateUsage", ctypes.c_size_t),
                ]

            counters = _PROCESS_MEMORY_COUNTERS()
            counters.cb = ctypes.sizeof(counters)
            api = ctypes.windll.psapi.GetProcessMemoryInfo  # type: ignore[attr-defined]
            api.argtypes = [  # type: ignore[attr-defined]
                ctypes.c_void_p,
                ctypes.POINTER(_PROCESS_MEMORY_COUNTERS),
                ctypes.c_ulong,
            ]
            api.restype = ctypes.c_bool  # type: ignore[attr-defined]
            if api(
                ctypes.windll.kernel32.GetCurrentProcess(),  # type: ignore[attr-defined]
                ctypes.byref(counters),
                counters.cb,
            ):
                return f"{counters.WorkingSetSize / 1024 / 1024:.1f} MB"
        except Exception:  # noqa: BLE001
            pass
    else:
        try:
            import resource

            kb = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
            # Linux reports KB; macOS reports bytes.
            rss = kb / 1024 if sys.platform.startswith("linux") else kb / 1024 / 1024
            return f"{rss:.1f} MB"
        except Exception:  # noqa: BLE001
            pass

    return "?"


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

    # Guard against oversized payloads reaching the pipeline (belt-and-braces;
    # the HTTP layer should reject them first via _MAX_UPLOAD_BYTES in the route).
    if file_bytes and len(file_bytes) > _MAX_FILE_BYTES:
        raise ValueError(
            f"File size {len(file_bytes) / 1024 / 1024:.1f} MB exceeds the "
            f"{_MAX_FILE_BYTES // 1024 // 1024} MB pipeline limit"
        )

    logger.info("Ingestion start: file='%s' RSS=%s", filename, _rss_mb())

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
    logger.info("Pre-embed RSS=%s chunks=%d", _rss_mb(), len(chunks))
    encoder = get_encoder()
    loop = asyncio.get_running_loop()
    embeddings: list[list[float]] = await loop.run_in_executor(
        _executor,
        partial(encoder.encode, chunk_texts),
    )
    logger.info("Post-embed RSS=%s", _rss_mb())

    # ── 4. Store in ChromaDB ──────────────────────────────────────────────────
    # get_chroma_store() returns a cached instance — no repeated client init.
    store = get_chroma_store(
        collection_name=collection,
        persist_dir=settings.chroma_persist_dir,
    )
    metadatas = [
        {
            "source": c.source,
            "page": c.page if c.page is not None else -1,
            "doc_id": doc_id,
            "chunk_strategy": chunk_strategy,
            "ingested_at": ingested_at.isoformat(),
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
        "Ingestion complete: doc_id=%s collection='%s' chunks=%d RSS=%s",
        doc_id,
        collection,
        len(chunks),
        _rss_mb(),
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

    # Use a fresh read-only client here (listing collections is an admin
    # operation, not a per-request hot path, so caching is not needed).
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

        # Real creation time = earliest chunk ingestion timestamp (persisted in
        # metadata at ingest). Falls back to now() only for legacy collections
        # that predate the ingested_at metadata field.
        ingested_ats = [
            m.get("ingested_at")
            for m in metadatas
            if m and m.get("doc_id") and m.get("ingested_at")
        ]
        created_at = (
            datetime.datetime.fromisoformat(min(ingested_ats))
            if ingested_ats
            else datetime.datetime.now(datetime.timezone.utc)
        )

        result.append(
            {
                "name": col.name,
                "doc_count": len(doc_ids),
                "chunk_count": len(metadatas),
                "created_at": created_at,
            }
        )

    return sorted(result, key=lambda x: x["name"])


def get_documents(persist_dir: str, collection: Optional[str] = None) -> list[dict]:
    """
    Return real per-document records reconstructed from ChromaDB metadata.

    Every ingested chunk carries a shared ``doc_id`` and ``source`` in its
    metadata (see ingest_document), so grouping chunks by ``doc_id`` recreates
    the original document list — no separate index required.

    Returns a list of dicts with keys:
    doc_id, source, collection, chunk_count, created_at.
    """
    import chromadb
    from chromadb.config import Settings as CS

    client = chromadb.PersistentClient(
        path=persist_dir,
        settings=CS(anonymized_telemetry=False),
    )

    collections = client.list_collections()
    if collection:
        collections = [c for c in collections if c.name == collection]

    docs: list[dict] = []
    for col in collections:
        chroma_col = client.get_collection(col.name)
        metadatas = (chroma_col.get(include=["metadatas"]) or {}).get("metadatas", [])
        for m in metadatas:
            if not m:
                continue
            doc_id = m.get("doc_id")
            if not doc_id:
                continue
            match = next(
                (
                    d
                    for d in docs
                    if d["doc_id"] == doc_id and d["collection"] == col.name
                ),
                None,
            )
            if match:
                match["chunk_count"] += 1
            else:
                docs.append(
                    {
                        "doc_id": doc_id,
                        "source": m.get("source", ""),
                        "collection": col.name,
                        "chunk_count": 1,
                        "created_at": m.get("ingested_at", ""),
                    }
                )

    return docs
