"""
core/embeddings/encoder.py — Sentence-Transformers embedding singleton.

Wraps the all-MiniLM-L6-v2 model (384-dim, fast, good quality for RAG).
The model is loaded once at process startup and reused for all requests
to avoid the ~2s cold-start penalty per call.

Usage:
    from core.embeddings.encoder import get_encoder
    encoder = get_encoder()
    vecs = encoder.encode(["hello world", "another sentence"])
"""

from __future__ import annotations

import logging
from functools import lru_cache
from typing import Sequence

import numpy as np

logger = logging.getLogger(__name__)

MODEL_NAME = "all-MiniLM-L6-v2"


class Encoder:
    """
    Thin wrapper around SentenceTransformer that normalises embeddings
    and exposes a clean encode() interface.
    """

    def __init__(self, model_name: str = MODEL_NAME) -> None:
        from sentence_transformers import SentenceTransformer

        logger.info("Loading embedding model '%s' …", model_name)
        self._model = SentenceTransformer(model_name)
        self.model_name = model_name
        self.dimension: int = self._model.get_sentence_embedding_dimension()
        logger.info("Encoder ready — dimension=%d", self.dimension)

    def encode(
        self,
        texts: Sequence[str],
        batch_size: int = 64,
        normalize: bool = True,
    ) -> list[list[float]]:
        """
        Embed a list of strings.

        Args:
            texts:      Input strings to embed.
            batch_size: How many to process per GPU/CPU batch.
            normalize:  Whether to L2-normalise the output vectors.

        Returns:
            List of float lists, one per input string.
        """
        if not texts:
            return []

        vecs: np.ndarray = self._model.encode(
            list(texts),
            batch_size=batch_size,
            normalize_embeddings=normalize,
            show_progress_bar=False,
        )
        return vecs.tolist()

    def encode_one(self, text: str, normalize: bool = True) -> list[float]:
        """Convenience wrapper for a single string."""
        return self.encode([text], normalize=normalize)[0]


@lru_cache(maxsize=1)
def get_encoder() -> Encoder:
    """Return the process-wide Encoder singleton (lazy-loaded on first call)."""
    return Encoder()
