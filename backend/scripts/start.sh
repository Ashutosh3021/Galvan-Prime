#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/start.sh — Container entrypoint
#
# Starts the uvicorn server.  No database migrations needed.
#
# --timeout-graceful-shutdown 5
#   Gives in-flight requests 5 s to complete before the process exits.
#   Without this, an OOM kill produces a silent cut-off in logs with no
#   Python traceback — making it look like a clean shutdown.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

echo "[start.sh] Starting uvicorn…"
exec uvicorn main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 1 \
    --timeout-graceful-shutdown 5 \
    --log-level "${LOG_LEVEL:-info}"
