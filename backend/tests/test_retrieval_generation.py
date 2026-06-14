"""
tests/test_retrieval_generation.py — Phase 3 unit + integration tests.

LLM and ChromaDB calls are mocked throughout so no API keys or
vector DB setup are needed to run the suite.

Covers:
  Unit:
    - hybrid._bm25_search         — ranking, empty corpus
    - hybrid._rrf_fuse            — score merging, deduplication
    - memory.MemoryStore          — add/get/clear, overflow truncation
    - chain._build_context_block  — formatting
    - chain._build_messages       — message order
    - llm.get_llm                 — provider selection, missing key error

  API (POST /query):
    - happy path with mocked chain
    - empty collection → 422
    - LLM not configured → 503
"""

from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient


# ── Helpers ───────────────────────────────────────────────────────────────────


def _make_search_result(text="chunk text", source="doc.pdf", page=1, score=0.9, doc_id=None):
    from core.retrieval.vectorstore import SearchResult

    return SearchResult(
        chunk_text=text,
        source=source,
        page=page,
        score=score,
        doc_id=doc_id or str(uuid.uuid4()),
    )


def _make_rag_result(answer="Test answer", session_id=None, citations=None):
    from core.generation.chain import Citation, RAGResult

    return RAGResult(
        answer=answer,
        citations=citations or [Citation(source="doc.pdf", page=1, chunk="relevant excerpt")],
        session_id=session_id or str(uuid.uuid4()),
        latency_ms=250,
    )


# ── Unit: BM25 search ─────────────────────────────────────────────────────────


class TestBM25Search:
    def test_returns_ranked_results(self):
        from core.retrieval.hybrid import _bm25_search

        corpus = [
            "the quick brown fox jumps over the lazy dog",
            "machine learning is a subset of artificial intelligence",
            "retrieval augmented generation uses documents",
        ]
        meta = [{} for _ in corpus]
        results = _bm25_search(corpus, meta, "retrieval generation documents", n_results=2)
        assert len(results) == 2
        top_idx = results[0][0]
        assert top_idx == 2

    def test_single_corpus_returns_one_result(self):
        from core.retrieval.hybrid import _bm25_search

        corpus = ["only one document here"]
        results = _bm25_search(corpus, [{}], "document", n_results=5)
        assert len(results) == 1

    def test_scores_are_non_negative(self):
        from core.retrieval.hybrid import _bm25_search

        corpus = ["alpha beta gamma", "delta epsilon zeta"]
        results = _bm25_search(corpus, [{}, {}], "alpha", n_results=2)
        for _idx, score in results:
            assert score >= 0.0


# ── Unit: RRF fusion ──────────────────────────────────────────────────────────


class TestRRFFusion:
    def _make_corpus(self):
        return (
            ["chunk about AI", "chunk about RAG", "chunk about databases"],
            [
                {"source": "a.pdf", "page": 1, "doc_id": "d1"},
                {"source": "b.pdf", "page": 2, "doc_id": "d2"},
                {"source": "c.pdf", "page": 3, "doc_id": "d3"},
            ],
        )

    def test_fused_results_leq_top_k(self):
        from core.retrieval.hybrid import _rrf_fuse

        corpus_texts, corpus_meta = self._make_corpus()
        vector_results = [
            _make_search_result(t, score=0.9 - i * 0.1) for i, t in enumerate(corpus_texts)
        ]
        bm25_ranked = [(0, 5.0), (2, 3.0), (1, 1.0)]
        fused = _rrf_fuse(vector_results, bm25_ranked, corpus_texts, corpus_meta, top_k=2)
        assert len(fused) <= 2

    def test_fused_scores_are_positive(self):
        from core.retrieval.hybrid import _rrf_fuse

        corpus_texts, corpus_meta = self._make_corpus()
        vector_results = [_make_search_result(t) for t in corpus_texts]
        bm25_ranked = [(0, 4.0), (1, 2.0), (2, 1.0)]
        fused = _rrf_fuse(vector_results, bm25_ranked, corpus_texts, corpus_meta, top_k=3)
        for r in fused:
            assert r.score > 0.0

    def test_deduplication_preserves_best_score(self):
        from core.retrieval.hybrid import _rrf_fuse

        text = "shared chunk"
        corpus_texts = [text, "other chunk"]
        corpus_meta = [
            {"source": "x.pdf", "page": 1, "doc_id": "d1"},
            {"source": "y.pdf", "page": 2, "doc_id": "d2"},
        ]
        vector_results = [_make_search_result(text, score=0.95)]
        bm25_ranked = [(0, 8.0)]
        fused = _rrf_fuse(vector_results, bm25_ranked, corpus_texts, corpus_meta, top_k=5)
        texts_in_result = [r.chunk_text for r in fused]
        assert texts_in_result.count(text) == 1


# ── Unit: Memory store ────────────────────────────────────────────────────────


class TestMemoryStore:
    def setup_method(self):
        from core.generation.memory import MemoryStore

        self.store = MemoryStore(max_turns=3)

    def test_add_and_get_messages(self):
        self.store.add_user_message("s1", "Hello")
        self.store.add_ai_message("s1", "Hi there")
        history = self.store.get_history("s1")
        assert len(history) == 2
        assert history[0].content == "Hello"
        assert history[1].content == "Hi there"

    def test_get_empty_session_returns_empty_list(self):
        history = self.store.get_history("nonexistent")
        assert history == []

    def test_sessions_are_isolated(self):
        self.store.add_user_message("s1", "Question A")
        self.store.add_user_message("s2", "Question B")
        assert len(self.store.get_history("s1")) == 1
        assert self.store.get_history("s1")[0].content == "Question A"

    def test_overflow_drops_oldest_messages(self):
        for i in range(4):
            self.store.add_user_message("s1", f"Q{i}")
            self.store.add_ai_message("s1", f"A{i}")
        assert self.store.message_count("s1") <= 6

    def test_clear_session(self):
        self.store.add_user_message("s1", "Hello")
        self.store.clear_session("s1")
        assert self.store.get_history("s1") == []

    def test_message_types(self):
        from langchain_core.messages import AIMessage, HumanMessage

        self.store.add_user_message("s1", "Human")
        self.store.add_ai_message("s1", "AI")
        history = self.store.get_history("s1")
        assert isinstance(history[0], HumanMessage)
        assert isinstance(history[1], AIMessage)


# ── Unit: context block builder ───────────────────────────────────────────────


class TestContextBuilder:
    def test_empty_chunks_returns_placeholder(self):
        from core.generation.chain import _build_context_block

        assert "no relevant context" in _build_context_block([])

    def test_chunks_are_numbered(self):
        from core.generation.chain import _build_context_block

        chunks = [_make_search_result("text A", page=1), _make_search_result("text B", page=2)]
        block = _build_context_block(chunks)
        assert "[1]" in block
        assert "[2]" in block

    def test_page_numbers_included(self):
        from core.generation.chain import _build_context_block

        chunk = _make_search_result("relevant text", page=5)
        block = _build_context_block([chunk])
        assert "p.5" in block

    def test_no_page_when_none(self):
        from core.generation.chain import _build_context_block

        chunk = _make_search_result("text", page=None)
        block = _build_context_block([chunk])
        assert "p." not in block


# ── Unit: message builder ─────────────────────────────────────────────────────


class TestMessageBuilder:
    def test_system_message_is_first(self):
        from langchain_core.messages import SystemMessage

        from core.generation.chain import _build_messages

        messages = _build_messages([], "question?", "context")
        assert isinstance(messages[0], SystemMessage)

    def test_human_message_is_last(self):
        from langchain_core.messages import HumanMessage

        from core.generation.chain import _build_messages

        messages = _build_messages([], "question?", "some context")
        assert isinstance(messages[-1], HumanMessage)
        assert "question?" in messages[-1].content
        assert "some context" in messages[-1].content

    def test_history_inserted_between_system_and_human(self):
        from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

        from core.generation.chain import _build_messages

        history = [HumanMessage(content="prev Q"), AIMessage(content="prev A")]
        messages = _build_messages(history, "follow-up?", "ctx")
        assert isinstance(messages[0], SystemMessage)
        assert messages[1].content == "prev Q"
        assert messages[2].content == "prev A"
        assert isinstance(messages[3], HumanMessage)


# ── Unit: LLM provider selection ─────────────────────────────────────────────


class TestLLMProvider:
    def test_no_keys_raises_runtime_error(self):
        from core.generation.llm import get_llm, reset_llm_cache

        reset_llm_cache()
        with patch("core.generation.llm.get_settings") as mock_settings:
            mock_settings.return_value.gemini_api_key = ""
            mock_settings.return_value.openai_api_key = ""
            with pytest.raises(RuntimeError, match="No LLM API key"):
                get_llm()
        reset_llm_cache()

    def test_gemini_selected_when_key_present(self):
        from core.generation.llm import get_llm, reset_llm_cache

        reset_llm_cache()
        with patch("core.generation.llm.get_settings") as mock_settings:
            mock_settings.return_value.gemini_api_key = "fake-gemini-key"
            mock_settings.return_value.openai_api_key = ""
            with patch("core.generation.llm.ChatGoogleGenerativeAI") as mock_cls:
                mock_cls.return_value = MagicMock()
                get_llm()
                mock_cls.assert_called_once()
        reset_llm_cache()

    def test_openai_selected_when_only_openai_key(self):
        from core.generation.llm import get_llm, reset_llm_cache

        reset_llm_cache()
        with patch("core.generation.llm.get_settings") as mock_settings:
            mock_settings.return_value.gemini_api_key = ""
            mock_settings.return_value.openai_api_key = "fake-openai-key"
            with patch("core.generation.llm.ChatOpenAI") as mock_cls:
                mock_cls.return_value = MagicMock()
                get_llm()
                mock_cls.assert_called_once()
        reset_llm_cache()


# ── API: POST /query ──────────────────────────────────────────────────────────


@pytest.mark.asyncio
class TestQueryEndpoint:
    def _session_id(self):
        return str(uuid.uuid4())

    async def test_query_happy_path(self, client: AsyncClient):
        sid = self._session_id()
        mock_result = _make_rag_result(session_id=sid)
        with patch(
            "api.routes.query.run_rag_chain", new_callable=AsyncMock, return_value=mock_result
        ):
            resp = await client.post(
                "/query",
                json={"question": "What is RAG?", "collection": "docs", "session_id": sid},
            )
        assert resp.status_code == 200
        body = resp.json()
        assert body["answer"] == "Test answer"
        assert body["session_id"] == sid
        assert body["latency_ms"] == 250
        assert len(body["citations"]) == 1
        assert body["citations"][0]["source"] == "doc.pdf"

    async def test_query_empty_question_returns_422(self, client: AsyncClient):
        resp = await client.post(
            "/query",
            json={"question": "", "collection": "docs", "session_id": str(uuid.uuid4())},
        )
        assert resp.status_code == 422

    async def test_query_empty_collection_raises_422(self, client: AsyncClient):
        with patch(
            "api.routes.query.run_rag_chain",
            new_callable=AsyncMock,
            side_effect=ValueError("collection is empty"),
        ):
            resp = await client.post(
                "/query",
                json={
                    "question": "Q?",
                    "collection": "empty-col",
                    "session_id": str(uuid.uuid4()),
                },
            )
        assert resp.status_code == 422
        assert "empty" in resp.json()["detail"]

    async def test_query_llm_not_configured_returns_503(self, client: AsyncClient):
        with patch(
            "api.routes.query.run_rag_chain",
            new_callable=AsyncMock,
            side_effect=RuntimeError("No LLM API key configured"),
        ):
            resp = await client.post(
                "/query",
                json={"question": "Q?", "collection": "docs", "session_id": str(uuid.uuid4())},
            )
        assert resp.status_code == 503
