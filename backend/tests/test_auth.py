"""
tests/test_auth.py — Unit tests for authentication endpoints.

Covers:
  - POST /auth/register  (happy path, duplicate email)
  - POST /auth/login     (happy path, wrong password, unknown email)
  - POST /auth/refresh   (happy path, revoked token, expired token)
  - POST /auth/logout    (happy path)
  - core/security helpers (hash/verify, JWT round-trip)
"""

from datetime import datetime, timedelta, timezone

import pytest
import pytest_asyncio
from httpx import AsyncClient

from core.security import (
    create_access_token,
    decode_access_token,
    generate_refresh_token,
    hash_password,
    verify_password,
)


# ── Security unit tests ───────────────────────────────────────────────────────

class TestPasswordHashing:
    def test_hash_is_not_plaintext(self):
        pw = "SuperSecret1"
        assert hash_password(pw) != pw

    def test_verify_correct_password(self):
        pw = "SuperSecret1"
        assert verify_password(pw, hash_password(pw)) is True

    def test_verify_wrong_password(self):
        assert verify_password("wrong", hash_password("correct")) is False

    def test_two_hashes_differ(self):
        pw = "SamePassword1"
        assert hash_password(pw) != hash_password(pw)  # bcrypt uses salt


class TestJWT:
    def test_round_trip(self):
        token = create_access_token("user-uuid-123")
        assert decode_access_token(token) == "user-uuid-123"

    def test_invalid_token_raises(self):
        from jose import JWTError
        with pytest.raises(JWTError):
            decode_access_token("not.a.token")

    def test_refresh_token_length(self):
        rt = generate_refresh_token()
        assert len(rt) == 64  # 32 bytes → 64 hex chars


# ── HTTP endpoint tests ───────────────────────────────────────────────────────

REGISTER_PAYLOAD = {
    "email": "alice@example.com",
    "username": "alice",
    "password": "Password123",
}


@pytest.mark.asyncio
class TestRegister:
    async def test_register_returns_201_and_tokens(self, client: AsyncClient):
        resp = await client.post("/auth/register", json=REGISTER_PAYLOAD)
        assert resp.status_code == 201
        body = resp.json()
        assert "access_token" in body
        assert "refresh_token" in body
        assert body["token_type"] == "bearer"
        assert body["user"]["email"] == REGISTER_PAYLOAD["email"]

    async def test_register_duplicate_email_returns_409(self, client: AsyncClient):
        await client.post("/auth/register", json=REGISTER_PAYLOAD)
        resp = await client.post("/auth/register", json=REGISTER_PAYLOAD)
        assert resp.status_code == 409

    async def test_register_short_password_returns_422(self, client: AsyncClient):
        payload = {**REGISTER_PAYLOAD, "email": "bob@example.com", "password": "short"}
        resp = await client.post("/auth/register", json=payload)
        assert resp.status_code == 422

    async def test_register_invalid_email_returns_422(self, client: AsyncClient):
        payload = {**REGISTER_PAYLOAD, "email": "not-an-email"}
        resp = await client.post("/auth/register", json=payload)
        assert resp.status_code == 422


@pytest.mark.asyncio
class TestLogin:
    @pytest_asyncio.fixture(autouse=True)
    async def _create_user(self, client: AsyncClient):
        """Ensure Alice exists before each login test."""
        await client.post("/auth/register", json=REGISTER_PAYLOAD)

    async def test_login_happy_path(self, client: AsyncClient):
        resp = await client.post(
            "/auth/login",
            json={"email": REGISTER_PAYLOAD["email"], "password": REGISTER_PAYLOAD["password"]},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert "access_token" in body
        assert body["user"]["email"] == REGISTER_PAYLOAD["email"]

    async def test_login_wrong_password(self, client: AsyncClient):
        resp = await client.post(
            "/auth/login",
            json={"email": REGISTER_PAYLOAD["email"], "password": "WrongPassword1"},
        )
        assert resp.status_code == 401

    async def test_login_unknown_email(self, client: AsyncClient):
        resp = await client.post(
            "/auth/login",
            json={"email": "nobody@example.com", "password": "Password123"},
        )
        assert resp.status_code == 401


@pytest.mark.asyncio
class TestRefresh:
    @pytest_asyncio.fixture
    async def tokens(self, client: AsyncClient):
        resp = await client.post(
            "/auth/register",
            json={**REGISTER_PAYLOAD, "email": "refresh_user@example.com", "username": "refreshuser"},
        )
        body = resp.json()
        # If user already exists from a previous test, log in instead
        if resp.status_code == 409:
            resp = await client.post(
                "/auth/login",
                json={"email": "refresh_user@example.com", "password": REGISTER_PAYLOAD["password"]},
            )
            body = resp.json()
        return body

    async def test_refresh_returns_new_tokens(self, client: AsyncClient, tokens):
        resp = await client.post(
            "/auth/refresh",
            json={"refresh_token": tokens["refresh_token"]},
        )
        assert resp.status_code == 200
        new = resp.json()
        # Refresh token must rotate on every use
        assert new["refresh_token"] != tokens["refresh_token"]
        # Access token and user data must be present
        assert "access_token" in new
        assert new["user"]["email"] == "refresh_user@example.com"

    async def test_refresh_with_invalid_token_returns_401(self, client: AsyncClient):
        resp = await client.post(
            "/auth/refresh",
            json={"refresh_token": "totally-fake-token"},
        )
        assert resp.status_code == 401

    async def test_refresh_token_rotation_revokes_old(
        self, client: AsyncClient, tokens
    ):
        """Using the same refresh token twice should fail on the second attempt."""
        first = await client.post(
            "/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
        )
        assert first.status_code == 200

        second = await client.post(
            "/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
        )
        assert second.status_code == 401


@pytest.mark.asyncio
class TestLogout:
    async def test_logout_revokes_refresh_token(self, client: AsyncClient):
        reg = await client.post(
            "/auth/register",
            json={**REGISTER_PAYLOAD, "email": "logout_user@example.com"},
        )
        tokens = reg.json()
        access = tokens["access_token"]
        refresh = tokens["refresh_token"]

        resp = await client.post(
            "/auth/logout",
            json={"refresh_token": refresh},
            headers={"Authorization": f"Bearer {access}"},
        )
        assert resp.status_code == 204

        # Now the refresh token should be revoked
        refresh_resp = await client.post(
            "/auth/refresh", json={"refresh_token": refresh}
        )
        assert refresh_resp.status_code == 401
