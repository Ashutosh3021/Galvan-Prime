"""
core/generation/memory.py — Per-session conversation memory.

Maintains a rolling window of Human/AI message pairs keyed by session_id.
The store is in-process (dict); for multi-worker deployments this should be
backed by Redis.  For a single-instance deployment it's sufficient.

The memory is intentionally kept separate from the DB query log — the log
is the durable record, the memory store is the fast in-context window used
to build the prompt.

Usage:
    from core.generation.memory import get_memory_store
    store = get_memory_store()
    store.add_user_message(session_id, "What is RAG?")
    store.add_ai_message(session_id, "RAG stands for …")
    history = store.get_history(session_id)   # list[BaseMessage]
"""

from __future__ import annotations

import logging
from collections import defaultdict, deque
from functools import lru_cache
from typing import Deque

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage

logger = logging.getLogger(__name__)

# Maximum turns kept in memory per session (1 turn = 1 human + 1 AI message)
_MAX_TURNS = 10


class MemoryStore:
    """
    Thread-safe in-process conversation history store.

    Each session_id maps to a bounded deque of BaseMessage objects.
    When the deque exceeds 2 * MAX_TURNS messages, the oldest pair is
    dropped to keep the prompt context manageable.
    """

    def __init__(self, max_turns: int = _MAX_TURNS) -> None:
        self._max_messages = max_turns * 2  # human + AI per turn
        self._store: dict[str, Deque[BaseMessage]] = defaultdict(
            lambda: deque(maxlen=self._max_messages)
        )

    def add_user_message(self, session_id: str, content: str) -> None:
        """Append a HumanMessage to the session history."""
        self._store[session_id].append(HumanMessage(content=content))

    def add_ai_message(self, session_id: str, content: str) -> None:
        """Append an AIMessage to the session history."""
        self._store[session_id].append(AIMessage(content=content))

    def get_history(self, session_id: str) -> list[BaseMessage]:
        """Return the current message history for a session (oldest first)."""
        return list(self._store[session_id])

    def clear_session(self, session_id: str) -> None:
        """Remove all history for a session."""
        self._store.pop(session_id, None)

    def session_count(self) -> int:
        """Return the number of active sessions tracked."""
        return len(self._store)

    def message_count(self, session_id: str) -> int:
        """Return the number of messages in a session."""
        return len(self._store[session_id])


@lru_cache(maxsize=1)
def get_memory_store() -> MemoryStore:
    """Return the process-wide MemoryStore singleton."""
    return MemoryStore()
