"""
api/routes/status.py — System health / status endpoint.

GET /status — returns health of the API and downstream services
              (ChromaDB, Pinecone, LLM).

Each service probe is run with a timeout; a failed probe marks that
service as 'down' but does NOT crash the endpoint — the API itself
stays up and reports 'degraded'.
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Literal

from fastapi import APIRouter

from config import get_settings
from schemas.status import ServiceStatus, StatusOut

router = APIRouter(prefix="/status", tags=["status"])
logger = logging.getLogger(__name__)
settings = get_settings()

_START_TIME = time.monotonic()
_API_VERSION = "1.0.0"
_PROBE_TIMEOUT = 3.0  # seconds per probe


# ── Probe helpers ─────────────────────────────────────────────────────────────


async def _probe_chroma() -> ServiceStatus:
    t0 = time.monotonic()
    try:

        def _check():
            import chromadb
            from chromadb.config import Settings as CS

            client = chromadb.PersistentClient(
                path=settings.chroma_persist_dir,
                settings=CS(anonymized_telemetry=False),
            )
            client.heartbeat()

        await asyncio.wait_for(
            asyncio.get_running_loop().run_in_executor(None, _check),
            timeout=_PROBE_TIMEOUT,
        )
        latency = int((time.monotonic() - t0) * 1000)
        return ServiceStatus(name="chromadb", status="healthy", latency_ms=latency)
    except Exception as exc:
        logger.warning("ChromaDB probe failed: %s", exc)
        return ServiceStatus(name="chromadb", status="down", latency_ms=None)


async def _probe_pinecone() -> ServiceStatus:
    if not settings.pinecone_api_key:
        return ServiceStatus(name="pinecone", status="degraded", latency_ms=None)
    t0 = time.monotonic()
    try:

        def _check():
            from pinecone import Pinecone  # type: ignore

            pc = Pinecone(api_key=settings.pinecone_api_key)
            pc.list_indexes()

        await asyncio.wait_for(
            asyncio.get_running_loop().run_in_executor(None, _check),
            timeout=_PROBE_TIMEOUT,
        )
        latency = int((time.monotonic() - t0) * 1000)
        return ServiceStatus(name="pinecone", status="healthy", latency_ms=latency)
    except Exception as exc:
        logger.warning("Pinecone probe failed: %s", exc)
        return ServiceStatus(name="pinecone", status="down", latency_ms=None)


async def _probe_llm() -> ServiceStatus:
    has_key = bool(settings.gemini_api_key or settings.openai_api_key)
    s: Literal["healthy", "degraded"] = "healthy" if has_key else "degraded"
    return ServiceStatus(name="llm", status=s, latency_ms=None)


# ── GET /status ───────────────────────────────────────────────────────────────


@router.get(
    "",
    response_model=StatusOut,
    summary="System health status",
)
async def get_status() -> StatusOut:
    """
    Run all service probes concurrently and return a consolidated health report.
    """
    results = await asyncio.gather(
        _probe_chroma(),
        _probe_pinecone(),
        _probe_llm(),
        return_exceptions=False,
    )

    services: list[ServiceStatus] = list(results)
    any_down = any(s.status == "down" for s in services)
    api_status: Literal["healthy", "degraded"] = "degraded" if any_down else "healthy"

    return StatusOut(
        api=api_status,
        services=services,
        uptime_seconds=int(time.monotonic() - _START_TIME),
        version=_API_VERSION,
    )
