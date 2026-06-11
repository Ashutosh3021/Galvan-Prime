"""
core/generation/chain.py — LangChain RAG chain with multi-turn memory.

RAGResult is the structured output returned by run_rag_chain().

Pipeline per call:
  1.  Load session history from MemoryStore.
  2.  Run hybrid_search to get top-k chunks.
  3.  Build a prompt: [system] + [history] + [human with context].
  4.  Invoke the LLM.
  5.  Persist the new turn in MemoryStore.
  6.  Return the answer + citations + latency.

This module is intentionally stateless — all state lives in MemoryStore
and the DB (persisted by the caller in api/routes/query.py).
"""

from __future__ import annotations

import asyncio
import logging
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from functools import partial
from typing import Optional

from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage
from langchain_core.output_parsers import StrOutputParser

from config import get_settings
from core.embeddings.encoder import get_encoder
from core.generation.llm import get_llm
from core.generation.memory import get_memory_store
from core.retrieval.hybrid import hybrid_search
from core.retrieval.vectorstore import SearchResult

logger = logging.getLogger(__name__)
settings = get_settings()

# Thread pool for sync LLM calls (LangChain models are sync by default)
_llm_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="llm")

# ── System prompt ─────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """\
You are GalvanRAG, a helpful assistant that answers questions using only the \
provided context passages.

Rules:
1. Answer only from the provided CONTEXT.  If the context doesn't contain \
enough information, say "I don't have enough information to answer that."
2. Be concise and precise.
3. When you use information from a passage, the source will be cited automatically \
— do NOT add your own citations.
4. If the user asks a follow-up question, use the conversation history to maintain \
continuity.
"""

# ── Output types ──────────────────────────────────────────────────────────────

@dataclass
class Citation:
    source: str
    page: Optional[int]
    chunk: str  # excerpt (first 300 chars of the chunk)


@dataclass
class RAGResult:
    answer: str
    citations: list[Citation]
    session_id: str
    latency_ms: int
    context_chunks: list[SearchResult] = field(default_factory=list)


# ── Context builder ───────────────────────────────────────────────────────────

def _build_context_block(chunks: list[SearchResult]) -> str:
    """Format retrieved chunks into a numbered context block for the prompt."""
    if not chunks:
        return "(no relevant context found)"

    lines = []
    for i, chunk in enumerate(chunks, start=1):
        page_info = f" [p.{chunk.page}]" if chunk.page and chunk.page > 0 else ""
        lines.append(f"[{i}] {chunk.source}{page_info}\n{chunk.chunk_text}\n")
    return "\n".join(lines)


def _build_messages(
    history: list[BaseMessage],
    question: str,
    context_block: str,
) -> list[BaseMessage]:
    """
    Assemble the full message list to send to the LLM:
      [SystemMessage] + [prior history] + [HumanMessage with embedded context]
    """
    human_content = f"""CONTEXT:
{context_block}

QUESTION:
{question}"""

    return [SystemMessage(content=_SYSTEM_PROMPT)] + history + [HumanMessage(content=human_content)]


# ── Main entry point ──────────────────────────────────────────────────────────

async def run_rag_chain(
    *,
    question: str,
    collection: str,
    session_id: str,
    top_k: int = 5,
) -> RAGResult:
    """
    Execute the full RAG pipeline for a single user question.

    Args:
        question:    The user's natural-language question.
        collection:  ChromaDB collection to retrieve from.
        session_id:  Conversation session identifier.
        top_k:       Number of context chunks to retrieve.

    Returns:
        RAGResult with answer, citations, session_id, and latency_ms.

    Raises:
        RuntimeError: If no LLM API key is configured.
        ValueError:   If the collection is empty (no documents ingested yet).
    """
    t_start = time.monotonic()
    memory = get_memory_store()
    loop = asyncio.get_event_loop()

    # ── 1. Embed query (thread pool) ──────────────────────────────────────────
    encoder = get_encoder()
    query_embedding: list[float] = await loop.run_in_executor(
        _llm_executor,
        partial(encoder.encode_one, question),
    )

    # ── 2. Hybrid search ──────────────────────────────────────────────────────
    chunks: list[SearchResult] = await hybrid_search(
        query=question,
        collection=collection,
        query_embedding=query_embedding,
        persist_dir=settings.chroma_persist_dir,
        top_k=top_k,
    )

    # ── 3. Build prompt ───────────────────────────────────────────────────────
    history = memory.get_history(session_id)
    context_block = _build_context_block(chunks)
    messages = _build_messages(history, question, context_block)

    # ── 4. Invoke LLM (thread pool — LangChain is synchronous) ────────────────
    llm = get_llm()
    parser = StrOutputParser()

    def _invoke_llm() -> str:
        response = llm.invoke(messages)
        return parser.invoke(response)

    answer: str = await loop.run_in_executor(_llm_executor, _invoke_llm)

    # ── 5. Update memory ──────────────────────────────────────────────────────
    memory.add_user_message(session_id, question)
    memory.add_ai_message(session_id, answer)

    # ── 6. Build citations ────────────────────────────────────────────────────
    seen: set[str] = set()
    citations: list[Citation] = []
    for chunk in chunks:
        key = f"{chunk.source}:{chunk.page}"
        if key not in seen:
            seen.add(key)
            citations.append(
                Citation(
                    source=chunk.source,
                    page=chunk.page if chunk.page and chunk.page > 0 else None,
                    chunk=chunk.chunk_text[:300],
                )
            )

    latency_ms = int((time.monotonic() - t_start) * 1000)
    logger.info(
        "RAG chain: session=%s collection='%s' chunks=%d latency=%dms",
        session_id, collection, len(chunks), latency_ms,
    )

    return RAGResult(
        answer=answer,
        citations=citations,
        session_id=session_id,
        latency_ms=latency_ms,
        context_chunks=chunks,
    )
