# ─────────────────────────────────────────────────────────────────────────────
# GalvanR.A.G — Developer Makefile
#
# Usage:
#   make up          — start full stack (Postgres + backend)
#   make up-dev      — start with hot-reload (dev override)
#   make down        — stop and remove containers
#   make test        — run backend test suite
#   make lint        — run ruff + black
#   make migrate     — run Alembic migrations against local DB
#   make logs        — tail backend logs
#   make shell       — open a shell inside the backend container
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: up up-dev down test lint migrate logs shell build clean

COMPOSE      = docker compose
COMPOSE_DEV  = docker compose -f docker-compose.yml -f docker-compose.override.yml
BACKEND_DIR  = backend
VENV_PYTHON  = $(BACKEND_DIR)/.venv/Scripts/python  # Windows path
PYTEST       = $(VENV_PYTHON) -m pytest

# ── Docker ────────────────────────────────────────────────────────────────────

up:
	$(COMPOSE) up --build -d
	@echo "API running at http://localhost:8000"
	@echo "Docs at     http://localhost:8000/docs"

up-dev:
	$(COMPOSE_DEV) up --build

down:
	$(COMPOSE) down

build:
	$(COMPOSE) build --no-cache

logs:
	$(COMPOSE) logs -f backend

shell:
	$(COMPOSE) exec backend /bin/bash

# ── Testing ───────────────────────────────────────────────────────────────────

test:
	cd $(BACKEND_DIR) && $(PYTEST) tests/ -v --tb=short

test-cov:
	cd $(BACKEND_DIR) && $(PYTEST) tests/ \
		--cov=. \
		--cov-report=term-missing \
		--cov-report=html \
		--cov-omit="tests/*,db/migrations/*" \
		-q

# ── Lint ──────────────────────────────────────────────────────────────────────

lint:
	cd $(BACKEND_DIR) && $(VENV_PYTHON) -m ruff check . --select E,W,F,I --ignore E501
	cd $(BACKEND_DIR) && $(VENV_PYTHON) -m black --check --diff .

lint-fix:
	cd $(BACKEND_DIR) && $(VENV_PYTHON) -m ruff check . --fix
	cd $(BACKEND_DIR) && $(VENV_PYTHON) -m black .

# ── Database ──────────────────────────────────────────────────────────────────

migrate:
	cd $(BACKEND_DIR) && $(VENV_PYTHON) -m alembic upgrade head

migrate-new:
	@read -p "Migration message: " msg; \
	cd $(BACKEND_DIR) && $(VENV_PYTHON) -m alembic revision --autogenerate -m "$$msg"

# ── Cleanup ───────────────────────────────────────────────────────────────────

clean:
	$(COMPOSE) down -v
	find $(BACKEND_DIR) -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find $(BACKEND_DIR) -name "*.pyc" -delete 2>/dev/null || true
