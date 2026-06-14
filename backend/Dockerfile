# ─────────────────────────────────────────────────────────────────────────────
# GalvanR.A.G — Backend Dockerfile
#
# Multi-stage build:
#   builder  — installs all dependencies into a virtual-env
#   runtime  — copies only the venv + app code; no build tools
#
# Result: lean ~600 MB image (sentence-transformers is the bulk).
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: dependency builder ───────────────────────────────────────────────
FROM python:3.11-slim AS builder

# System deps needed at build time only
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy requirements first — Docker layer caching means this layer is only
# rebuilt when requirements.txt changes.
COPY requirements.txt .

# Create a virtual environment inside the image and install into it.
# Using --no-cache-dir keeps the image smaller.
RUN python -m venv /opt/venv \
    && /opt/venv/bin/pip install --upgrade pip --no-cache-dir \
    && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt


# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

# Runtime system deps only
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root user for security
RUN useradd --create-home --shell /bin/bash appuser

WORKDIR /app

# Copy venv from builder
COPY --from=builder /opt/venv /opt/venv

# Copy application source
COPY --chown=appuser:appuser . .

# Make sure the venv is on PATH
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    # Sentence-Transformers model cache inside the container
    SENTENCE_TRANSFORMERS_HOME=/app/.cache/sentence_transformers \
    # HuggingFace cache
    HF_HOME=/app/.cache/huggingface

# Create cache directories and give appuser ownership
RUN mkdir -p /app/.cache/sentence_transformers /app/.cache/huggingface \
        /app/chroma_db /app/scripts \
    && chown -R appuser:appuser /app

# Make startup script executable
RUN chmod +x /app/scripts/start.sh

USER appuser

# Expose the FastAPI port
EXPOSE 8000

# Healthcheck — Docker will mark the container unhealthy if this fails
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Default command: run migrations then start the server.
# Workers = 1 keeps the in-process memory store consistent across requests.
# Scale horizontally (multiple container replicas) rather than with workers
# until a Redis-backed memory store is added.
CMD ["/app/scripts/start.sh"]
