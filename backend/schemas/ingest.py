"""
schemas/ingest.py — Ingestion request/response models.
"""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class IngestOut(BaseModel):
    doc_id: uuid.UUID
    filename: str
    collection: str
    chunk_count: int
    chunk_strategy: Literal["fixed", "semantic"]
    status: Literal["processing", "ready", "failed"]
    ingested_at: datetime

    model_config = {"from_attributes": True}


class CollectionOut(BaseModel):
    name: str
    doc_count: int
    chunk_count: int
    created_at: datetime


class DocumentOut(BaseModel):
    doc_id: str
    source: str
    collection: str
    chunk_count: int
    created_at: str
