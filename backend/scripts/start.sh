#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/start.sh — Container entrypoint
#
# Starts the uvicorn server.  No database migrations needed.
#
# CUDA_VISIBLE_DEVICES=""
#   Must be set here in the shell, before the Python process starts.
#   Setting it inside Python (os.environ) is too late — ONNX Runtime's
#   native device-discovery runs during shared-library load, before any
#   Python code executes.  Without this the runtime scans /sys/class/drm
#   on startup, triggers a transient memory spike, and logs a noisy
#   warning on every container start.
#
# --timeout-graceful-shutdown 5
#   Gives in-flight requests 5 s to complete before the process exits.
#   Without this, an OOM kill produces a silent log cut-off with no
#   Python traceback, making the incident look like a clean shutdown.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# Suppress ONNX Runtime GPU/CUDA device scan in CPU-only containers.
export CUDA_VISIBLE_DEVICES=""

echo "[start.sh] Starting uvicorn…"
exec uvicorn main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 1 \
    --timeout-graceful-shutdown 5 \
    --log-level "${LOG_LEVEL:-info}"
