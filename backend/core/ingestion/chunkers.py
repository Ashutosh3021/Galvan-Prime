"""
core/ingestion/chunkers.py — Text chunking strategies.

FixedChunker   — RecursiveCharacterTextSplitter (512 tokens, 64 overlap).
SemanticChunker — Sentence-boundary segmentation: groups sentences until
                  a target token budget is reached, then starts a new chunk.

Both return lists of (chunk_text, page_number | None) tuples so provenance
is preserved for citation generation.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from typing import Optional

from core.ingestion.loaders import RawPage

logger = logging.getLogger(__name__)


@dataclass
class Chunk:
    """A single text chunk with its provenance."""
    text: str
    source: str
    page: Optional[int]   # None for URL/TXT; int for PDFs


# ── Fixed-size chunker ────────────────────────────────────────────────────────

def fixed_chunk(pages: list[RawPage], chunk_size: int = 512, overlap: int = 64) -> list[Chunk]:
    """
    Split pages into fixed-size chunks using LangChain's
    RecursiveCharacterTextSplitter (character-based, approximating tokens).

    Args:
        pages:      Extracted pages from a loader.
        chunk_size: Approximate max chars per chunk (~1 char ≈ 1 token for English).
        overlap:    Overlap chars between successive chunks.

    Returns:
        List of Chunk objects.
    """
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks: list[Chunk] = []
    for page in pages:
        texts = splitter.split_text(page.text)
        for t in texts:
            t = t.strip()
            if t:
                chunks.append(Chunk(text=t, source=page.source, page=page.page))

    logger.info(
        "fixed_chunk: %d page(s) → %d chunks (size=%d, overlap=%d)",
        len(pages), len(chunks), chunk_size, overlap,
    )
    return chunks


# ── Semantic chunker ──────────────────────────────────────────────────────────

_SENTENCE_END = re.compile(r"(?<=[.!?])\s+")


def _split_sentences(text: str) -> list[str]:
    """Split *text* into sentences using a simple regex boundary detector."""
    sentences = _SENTENCE_END.split(text)
    return [s.strip() for s in sentences if s.strip()]


def semantic_chunk(
    pages: list[RawPage],
    target_size: int = 400,
    overlap_sentences: int = 1,
) -> list[Chunk]:
    """
    Group sentences into chunks that stay near *target_size* characters.

    A new chunk is started when adding the next sentence would exceed
    *target_size*.  The last *overlap_sentences* sentences of the previous
    chunk are prepended to the next one for context continuity.

    Args:
        pages:              Extracted pages from a loader.
        target_size:        Soft character limit per chunk.
        overlap_sentences:  Number of trailing sentences to carry forward.

    Returns:
        List of Chunk objects.
    """
    chunks: list[Chunk] = []

    for page in pages:
        sentences = _split_sentences(page.text)
        if not sentences:
            continue

        current: list[str] = []
        current_len = 0

        for sentence in sentences:
            s_len = len(sentence)

            # If adding this sentence exceeds the budget and we already have
            # content, flush the current chunk.
            if current_len + s_len > target_size and current:
                chunk_text = " ".join(current).strip()
                if chunk_text:
                    chunks.append(Chunk(text=chunk_text, source=page.source, page=page.page))

                # Keep the last N sentences as overlap context
                current = current[-overlap_sentences:] if overlap_sentences else []
                current_len = sum(len(s) for s in current)

            current.append(sentence)
            current_len += s_len

        # Flush the remaining sentences
        if current:
            chunk_text = " ".join(current).strip()
            if chunk_text:
                chunks.append(Chunk(text=chunk_text, source=page.source, page=page.page))

    logger.info(
        "semantic_chunk: %d page(s) → %d chunks (target=%d)",
        len(pages), len(chunks), target_size,
    )
    return chunks
