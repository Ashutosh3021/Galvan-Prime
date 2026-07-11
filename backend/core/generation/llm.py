"""
core/generation/llm.py — Pluggable LLM backend.

Selects an LLM provider (gemini | openai | groq | openrouter) from config.
Returns a LangChain BaseChatModel so the rest of the chain is
provider-agnostic — swapping providers is a single config change.

Usage:
    from core.generation.llm import get_llm
    llm = get_llm()          # returns a cached chat model for the active provider
    response = llm.invoke("Hello")
"""

from __future__ import annotations

import logging
from functools import lru_cache
from typing import Literal

from langchain_core.language_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI  # type: ignore
from langchain_openai import ChatOpenAI  # type: ignore

from config import Settings, get_runtime_setting, get_settings

logger = logging.getLogger(__name__)

LLMProvider = Literal["gemini", "openai", "groq", "openrouter"]

# In-code fallback defaults. Config supplies the real values; these cover the
# case where an env var is left empty. Override any via its *_MODEL env var.
_GEMINI_MODEL = "gemini-2.5-flash"        # override: GEMINI_MODEL
_OPENAI_MODEL = "gpt-4o-mini"             # override: OPENAI_MODEL
_GROQ_MODEL = "llama-3.3-70b-versatile"   # override: GROQ_MODEL
_OPENROUTER_MODEL = "openai/gpt-4o-mini"  # override: OPENROUTER_MODEL
_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"


def _resolve_provider(settings: Settings, explicit: LLMProvider | None) -> str:
    """Pick which LLM provider to use.

    Resolution order:
      1. *provider* argument (explicit override — used by tests).
      2. LLM_PROVIDER env var (e.g. "groq").
      3. first API key present (gemini > openai > openrouter > groq).
    Raises RuntimeError if nothing is configured.
    """
    if explicit:
        return explicit
    rt = get_runtime_setting("llm_provider")
    if rt:
        return rt
    if settings.llm_provider:
        return settings.llm_provider
    for name in ("gemini", "openai", "openrouter", "groq"):
        if getattr(settings, f"{name}_api_key", ""):
            return name
    raise RuntimeError(
        "No LLM API key configured. Set GEMINI_API_KEY, OPENAI_API_KEY, "
        "GROQ_API_KEY, or OPENROUTER_API_KEY in your environment."
    )


@lru_cache(maxsize=1)
def get_llm(provider: LLMProvider | None = None) -> BaseChatModel:
    """
    Return a cached LangChain chat model for the configured provider.

    Provider resolution: see _resolve_provider. The selected provider's API
    key must be set, or a clear RuntimeError is raised.

    Args:
        provider: Optional explicit provider name (gemini/openai/groq/openrouter).

    Returns:
        Configured BaseChatModel instance.

    Raises:
        RuntimeError: If no API key is available for the resolved provider.
        ImportError:  If the required LangChain integration package is missing
                      (only Groq needs an extra dep: langchain-groq).
    """
    settings = get_settings()
    resolved = _resolve_provider(settings, provider)

    if resolved == "gemini":
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is not set")
        model = settings.gemini_model or _GEMINI_MODEL
        logger.info("LLM: using Gemini model '%s'", model)
        return ChatGoogleGenerativeAI(
            model=model,
            google_api_key=settings.gemini_api_key,
            temperature=0.2,
            max_retries=3,
        )

    if resolved == "openai":
        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is not set")
        model = settings.openai_model or _OPENAI_MODEL
        logger.info("LLM: using OpenAI model '%s'", model)
        return ChatOpenAI(
            model=model,
            openai_api_key=settings.openai_api_key,
            temperature=0.2,
            max_retries=3,
        )

    if resolved == "openrouter":
        if not settings.openrouter_api_key:
            raise RuntimeError("OPENROUTER_API_KEY is not set")
        model = settings.openrouter_model or _OPENROUTER_MODEL
        logger.info("LLM: using OpenRouter model '%s'", model)
        return ChatOpenAI(
            model=model,
            openai_api_key=settings.openrouter_api_key,
            base_url=settings.openrouter_base_url or _OPENROUTER_BASE_URL,
            temperature=0.2,
            max_retries=3,
        )

    if resolved == "groq":
        if not settings.groq_api_key:
            raise RuntimeError("GROQ_API_KEY is not set")
        # langchain-groq is an optional dependency — import lazily so the app
        # still boots (and other providers work) if it isn't installed.
        from langchain_groq import ChatGroq  # type: ignore
        model = settings.groq_model or _GROQ_MODEL
        logger.info("LLM: using Groq model '%s'", model)
        return ChatGroq(
            model=model,
            groq_api_key=settings.groq_api_key,
            temperature=0.2,
            max_retries=3,
        )

    raise RuntimeError(f"Unknown LLM provider: {resolved}")


def reset_llm_cache() -> None:
    """Clear the LLM singleton cache (useful for tests / provider switching)."""
    get_llm.cache_clear()
