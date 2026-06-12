"""
core/security.py — Password hashing, JWT creation/verification,
and refresh-token generation utilities.
"""

import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from config import get_settings

settings = get_settings()

ALGORITHM = "HS256"


# ── Password helpers ──────────────────────────────────────────────────────────


def hash_password(plain: str) -> str:
    """Return a bcrypt hash of *plain*.

    bcrypt natively limits input to 72 bytes.  We SHA-256-prehash the
    password so longer passwords are safe, then base64-encode to keep the
    intermediate value printable/ASCII-safe for the bcrypt salt routine.
    """
    import base64
    import hashlib

    digest = base64.b64encode(hashlib.sha256(plain.encode()).digest())
    return bcrypt.hashpw(digest, bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if *plain* matches the stored bcrypt *hashed* value."""
    import base64
    import hashlib

    digest = base64.b64encode(hashlib.sha256(plain.encode()).digest())
    return bcrypt.checkpw(digest, hashed.encode())


# ── JWT helpers ───────────────────────────────────────────────────────────────


def create_access_token(subject: str) -> str:
    """
    Create a short-lived JWT access token.

    Args:
        subject: Typically the user's UUID as a string.

    Returns:
        Encoded JWT string.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str:
    """
    Decode and validate a JWT access token.

    Args:
        token: Raw JWT string.

    Returns:
        The ``sub`` claim (user UUID string).

    Raises:
        JWTError: If the token is invalid, expired, or has an unexpected type.
    """
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except JWTError:
        raise

    if payload.get("type") != "access":
        raise JWTError("Token is not an access token")

    subject: str | None = payload.get("sub")
    if subject is None:
        raise JWTError("Token missing 'sub' claim")

    return subject


# ── Refresh-token helpers ─────────────────────────────────────────────────────


def generate_refresh_token() -> str:
    """Return a 64-character cryptographically secure hex token."""
    return secrets.token_hex(32)


def refresh_token_expiry() -> datetime:
    """Return the expiry datetime for a new refresh token."""
    return datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
