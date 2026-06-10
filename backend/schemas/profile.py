"""
schemas/profile.py — Profile request/response models (stub for Phase 5).
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class ProfileOut(BaseModel):
    id: uuid.UUID
    username: str
    email: EmailStr
    created_at: datetime
    doc_count: int = 0
    query_count: int = 0

    model_config = {"from_attributes": True}


class ProfileUpdateIn(BaseModel):
    username: str = Field(min_length=3, max_length=64)
