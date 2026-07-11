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
    # Active provider is chosen by LLM_PROVIDER (gemini|openai|groq|openrouter);
    # if blank, the first API key present wins (gemini>openai>openrouter>groq).
    gemini_api_key: str = ""
    openai_api_key: str = ""
    groq_api_key: str = ""
    openrouter_api_key: str = ""
    llm_provider: str = ""
    gemini_model: str = "gemini-2.5-flash"       # override: GEMINI_MODEL
    openai_model: str = "gpt-4o-mini"            # override: OPENAI_MODEL
    groq_model: str = "llama-3.3-70b-versatile"  # override: GROQ_MODEL
    openrouter_model: str = "openai/gpt-4o-mini" # override: OPENROUTER_MODEL
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    # ── UI-configurable settings (runtime-overridable) ───────
    # Fallbacks for values the Settings page can change at runtime. The live
    # values come from the in-memory override store set via POST /settings
    # (reset on restart).
    chunk_strategy: str = "fixed"
    default_collection: str | None = None
    eval_auto_run: bool = False

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


# ── Runtime setting overrides ─────────────────────────────────────────────────
# In-memory overrides applied via POST /settings. These take precedence over the
# env-derived values above and reset when the process restarts.

_runtime_overrides: dict = {}


def get_runtime_setting(key: str, default=None):
    """Return a runtime override, or *default* if it was never set."""
    return _runtime_overrides.get(key, default)


def set_runtime_settings(values: dict) -> None:
    """Persist runtime overrides (only non-None values are stored)."""
    for key, value in values.items():
        if value is not None:
            _runtime_overrides[key] = value
