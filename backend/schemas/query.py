"""
schemas/query.py — Query request/response models.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class QueryIn(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    collection: str = Field(min_length=1, max_length=128)
    session_id: str = Field(min_length=1, max_length=64, description="UUID; frontend generates on new chat")


class Citation(BaseModel):
    source: str
    page: Optional[int] = None
    chunk: str  # excerpt text


class QueryOut(BaseModel):
    answer: str
    citations: list[Citation]
    session_id: str
    latency_ms: int


class HistoryOut(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    citations: list[Citation] | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
