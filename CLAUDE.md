# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend

```bash
cd frontend
npm install          # install dependencies
npm run dev          # dev server at http://localhost:3000
npm run build        # production build
npm run lint         # ESLint via next lint
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload   # dev server at http://localhost:8000
```

API docs available at `http://localhost:8000/docs` (Swagger UI) when running locally.

### Database

```bash
make db-start        # start PostgreSQL via Docker Compose
make db-stop         # stop the database container
make db-shell        # open psql shell (user: survey, db: survey_mvp)
make db-reset        # drop and recreate volumes (destroys all data)

# Initialize tables (no Alembic migrations — use this instead)
cd backend && python -m app.db.init_tables
```

### Tests (backend only)

```bash
cd backend
pytest                          # run all tests
pytest tests/test_surveys.py    # run a single test file
pytest tests/test_auth.py -k "test_login"  # run a single test by name
```

Tests use an **in-memory SQLite** database (not PostgreSQL). The conftest monkey-patches `UUID` → `GUID` and `JSONB` → `JSON` for SQLite compatibility. Do not change ORM column types without updating `conftest.py`.

### Makefile shortcuts

```bash
make install         # npm install + pip install
make dev             # docker-compose up -d (DB) + npm run dev
make build           # npm run build + docker build backend
make clean           # remove build artifacts and containers
```

## Architecture

### Overview

Strict frontend/backend separation with JWT-based auth. The frontend never talks to the database directly; all data access goes through the FastAPI REST API.

```
Frontend (Next.js, Vercel)
    ↕  REST + JWT
Backend (FastAPI, Google Cloud Run)
    ↕  SQLAlchemy ORM
Database (PostgreSQL, Cloud SQL)
```

### Backend (`backend/app/`)

**Route split:**
- `api/routes/auth.py` — register, login; returns JWT access token
- `api/routes/surveys.py` — authenticated CRUD for surveys and questions; publish; dashboard stats; CSV export
- `api/routes/public.py` — unauthenticated; fetch survey by slug, create/resume/submit responses
- `api/routes/dashboard.py` — authenticated; list user's surveys with aggregate stats
- `api/routes/health.py` — `GET /health`

**Data models (`db/orms/`):**

```
User → Survey (owner_id FK)
Survey → Question[]  (cascade delete)
Survey → Response[]  (cascade delete)
Response → Answer[]  (one per question)
```

`Question.options_json` is a JSONB column storing `{"options": [...]}` for `single`/`multi` types.  
`Answer.answer_json` stores the typed response payload:
- text: `{"text": "..."}`
- single: `{"value": "..."}`
- multi: `{"values": [...]}`
- image: `{"files": [...]}` (storage keys, not URLs — upload not yet implemented)

**Auth flow:** JWT is HS256, signed with `JWT_SECRET` env var, 60-minute expiry. Token is decoded in `core/deps.py` via `get_current_user`, injected as a FastAPI dependency.

**Publishing:** `POST /surveys/{id}/publish` generates an 8-char random alphanumeric slug with collision retry (up to 10 attempts). Once published, the slug is permanent.

**Response lifecycle:** `in_progress` → (upsert answers) → `submitted`. Re-taking is allowed — submitting creates a new response; existing `submitted` responses are never updated.

### Frontend (`frontend/`)

**Page routes (App Router):**
- `/` — landing page
- `/login`, `/register` — auth forms
- `/dashboard/[userId]` — user's survey list
- `/surveys/new` — create survey (survey builder)
- `/surveys/[surveyId]/edit` — edit existing survey (survey builder)
- `/surveys/preview` — read-only preview (state passed via query/sessionStorage)
- `/public/surveys/[slug]` — public respondent-facing survey

**Key abstractions:**

`lib/api.ts` — thin fetch wrapper. All requests go through `api.get/post/put/patch/delete`. Automatically attaches JWT from localStorage (`lib/auth.ts`) and throws `ApiError` on non-2xx.

`lib/config.ts` — single source of truth for `NEXT_PUBLIC_API_BASE_URL`. Defaults to `http://localhost:8000`; set in Vercel environment variables for production.

`hooks/useSurveyBuilder.ts` — `useReducer`-based state machine for the survey builder UI. Manages the full question list, selected question, and `saveStatus` (`idle | dirty | saving | saved | error`). All mutations dispatch typed actions; the reducer is the only place state changes happen.

`hooks/useSurveyDraft.ts` — handles async persistence (calling the backend API) coordinated with `useSurveyBuilder`'s `saveStatus`.

**Question types supported:** `text`, `single`, `multi`, `image`. The `image` type has UI (`ImageUploadQuestionView.tsx`) but no backend upload implementation yet (planned: pre-signed URLs + GCS).

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | frontend `.env.local` | Backend API base URL |
| `JWT_SECRET` | backend `.env` | JWT signing secret |
| `DATABASE_URL` | backend `.env` | PostgreSQL connection string |

See `.env.example` files at root and in `backend/` for required variables.

### Deployment

- **Frontend**: Vercel — set `NEXT_PUBLIC_API_BASE_URL` to the Cloud Run service URL.
- **Backend**: `backend/Dockerfile` → Google Cloud Run. Deploy script at `backend/deploy_cloud_run.sh`.
- **Database**: Cloud SQL (PostgreSQL 15). Tables are created via `python -m app.db.init_tables` (no Alembic migrations in production currently).
