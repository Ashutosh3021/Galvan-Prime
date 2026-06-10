"""
api/deps.py — Shared FastAPI dependencies.

Provides:
  - get_db   → yields an AsyncSession (re-exported from db.session)
  - get_current_user → decodes the JWT and returns the active User row
"""

import uuid

from fastapi import Depends, HTTPException, status
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.middleware.auth import oauth2_scheme
from core.security import decode_access_token
from db.models.user import User
from db.session import get_db

# Re-export get_db so callers only need to import from api.deps
__all__ = ["get_db", "get_current_user"]


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    FastAPI dependency that resolves the Bearer token to an active User.

    Raises HTTP 401 if the token is invalid or the user does not exist /
    is inactive.
    """
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        user_id_str = decode_access_token(token)
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exc

    result = await db.execute(select(User).where(User.id == user_id))
    user: User | None = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise credentials_exc

    return user
