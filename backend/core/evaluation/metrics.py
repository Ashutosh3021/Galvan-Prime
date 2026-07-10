"""
core/evaluation/metrics.py — RAGAS metric definitions and score targets.

All four core RAGAS metrics are exported here so the rest of the codebase
has a single import point.  Target thresholds mirror the project's success
criteria from the README.

Metric descriptions:
  faithfulness      — are the claims in the answer supported by the context?
  answer_relevancy  — how relevant is the answer to the question?
  context_recall    — are all ground-truth facts present in the retrieved context?
  context_precision — what fraction of the retrieved context is actually relevant?
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from ragas.metrics import (  # type: ignore
    answer_relevancy,
    context_precision,
    context_recall,
    faithfulness,
)

# ── The four metrics used in every eval run ───────────────────────────────────

METRICS = [faithfulness, answer_relevancy, context_recall, context_precision]

MetricName = Literal[
    "faithfulness",
    "answer_relevancy",
    "context_recall",
    "context_precision",
]

# ── Per-metric pass/fail thresholds (project success criteria) ────────────────

METRIC_TARGETS: dict[MetricName, float] = {
    "faithfulness": 0.80,
    "answer_relevancy": 0.75,
    "context_recall": 0.70,
    "context_precision": 0.70,
}


@dataclass
class MetricResult:
    """Structured result for a single metric."""

    metric: MetricName
    score: float
    target: float
    passed: bool

    @classmethod
    def from_score(cls, metric: MetricName, score: float) -> "MetricResult":
        target = METRIC_TARGETS[metric]
        return cls(metric=metric, score=round(score, 4), target=target, passed=score >= target)
