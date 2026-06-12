"""
tests/test_eval.py — Phase 7 unit + integration tests.

RAGAS evaluate() and the RAG chain are mocked throughout so no LLM
API keys are required.

Covers:
  Unit:
    - MetricResult.from_score   — pass/fail logic, score rounding
    - run_evaluation            — happy path, no-key fallback, empty test_set error

  API:
    POST /eval/run      — 202 accepted, background task starts, auth required
    GET  /eval/metrics  — 200 with scores, 202 while running, 404 not found
    GET  /eval/history  — empty list, populated list, scoped to user, auth required
"""

from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, patch

import pytest
import pytest_asyncio
from httpx import AsyncClient

# ── Fixtures ──────────────────────────────────────────────────────────────────

REGISTER = {
    "email": "eval_user@example.com",
    "username": "evaluser",
    "password": "Password123",
}

OTHER_REGISTER = {
    "email": "other_eval@example.com",
    "username": "othereval",
    "password": "Password123",
}


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient) -> dict:
    resp = await client.post("/auth/register", json=REGISTER)
    if resp.status_code == 409:
        resp = await client.post(
            "/auth/login",
            json={"email": REGISTER["email"], "password": REGISTER["password"]},
        )
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


@pytest_asyncio.fixture
async def other_headers(client: AsyncClient) -> dict:
    resp = await client.post("/auth/register", json=OTHER_REGISTER)
    if resp.status_code == 409:
        resp = await client.post(
            "/auth/login",
            json={"email": OTHER_REGISTER["email"], "password": OTHER_REGISTER["password"]},
        )
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


_SAMPLE_TEST_SET = [
    {"question": "What is RAG?", "ground_truth": "RAG stands for Retrieval-Augmented Generation."},
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

        for metric in ("faithfulness", "answer_relevancy", "context_recall", "context_precision"):
            assert metric in METRIC_TARGETS
            assert 0.0 < METRIC_TARGETS[metric] <= 1.0


# ── Unit: run_evaluation ──────────────────────────────────────────────────────


@pytest.mark.asyncio
class TestRunEvaluation:
    async def test_happy_path_returns_scores(self):
        from core.evaluation.ragas_runner import run_evaluation
        from core.generation.chain import Citation, RAGResult
        from core.retrieval.vectorstore import SearchResult

        mock_rag = RAGResult(
            answer="RAG is Retrieval-Augmented Generation.",
            citations=[Citation(source="doc.pdf", page=1, chunk="excerpt")],
            session_id="eval-sess",
            latency_ms=100,
            context_chunks=[
                SearchResult(
                    chunk_text="RAG stands for retrieval augmented generation",
                    source="doc.pdf",
                    page=1,
                    score=0.9,
                    doc_id="d1",
                )
            ],
        )

        with patch(
            "core.evaluation.ragas_runner.run_rag_chain",
            new_callable=AsyncMock,
            return_value=mock_rag,
        ):
            with patch("core.evaluation.ragas_runner._eval_executor"):
                async def fake_executor(executor, fn):
                    return dict(_SAMPLE_SCORES)

                with patch("asyncio.AbstractEventLoop.run_in_executor", new=fake_executor):
                    scores = await run_evaluation(
                        collection="test-col", test_set=_SAMPLE_TEST_SET
                    )
        assert isinstance(scores, dict)

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

    async def test_no_llm_key_returns_none_scores(self):
        """When LLM is not configured, scores should all be None (not crash)."""
        from core.evaluation.ragas_runner import run_evaluation
        from core.generation.chain import RAGResult

        mock_rag = RAGResult(
            answer="answer",
            citations=[],
            session_id="s",
            latency_ms=10,
            context_chunks=[],
        )
        with patch(
            "core.evaluation.ragas_runner.run_rag_chain",
            new_callable=AsyncMock,
            return_value=mock_rag,
        ):
            with patch(
                "core.evaluation.ragas_runner.get_llm",
                side_effect=RuntimeError("No LLM API key"),
            ):
                scores = await run_evaluation(collection="col", test_set=_SAMPLE_TEST_SET)

        assert all(v is None for v in scores.values())


# ── API: POST /eval/run ───────────────────────────────────────────────────────


@pytest.mark.asyncio
class TestStartEvalRun:
    async def test_returns_202_accepted(self, client: AsyncClient, auth_headers):
        # Patch add_task so the background coroutine never actually runs
        with patch("fastapi.BackgroundTasks.add_task"):
            resp = await client.post(
                "/eval/run",
                json={"collection": "test-col", "test_set": _SAMPLE_TEST_SET},
                headers=auth_headers,
            )
        assert resp.status_code == 202

    async def test_response_has_run_id_and_status_running(
        self, client: AsyncClient, auth_headers
    ):
        with patch("fastapi.BackgroundTasks.add_task"):
            resp = await client.post(
                "/eval/run",
                json={"collection": "test-col", "test_set": _SAMPLE_TEST_SET},
                headers=auth_headers,
            )
        body = resp.json()
        assert "run_id" in body
        assert body["status"] == "running"
        assert body["collection"] == "test-col"
        assert "created_at" in body

    async def test_requires_auth(self, client: AsyncClient):
        resp = await client.post(
            "/eval/run",
            json={"collection": "col", "test_set": _SAMPLE_TEST_SET},
        )
        assert resp.status_code == 401

    async def test_empty_test_set_returns_422(self, client: AsyncClient, auth_headers):
        resp = await client.post(
            "/eval/run",
            json={"collection": "col", "test_set": []},
            headers=auth_headers,
        )
        assert resp.status_code == 422

    async def test_missing_collection_returns_422(self, client: AsyncClient, auth_headers):
        resp = await client.post(
            "/eval/run",
            json={"test_set": _SAMPLE_TEST_SET},
            headers=auth_headers,
        )
        assert resp.status_code == 422


# ── API: GET /eval/metrics ────────────────────────────────────────────────────


@pytest.mark.asyncio
class TestGetMetrics:
    async def _create_completed_run(
        self, client: AsyncClient, auth_headers: dict, db_session
    ) -> str:
        with patch("fastapi.BackgroundTasks.add_task"):
            resp = await client.post(
                "/eval/run",
                json={"collection": "test-col", "test_set": _SAMPLE_TEST_SET},
                headers=auth_headers,
            )
        run_id = resp.json()["run_id"]

        from sqlalchemy.future import select

        from db.models.eval_result import EvalRun

        result = await db_session.execute(
            select(EvalRun).where(EvalRun.id == uuid.UUID(run_id))
        )
        run = result.scalar_one()
        run.status = "complete"
        run.faithfulness = _SAMPLE_SCORES["faithfulness"]
        run.answer_relevancy = _SAMPLE_SCORES["answer_relevancy"]
        run.context_recall = _SAMPLE_SCORES["context_recall"]
        run.context_precision = _SAMPLE_SCORES["context_precision"]
        db_session.add(run)
        await db_session.flush()
        return run_id

    async def test_metrics_for_completed_run(
        self, client: AsyncClient, auth_headers, db_session
    ):
        run_id = await self._create_completed_run(client, auth_headers, db_session)
        resp = await client.get(f"/eval/metrics?run_id={run_id}", headers=auth_headers)
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

    async def test_metrics_have_pass_fail_flags(
        self, client: AsyncClient, auth_headers, db_session
    ):
        run_id = await self._create_completed_run(client, auth_headers, db_session)
        resp = await client.get(f"/eval/metrics?run_id={run_id}", headers=auth_headers)
        for metric in resp.json():
            assert "passed" in metric
            assert "target" in metric
            assert "score" in metric
            assert metric["passed"] == (metric["score"] >= metric["target"])

    async def test_running_run_returns_202(self, client: AsyncClient, auth_headers):
        with patch("fastapi.BackgroundTasks.add_task"):
            resp = await client.post(
                "/eval/run",
                json={"collection": "col", "test_set": _SAMPLE_TEST_SET},
                headers=auth_headers,
            )
        run_id = resp.json()["run_id"]
        resp = await client.get(f"/eval/metrics?run_id={run_id}", headers=auth_headers)
        assert resp.status_code == 202

    async def test_nonexistent_run_returns_404(self, client: AsyncClient, auth_headers):
        fake_id = str(uuid.uuid4())
        resp = await client.get(f"/eval/metrics?run_id={fake_id}", headers=auth_headers)
        assert resp.status_code == 404

    async def test_metrics_requires_auth(self, client: AsyncClient):
        resp = await client.get(f"/eval/metrics?run_id={uuid.uuid4()}")
        assert resp.status_code == 401

    async def test_cannot_access_other_users_run(
        self, client: AsyncClient, auth_headers, other_headers, db_session
    ):
        run_id = await self._create_completed_run(client, auth_headers, db_session)
        resp = await client.get(f"/eval/metrics?run_id={run_id}", headers=other_headers)
        assert resp.status_code == 404


# ── API: GET /eval/history ────────────────────────────────────────────────────


@pytest.mark.asyncio
class TestEvalHistory:
    async def test_empty_history_for_new_user(self, client: AsyncClient):
        """A brand-new user with no runs should get an empty list."""
        unique = {
            "email": f"eval_hist_{uuid.uuid4().hex[:8]}@example.com",
            "username": f"evhist{uuid.uuid4().hex[:6]}",
            "password": "Password123",
        }
        reg = await client.post("/auth/register", json=unique)
        headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}
        resp = await client.get("/eval/history", headers=headers)
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_history_requires_auth(self, client: AsyncClient):
        resp = await client.get("/eval/history")
        assert resp.status_code == 401

    async def test_history_contains_started_run(self, client: AsyncClient, auth_headers):
        with patch("fastapi.BackgroundTasks.add_task"):
            await client.post(
                "/eval/run",
                json={"collection": "hist-col", "test_set": _SAMPLE_TEST_SET},
                headers=auth_headers,
            )
        resp = await client.get("/eval/history", headers=auth_headers)
        assert resp.status_code == 200
        history = resp.json()
        assert len(history) >= 1
        assert any(r["collection"] == "hist-col" for r in history)

    async def test_history_newest_first(self, client: AsyncClient, auth_headers):
        with patch("fastapi.BackgroundTasks.add_task"):
            for col in ["col-alpha", "col-beta"]:
                await client.post(
                    "/eval/run",
                    json={"collection": col, "test_set": _SAMPLE_TEST_SET},
                    headers=auth_headers,
                )
        resp = await client.get("/eval/history", headers=auth_headers)
        history = resp.json()
        if len(history) >= 2:
            assert history[0]["created_at"] >= history[1]["created_at"]

    async def test_history_scoped_to_user(
        self, client: AsyncClient, auth_headers, other_headers
    ):
        with patch("fastapi.BackgroundTasks.add_task"):
            await client.post(
                "/eval/run",
                json={"collection": "user-a-col", "test_set": _SAMPLE_TEST_SET},
                headers=auth_headers,
            )
        resp = await client.get("/eval/history", headers=other_headers)
        history = resp.json()
        assert all(r["collection"] != "user-a-col" for r in history)

    async def test_history_run_fields_present(self, client: AsyncClient, auth_headers):
        with patch("fastapi.BackgroundTasks.add_task"):
            await client.post(
                "/eval/run",
                json={"collection": "field-check-col", "test_set": _SAMPLE_TEST_SET},
                headers=auth_headers,
            )
        history = (await client.get("/eval/history", headers=auth_headers)).json()
        run = next(r for r in history if r["collection"] == "field-check-col")
        assert "run_id" in run
        assert "status" in run
        assert "created_at" in run
        assert run["status"] in ("running", "complete", "failed")
