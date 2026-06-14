"""
tests/test_ingest.py — Tests for Phase 2 ingestion endpoints.

Real ChromaDB and encoder are expensive in CI, so the core ingestion
service is mocked at the route boundary.  Loader and chunker unit tests
run fully in-process without any network or model calls.

Covers:
  Unit:
    - load_text: happy path, empty file error
    - load_url: mocked HTTP fetch
    - fixed_chunk / semantic_chunk: output shape
  API:
    POST /ingest    — file upload (mocked service), URL upload, validation errors
    GET  /ingest/collections — empty list, populated list
    DELETE /ingest/{doc_id}  — 204, not found
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

from schemas.ingest import IngestOut


def _make_ingest_out(doc_id=None) -> IngestOut:
    return IngestOut(
        doc_id=doc_id or uuid.uuid4(),
        filename="test.txt",
        collection="test-col",
        chunk_count=5,
        chunk_strategy="fixed",
        status="ready",
        ingested_at=datetime.now(timezone.utc),
    )


# ── Unit tests: loaders ───────────────────────────────────────────────────────


class TestLoaders:
    def test_load_text_happy_path(self):
        from core.ingestion.loaders import load_text

        pages = load_text(b"Hello. World.", "test.txt")
        assert len(pages) == 1
        assert pages[0].text == "Hello. World."
        assert pages[0].source == "test.txt"
        assert pages[0].page is None

    def test_load_text_empty_raises(self):
        from core.ingestion.loaders import load_text

        with pytest.raises(ValueError, match="empty"):
            load_text(b"   ", "blank.txt")

    def test_load_text_utf8_fallback(self):
        from core.ingestion.loaders import load_text

        latin_bytes = "café".encode("latin-1")
        pages = load_text(latin_bytes, "latin.txt")
        assert "caf" in pages[0].text

    def test_load_url_fetches_text(self):
        from core.ingestion.loaders import load_url

        html = "<html><body><p>Important content here.</p></body></html>"
        with patch("core.ingestion.loaders.requests.get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.text = html
            mock_resp.raise_for_status = MagicMock()
            mock_get.return_value = mock_resp
            pages = load_url("https://example.com")
        assert len(pages) == 1
        assert "Important content" in pages[0].text

    def test_load_url_http_error_raises(self):
        import requests as req

        from core.ingestion.loaders import load_url

        with patch("core.ingestion.loaders.requests.get") as mock_get:
            mock_get.side_effect = req.RequestException("timeout")
            with pytest.raises(ValueError, match="Failed to fetch"):
                load_url("https://bad.example.com")


# ── Unit tests: chunkers ──────────────────────────────────────────────────────


class TestChunkers:
    def _make_pages(self, text: str, n: int = 1):
        from core.ingestion.loaders import RawPage

        return [RawPage(text=text, page=i + 1, source="test.txt") for i in range(n)]

    def test_fixed_chunk_produces_chunks(self):
        from core.ingestion.chunkers import fixed_chunk

        long_text = "The quick brown fox jumps over the lazy dog. " * 50
        pages = self._make_pages(long_text)
        chunks = fixed_chunk(pages, chunk_size=200, overlap=20)
        assert len(chunks) > 1
        for c in chunks:
            assert len(c.text) <= 250

    def test_fixed_chunk_preserves_source(self):
        from core.ingestion.chunkers import fixed_chunk

        pages = self._make_pages("Short text.")
        chunks = fixed_chunk(pages)
        assert all(c.source == "test.txt" for c in chunks)

    def test_semantic_chunk_produces_chunks(self):
        from core.ingestion.chunkers import semantic_chunk

        text = "First sentence. Second sentence. Third sentence. " * 30
        pages = self._make_pages(text)
        chunks = semantic_chunk(pages, target_size=200)
        assert len(chunks) > 1

    def test_empty_pages_returns_empty(self):
        from core.ingestion.chunkers import fixed_chunk, semantic_chunk

        assert fixed_chunk([]) == []
        assert semantic_chunk([]) == []


# ── API tests: POST /ingest ───────────────────────────────────────────────────


@pytest.mark.asyncio
class TestIngestEndpoint:
    async def test_ingest_txt_file(self, client: AsyncClient):
        mock_out = _make_ingest_out()
        with patch(
            "api.routes.ingest.ingest_document",
            new_callable=AsyncMock,
            return_value=mock_out,
        ):
            resp = await client.post(
                "/ingest",
                data={"collection": "test-col", "chunk_strategy": "fixed"},
                files={
                    "file": ("test.txt", b"Hello world test content.", "text/plain")
                },
            )
        assert resp.status_code == 201
        body = resp.json()
        assert body["collection"] == "test-col"
        assert body["status"] == "ready"
        assert body["chunk_count"] == 5

    async def test_ingest_without_file_or_url_returns_422(self, client: AsyncClient):
        resp = await client.post(
            "/ingest",
            data={"collection": "test-col"},
        )
        assert resp.status_code == 422

    async def test_ingest_with_both_file_and_url_returns_422(self, client: AsyncClient):
        resp = await client.post(
            "/ingest",
            data={"collection": "test-col", "url": "https://example.com"},
            files={"file": ("test.txt", b"content", "text/plain")},
        )
        assert resp.status_code == 422

    async def test_ingest_unsupported_file_type_returns_415(self, client: AsyncClient):
        resp = await client.post(
            "/ingest",
            data={"collection": "test-col"},
            files={
                "file": (
                    "test.docx",
                    b"content",
                    "application/vnd.openxmlformats-officedocument",
                )
            },
        )
        assert resp.status_code == 415

    async def test_ingest_url(self, client: AsyncClient):
        mock_out = _make_ingest_out()
        mock_out = mock_out.model_copy(update={"filename": "https://example.com"})
        with patch(
            "api.routes.ingest.ingest_document",
            new_callable=AsyncMock,
            return_value=mock_out,
        ):
            resp = await client.post(
                "/ingest",
                data={"collection": "test-col", "url": "https://example.com"},
            )
        assert resp.status_code == 201

    async def test_ingest_service_error_returns_422(self, client: AsyncClient):
        with patch(
            "api.routes.ingest.ingest_document",
            new_callable=AsyncMock,
            side_effect=ValueError("bad PDF"),
        ):
            resp = await client.post(
                "/ingest",
                data={"collection": "test-col"},
                files={"file": ("test.txt", b"content", "text/plain")},
            )
        assert resp.status_code == 422
        assert "bad PDF" in resp.json()["detail"]


# ── API tests: GET /ingest/collections ───────────────────────────────────────


@pytest.mark.asyncio
class TestCollections:
    async def test_collections_empty_returns_200(self, client: AsyncClient):
        with patch("api.routes.ingest.get_collections", return_value=[]):
            resp = await client.get("/ingest/collections")
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_collections_returns_list(self, client: AsyncClient):
        mock_data = [
            {
                "name": "research",
                "doc_count": 3,
                "chunk_count": 120,
                "created_at": datetime.now(timezone.utc),
            },
            {
                "name": "notes",
                "doc_count": 1,
                "chunk_count": 10,
                "created_at": datetime.now(timezone.utc),
            },
        ]
        with patch("api.routes.ingest.get_collections", return_value=mock_data):
            resp = await client.get("/ingest/collections")
        assert resp.status_code == 200
        body = resp.json()
        assert len(body) == 2
        assert body[0]["name"] == "research"


# ── API tests: DELETE /ingest/{doc_id} ────────────────────────────────────────


@pytest.mark.asyncio
class TestDeleteDocument:
    async def test_delete_succeeds_when_vectors_exist(self, client: AsyncClient):
        doc_id = uuid.uuid4()
        with patch("api.routes.ingest.ChromaStore") as mock_store_cls:
            mock_store = MagicMock()
            mock_store_cls.return_value = mock_store
            resp = await client.delete(f"/ingest/{doc_id}?collection=test-col")
        assert resp.status_code == 204

    async def test_delete_raises_404_on_error(self, client: AsyncClient):
        doc_id = uuid.uuid4()
        with patch("api.routes.ingest.ChromaStore") as mock_store_cls:
            mock_store_cls.side_effect = Exception("collection not found")
            resp = await client.delete(f"/ingest/{doc_id}?collection=missing-col")
        assert resp.status_code == 404
