"""
api/routes/profile.py — User profile endpoints.

GET /profile/me  — return the current user's profile + stats
PUT /profile/me  — update username
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.deps import get_current_user, get_db
from db.models.document import Document
from db.models.query_log import QueryLog
from db.models.user import User
from schemas.profile import ProfileOut, ProfileUpdateIn

router = APIRouter(prefix="/profile", tags=["profile"])


# ── GET /profile/me ───────────────────────────────────────────────────────────


@router.get(
    "/me",
    response_model=ProfileOut,
    summary="Get the current user's profile",
)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfileOut:
    # Count documents owned by this user
    doc_result = await db.execute(
        select(func.count(Document.id)).where(Document.user_id == current_user.id)
    )
    doc_count: int = doc_result.scalar_one() or 0

    # Count query log entries (only user-role messages = actual questions asked)
    query_result = await db.execute(
        select(func.count(QueryLog.id)).where(
            QueryLog.user_id == current_user.id,
            QueryLog.role == "user",
        )
    )
    query_count: int = query_result.scalar_one() or 0

    return ProfileOut(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        created_at=current_user.created_at,
        doc_count=doc_count,
        query_count=query_count,
    )


# ── PUT /profile/me ───────────────────────────────────────────────────────────


@router.put(
    "/me",
    response_model=ProfileOut,
    summary="Update the current user's profile",
)
async def update_profile(
    body: ProfileUpdateIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfileOut:
    current_user.username = body.username
    db.add(current_user)
    await db.flush()
    await db.refresh(current_user)

    # Re-fetch counts after update
    doc_result = await db.execute(
        select(func.count(Document.id)).where(Document.user_id == current_user.id)
    )
    doc_count: int = doc_result.scalar_one() or 0

    query_result = await db.execute(
        select(func.count(QueryLog.id)).where(
            QueryLog.user_id == current_user.id,
            QueryLog.role == "user",
        )
    )
    query_count: int = query_result.scalar_one() or 0

    return ProfileOut(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        created_at=current_user.created_at,
        doc_count=doc_count,
        query_count=query_count,
    )
