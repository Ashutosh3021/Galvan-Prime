"""
api/routes/query.py — Query endpoint.

POST /query — run RAG pipeline, return answer + citations
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status

from core.generation.chain import run_rag_chain
from schemas.query import Citation, QueryIn, QueryOut

router = APIRouter(prefix="/query", tags=["query"])
logger = logging.getLogger(__name__)


# ── POST /query ───────────────────────────────────────────────────────────────


@router.post(
    "",
    response_model=QueryOut,
    summary="Ask a question against an ingested collection",
)
async def query(body: QueryIn) -> QueryOut:
    """
    Run the full RAG pipeline (hybrid search → LLM → citations) and return
    the answer, source citations, session_id, and latency.
    """
    try:
        result = await run_rag_chain(
            question=body.question,
            collection=body.collection,
            session_id=body.session_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception as exc:
        logger.exception("RAG chain error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your query",
        )

    return QueryOut(
        answer=result.answer,
        citations=[Citation(source=c.source, page=c.page, chunk=c.chunk) for c in result.citations],
        session_id=result.session_id,
        latency_ms=result.latency_ms,
    )
