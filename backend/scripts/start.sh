#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/start.sh — Container entrypoint
#
# Runs Alembic migrations then starts the uvicorn server.
# Called by the Dockerfile CMD or override.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

echo "[start.sh] Running Alembic migrations…"
alembic upgrade head

echo "[start.sh] Starting uvicorn…"
exec uvicorn main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 1 \
    --log-level "${LOG_LEVEL:-info}"
