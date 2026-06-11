"""
core/evaluation/ragas_runner.py — Async RAGAS evaluation runner.

run_evaluation() is the single entry point.  It:
  1.  Iterates over the test set, running the full RAG pipeline per question.
  2.  Collects (question, answer, contexts, ground_truth) for each item.
  3.  Wraps the LLM and embedding model in RAGAS-compatible adapters.
  4.  Calls ragas.evaluate() in a thread pool (it is synchronous).
  5.  Returns a dict of metric_name → float scores.

The caller (api/routes/eval.py) persists the scores to the EvalRun row
and handles the background-task lifecycle.

RAGAS dataset columns required:
  question      — the test question string
  answer        — the RAG-generated answer
  contexts      — list[str] of retrieved chunks used to generate the answer
  ground_truth  — the expected / reference answer
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from typing import Any

from datasets import Dataset  # type: ignore

from core.evaluation.metrics import METRICS, MetricName
from core.generation.chain import run_rag_chain

logger = logging.getLogger(__name__)

# Thread pool for RAGAS evaluate() which is synchronous
_eval_executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="ragas")


async def run_evaluation(
    *,
    collection: str,
    test_set: list[dict[str, str]],
    run_id: str | None = None,
) -> dict[MetricName, float | None]:
    """
    Run a full RAGAS evaluation pass over *test_set*.

    Args:
        collection: Collection name to query against.
        test_set:   List of dicts, each with keys:
                      - "question"    (required)
                      - "ground_truth" (required)
        run_id:     Optional identifier for logging.

    Returns:
        Dict mapping metric name → score (0.0–1.0), or None if the metric
        could not be computed (e.g. no LLM key configured).

    Raises:
        ValueError: If test_set is empty or items are missing required keys.
    """
    if not test_set:
        raise ValueError("test_set must contain at least one item")

    for i, item in enumerate(test_set):
        if "question" not in item:
            raise ValueError(f"test_set[{i}] is missing 'question'")
        if "ground_truth" not in item:
            raise ValueError(f"test_set[{i}] is missing 'ground_truth'")

    run_label = run_id or str(uuid.uuid4())[:8]
    logger.info("RAGAS eval run=%s  collection='%s'  items=%d", run_label, collection, len(test_set))

    # ── Step 1: run RAG pipeline for each test question ───────────────────────
    questions: list[str] = []
    answers: list[str] = []
    contexts: list[list[str]] = []
    ground_truths: list[str] = []

    for item in test_set:
        question: str = item["question"]
        ground_truth: str = item["ground_truth"]
        session_id = f"eval-{run_label}-{uuid.uuid4()}"

        try:
            result = await run_rag_chain(
                question=question,
                collection=collection,
                session_id=session_id,
                top_k=5,
            )
            retrieved_contexts = [c.chunk_text for c in result.context_chunks]
            answer = result.answer
        except Exception as exc:
            logger.warning("RAG chain failed for question %r: %s", question[:60], exc)
            # Use empty context + fallback answer so RAGAS can still compute partial scores
            retrieved_contexts = []
            answer = ""

        questions.append(question)
        answers.append(answer)
        contexts.append(retrieved_contexts)
        ground_truths.append(ground_truth)

    # ── Step 2: build HuggingFace Dataset ────────────────────────────────────
    dataset = Dataset.from_dict(
        {
            "question": questions,
            "answer": answers,
            "contexts": contexts,
            "ground_truth": ground_truths,
        }
    )

    # ── Step 3: build RAGAS-compatible LLM + embeddings wrappers ─────────────
    try:
        from core.generation.llm import get_llm
        from ragas.llms import LangchainLLMWrapper  # type: ignore
        from ragas.embeddings import LangchainEmbeddingsWrapper  # type: ignore
        from langchain_community.embeddings import HuggingFaceEmbeddings  # type: ignore

        ragas_llm = LangchainLLMWrapper(get_llm())

        # Use the same SentenceTransformer model already cached by the encoder
        hf_embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        ragas_embeddings = LangchainEmbeddingsWrapper(hf_embeddings)

    except RuntimeError as exc:
        # No LLM key → return None scores (don't crash the background task)
        logger.warning("RAGAS eval skipped — LLM not configured: %s", exc)
        return {m.name: None for m in METRICS}  # type: ignore[attr-defined]

    # ── Step 4: run RAGAS evaluate() in thread pool ───────────────────────────
    loop = asyncio.get_event_loop()

    def _run_ragas() -> dict[str, float]:
        from ragas import evaluate  # type: ignore
        result = evaluate(
            dataset=dataset,
            metrics=METRICS,
            llm=ragas_llm,
            embeddings=ragas_embeddings,
            raise_exceptions=False,
        )
        # ragas Result supports dict-like access: result["faithfulness"] etc.
        return {m.name: result[m.name] for m in METRICS}  # type: ignore[attr-defined]

    try:
        scores: dict[str, float] = await loop.run_in_executor(_eval_executor, _run_ragas)
    except Exception as exc:
        logger.error("RAGAS evaluate() failed: %s", exc)
        return {m.name: None for m in METRICS}  # type: ignore[attr-defined]

    logger.info(
        "RAGAS run=%s completed: %s",
        run_label,
        {k: f"{v:.3f}" if v is not None else "N/A" for k, v in scores.items()},
    )
    return scores  # type: ignore[return-value]
