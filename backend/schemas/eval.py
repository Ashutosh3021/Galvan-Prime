"""
schemas/eval.py — Evaluation request/response models.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class EvalTestItem(BaseModel):
    question: str = Field(min_length=1)
    ground_truth: str = Field(min_length=1)


class EvalRunIn(BaseModel):
    collection: str = Field(min_length=1, max_length=128)
    test_set: list[EvalTestItem] = Field(min_length=1, description="At least one question/ground_truth pair")

    @field_validator("test_set")
    @classmethod
    def test_set_not_empty(cls, v: list) -> list:
        if len(v) == 0:
            raise ValueError("test_set must contain at least one item")
        return v


class EvalRunOut(BaseModel):
    run_id: uuid.UUID
    collection: str
    status: Literal["running", "complete", "failed"]
    faithfulness: float | None = None
    answer_relevancy: float | None = None
    context_recall: float | None = None
    context_precision: float | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MetricOut(BaseModel):
    metric: str
    score: float
    target: float
    passed: bool
