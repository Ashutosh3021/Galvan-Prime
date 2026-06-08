# GalvanR.A.G — Build Plan

## Overview

Self-hostable Omni-RAG Engine with hybrid search, multi-turn memory, and RAGAS evaluation.  
Target: production-ready portfolio project demonstrating end-to-end AI/ML engineering.

---

## Architecture

```mermaid
graph TB
    subgraph Ingestion["📥 Ingestion Layer"]
        PDF[PDF Upload]
        URL[URL Scraper]
        TXT[Plain Text]
    end

    subgraph Processing["⚙️ Processing Layer"]
        CHUNK[Chunker<br/>Fixed / Semantic]
        EMBED[Sentence Transformers<br/>Embedding Model]
    end

    subgraph Storage["🗄️ Storage Layer"]
        CHROMA[(ChromaDB<br/>Local Vector Store)]
        PINE[(Pinecone<br/>Cloud Vector Store)]
        PG[(PostgreSQL<br/>Metadata + Users)]
    end

    subgraph Retrieval["🔍 Retrieval Layer"]
        HYBRID[Hybrid Search<br/>Vector + BM25]
        RERANK[Re-ranker]
    end

    subgraph Generation["🧠 Generation Layer"]
        LC[LangChain / LlamaIndex<br/>Orchestration]
        LLM[Gemini 1.5 Flash<br/>Pluggable LLM Backend]
        MEM[Conversation Memory<br/>Multi-turn]
    end

    subgraph Output["📤 Output Layer"]
        API[FastAPI<br/>REST API]
        CITE[Answer + Citations]
        UI[Streamlit Demo UI]
    end

    subgraph Eval["📊 Evaluation Layer"]
        RAGAS[RAGAS Framework]
        DASH[Eval Dashboard]
    end

    PDF & URL & TXT --> CHUNK
    CHUNK --> EMBED
    EMBED --> CHROMA & PINE
    EMBED -.metadata.-> PG

    CHROMA & PINE --> HYBRID
    HYBRID --> RERANK
    RERANK --> LC
    MEM --> LC
    LC --> LLM
    LLM --> CITE
    CITE --> API
    API --> UI

    CITE --> RAGAS
    RAGAS --> DASH
```

---

## Phase Breakdown

```mermaid
gantt
    title GalvanR.A.G — Build Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1 — Core Infra
    Document Ingestion Pipeline     :p1, 2025-07-01, 10d
    Chunking Strategies             :p2, after p1, 7d

    section Phase 2 — Retrieval
    Dual Vector Store Setup         :p3, after p2, 7d
    Hybrid Search (Vector + BM25)   :p4, after p3, 7d

    section Phase 3 — API + Product
    Query API with Citations        :p5, after p4, 7d
    Conversation Memory             :p6, after p5, 10d

    section Phase 4 — Eval + Polish
    RAGAS Eval Suite + Dashboard    :p7, after p6, 10d
    Pluggable LLM Backend           :p8, after p7, 5d
    Docker + CI/CD + API Docs       :p9, after p8, 7d
```

---

## Query Flow

```mermaid
sequenceDiagram
    participant U as User
    participant API as FastAPI
    participant MEM as Memory Store
    participant HS as Hybrid Search
    participant LLM as Gemini 1.5 Flash
    participant RAGAS as RAGAS Eval

    U->>API: POST /query {question, session_id}
    API->>MEM: Fetch conversation history
    MEM-->>API: Prior context
    API->>HS: BM25 + Vector search
    HS-->>API: Top-k chunks + sources
    API->>LLM: Prompt = context + history + question
    LLM-->>API: Answer
    API->>RAGAS: Log (question, answer, context)
    API-->>U: {answer, citations[], session_id}
```

---

## Ingestion Flow

```mermaid
flowchart LR
    A[Raw Document<br/>PDF / URL / TXT] --> B[Parser]
    B --> C{Chunk Strategy}
    C -->|Fixed Size| D[512-token windows<br/>+ overlap]
    C -->|Semantic| E[Sentence-boundary<br/>segmentation]
    D & E --> F[Sentence Transformers<br/>Embeddings]
    F --> G[(ChromaDB)]
    F --> H[(Pinecone)]
    F --> I[(PostgreSQL<br/>doc_id, source, metadata)]
```

---

## Evaluation Pipeline

```mermaid
flowchart TD
    Q[Test Question Set] --> R[RAG Pipeline]
    R --> ANS[Generated Answer]
    ANS --> RAGAS{RAGAS Metrics}
    RAGAS --> F[Faithfulness]
    RAGAS --> AR[Answer Relevancy]
    RAGAS --> CR[Context Recall]
    RAGAS --> CP[Context Precision]
    F & AR & CR & CP --> DB[(Results DB)]
    DB --> DASH[Streamlit Dashboard]
```

---

## Phase Feature Map

| Phase | Feature | Stack | Differentiator |
|-------|---------|-------|----------------|
| 1 | Document ingestion (PDF/URL/TXT) | LangChain loaders | Core RAG infra |
| 2 | Chunking strategy comparison | Custom splitters | Retrieval quality signal |
| 3 | Dual vector store (local + cloud) | ChromaDB + Pinecone | Prod-ready flexibility |
| 4 | Hybrid search (vector + BM25) | LangChain retrievers | Real production pattern |
| 5 | Query API with source citations | FastAPI | Product-facing layer |
| 6 | Multi-turn conversation memory | LangChain memory | Stateful RAG |
| 7 | RAGAS eval suite + dashboard | RAGAS + Streamlit | **Biggest differentiator** |
| 8 | Pluggable LLM backend | Provider abstraction | Architectural maturity |
| 9 | Docker + CI/CD + API docs | Docker, GH Actions | Production standard |

---

## Directory Structure

```
galvanprime/
├── api/
│   ├── main.py              # FastAPI app
│   ├── routes/
│   │   ├── ingest.py        # /ingest endpoints
│   │   ├── query.py         # /query endpoints
│   │   └── eval.py          # /eval endpoints
│   └── middleware/
├── core/
│   ├── ingestion/
│   │   ├── loaders.py       # PDF, URL, TXT parsers
│   │   └── chunkers.py      # Fixed + semantic chunking
│   ├── embeddings/
│   │   └── encoder.py       # Sentence Transformers wrapper
│   ├── retrieval/
│   │   ├── vectorstore.py   # ChromaDB + Pinecone interface
│   │   └── hybrid.py        # BM25 + vector fusion
│   ├── generation/
│   │   ├── chain.py         # LangChain RAG chain
│   │   ├── memory.py        # Conversation memory
│   │   └── llm.py           # Pluggable LLM backend
│   └── evaluation/
│       ├── ragas_runner.py  # RAGAS evaluation runner
│       └── metrics.py       # Custom metric wrappers
├── db/
│   ├── models.py            # SQLAlchemy models
│   └── migrations/
├── ui/
│   └── app.py               # Streamlit demo
├── tests/
├── docker-compose.yml
├── Dockerfile
├── .github/workflows/
│   └── ci.yml
└── README.md
```

---

## Environment Variables

```env
# LLM
GEMINI_API_KEY=
OPENAI_API_KEY=          # optional, for pluggable backend

# Vector Stores
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
CHROMA_PERSIST_DIR=./chroma_db

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/galvanprime

# App
SECRET_KEY=
ENVIRONMENT=development
```

---

## Success Metrics

- [ ] Ingest 100-page PDF in < 30s
- [ ] Query latency P95 < 3s
- [ ] RAGAS faithfulness score > 0.80 on test set
- [ ] API docs live at `/docs`
- [ ] One-command local start via `docker-compose up`