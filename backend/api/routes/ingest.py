"""
api/routes/ingest.py — Document ingestion endpoints.

POST   /ingest                — upload a file (PDF/TXT) or provide a URL
GET    /ingest/collections    — list collections with stats for the current user
DELETE /ingest/{doc_id}       — delete a document and its vectors
"""

from __future__ import annotations

import uuid
from typing import Literal, Optional

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.deps import get_current_user, get_db
from config import get_settings
from core.ingestion.service import get_collections, ingest_document
from core.retrieval.vectorstore import ChromaStore
from db.models.document import Document
from db.models.user import User
from schemas.ingest import CollectionOut, IngestOut

router = APIRouter(prefix="/ingest", tags=["ingest"])
settings = get_settings()

_ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "text/plain": "txt",
    "text/csv": "txt",
}
_MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB


# ── POST /ingest ──────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=IngestOut,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest a document (PDF/TXT upload or URL)",
)
async def ingest(
    background_tasks: BackgroundTasks,
    collection: str = Form(..., min_length=1, max_length=128, description="Target collection name"),
    chunk_strategy: Literal["fixed", "semantic"] = Form("fixed"),
    file: Optional[UploadFile] = File(None, description="PDF or TXT file to upload"),
    url: Optional[str] = Form(None, description="URL to scrape (alternative to file upload)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> IngestOut:
    """
    Upload a PDF/TXT file **or** provide a URL.  Exactly one must be supplied.

    The document is processed synchronously in this request.  For large files
    (>10 MB) consider wrapping this in a background task — the architecture
    supports it via BackgroundTasks.
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
        doc = await ingest_document(
            db=db,
            user_id=current_user.id,
            file_bytes=file_bytes,
            filename=filename,
            source_type=source_type,
            collection=collection,
            chunk_strategy=chunk_strategy,
            url=url or None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))

    return IngestOut(
        doc_id=doc.id,
        filename=doc.filename,
        collection=doc.collection,
        chunk_count=doc.chunk_count,
        chunk_strategy=doc.chunk_strategy,  # type: ignore[arg-type]
        status=doc.status,                  # type: ignore[arg-type]
        ingested_at=doc.ingested_at,
    )


# ── GET /ingest/collections ───────────────────────────────────────────────────

@router.get(
    "/collections",
    response_model=list[CollectionOut],
    summary="List all collections for the current user",
)
async def list_collections(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CollectionOut]:
    rows = await get_collections(user_id=current_user.id, db=db)
    return [CollectionOut(**row) for row in rows]


# ── DELETE /ingest/{doc_id} ───────────────────────────────────────────────────

@router.delete(
    "/{doc_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    summary="Delete a document and its vectors",
)
async def delete_document(
    doc_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(Document).where(
            Document.id == doc_id,
            Document.user_id == current_user.id,
        )
    )
    doc: Document | None = result.scalar_one_or_none()

    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    # Remove vectors from ChromaDB
    try:
        store = ChromaStore(
            collection_name=doc.collection,
            persist_dir=settings.chroma_persist_dir,
        )
        store.delete_by_doc_id(str(doc.id))
    except Exception as exc:
        # Non-fatal: log and continue with DB deletion
        import logging
        logging.getLogger(__name__).warning("Vector deletion failed: %s", exc)

    await db.delete(doc)
    await db.flush()
