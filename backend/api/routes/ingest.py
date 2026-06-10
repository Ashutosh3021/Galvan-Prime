"""
api/routes/ingest.py — Ingestion endpoints (Phase 2 stub).
"""

from fastapi import APIRouter

router = APIRouter(prefix="/ingest", tags=["ingest"])

# Phase 2 will implement:
#   POST   /ingest
#   GET    /ingest/collections
#   DELETE /ingest/{doc_id}
