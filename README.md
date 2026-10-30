# VyomAcre

A marketplace for renting out rooftops and land. Owners list a space, it gets
checked, and businesses that need that space — solar developers, telecom tower
companies, brands — lease it.

**Live app:** https://devdoots-vyom-acre-nine.vercel.app
**API:** https://devdoots-vyomacre-y0gr.onrender.com (docs at `/docs`)
**Lead form:** https://vyomacre-leads.vercel.app ([separate repo](https://github.com/Devdootjii/vyomacre-leads))

---

## The problem

India has roughly 637 GW of rooftop solar potential and about 23 GW installed.
A large part of the gap is not technology or money — it is that nobody knows
which roofs exist, who owns them, and whether the roof is any good.

On the other side, a building owner with a spare roof has no practical way to
reach the companies that would pay for it. Deals happen through informal
brokers, over phone calls, with no verification and no record.

VyomAcre sits in that gap.

---

## How it works

**Owner** signs up, lists a rooftop on a map (pin drop, or "detect my
location"), gives the area, roof type and photos. The listing goes to
verification.

**Verification** — an Earth Engine script estimates the built-up area around the
submitted coordinates, and the estimate is compared with what the owner
claimed. A large mismatch flags the listing for review. This is a
**pre-screen**, not a measurement: the imagery is coarse, so the number is
treated as a sanity check and confirmed on a site visit before any deal. An
admin marks the listing verified or flagged.

**Business (seeker)** browses verified listings on the map with filters, sends a
lease request, and gets the owner's contact only after the owner accepts. The
deal stays on the platform until that point.

**Admin** sees every roof with its submitted and estimated area, the
verification status, and can verify, flag or reject.

**AI assistant** — a Gemini-powered chat that answers questions in Hindi and
English and walks people through listing a roof.

---

## Stack

| Layer | What |
|---|---|
| Frontend | React 19, Vite, Tailwind, React Router, Leaflet + Esri imagery, Framer Motion |
| Backend | FastAPI, SQLAlchemy 2.0, Pydantic v2, JWT auth (bcrypt + python-jose) |
| Database | PostgreSQL (Neon in production) |
| Geospatial | Google Earth Engine (earthengine-api) |
| AI | Gemini via `google-generativeai` |
| Hosting | Vercel (frontend), Render (backend), Neon (database) |

---

## Repository layout

```
backend/          FastAPI app
  main.py           app entry, CORS, startup table creation
  models.py         SQLAlchemy models (roofs, leases, zones)
  auth_*.py         users, signup/login, JWT
  routes/           auth, roofs, leases, admin, ai, zones
  services/         verification_service.py (Earth Engine calls)
  config.py         settings from environment
  database.py       engine + session
frontend/         React app
  src/components/   landing, maps, dashboards, forms, chatbot
  src/services/api.js
engine/           Earth Engine scripts (area estimate, zone scanning)
```

---

## Running it locally

### Backend

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

Create `backend/.env`:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=any-long-random-string
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
GEMINI_API_KEY=...
```

```bash
uvicorn main:app --reload --port 8000
```

Swagger is at `http://localhost:8000/docs`. Tables are created on startup.

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

`frontend/src/services/api.js` holds the API base URL.

### Earth Engine

`engine/` needs a service-account JSON and `earthengine authenticate`. Without
it the verification endpoint falls back and listings stay pending — the rest of
the app works fine.

---

## API

| Method | Path | Who |
|---|---|---|
| POST | `/api/auth/signup`, `/api/auth/login` | public |
| GET | `/api/roofs` | public |
| POST | `/api/roofs` | owner |
| GET | `/api/roofs/{id}` | owner of that roof, or seeker after acceptance |
| POST | `/api/lease-requests` | seeker |
| PATCH | `/api/lease-requests/{id}` | owner — body `{"status": "accepted" \| "rejected"}` |
| GET | `/api/admin/roofs`, `/api/admin/stats` | admin |
| POST | `/api/ai/ask` | public |

`PATCH /api/lease-requests/{id}` accepts only `accepted` or `rejected`. Sending
`leased` returns 422 — the lease status enum is separate from the roof status
enum.

---

## Deployment notes

These cost us a day each, so they are written down.

- **CORS.** `CORS_ORIGINS` must list the deployed frontend URL, not just
  localhost. Missing it shows up as "login works locally, fails on Vercel".
- **SQLAlchemy is pinned below 2.1.** From 2.1 the `postgresql://` prefix
  resolves to `psycopg` (v3) instead of `psycopg2`, and the app dies at startup
  with `ModuleNotFoundError: No module named 'psycopg'`. `database.py` also
  forces the driver explicitly.
- **Neon, not a Render free database.** Render's free Postgres expires after 30
  days and then refuses connections; the backend crashes on startup because it
  creates tables at boot. Neon's free tier does not expire.
- **Render free web services sleep** after 15 minutes. The first request takes
  about 50 seconds. Wake it before a demo.
- **`google-generativeai` is deprecated** in favour of `google.genai`. It still
  works, but the migration is pending.

---

## Status

Working end to end: signup → list a roof → admin verify → seeker request →
owner accepts → contact unlocks → roof marked leased.

Next: farmland and building listings (interest is already being collected in the
lead form), in-app agreements, payments, and account recovery.

---

## Team

Team Devdoots — Divyansh Kumar (TPM, backend and AI), Ritesh (maps and
geospatial), Balram (API integration), Harsh (routing and frontend), Khushi
(data and seeding).

Built for *Build with AI: Code for Communities*.
