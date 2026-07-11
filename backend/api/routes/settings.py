"""
api/routes/settings.py — Runtime settings endpoints.

GET  /settings — current effective settings (env + runtime overrides)
POST /settings — update runtime-overridable settings (e.g. active LLM provider)
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status

from config import get_runtime_setting, get_settings, set_runtime_settings
from schemas.settings import SettingsOut, SettingsUpdateIn

router = APIRouter(prefix="/settings", tags=["settings"])
logger = logging.getLogger(__name__)

# Maps each provider to the settings field holding its API key, for validation.
_PROVIDER_KEYS = {
    "gemini": "gemini_api_key",
    "openai": "openai_api_key",
    "groq": "groq_api_key",
    "openrouter": "openrouter_api_key",
}


def _effective() -> SettingsOut:
    """Build the effective SettingsOut from env values + runtime overrides."""
    s = get_settings()
    return SettingsOut(
        llm_provider=get_runtime_setting("llm_provider") or s.llm_provider or "gemini",
        chunk_strategy=get_runtime_setting("chunk_strategy") or s.chunk_strategy,
        default_collection=get_runtime_setting("default_collection", s.default_collection),
        eval_auto_run=get_runtime_setting("eval_auto_run", s.eval_auto_run),
    )


@router.get(
    "",
    response_model=SettingsOut,
    summary="Get current effective settings",
)
async def get_settings_route() -> SettingsOut:
    return _effective()


@router.post(
    "",
    response_model=SettingsOut,
    summary="Update runtime settings",
)
async def update_settings(body: SettingsUpdateIn) -> SettingsOut:
    updates: dict = {}

    if body.llm_provider is not None:
        if not getattr(get_settings(), _PROVIDER_KEYS[body.llm_provider], ""):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"LLM provider '{body.llm_provider}' is not configured on this server (missing API key).",
            )
        updates["llm_provider"] = body.llm_provider

    if body.chunk_strategy is not None:
        updates["chunk_strategy"] = body.chunk_strategy
    if body.default_collection is not None:
        updates["default_collection"] = body.default_collection
    if body.eval_auto_run is not None:
        updates["eval_auto_run"] = body.eval_auto_run

    set_runtime_settings(updates)
    logger.info("Settings updated: %s", {k: v for k, v in updates.items()})
    return _effective()
