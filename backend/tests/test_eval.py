"""
tests/test_eval.py — Phase 7 unit + integration tests.

RAGAS evaluate() and the RAG chain are mocked throughout so no LLM
API keys are required.

Covers:
  Unit:
    - MetricResult.from_score   — pass/fail logic, score rounding
    - run_evaluation            — empty test_set error, missing fields

  API:
    POST /eval/run      — 202 accepted, background task starts
    GET  /eval/metrics  — 200 with scores, 202 while running, 404 not found
    GET  /eval/history  — empty list, populated list
"""

from __future__ import annotations

import uuid
from unittest.mock import patch

import pytest
from httpx import AsyncClient

_SAMPLE_TEST_SET = [
    {
        "question": "What is RAG?",
        "ground_truth": "RAG stands for Retrieval-Augmented Generation.",
    },
    {
        "question": "What is a vector store?",
        "ground_truth": "A vector store holds embeddings for similarity search.",
    },
]

_SAMPLE_SCORES = {
    "faithfulness": 0.85,
    "answer_relevancy": 0.78,
    "context_recall": 0.72,
    "context_precision": 0.76,
}


# ── Unit: MetricResult ────────────────────────────────────────────────────────


class TestMetricResult:
    def test_passed_when_score_above_target(self):
        from core.evaluation.metrics import MetricResult

        r = MetricResult.from_score("faithfulness", 0.90)
        assert r.passed is True
        assert r.target == 0.80

    def test_failed_when_score_below_target(self):
        from core.evaluation.metrics import MetricResult

        r = MetricResult.from_score("faithfulness", 0.70)
        assert r.passed is False

    def test_exactly_at_target_passes(self):
        from core.evaluation.metrics import MetricResult

        r = MetricResult.from_score("answer_relevancy", 0.75)
        assert r.passed is True

    def test_score_rounded_to_4dp(self):
        from core.evaluation.metrics import MetricResult

        r = MetricResult.from_score("context_recall", 0.712345678)
        assert r.score == 0.7123

    def test_all_four_metrics_have_targets(self):
        from core.evaluation.metrics import METRIC_TARGETS

        for metric in (
            "faithfulness",
            "answer_relevancy",
            "context_recall",
            "context_precision",
        ):
            assert metric in METRIC_TARGETS
            assert 0.0 < METRIC_TARGETS[metric] <= 1.0


# ── Unit: run_evaluation ──────────────────────────────────────────────────────


@pytest.mark.asyncio
class TestRunEvaluation:
    async def test_empty_test_set_raises_value_error(self):
        from core.evaluation.ragas_runner import run_evaluation

        with pytest.raises(ValueError, match="at least one item"):
            await run_evaluation(collection="col", test_set=[])

    async def test_missing_question_raises_value_error(self):
        from core.evaluation.ragas_runner import run_evaluation

        with pytest.raises(ValueError, match="missing 'question'"):
            await run_evaluation(
                collection="col",
                test_set=[{"ground_truth": "answer but no question"}],
            )

    async def test_missing_ground_truth_raises_value_error(self):
        from core.evaluation.ragas_runner import run_evaluation

        with pytest.raises(ValueError, match="missing 'ground_truth'"):
            await run_evaluation(
                collection="col",
                test_set=[{"question": "Q without ground truth"}],
            )


# ── API: POST /eval/run ───────────────────────────────────────────────────────


@pytest.mark.asyncio
class TestStartEvalRun:
    async def test_returns_202_accepted(self, client: AsyncClient):
        with patch("fastapi.BackgroundTasks.add_task"):
            resp = await client.post(
                "/eval/run",
                json={"collection": "test-col", "test_set": _SAMPLE_TEST_SET},
            )
        assert resp.status_code == 202

    async def test_response_has_run_id_and_status_running(self, client: AsyncClient):
        with patch("fastapi.BackgroundTasks.add_task"):
            resp = await client.post(
                "/eval/run",
                json={"collection": "test-col", "test_set": _SAMPLE_TEST_SET},
            )
        body = resp.json()
        assert "run_id" in body
        assert body["status"] == "running"
        assert body["collection"] == "test-col"
        assert "created_at" in body

    async def test_empty_test_set_returns_422(self, client: AsyncClient):
        resp = await client.post(
            "/eval/run",
            json={"collection": "col", "test_set": []},
        )
        assert resp.status_code == 422

    async def test_missing_collection_returns_422(self, client: AsyncClient):
        resp = await client.post(
            "/eval/run",
            json={"test_set": _SAMPLE_TEST_SET},
        )
        assert resp.status_code == 422


# ── API: GET /eval/metrics ────────────────────────────────────────────────────


@pytest.mark.asyncio
class TestGetMetrics:
    async def _create_run(self, client: AsyncClient) -> str:
        with patch("fastapi.BackgroundTasks.add_task"):
            resp = await client.post(
                "/eval/run",
                json={"collection": "test-col", "test_set": _SAMPLE_TEST_SET},
            )
        return resp.json()["run_id"]

    async def test_running_run_returns_202(self, client: AsyncClient):
        run_id = await self._create_run(client)
        resp = await client.get(f"/eval/metrics?run_id={run_id}")
        assert resp.status_code == 202

    async def test_nonexistent_run_returns_404(self, client: AsyncClient):
        fake_id = str(uuid.uuid4())
        resp = await client.get(f"/eval/metrics?run_id={fake_id}")
        assert resp.status_code == 404

    async def test_completed_run_returns_metrics(self, client: AsyncClient):
        run_id = await self._create_run(client)
        # Manually mark the in-memory run as complete
        from api.routes.eval import _runs

        _runs[run_id].update({"status": "complete", **_SAMPLE_SCORES})

        resp = await client.get(f"/eval/metrics?run_id={run_id}")
        assert resp.status_code == 200
        metrics = resp.json()
        assert len(metrics) == 4
        names = {m["metric"] for m in metrics}
        assert names == {
            "faithfulness",
            "answer_relevancy",
            "context_recall",
            "context_precision",
        }


# ── API: GET /eval/history ────────────────────────────────────────────────────


@pytest.mark.asyncio
class TestEvalHistory:
    async def test_history_contains_started_run(self, client: AsyncClient):
        with patch("fastapi.BackgroundTasks.add_task"):
            await client.post(
                "/eval/run",
                json={"collection": "hist-col", "test_set": _SAMPLE_TEST_SET},
            )
        resp = await client.get("/eval/history")
        assert resp.status_code == 200
        history = resp.json()
        assert any(r["collection"] == "hist-col" for r in history)

    async def test_history_newest_first(self, client: AsyncClient):
        with patch("fastapi.BackgroundTasks.add_task"):
            for col in ["col-alpha", "col-beta"]:
                await client.post(
                    "/eval/run",
                    json={"collection": col, "test_set": _SAMPLE_TEST_SET},
                )
        resp = await client.get("/eval/history")
        history = resp.json()
        if len(history) >= 2:
            assert history[0]["created_at"] >= history[1]["created_at"]

    async def test_history_run_fields_present(self, client: AsyncClient):
        with patch("fastapi.BackgroundTasks.add_task"):
            await client.post(
                "/eval/run",
                json={"collection": "field-check-col", "test_set": _SAMPLE_TEST_SET},
            )
        history = (await client.get("/eval/history")).json()
        run = next(r for r in history if r["collection"] == "field-check-col")
        assert "run_id" in run
        assert "status" in run
        assert "created_at" in run
        assert run["status"] in ("running", "complete", "failed")
