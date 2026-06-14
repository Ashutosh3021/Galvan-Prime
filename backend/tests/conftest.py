"""
tests/conftest.py — Shared pytest fixtures.

No database needed.  Provides a plain httpx AsyncClient wired to the app.
"""

import os

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

os.environ.setdefault("ENVIRONMENT", "development")


@pytest_asyncio.fixture
async def client():
    """Yield an httpx AsyncClient wired to the FastAPI app."""
    from main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
