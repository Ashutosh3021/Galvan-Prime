"""
api/routes/query.py — Query endpoints (Phase 4).

POST /query                        — run RAG pipeline, return answer + citations
GET  /query/history/{session_id}   — return conversation history from DB
"""

from __future__ import annotations

import json
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.deps import get_current_user, get_db
from core.generation.chain import run_rag_chain
from db.models.query_log import QueryLog
from db.models.user import User
from schemas.query import Citation, HistoryOut, QueryIn, QueryOut

router = APIRouter(prefix="/query", tags=["query"])
logger = logging.getLogger(__name__)


# ── POST /query ───────────────────────────────────────────────────────────────


@router.post(
    "",
    response_model=QueryOut,
    summary="Ask a question against an ingested collection",
)
async def query(
    body: QueryIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> QueryOut:
    """
    Run the full RAG pipeline (hybrid search → LLM → citations) and
    persist both the user question and assistant answer in QueryLog.

    Returns the answer, source citations, session_id, and latency.
    """
    # ── Run chain ─────────────────────────────────────────────────────────────
    try:
        result = await run_rag_chain(
            question=body.question,
            collection=body.collection,
            session_id=body.session_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except RuntimeError as exc:
        # LLM not configured
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception as exc:
        logger.exception("RAG chain error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your query",
        )

    # ── Serialise citations for DB storage ────────────────────────────────────
    citations_json = [
        {"source": c.source, "page": c.page, "chunk": c.chunk} for c in result.citations
    ]

    # ── Persist user turn ─────────────────────────────────────────────────────
    db.add(
        QueryLog(
            user_id=current_user.id,
            session_id=body.session_id,
            role="user",
            content=body.question,
            citations=None,
            latency_ms=None,
        )
    )

    # ── Persist assistant turn ────────────────────────────────────────────────
    db.add(
        QueryLog(
            user_id=current_user.id,
            session_id=body.session_id,
            role="assistant",
            content=result.answer,
            citations=citations_json,
            latency_ms=result.latency_ms,
        )
    )

    await db.flush()

    return QueryOut(
        answer=result.answer,
        citations=[Citation(source=c.source, page=c.page, chunk=c.chunk) for c in result.citations],
        session_id=result.session_id,
        latency_ms=result.latency_ms,
    )


# ── GET /query/history/{session_id} ──────────────────────────────────────────


@router.get(
    "/history/{session_id}",
    response_model=list[HistoryOut],
    summary="Get conversation history for a session",
)
async def get_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[HistoryOut]:
    """
    Return all QueryLog entries for a session, oldest first.
    Only the authenticated user's own sessions are accessible.
    """
    result = await db.execute(
        select(QueryLog)
        .where(
            QueryLog.user_id == current_user.id,
            QueryLog.session_id == session_id,
        )
        .order_by(QueryLog.created_at.asc())
    )
    rows = result.scalars().all()

    history: list[HistoryOut] = []
    for row in rows:
        # Deserialise citations from JSON storage
        cits: list[Citation] | None = None
        if row.citations:
            raw = row.citations if isinstance(row.citations, list) else json.loads(row.citations)
            cits = [Citation(**c) for c in raw]

        history.append(
            HistoryOut(
                role=row.role,  # type: ignore[arg-type]
                content=row.content,
                citations=cits,
                created_at=row.created_at,
            )
        )
    return history
