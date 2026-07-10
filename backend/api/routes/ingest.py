"""
api/routes/ingest.py — Document ingestion endpoints.

POST   /ingest                — upload a file (PDF/TXT) or provide a URL
GET    /ingest/collections    — list collections stored in ChromaDB
DELETE /ingest/{doc_id}       — delete a document's vectors from ChromaDB
"""

from __future__ import annotations

import uuid
from typing import Literal, Optional

from fastapi import (
    APIRouter,
    BackgroundTasks,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)

from config import get_settings
from core.ingestion.service import get_collections, get_documents, ingest_document
from core.retrieval.vectorstore import ChromaStore
from schemas.ingest import CollectionOut, DocumentOut, IngestOut

router = APIRouter(prefix="/ingest", tags=["ingest"])
settings = get_settings()

_ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "text/plain": "txt",
    "text/csv": "txt",
}
_MAX_UPLOAD_BYTES = settings.max_upload_bytes


# ── POST /ingest ──────────────────────────────────────────────────────────────


@router.post(
    "",
    response_model=IngestOut,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest a document (PDF/TXT upload or URL)",
)
async def ingest(
    background_tasks: BackgroundTasks,
    collection: str = Form(
        ..., min_length=1, max_length=128, description="Target collection name"
    ),
    chunk_strategy: Literal["fixed", "semantic"] = Form("fixed"),
    file: Optional[UploadFile] = File(None, description="PDF or TXT file to upload"),
    url: Optional[str] = Form(
        None, description="URL to scrape (alternative to file upload)"
    ),
) -> IngestOut:
    """
    Upload a PDF/TXT file **or** provide a URL.  Exactly one must be supplied.
    """
    if file is None and not url:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide either 'file' or 'url'",
        )
    if file is not None and url:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide either 'file' or 'url', not both",
        )

    # ── Determine source type ─────────────────────────────────────────────────
    file_bytes: Optional[bytes] = None
    filename: str
    source_type: Literal["pdf", "url", "txt"]

    if url:
        source_type = "url"
        filename = url[:255]
    else:
        content_type = (file.content_type or "").split(";")[0].strip().lower()
        if content_type not in _ALLOWED_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file type '{content_type}'. Allowed: PDF, TXT",
            )
        source_type = _ALLOWED_TYPES[content_type]  # type: ignore[assignment]
        file_bytes = await file.read()
        if len(file_bytes) > _MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File exceeds the 50 MB limit",
            )
        filename = file.filename or "upload"

    # ── Run ingestion ─────────────────────────────────────────────────────────
    try:
        result = await ingest_document(
            file_bytes=file_bytes,
            filename=filename,
            source_type=source_type,
            collection=collection,
            chunk_strategy=chunk_strategy,
            url=url or None,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        )

    return result


# ── GET /ingest/collections ───────────────────────────────────────────────────


@router.get(
    "/collections",
    response_model=list[CollectionOut],
    summary="List all collections",
)
async def list_collections() -> list[CollectionOut]:
    rows = get_collections(persist_dir=settings.chroma_persist_dir)
    return [CollectionOut(**row) for row in rows]


# ── GET /ingest/documents ──────────────────────────────────────────────────


@router.get(
    "/documents",
    response_model=list[DocumentOut],
    summary="List documents with real doc_id/source from ChromaDB",
)
async def list_documents(collection: Optional[str] = None) -> list[DocumentOut]:
    rows = get_documents(persist_dir=settings.chroma_persist_dir, collection=collection)
    return [DocumentOut(**row) for row in rows]


# ── DELETE /ingest/{doc_id} ───────────────────────────────────────────────────


@router.delete(
    "/{doc_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    summary="Delete a document's vectors from ChromaDB",
)
async def delete_document(
    doc_id: uuid.UUID,
    collection: str,
) -> None:
    try:
        store = ChromaStore(
            collection_name=collection,
            persist_dir=settings.chroma_persist_dir,
        )
        store.delete_by_doc_id(str(doc_id))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not delete vectors: {exc}",
        )
