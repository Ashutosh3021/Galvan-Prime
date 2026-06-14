"""
core/embeddings/encoder.py — Sentence-Transformers embedding singleton.

Wraps the all-MiniLM-L6-v2 model (384-dim, fast, good quality for RAG).
The model is loaded once at process startup and reused for all requests
to avoid the ~2s cold-start penalty per call.

Memory notes
────────────
* ``CUDA_VISIBLE_DEVICES=""`` is exported in ``scripts/start.sh`` *before*
  the Python process starts.  ONNX Runtime's native device-discovery runs
  during shared-library load — setting the var inside Python is too late.
  The shell-level export is what actually suppresses the DRM scan and its
  transient memory spike.
* ``device="cpu"`` on SentenceTransformer is a belt-and-braces guard that
  also prevents ONNX from choosing a GPU execution provider at model-load
  time even if CUDA somehow becomes visible.
* ``encode()`` processes texts in micro-batches and deletes each NumPy
  ndarray immediately after converting to Python lists, so peak RAM is
  proportional to ``batch_size`` rather than the full corpus size.

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
        # Force CPU execution — eliminates the ONNX GPU-scan transient spike.
        self._model = SentenceTransformer(model_name, device="cpu")
        self.model_name = model_name
        self.dimension: int = self._model.get_sentence_embedding_dimension()
        logger.info("Encoder ready — dimension=%d", self.dimension)

    def encode(
        self,
        texts: Sequence[str],
        batch_size: int = 32,
        normalize: bool = True,
    ) -> list[list[float]]:
        """
        Embed a list of strings in memory-efficient micro-batches.

        Each batch's NumPy array is converted to Python lists and released
        immediately so peak RSS is bounded by ``batch_size`` rather than
        ``len(texts)``.

        Args:
            texts:      Input strings to embed.
            batch_size: Chunks processed per forward pass (default 32).
                        Lower values reduce peak RAM; raise only if latency
                        becomes a bottleneck on larger hardware.
            normalize:  Whether to L2-normalise the output vectors.

        Returns:
            List of float lists, one per input string.
        """
        if not texts:
            return []

        text_list = list(texts)
        results: list[list[float]] = []

        for i in range(0, len(text_list), batch_size):
            batch = text_list[i : i + batch_size]
            vecs: np.ndarray = self._model.encode(
                batch,
                batch_size=len(batch),
                normalize_embeddings=normalize,
                show_progress_bar=False,
            )
            results.extend(vecs.tolist())
            del vecs  # release ndarray before next batch; avoids dual-copy peak

        return results

    def encode_one(self, text: str, normalize: bool = True) -> list[float]:
        """Convenience wrapper for a single string."""
        return self.encode([text], normalize=normalize)[0]


@lru_cache(maxsize=1)
def get_encoder() -> Encoder:
    """Return the process-wide Encoder singleton (lazy-loaded on first call)."""
    return Encoder()
