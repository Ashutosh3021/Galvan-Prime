"""
tests/test_profile_settings.py — Tests for Phase 5 endpoints.

Covers:
  GET /profile/me   — returns profile with doc/query counts
  PUT /profile/me   — updates username; validates min length
  GET /settings     — returns default settings
  PUT /settings     — partial update; unknown fields ignored
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient

# ── Fixtures ──────────────────────────────────────────────────────────────────

REGISTER = {
    "email": "profile_user@example.com",
    "username": "profileuser",
    "password": "Password123",
}


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient) -> dict:
    """Register a fresh user and return auth headers."""
    resp = await client.post("/auth/register", json=REGISTER)
    if resp.status_code == 409:
        resp = await client.post(
            "/auth/login",
            json={"email": REGISTER["email"], "password": REGISTER["password"]},
        )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── Profile tests ─────────────────────────────────────────────────────────────


@pytest.mark.asyncio
class TestProfile:
    async def test_get_profile_returns_user_data(self, client: AsyncClient, auth_headers):
        resp = await client.get("/profile/me", headers=auth_headers)
        assert resp.status_code == 200
        body = resp.json()
        assert body["email"] == REGISTER["email"]
        assert body["username"] == REGISTER["username"]
        assert body["doc_count"] == 0
        assert body["query_count"] == 0
        assert "id" in body
        assert "created_at" in body

    async def test_get_profile_requires_auth(self, client: AsyncClient):
        resp = await client.get("/profile/me")
        assert resp.status_code == 401

    async def test_update_username(self, client: AsyncClient, auth_headers):
        resp = await client.put(
            "/profile/me",
            json={"username": "newusername"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["username"] == "newusername"

    async def test_update_username_too_short_returns_422(self, client: AsyncClient, auth_headers):
        resp = await client.put(
            "/profile/me",
            json={"username": "ab"},  # min_length=3
            headers=auth_headers,
        )
        assert resp.status_code == 422

    async def test_update_username_requires_auth(self, client: AsyncClient):
        resp = await client.put("/profile/me", json={"username": "x"})
        assert resp.status_code == 401


# ── Settings tests ────────────────────────────────────────────────────────────


@pytest.mark.asyncio
class TestSettings:
    async def test_get_settings_returns_defaults(self, client: AsyncClient, auth_headers):
        resp = await client.get("/settings", headers=auth_headers)
        assert resp.status_code == 200
        body = resp.json()
        assert body["llm_provider"] == "gemini"
        assert body["chunk_strategy"] == "fixed"
        assert body["eval_auto_run"] is False
        assert body["default_collection"] is None

    async def test_get_settings_requires_auth(self, client: AsyncClient):
        resp = await client.get("/settings")
        assert resp.status_code == 401

    async def test_update_llm_provider(self, client: AsyncClient, auth_headers):
        resp = await client.put(
            "/settings",
            json={"llm_provider": "openai"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["llm_provider"] == "openai"

    async def test_update_chunk_strategy(self, client: AsyncClient, auth_headers):
        resp = await client.put(
            "/settings",
            json={"chunk_strategy": "semantic"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["chunk_strategy"] == "semantic"

    async def test_update_partial_preserves_other_fields(self, client: AsyncClient, auth_headers):
        # Set a known baseline
        await client.put(
            "/settings",
            json={"llm_provider": "gemini", "eval_auto_run": True},
            headers=auth_headers,
        )
        # Update only one field
        resp = await client.put("/settings", json={"chunk_strategy": "fixed"}, headers=auth_headers)
        assert resp.status_code == 200
        body = resp.json()
        # llm_provider and eval_auto_run should be unchanged
        assert body["llm_provider"] == "gemini"
        assert body["eval_auto_run"] is True
        assert body["chunk_strategy"] == "fixed"

    async def test_update_default_collection(self, client: AsyncClient, auth_headers):
        resp = await client.put(
            "/settings",
            json={"default_collection": "my-docs"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["default_collection"] == "my-docs"

    async def test_invalid_llm_provider_returns_422(self, client: AsyncClient, auth_headers):
        resp = await client.put(
            "/settings",
            json={"llm_provider": "anthropic"},  # not in Literal
            headers=auth_headers,
        )
        assert resp.status_code == 422

    async def test_settings_requires_auth(self, client: AsyncClient):
        resp = await client.put("/settings", json={"llm_provider": "openai"})
        assert resp.status_code == 401
