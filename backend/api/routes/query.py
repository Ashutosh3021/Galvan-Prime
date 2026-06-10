"""
api/routes/query.py — Query endpoints (Phase 4 stub).
"""

from fastapi import APIRouter

router = APIRouter(prefix="/query", tags=["query"])

# Phase 4 will implement:
#   POST /query
#   GET  /query/history/{session_id}
