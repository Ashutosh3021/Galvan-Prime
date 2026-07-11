"""
main.py — FastAPI application entry point.

Run locally:
  uvicorn main:app --reload --port 8000
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.middleware.cors import add_cors
from api.routes import eval, ingest, query, settings, status
from config import get_settings

settings_obj = get_settings()

logging.basicConfig(
    level=getattr(logging, settings_obj.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)s | %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup → yield → shutdown."""
    logger.info("GalvanR.A.G backend starting up (env=%s)", settings_obj.environment)
    yield
    logger.info("GalvanR.A.G backend shutting down")


app = FastAPI(
    title="GalvanR.A.G API",
    description=(
        "Self-hostable RAG engine — upload docs, get cited answers, " "measure quality with RAGAS."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
add_cors(app)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(ingest.router)
app.include_router(query.router)
app.include_router(eval.router)
app.include_router(status.router)
app.include_router(settings.router)


# ── Root health probe ─────────────────────────────────────────────────────────
@app.get("/", tags=["health"], summary="Root health probe")
async def root() -> dict:
    return {"status": "ok", "version": "1.0.0"}
