"""
config.py — Application settings loaded from environment / .env file.
Uses Pydantic Settings so every value is typed and validated at startup.
"""

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────
    environment: str = "development"
    log_level: str = "INFO"

    # ── Database ─────────────────────────────────────────────
    database_url: str

    # ── Auth ─────────────────────────────────────────────────
    secret_key: str
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # ── LLM ──────────────────────────────────────────────────
    gemini_api_key: str = ""
    openai_api_key: str = ""

    # ── Vector Stores ────────────────────────────────────────
    pinecone_api_key: str = ""
    pinecone_environment: str = ""
    chroma_persist_dir: str = "./chroma_db"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("secret_key")
    @classmethod
    def secret_key_min_length(cls, v: str) -> str:
        if len(v) < 16:
            raise ValueError("SECRET_KEY must be at least 16 characters")
        return v


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (singleton)."""
    return Settings()
