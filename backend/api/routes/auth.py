"""
api/routes/auth.py — Authentication endpoints.

POST /auth/register  — create account + return tokens
POST /auth/login     — sign in + return tokens
POST /auth/refresh   — exchange refresh token for new token pair
POST /auth/logout    — revoke refresh token (204)
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.deps import get_current_user, get_db
from core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    refresh_token_expiry,
    verify_password,
)
from db.models.user import RefreshToken, User, UserSettings
from schemas.auth import LoginIn, RefreshIn, RegisterIn, TokenOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _build_token_out(user: User, raw_refresh: str) -> TokenOut:
    return TokenOut(
        access_token=create_access_token(str(user.id)),
        refresh_token=raw_refresh,
        user=UserOut.model_validate(user),
    )


# ── Register ──────────────────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=TokenOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user account",
)
async def register(body: RegisterIn, db: AsyncSession = Depends(get_db)) -> TokenOut:
    # Check e-mail uniqueness
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Persist user
    user = User(
        email=body.email,
        username=body.username,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    await db.flush()  # populate user.id before FK references

    # Create default settings row
    db.add(UserSettings(user_id=user.id))

    # Issue refresh token
    raw_refresh = generate_refresh_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token=raw_refresh,
            expires_at=refresh_token_expiry(),
        )
    )

    await db.commit()
    await db.refresh(user)

    return _build_token_out(user, raw_refresh)


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=TokenOut,
    summary="Sign in and receive JWT tokens",
)
async def login(body: LoginIn, db: AsyncSession = Depends(get_db)) -> TokenOut:
    result = await db.execute(select(User).where(User.email == body.email))
    user: User | None = result.scalar_one_or_none()

    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    raw_refresh = generate_refresh_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token=raw_refresh,
            expires_at=refresh_token_expiry(),
        )
    )
    await db.commit()

    return _build_token_out(user, raw_refresh)


# ── Refresh ───────────────────────────────────────────────────────────────────

@router.post(
    "/refresh",
    response_model=TokenOut,
    summary="Exchange a refresh token for a new token pair",
)
async def refresh(body: RefreshIn, db: AsyncSession = Depends(get_db)) -> TokenOut:
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token == body.refresh_token)
    )
    rt: RefreshToken | None = result.scalar_one_or_none()

    if rt is None or rt.revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked refresh token",
        )

    # Make the comparison timezone-safe: SQLite returns naive datetimes,
    # PostgreSQL returns aware ones.  Normalize both to UTC.
    expires_at = rt.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired",
        )

    # Revoke the old token (rotation)
    rt.revoked = True
    db.add(rt)

    # Load user
    user_result = await db.execute(select(User).where(User.id == rt.user_id))
    user: User = user_result.scalar_one()

    # Issue a fresh refresh token
    raw_refresh = generate_refresh_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token=raw_refresh,
            expires_at=refresh_token_expiry(),
        )
    )
    await db.commit()

    return _build_token_out(user, raw_refresh)


# ── Logout ────────────────────────────────────────────────────────────────────

@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke the current refresh token",
)
async def logout(
    body: RefreshIn,
    _current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token == body.refresh_token)
    )
    rt: RefreshToken | None = result.scalar_one_or_none()

    if rt is not None and not rt.revoked:
        rt.revoked = True
        db.add(rt)
        await db.commit()
