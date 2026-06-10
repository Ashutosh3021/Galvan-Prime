"""
api/routes/eval.py — Evaluation endpoints (Phase 7 stub).
"""

from fastapi import APIRouter

router = APIRouter(prefix="/eval", tags=["eval"])

# Phase 7 will implement:
#   POST /eval/run
#   GET  /eval/metrics
#   GET  /eval/history
