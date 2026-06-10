-- =============================================================
-- GalvanR.A.G — PostgreSQL Schema
-- Run this on your Supabase SQL editor or any PostgreSQL instance
-- =============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- USERS
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL UNIQUE,
    username        TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- =============================================================
-- REFRESH TOKENS
-- =============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token   ON refresh_tokens (token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);

-- =============================================================
-- USER SETTINGS
-- =============================================================
CREATE TABLE IF NOT EXISTS user_settings (
    user_id            UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    llm_provider       TEXT NOT NULL DEFAULT 'gemini'
                           CHECK (llm_provider IN ('gemini', 'openai')),
    chunk_strategy     TEXT NOT NULL DEFAULT 'fixed'
                           CHECK (chunk_strategy IN ('fixed', 'semantic')),
    default_collection TEXT,
    eval_auto_run      BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- DOCUMENTS
-- =============================================================
CREATE TABLE IF NOT EXISTS documents (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    filename       TEXT NOT NULL,
    collection     TEXT NOT NULL,
    source_type    TEXT NOT NULL CHECK (source_type IN ('pdf', 'url', 'txt')),
    chunk_strategy TEXT NOT NULL CHECK (chunk_strategy IN ('fixed', 'semantic')),
    chunk_count    INTEGER NOT NULL DEFAULT 0,
    status         TEXT NOT NULL DEFAULT 'processing'
                       CHECK (status IN ('processing', 'ready', 'failed')),
    ingested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id    ON documents (user_id);
CREATE INDEX IF NOT EXISTS idx_documents_collection ON documents (collection);

-- =============================================================
-- QUERY LOGS
-- =============================================================
CREATE TABLE IF NOT EXISTS query_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    session_id  TEXT NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content     TEXT NOT NULL,
    citations   JSONB,
    latency_ms  INTEGER,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_logs_user_id    ON query_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_query_logs_session_id ON query_logs (session_id);

-- =============================================================
-- EVAL RUNS
-- =============================================================
CREATE TABLE IF NOT EXISTS eval_runs (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    collection         TEXT NOT NULL,
    status             TEXT NOT NULL DEFAULT 'running'
                           CHECK (status IN ('running', 'complete', 'failed')),
    faithfulness       DOUBLE PRECISION,
    answer_relevancy   DOUBLE PRECISION,
    context_recall     DOUBLE PRECISION,
    context_precision  DOUBLE PRECISION,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eval_runs_user_id ON eval_runs (user_id);

-- =============================================================
-- Auto-update updated_at trigger
-- =============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at'
    ) THEN
        CREATE TRIGGER trg_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_settings_updated_at'
    ) THEN
        CREATE TRIGGER trg_user_settings_updated_at
        BEFORE UPDATE ON user_settings
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_eval_runs_updated_at'
    ) THEN
        CREATE TRIGGER trg_eval_runs_updated_at
        BEFORE UPDATE ON eval_runs
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END;
$$;
