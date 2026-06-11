"""
core/generation/llm.py — Pluggable LLM backend.

Selects between Gemini (default) and OpenAI based on config.
Returns a LangChain BaseChatModel so the rest of the chain is
provider-agnostic — swapping providers is a single config change.

Usage:
    from core.generation.llm import get_llm
    llm = get_llm()          # returns cached ChatGoogleGenerativeAI or ChatOpenAI
    response = llm.invoke("Hello")
"""

from __future__ import annotations

import logging
from functools import lru_cache
from typing import Literal

from langchain_core.language_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI  # type: ignore
from langchain_openai import ChatOpenAI  # type: ignore

from config import get_settings

logger = logging.getLogger(__name__)

LLMProvider = Literal["gemini", "openai"]

# Models used per provider — easy to override via config in the future
_GEMINI_MODEL = "gemini-1.5-flash"
_OPENAI_MODEL = "gpt-4o-mini"


@lru_cache(maxsize=1)
def get_llm(provider: LLMProvider | None = None) -> BaseChatModel:
    """
    Return a cached LangChain chat model for the configured provider.

    Provider resolution order:
      1. *provider* argument (explicit override — used by tests).
      2. Settings.gemini_api_key present → Gemini.
      3. Settings.openai_api_key present → OpenAI.
      4. No key configured → raises RuntimeError.

    Args:
        provider: Optional explicit provider name ('gemini' or 'openai').

    Returns:
        Configured BaseChatModel instance.

    Raises:
        RuntimeError: If no API key is available for the requested provider.
        ImportError:  If the required LangChain integration package is missing.
    """
    settings = get_settings()

    resolved: LLMProvider
    if provider is not None:
        resolved = provider
    elif settings.gemini_api_key:
        resolved = "gemini"
    elif settings.openai_api_key:
        resolved = "openai"
    else:
        raise RuntimeError(
            "No LLM API key configured. Set GEMINI_API_KEY or OPENAI_API_KEY in .env"
        )

    if resolved == "gemini":
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is not set")
        logger.info("LLM: using Gemini model '%s'", _GEMINI_MODEL)
        return ChatGoogleGenerativeAI(
            model=_GEMINI_MODEL,
            google_api_key=settings.gemini_api_key,
            temperature=0.2,
            max_retries=3,
        )

    # OpenAI
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")
    logger.info("LLM: using OpenAI model '%s'", _OPENAI_MODEL)
    return ChatOpenAI(
        model=_OPENAI_MODEL,
        openai_api_key=settings.openai_api_key,
        temperature=0.2,
        max_retries=3,
    )


def reset_llm_cache() -> None:
    """Clear the LLM singleton cache (useful for tests / provider switching)."""
    get_llm.cache_clear()
