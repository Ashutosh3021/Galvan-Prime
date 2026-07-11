"""
schemas/settings.py — Settings request/response models (stub for Phase 5).
"""

from typing import Literal

from pydantic import BaseModel


class SettingsOut(BaseModel):
    llm_provider: Literal["gemini", "openai", "groq", "openrouter"]
    chunk_strategy: Literal["fixed", "semantic"]
    default_collection: str | None
    eval_auto_run: bool

    model_config = {"from_attributes": True}


class SettingsUpdateIn(BaseModel):
    llm_provider: Literal["gemini", "openai", "groq", "openrouter"] | None = None
    chunk_strategy: Literal["fixed", "semantic"] | None = None
    default_collection: str | None = None
    eval_auto_run: bool | None = None
