# Application Error Report

**Generated:** 2026-07-09
**Project:** GalvanR.A.G (FastAPI backend + React/Vite/TS frontend)
**Scope:** Full recursive scan of source, config, infra, and build files
(excludes `node_modules`, `.git`, `.venv`, `.ruff_cache`, `.pytest_cache`, build output).

---

## Total Errors Found: 22

| Severity | Count |
|----------|-------|
| Critical | 7 |
| High     | 1 |
| Medium   | 5 |
| Low      | 9 |

> **Build status:** `npm run build` runs `tsc && vite build`. The backend and the
> front-end *runtime* code are individually healthy, but **7 Critical TypeScript
> compile errors currently make `tsc` fail**, which short-circuits the build via
> `&&`. As a result **no production bundle is produced** and any Vercel/deploy
> step that runs `npm run build` ships a blank app. These 7 errors are the most
> urgent to fix.

---

## Critical Errors

The following all break `npx tsc -p tsconfig.app.json --noEmit` (verified by running it).

---

### C1. Missing `src/vite-env.d.ts` — `import.meta.env` and CSS imports untyped
- **File:** `src/api/client.ts:11` and `src/main.tsx:5`
- **Type:** Module/type resolution failure
- **Errors:**
  - `src/api/client.ts(11,30): error TS2339: Property 'env' does not exist on type 'ImportMeta'.`
  - `src/main.tsx(5,8): error TS2307: Cannot find module './styles/global.css'`
- **Root cause:** No `src/vite-env.d.ts` exists. Vite's ambient types
  (`vite/client`) — which declare `import.meta.env` and `*.css` side-effect
  modules — are never loaded, so `tsc` rejects both the env access and the CSS
  import. This is why the production build dies before Vite even runs.
- **Severity:** Critical (breaks build → blank screen / no deploy)
- **Fix:** Create `src/vite-env.d.ts` containing:
  ```ts
  /// <reference types="vite/client" />
  ```

---

### C2. Unused imports in `Icon.tsx` trip `noUnusedLocals`
- **File:** `src/components/ui/Icon.tsx:66` (`UploadCloud`) and `:69` (`XCircle`)
- **Type:** Unused-symbol error (TS6133)
- **Description:** Both `UploadCloud` and `XCircle` are imported from
  `lucide-react` but never referenced in `ICON_MAP`. With `noUnusedLocals: true`
  in `tsconfig.app.json`, this fails the build.
- **Severity:** Critical (build break)
- **Fix:** Remove the two unused imports, or wire them into `ICON_MAP` if they
  were intended to back an icon name.

---

### C3. `tsconfig.app.json` includes the `BIN/` directory → its errors break the build
- **File:** `tsconfig.app.json:21` (`"include": ["src", "BIN"]`) and `BIN/mobile/Collections.tsx:19`
- **Type:** Config + unused-symbol error (TS6133)
- **Description:** The `BIN/` folder contains standalone/alternate HTML+TSX
  builds that are **not** part of the Vite app (entry is `index.html` →
  `src/main.tsx`). Yet `tsconfig.app.json` type-checks them. `BIN/mobile/Collections.tsx`
  declares `pathname` and never reads it → TS6133 → `tsc` fails. Any future BIN
  error will also block every production build.
- **Severity:** Critical (build break via misconfiguration)
- **Fix:** Remove `"BIN"` from the `include` array (recommended — BIN is not
  bundled), **or** give BIN its own tsconfig, **or** fix the BIN source. Do not
  ship a production build that depends on unrelated demo folders.

---

### C4. `MetricCard` passes `style` to `<Icon>` which has no `style` prop
- **File:** `src/components/eval/MetricCard.tsx:22`
- **Type:** Type error (TS2322)
- **Description:** `IconProps` (in `src/components/ui/Icon.tsx`) does not declare
  a `style` field, but `MetricCard` calls
  `<Icon name={icon} size={18} filled className="…" style={{ color }} />`.
  `EvalPage` renders `MetricCard`, so this is on the live path.
- **Severity:** Critical (build break)
- **Fix:** Add `style?: CSSProperties` to `IconProps` (import `CSSProperties` from
  `react`), or apply the color via `className` instead of `style`.

---

### C5. `DocumentList` delete passes a string where an object is required
- **File:** `src/components/ingest/DocumentList.tsx:61`
- **Type:** Type error (TS2345)
- **Description:** `deleteMutation.mutateAsync(confirmDoc.id)` passes a `string`,
  but `useDeleteDocument()`'s mutation fn expects
  `{ docId: string; collection: string }`. Fails compile. (Note: even once the
  type is fixed, deletion is still functionally broken — see **H1**.)
- **Severity:** Critical (build break) — also blocks the delete feature (H1)
- **Fix:** Thread `collection` into `confirmDoc` and call
  `deleteMutation.mutateAsync({ docId: confirmDoc.id, collection: confirmDoc.collection })`.

---

### C6. `MobileEval` calls `triggerRun()` with no arguments
- **File:** `src/components/mobile/MobileEval.tsx:132`
- **Type:** Type error (TS2554)
- **Description:** `triggerRun()` is invoked with 0 args, but
  `useRunEval().triggerRun(collection: string, testSet: EvalTestItem[])`
  requires two. Fails compile. (This component is not wired into the router, so
  it is dead code, but it still lives under `src/` and is type-checked.)
- **Severity:** Critical (build break)
- **Fix:** Either remove `MobileEval`/`MobileIngest` (they are not imported by any
  page) or call `triggerRun(collection, testSet)` with real values; consider
  making the arguments optional if a no-arg "run with defaults" is desired.

---

### C7. `MobileIngest` type violations (`IngestionJob` shape + `FileType` map)
- **File:** `src/components/mobile/MobileIngest.tsx:11, 31–34, 50, 73`
- **Type:** Type errors (TS7053, TS2741)
- **Description:**
  - `JobIcon` indexes a map keyed `pdf|url|markdown|error`, but
    `FileType` (in `src/types/index.ts:111`) also includes `'txt'` →
    `TS7053: Element implicitly has an 'any' type … Property 'txt' does not exist`.
  - The mock `initialJobs` objects (and the `newJob` literals) omit the required
    `collection` field of `IngestionJob` (`src/types/index.ts:122`) →
    `TS2741: Property 'collection' is missing`.
- **Severity:** Critical (build break)
- **Fix:** Add `collection` to every `IngestionJob` literal, and either add a
  `'txt'` key to the `JobIcon` map or drop `'txt'` from `FileType`. (Best: delete
  these unused mobile mocks, since `MobileIngest`/`MobileEval` are not routed.)

---

## High Severity

### H1. Document deletion is fundamentally broken (no real `doc_id` available)
- **Files:**
  - `src/api/ingest.ts:86–101` (`getDocuments` maps collections → fake documents)
  - `src/components/ingest/DocumentList.tsx` (delete wiring)
  - `backend/api/routes/ingest.py:126–146` (`DELETE /ingest/{doc_id}`)
- **Type:** API contract / logic error (broken functionality)
- **Description:** The backend has **no `GET /documents` endpoint**. The frontend
  fakes a document list by mapping `GET /ingest/collections` results, setting
  `doc_id = collection.name`. But real ChromaDB `doc_id`s are UUIDs generated at
  ingest time. Consequences:
  1. The "Ingested Documents" panel actually shows **collections**, mislabeled as
     documents.
  2. Clicking delete sends `DELETE /ingest/<collectionName>?collection=<name>`.
     The route requires `doc_id: uuid.UUID`, so FastAPI fails to parse the
     collection name → **HTTP 422**, and the toast shows "Failed to delete
     document".
  3. Even after fixing the C5 type error, the delete can **never** match a real
     `doc_id`, so nothing is ever removed.
- **Severity:** High (core feature non-functional)
- **Fix:** Add a real `GET /ingest/documents?collection=` endpoint that returns
  per-document records with their true `doc_id` + `source`, have the frontend use
  those ids, and ensure the DELETE route deletes by the actual `doc_id`.
  Alternatively, redesign the UI around collection-level deletion.

---

## Medium Severity

### M1. `get_collections` reports `created_at` as "now" for every collection
- **File:** `backend/core/ingestion/service.py:224`
- **Type:** Logic error (misleading data)
- **Description:** `created_at = datetime.datetime.now(datetime.timezone.utc)` is
  computed on every call for every collection, overwriting the true ingestion
  time. The "Ingested" / "created" dates shown in the UI are always the current
  moment.
- **Severity:** Medium
- **Fix:** Persist a real `created_at` in each chunk's ChromaDB metadata at ingest
  time and read the earliest `created_at` back per collection.

### M2. Inconsistent upload size limits (50 MB vs 20 MB)
- **Files:** `backend/api/routes/ingest.py:37` (`_MAX_UPLOAD_BYTES = 50 MB`) and
  `backend/core/ingestion/service.py:50` (`_MAX_FILE_BYTES = 20 MB`)
- **Type:** Configuration mismatch / poor UX
- **Description:** A 25–50 MB file passes the HTTP-layer check, uploads fully,
  then the service rejects it with a `ValueError` → HTTP 422. Users get a
  confusing failure after a long upload.
- **Severity:** Medium
- **Fix:** Define the limit once (e.g. in `config.py`) and reference it from both
  the route and the service.

### M3. Deprecated `asyncio.get_event_loop()` used inside async handlers
- **Files:** `backend/api/routes/status.py:51`, `backend/core/ingestion/service.py:137`,
  `backend/core/generation/chain.py:140`, `backend/core/retrieval/hybrid.py:151`,
  `backend/core/evaluation/ragas_runner.py:143`
- **Type:** Runtime / deprecation (works today, fragile on 3.12+)
- **Description:** `asyncio.get_event_loop()` is deprecated and emits warnings on
  modern Python; it can raise if no loop is running. Inside FastAPI async
  handlers a loop is present, so it currently works, but it is fragile.
- **Severity:** Medium
- **Fix:** Replace with `asyncio.get_running_loop()` in all five locations.

### M4. Eval "completed" runs with null scores are shown as 0.0
- **File:** `src/api/eval.ts:88–91`
- **Type:** Data-accuracy / logic
- **Description:** When a RAGAS run completes but individual metrics are `null`
  (e.g. RAGAS failed for that metric), `getEvalMetrics` coerces them to `0`, so
  the UI presents `0.00` as a legitimate score rather than "not available".
- **Severity:** Medium
- **Fix:** Track `null` distinctly (e.g. render "—" / "N/A") instead of `0.0`,
  and surface partial-run failures in the UI.

### M5. Silent config mismatch: `DATABASE_URL`/DB settings ignored; unused Postgres service
- **Files:** `backend/config.py:31–39` (`extra="ignore"`), `docker-compose.yml:20–42`
  (unused `db` service + `schema.sql` mount), `Makefile:70–75` (`make migrate`
  uses Alembic which is not installed)
- **Type:** Configuration misconfiguration
- **Description:** `backend/.env` and `docker-compose.yml` set `DATABASE_URL`,
  `SECRET_KEY`, `POSTGRES_*` and spin up a PostgreSQL container, but `config.py`
  uses `extra="ignore"`, so none of those values reach the app. There is **no DB
  layer, no SQLAlchemy, no Alembic** anywhere in the code. The `db` container
  runs but is never connected to, `data/schema.sql` is mounted but never read,
  and `make migrate` would fail (Alembic absent). This is a silent contract
  violation that will bite anyone expecting persistence/auth.
- **Severity:** Medium
- **Fix:** Either (a) implement the DB layer (add `SQLAlchemy`/`asyncpg`/Alembic,
  add the Settings fields, and stop ignoring them), or (b) remove the `db`
  service, the `schema.sql` mount, the `DATABASE_URL` override, and the `make migrate`
  targets so the config matches the code.

---

## Low Severity / Warnings

### L1. Redundant `pydantic` entries in `requirements.txt`
- **File:** `backend/requirements.txt:9,11`
- **Description:** Both `pydantic==2.7.1` and `pydantic[email]==2.7.1` are listed;
  the email extra is duplicated. Harmless but sloppy.
- **Fix:** Keep only `pydantic[email]==2.7.1`.

### L2. `asyncpg` driver referenced but not a dependency
- **File:** `backend/.env:20` (`DATABASE_URL=postgresql+asyncpg://…`)
- **Description:** The `DATABASE_URL` uses the `asyncpg` driver, but `asyncpg` is
  not in `requirements.txt` (and the DB isn't used). Dead/misleading.
- **Fix:** Remove the `DATABASE_URL` line (see M5) or add `asyncpg` if the DB is
  implemented.

### L3. `data/schema.sql` is dead
- **File:** `data/schema.sql`
- **Description:** Mounted into Postgres initdb by docker-compose but never used
  by the app (no DB layer). Misleading artifact.
- **Fix:** Remove it, or implement the DB layer that consumes it (see M5).

### L4. Unused stub schemas (`auth.py`, `profile.py`)
- **Files:** `backend/schemas/auth.py`, `backend/schemas/profile.py`
- **Description:** These `EmailStr`-based schemas are never imported by any route
  (auth is a documented placeholder; profiles are Phase-5 stubs). Dead code; safe
  only because `pydantic[email]` is installed.
- **Fix:** Remove, or wire into real auth/profile endpoints when implemented.

### L5. `make migrate` / `make migrate-new` invoke missing Alembic
- **File:** `Makefile:70–75`
- **Description:** Targets call `alembic` which is not in `requirements.txt` and
  has no `alembic.ini`/migrations directory. Would fail if run.
- **Fix:** Implement migrations or delete these targets (see M5).

### L6. CI / Docker Python version drift
- **Files:** `.github/workflows/ci.yml:31,68` (`PYTHON_VERSION: "3.10"`) vs
  `backend/Dockerfile:12,34` (`python:3.11-slim`)
- **Description:** CI tests on 3.10 while the image builds on 3.11 (the local
  `.venv` is 3.10). Minor drift; behavior could differ across versions.
- **Fix:** Align the Python version across CI, Dockerfile, and local venv.

### L7. `recharts@^3.8.1` (major v3) — verify runtime API
- **File:** `package.json:22`; consumers `src/components/eval/ScoreChart.tsx`,
  `src/components/eval/HistoryTable.tsx`
- **Description:** Recharts 3.x has API/prop changes vs the widely-used 2.x. `tsc`
  passes (types ship), but default props / `ResponsiveContainer` behavior differ;
  confirm charts render correctly at runtime.
- **Fix:** Smoke-test the eval charts; pin to a known-good Recharts version if
  needed.

### L8. Missing `favicon.svg`
- **File:** `index.html:5`
- **Description:** References `/favicon.svg`, which does not exist in the repo
  root → 404 for the favicon (cosmetic only).
- **Fix:** Add `public/favicon.svg` or remove the link.

### L9. `VITE_MOCK` documented but never read
- **Files:** `.env.example:1`, `.env.local:1`, `src/api/client.ts` (docstring)
- **Description:** Mock mode is described in comments and env files, but
  `client.ts` never reads `VITE_MOCK` and no mock branch exists. Dead config.
- **Fix:** Implement mock mode or remove the references to avoid confusion.

---

## Summary

### Root Cause Analysis
1. **Single biggest root cause — missing Vite ambient types + strict `tsc` in the
   build.** `src/vite-env.d.ts` is absent, and `tsconfig.app.json` enables
   `noUnusedLocals`, `noUnusedParameters`, and `noUncheckedSideEffectImports`
   while also type-checking the unrelated `BIN/` folder. Any one of these would
   be harmless in isolation, but together they guarantee `tsc` fails and
   `npm run build` produces nothing.
2. **Frontend/backend contract drift on "documents".** The backend only exposes
   collections (`GET /ingest/collections`), not individual documents, so the
   frontend invented a document list from collections — losing real `doc_id`s and
   breaking deletion.
3. **Config vs code drift on the database.** Docker Compose, `.env`, the Makefile,
   and `schema.sql` all assume a Postgres-backed app, but the code is fully
   stateless (no SQLAlchemy/Alembic). `extra="ignore"` in `config.py` hides this
   silently.

### Most Impactful Issues to Fix First
1. **C1** — add `src/vite-env.d.ts` (unblocks the whole build).
2. **C2, C3, C4, C5, C6, C7** — clear the remaining `tsc` errors (unused imports,
   BIN in `include`, `Icon` `style`, delete arg shape, dead mobile components).
   After C1–C7, `npm run build` succeeds.
3. **H1** — fix the document-deletion contract (add `GET /ingest/documents`, use
   real `doc_id`s) so the delete feature actually works.
4. **M5** — reconcile the database story (implement it or remove the dead config).

### Recommendations for Prevention
- **Make the build gate visible locally:** run `npx tsc --noEmit` in a `prebuild`
  and in `pre-commit`/CI so type errors fail fast instead of only at deploy.
- **Separate demo/standalone code** (the `BIN/` folder) from the app tsconfig, or
  give it its own project reference, so unrelated folders can't break the
  production build.
- **Add a contract test** (e.g. OpenAPI schema generated from FastAPI, consumed
  by the frontend) to catch endpoint/field mismatches like the missing documents
  endpoint.
- **Keep config and code in sync:** if a service (Postgres) or env var is
  declared, either consume it or remove it; avoid `extra="ignore"` masking
  required settings in non-obvious ways.
- **Pin and smoke-test major dependency bumps** (Recharts 3.x, langchain 0.2.x)
  rather than trusting `tsc` alone, since type-checking passes while runtime
  behavior can change.
