"""
api/routes/eval.py — RAGAS evaluation endpoints.

POST /eval/run        — start an async evaluation run (returns immediately)
GET  /eval/metrics    — get per-metric scores for a completed run
GET  /eval/history    — list all eval runs for the current user
"""

from __future__ import annotations

import asyncio
import logging
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.deps import get_current_user, get_db
from core.evaluation.metrics import METRIC_TARGETS, MetricResult
from core.evaluation.ragas_runner import run_evaluation
from db.models.eval_result import EvalRun
from db.models.user import User
from schemas.eval import EvalRunIn, EvalRunOut, MetricOut

router = APIRouter(prefix="/eval", tags=["eval"])
logger = logging.getLogger(__name__)


# ── Background task ───────────────────────────────────────────────────────────

async def _run_eval_background(
    run_id: uuid.UUID,
    collection: str,
    test_set: list[dict],
) -> None:
    """
    Background coroutine: run RAGAS evaluation and persist scores.
    Opens its own DB session so it outlives the request session.
    """
    from db.session import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        try:
            scores = await run_evaluation(
                collection=collection,
                test_set=test_set,
                run_id=str(run_id),
            )

            result = await db.execute(select(EvalRun).where(EvalRun.id == run_id))
            run: EvalRun | None = result.scalar_one_or_none()
            if run is None:
                logger.error("EvalRun %s not found after task completion", run_id)
                return

            run.faithfulness = scores.get("faithfulness")
            run.answer_relevancy = scores.get("answer_relevancy")
            run.context_recall = scores.get("context_recall")
            run.context_precision = scores.get("context_precision")
            run.status = "complete"
            db.add(run)
            await db.commit()
            logger.info("EvalRun %s completed: %s", run_id, scores)

        except Exception as exc:
            logger.exception("EvalRun %s failed: %s", run_id, exc)
            async with AsyncSessionLocal() as err_db:
                result = await err_db.execute(select(EvalRun).where(EvalRun.id == run_id))
                run = result.scalar_one_or_none()
                if run:
                    run.status = "failed"
                    err_db.add(run)
                    await err_db.commit()


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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EvalRunOut:
    """
    Kick off a RAGAS evaluation run in the background.
    Returns immediately with status='running' and the run_id.
    """
    run = EvalRun(
        user_id=current_user.id,
        collection=body.collection,
        status="running",
    )
    db.add(run)
    await db.flush()
    await db.commit()

    test_set_dicts = [item.model_dump() for item in body.test_set]

    background_tasks.add_task(
        _run_eval_background,
        run_id=run.id,
        collection=body.collection,
        test_set=test_set_dicts,
    )

    logger.info(
        "EvalRun %s started: collection='%s' items=%d user=%s",
        run.id, body.collection, len(body.test_set), current_user.id,
    )

    return EvalRunOut(
        run_id=run.id,
        collection=run.collection,
        status=run.status,  # type: ignore[arg-type]
        created_at=run.created_at,
    )


# ── GET /eval/metrics ─────────────────────────────────────────────────────────

@router.get(
    "/metrics",
    response_model=list[MetricOut],
    summary="Get per-metric scores for a completed eval run",
)
async def get_metrics(
    run_id: uuid.UUID = Query(..., description="UUID of the eval run"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[MetricOut]:
    result = await db.execute(
        select(EvalRun).where(
            EvalRun.id == run_id,
            EvalRun.user_id == current_user.id,
        )
    )
    run: EvalRun | None = result.scalar_one_or_none()

    if run is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Eval run not found")

    if run.status == "running":
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail="Eval run is still in progress",
        )

    if run.status == "failed":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Eval run failed — check server logs",
        )

    metric_values: dict[str, float | None] = {
        "faithfulness": run.faithfulness,
        "answer_relevancy": run.answer_relevancy,
        "context_recall": run.context_recall,
        "context_precision": run.context_precision,
    }

    metrics: list[MetricOut] = []
    for name, score in metric_values.items():
        target = METRIC_TARGETS.get(name, 0.0)  # type: ignore[arg-type]
        metrics.append(
            MetricOut(
                metric=name,
                score=round(score, 4) if score is not None else 0.0,
                target=target,
                passed=(score is not None and score >= target),
            )
        )
    return metrics


# ── GET /eval/history ─────────────────────────────────────────────────────────

@router.get(
    "/history",
    response_model=list[EvalRunOut],
    summary="List all eval runs for the current user",
)
async def get_eval_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[EvalRunOut]:
    result = await db.execute(
        select(EvalRun)
        .where(EvalRun.user_id == current_user.id)
        .order_by(EvalRun.created_at.desc())
    )
    runs = result.scalars().all()
    return [
        EvalRunOut(
            run_id=run.id,
            collection=run.collection,
            status=run.status,  # type: ignore[arg-type]
            faithfulness=run.faithfulness,
            answer_relevancy=run.answer_relevancy,
            context_recall=run.context_recall,
            context_precision=run.context_precision,
            created_at=run.created_at,
        )
        for run in runs
    ]
