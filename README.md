# Rent-A-Equip 🏀⛷️🎾

> A full-stack sports equipment rental marketplace — list your gear, rent from others, all in one account.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Coming_Soon-6c47ff?style=flat-square)]()
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)]()
[![Frontend](https://img.shields.io/badge/Frontend-React_+_Vite-61dafb?style=flat-square&logo=react)]()
[![Containerised](https://img.shields.io/badge/Docker-Compose-2496ed?style=flat-square&logo=docker)]()

---

<!-- Once you have a demo video, replace YOUR_VIDEO_ID and uncomment the two lines below -->
<!-- [![Watch the demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://youtu.be/YOUR_VIDEO_ID) -->
<!-- > *60-second walkthrough — list gear → request → accept → return → fine generated* -->

---

## What It Does

Rent-A-Equip works like Airbnb for sports gear. Any user can **list** their own equipment and **rent** from others — no separate roles, one account, two modes.

- **List gear** — post equipment with photos, daily rate, and pickup location
- **Browse & rent** — filter by sport or area, send a booking request
- **2-step booking flow** — lister accepts or rejects before anything changes hands
- **Automated fines** — late returns trigger fine calculation automatically (`days overdue × daily rate × quantity`)
- **Two-sided reviews** — borrowers review listings, listers review borrowers
- **Damage reports** — listers can file reports after equipment is returned

---

## Architecture

The system is fully containerised via Docker Compose. The FastAPI backend handles all business logic and exposes a REST API consumed by the React frontend. Redis doubles as a job broker for Celery and a cache layer. All background jobs (fine calculation) run on a dedicated Celery worker — keeping the API non-blocking.

```
┌──────────────────────────────────────────────────────────┐
│                     Docker Compose                       │
│                                                          │
│   ┌─────────────┐      ┌──────────────┐                  │
│   │   FastAPI   │─────▶│ PostgreSQL16 │                  │
│   │  (Uvicorn)  │      └──────────────┘                  │
│   └──────┬──────┘                                        │
│          │                                               │
│          ▼                                               │
│   ┌─────────────┐      ┌──────────────┐                  │
│   │   Redis 7   │◀────▶│    Celery    │                  │
│   │ broker+cache│      │    Worker    │                  │
│   └─────────────┘      └──────────────┘                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
         ▲
         │  REST + JWT
         │
┌────────────────┐
│  React + Vite  │
│  (TanStack Q)  │
└────────────────┘
```

**Why Celery + Redis instead of cron?** Fine calculation runs nightly as an async background task. Using Celery keeps the API fully non-blocking and makes the job queue observable, retriable, and easy to extend with future tasks (notifications, expiry reminders) without touching the API layer.

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Language | Python 3.12 |
| Framework | FastAPI |
| Server | Uvicorn (inside Docker) |
| ORM | SQLAlchemy 2 (async) |
| Database | PostgreSQL 16 |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| Auth | JWT via `python-jose` + `bcrypt` via `passlib` |
| Background Jobs | Celery + Redis |
| Containerisation | Docker + Docker Compose |

### Frontend

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Framework | React (Vite) |
| Styling | Tailwind CSS + shadcn/ui + Radix UI |
| Routing | React Router |
| Data Fetching | TanStack React Query + Axios |

---

## Project Structure

```
Rent-A-Equip/
├── backend/
│   ├── app/
│   │   ├── api/           # Route handlers (auth, listings, rentals, fines, reviews, admin…)
│   │   ├── models/        # SQLAlchemy ORM tables
│   │   ├── schemas/       # Pydantic request/response shapes
│   │   ├── services/      # All business logic — kept strictly out of route handlers
│   │   ├── tasks/         # Celery background jobs
│   │   └── core/
│   │       ├── config.py  # .env settings via Pydantic BaseSettings
│   │       ├── database.py# Async DB connection pool
│   │       ├── security.py# JWT creation/verification + password hashing
│   │       └── deps.py    # FastAPI dependency injection helpers
│   ├── alembic/           # Migration history
│   ├── celery_worker.py
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── pages/
        ├── components/
        ├── contexts/
        ├── hooks/
        └── lib/
            ├── api.ts
            └── api-services.ts
```

---

## Rental Flow

The entire rental lifecycle is modelled as an explicit state machine enforced at the service layer:

```
Borrower sends request
        │
        ▼
  status: pending
        │
  Lister accepts / rejects
        │
        ▼
  status: active
        │
  Lister marks returned
        │
        ▼
  status: returned
        │
  If overdue ──▶  Fine auto-created (days overdue × daily rate)
        │
        ▼
  Both sides leave a review
```

---

## Key Business Rules

| Rule | Detail |
|---|---|
| No self-rental | A user cannot rent their own listing — returns `409 Conflict` |
| Lister controls return | Only the lister marks equipment as returned |
| Lister confirms payment | Only the lister marks a fine as paid (confirms cash received offline) |
| Automatic fine | `days_overdue × daily_rate × quantity` — calculated by Celery on return |
| Reviews gate | Reviews can only be submitted after status is `returned` |
| Listing protection | Listings with pending or active rentals cannot be deleted |
| Instant listing | Listings go live immediately — no approval gate |

---

## API Overview

All protected endpoints require `Authorization: Bearer <token>`.

| Module | Coverage |
|---|---|
| Auth | Register, login, JWT token, refresh, logout |
| Listings | Browse catalog, create, edit, pause, delete |
| Rentals | Request, accept, reject, cancel, return |
| Fines | Auto-created on late return, lister marks paid |
| Damage Reports | Lister files after return |
| Reviews | Borrower reviews listing, lister reviews borrower |
| Users | Public profiles with rating and listing count |
| Admin | Stats dashboard, user management, listing moderation |

Full request/response shapes are documented in `API_Contract.docx`. Interactive Swagger UI is available at `/docs` when running locally.

---

## Running Locally

### Prerequisites

- Python 3.12+
- Node.js 18+
- Docker Desktop (must be running)

### First-time setup

```bash
# 1. Clone
git clone <your-repo-url>
cd Rent-A-Equip

# 2. Environment variables (defaults work for local dev)
cd backend
cp .env.example .env

# 3. Build and start all backend containers
docker compose up -d --build

# 4. Run migrations (first time only)
docker exec -it rentaequip_api bash
alembic upgrade head
exit

# 5. Start the frontend
cd frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://127.0.0.1:8000 |
| Swagger docs | http://127.0.0.1:8000/docs |

### Every time after

```bash
docker compose up -d        # start backend
cd frontend && npm run dev  # start frontend
```

### After pulling new changes

```bash
git pull

# If new migrations were added
docker exec -it rentaequip_api bash
alembic upgrade head
exit

# If new frontend packages were added
cd frontend && npm install
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL async connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET_KEY` | JWT signing secret — change before deploying |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry in minutes (default: 60) |
| `CORS_ORIGINS` | Allowed frontend URLs e.g. `["http://localhost:3000"]` |
| `CELERY_BROKER_URL` | Redis URL for Celery job queue |
| `SUPPORT_EMAIL` | Email shown to users for dispute resolution |
| `DEBUG` | `true` for development, `false` for production |

See `.env.example` for the full template.

---

## Common Commands

| Command | What it does |
|---|---|
| `docker compose up -d --build` | Build images and start all containers |
| `docker compose up -d` | Start containers (after first build) |
| `docker compose down` | Stop all containers |
| `docker compose ps` | Check container status |
| `docker compose logs api` | View FastAPI logs |
| `docker exec -it rentaequip_api bash` | Open shell inside API container |
| `alembic upgrade head` | Apply all pending migrations (run inside container) |
| `alembic revision --autogenerate -m "msg"` | Generate a new migration |

---
