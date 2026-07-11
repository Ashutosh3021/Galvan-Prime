"""
api/routes/query.py — Query endpoint.

POST /query           — run RAG pipeline, return answer + citations
GET  /query/providers — list LLM providers configured for this deployment
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status

from config import get_runtime_setting, get_settings
from core.generation.chain import run_rag_chain
from schemas.query import Citation, ProvidersOut, QueryIn, QueryOut

router = APIRouter(prefix="/query", tags=["query"])
logger = logging.getLogger(__name__)
settings = get_settings()

# Maps each provider to the settings field holding its API key, so we can return
# a clear 422 when the frontend picks a provider this deployment can't use.
_PROVIDER_KEYS = {
    "gemini": "gemini_api_key",
    "openai": "openai_api_key",
    "groq": "groq_api_key",
    "openrouter": "openrouter_api_key",
}


# ── GET /query/providers ───────────────────────────────────────────────────────


@router.get(
    "/providers",
    response_model=ProvidersOut,
    summary="List LLM providers available for this deployment",
)
async def list_providers() -> ProvidersOut:
    available = [
        name
        for name in ("gemini", "openai", "openrouter", "groq")
        if getattr(settings, f"{name}_api_key", "")
    ]
    default = get_runtime_setting("llm_provider") or (
        settings.llm_provider if settings.llm_provider in available else (available[0] if available else None)
    )
    models = {name: getattr(settings, f"{name}_model", "") for name in available}
    return ProvidersOut(default=default, available=available, models=models)


# ── POST /query ────────────────────────────────────────────────────────────────


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
    if body.provider and not getattr(settings, _PROVIDER_KEYS[body.provider], ""):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"LLM provider '{body.provider}' is not configured on this server (missing API key).",
        )

    try:
        result = await run_rag_chain(
            question=body.question,
            collection=body.collection,
            session_id=body.session_id,
            provider=body.provider,
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
