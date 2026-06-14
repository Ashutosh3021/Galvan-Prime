#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/start.sh — Container entrypoint
#
# Starts the uvicorn server.  No database migrations needed.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

echo "[start.sh] Starting uvicorn…"
exec uvicorn main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 1 \
    --log-level "${LOG_LEVEL:-info}"
