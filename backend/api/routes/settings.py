"""
api/routes/settings.py — User settings endpoints.

GET /settings — return the current user's settings
PUT /settings — update one or more settings fields (partial update)
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.deps import get_current_user, get_db
from db.models.user import User, UserSettings
from schemas.settings import SettingsOut, SettingsUpdateIn

router = APIRouter(prefix="/settings", tags=["settings"])


async def _get_or_create_settings(user: User, db: AsyncSession) -> UserSettings:
    """
    Return the UserSettings row for *user*, creating it with defaults
    if it doesn't exist yet (defensive: register already creates one).
    """
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == user.id))
    settings_row: UserSettings | None = result.scalar_one_or_none()

    if settings_row is None:
        settings_row = UserSettings(user_id=user.id)
        db.add(settings_row)
        await db.flush()

    return settings_row


# ── GET /settings ─────────────────────────────────────────────────────────────


@router.get(
    "",
    response_model=SettingsOut,
    summary="Get the current user's settings",
)
async def get_settings_route(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SettingsOut:
    row = await _get_or_create_settings(current_user, db)
    return SettingsOut.model_validate(row)


# ── PUT /settings ─────────────────────────────────────────────────────────────


@router.put(
    "",
    response_model=SettingsOut,
    summary="Update the current user's settings (partial update)",
)
async def update_settings(
    body: SettingsUpdateIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SettingsOut:
    row = await _get_or_create_settings(current_user, db)

    # Only update fields that were explicitly provided
    if body.llm_provider is not None:
        row.llm_provider = body.llm_provider
    if body.chunk_strategy is not None:
        row.chunk_strategy = body.chunk_strategy
    if body.default_collection is not None:
        row.default_collection = body.default_collection
    if body.eval_auto_run is not None:
        row.eval_auto_run = body.eval_auto_run

    db.add(row)
    await db.flush()
    await db.refresh(row)

    return SettingsOut.model_validate(row)
