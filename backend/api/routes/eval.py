"""
api/routes/eval.py — RAGAS evaluation endpoints.

POST /eval/run        — start an async evaluation run (returns immediately)
GET  /eval/metrics    — get per-metric scores for a completed run
GET  /eval/history    — list all eval runs (in-memory, resets on restart)
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, status

from core.evaluation.metrics import METRIC_TARGETS
from core.evaluation.ragas_runner import run_evaluation
from schemas.eval import EvalRunIn, EvalRunOut, MetricOut

router = APIRouter(prefix="/eval", tags=["eval"])
logger = logging.getLogger(__name__)

# In-memory store: run_id (str) → dict with run metadata + scores
_runs: dict[str, dict] = {}


# ── Background task ───────────────────────────────────────────────────────────


async def _run_eval_background(run_id: str, collection: str, test_set: list[dict]) -> None:
    try:
        scores = await run_evaluation(
            collection=collection,
            test_set=test_set,
            run_id=run_id,
        )
        _runs[run_id].update(
            {
                "status": "complete",
                "faithfulness": scores.get("faithfulness"),
                "answer_relevancy": scores.get("answer_relevancy"),
                "context_recall": scores.get("context_recall"),
                "context_precision": scores.get("context_precision"),
            }
        )
        logger.info("EvalRun %s completed: %s", run_id, scores)
    except Exception as exc:
        logger.exception("EvalRun %s failed: %s", run_id, exc)
        _runs[run_id]["status"] = "failed"


# ── POST /eval/run ────────────────────────────────────────────────────────────


@router.post(
    "/run",
    response_model=EvalRunOut,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Start an async RAGAS evaluation run",
)
async def start_eval_run(
    body: EvalRunIn,
    background_tasks: BackgroundTasks,
) -> EvalRunOut:
    run_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc)

    _runs[run_id] = {
        "run_id": run_id,
        "collection": body.collection,
        "status": "running",
        "faithfulness": None,
        "answer_relevancy": None,
        "context_recall": None,
        "context_precision": None,
        "created_at": created_at,
    }

    background_tasks.add_task(
        _run_eval_background,
        run_id=run_id,
        collection=body.collection,
        test_set=[item.model_dump() for item in body.test_set],
    )

    logger.info(
        "EvalRun %s started: collection='%s' items=%d",
        run_id,
        body.collection,
        len(body.test_set),
    )

    return EvalRunOut(
        run_id=uuid.UUID(run_id),
        collection=body.collection,
        status="running",
        created_at=created_at,
    )


# ── GET /eval/metrics ─────────────────────────────────────────────────────────


@router.get(
    "/metrics",
    response_model=list[MetricOut],
    summary="Get per-metric scores for a completed eval run",
)
async def get_metrics(
    run_id: uuid.UUID = Query(..., description="UUID of the eval run"),
) -> list[MetricOut]:
    run = _runs.get(str(run_id))
    if run is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Eval run not found")

    if run["status"] == "running":
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail="Eval run is still in progress",
        )

    if run["status"] == "failed":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Eval run failed — check server logs",
        )

    metric_values: dict[str, float | None] = {
        "faithfulness": run["faithfulness"],
        "answer_relevancy": run["answer_relevancy"],
        "context_recall": run["context_recall"],
        "context_precision": run["context_precision"],
    }

    return [
        MetricOut(
            metric=name,
            score=round(score, 4) if score is not None else 0.0,
            target=METRIC_TARGETS.get(name, 0.0),  # type: ignore[arg-type]
            passed=(score is not None and score >= METRIC_TARGETS.get(name, 0.0)),  # type: ignore[operator]
        )
        for name, score in metric_values.items()
    ]


# ── GET /eval/history ─────────────────────────────────────────────────────────


@router.get(
    "/history",
    response_model=list[EvalRunOut],
    summary="List all eval runs (in-memory, resets on restart)",
)
async def get_eval_history() -> list[EvalRunOut]:
    return [
        EvalRunOut(
            run_id=uuid.UUID(r["run_id"]),
            collection=r["collection"],
            status=r["status"],
            faithfulness=r["faithfulness"],
            answer_relevancy=r["answer_relevancy"],
            context_recall=r["context_recall"],
            context_precision=r["context_precision"],
            created_at=r["created_at"],
        )
        for r in sorted(_runs.values(), key=lambda x: x["created_at"], reverse=True)
    ]
