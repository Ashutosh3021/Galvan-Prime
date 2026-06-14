"""
tests/test_status.py — Tests for the status endpoint.

Covers:
  GET /status — returns api status, services list, uptime, version
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestStatus:
    async def test_status_returns_200(self, client: AsyncClient):
        resp = await client.get("/status")
        assert resp.status_code == 200

    async def test_status_has_required_fields(self, client: AsyncClient):
        resp = await client.get("/status")
        body = resp.json()
        assert "api" in body
        assert body["api"] in ("healthy", "degraded")
        assert "services" in body
        assert isinstance(body["services"], list)
        assert "uptime_seconds" in body
        assert "version" in body
        assert body["version"] == "1.0.0"

    async def test_status_services_have_correct_shape(self, client: AsyncClient):
        resp = await client.get("/status")
        services = resp.json()["services"]
        # chromadb, pinecone, llm
        assert len(services) == 3
        names = {s["name"] for s in services}
        assert names == {"chromadb", "pinecone", "llm"}
        for svc in services:
            assert svc["status"] in ("healthy", "degraded", "down")

    async def test_status_is_public(self, client: AsyncClient):
        """Status endpoint is public — no token needed."""
        resp = await client.get("/status")
        assert resp.status_code == 200

    async def test_uptime_is_non_negative(self, client: AsyncClient):
        resp = await client.get("/status")
        assert resp.json()["uptime_seconds"] >= 0
