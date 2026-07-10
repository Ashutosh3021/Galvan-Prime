"""
config.py — Application settings loaded from environment / .env file.
Uses Pydantic Settings so every value is typed and validated at startup.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────
    environment: str = "development"
    log_level: str = "INFO"

    # Embedding tier: "free" (lightweight ONNX encoder via fastembed, no
    # torch) or "paid" (full sentence-transformers/torch). Defaults to
    # "paid" and only switches to the free path when explicitly set to
    # "free" — a paid deployment is never silently downgraded.
    app_tier: str = "paid"

    # ── LLM ──────────────────────────────────────────────────
    gemini_api_key: str = ""
    openai_api_key: str = ""

    # ── Vector Stores ────────────────────────────────────────
    pinecone_api_key: str = ""
    pinecone_environment: str = ""
    chroma_persist_dir: str = "./chroma_db"

    # ── Upload limits ───────────────────────────────────────
    # Single source of truth for the max ingest upload size (bytes).
    # Referenced by both the HTTP route and the ingestion service.
    max_upload_bytes: int = 50 * 1024 * 1024  # 50 MB

    # ── CORS ─────────────────────────────────────────────────
    # Optional comma-separated extra origins, e.g. Vercel preview URLs.
    # The production Vercel origin is always allowed in code; this is
    # only needed for additional domains.
    cors_origins: str = ""

    model_config = SettingsConfigDict(
        # .env is optional — in production (Render, Docker) vars come from
        # the host environment directly.
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (singleton)."""
    return Settings()
