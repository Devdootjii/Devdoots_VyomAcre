# 🛰️ VyomAcre

**Rooftop leasing, verified from orbit.**

<div align="center">
  <img src="assets/hero-banner.png" alt="VyomAcre — rooftop leasing verified from orbit" width="100%">
</div>

<div align="center">

[![Live app](https://img.shields.io/badge/live-app-00E585?style=for-the-badge&logo=vercel&logoColor=white)](https://devdoots-vyom-acre-nine.vercel.app)
[![API docs](https://img.shields.io/badge/API-Swagger-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://devdoots-vyomacre-y0gr.onrender.com/docs)
[![Demo video](https://img.shields.io/badge/watch-20s%20demo-FF4D4D?style=for-the-badge&logo=youtube&logoColor=white)](assets/demo.mp4)

![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql&logoColor=white)
![Earth Engine](https://img.shields.io/badge/Google-Earth%20Engine-4285F4?style=flat-square&logo=googleearth&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-AI-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)
![Built for](https://img.shields.io/badge/Build%20with%20AI-Code%20for%20Communities-00E585?style=flat-square)

</div>

VyomAcre connects India's idle rooftops with the businesses that need them. An owner lists a roof in about two minutes, Google Earth Engine checks it against satellite imagery, and solar developers send lease requests straight to the owner's inbox — no broker, no site visit, no phone tag.

The whole loop runs in production today: **signup → list a roof → admin verify → business requests → owner accepts → contact unlocks → roof marked leased.**

---

## ▶️ Watch it work

<div align="center">
  <img src="assets/demo.gif" alt="VyomAcre demo — landing page, income calculator, satellite map, owner dashboard and inbox" width="100%">
</div>

<sub>20 seconds, recorded from the running app: landing → how it works → roof income calculator → live satellite map → owner dashboard → owner inbox. Higher-quality MP4 with sound-free playback: **[assets/demo.mp4](assets/demo.mp4)**.</sub>

---

## 💰 The gap VyomAcre closes

India has roughly **637 GW** of rooftop solar potential and about **23 GW** installed. Most of that gap is not technology or money — it is that nobody knows which roofs exist, who owns them, and whether a given roof is any good.

On the other side, an owner with a spare roof has no practical way to reach the companies that would pay for it. Deals happen through informal brokers, over phone calls, with no verification and no record of anything.

VyomAcre sits exactly in that gap, and it fixes the slowest step in the chain: the site visit.

| | Broker route | **VyomAcre** |
|---|---|---|
| Roof assessment | Agent site visit, 2–4 weeks | **Satellite scan, ~2 minutes** |
| Cost to owner | Broker commission | **Zero — free forever** |
| Who finds you | Whoever the broker knows | **Every business on the map** |
| Trust in listing data | Verbal claims | **Earth Engine verified** |
| Request tracking | Phone calls and hope | **Live status: request → accepted → leased** |
| Market visibility | One broker's contact list | **City-wide public map** |

---

## 📈 At a glance

| | Today |
|---|---|
| 🏠 Listings in the seeded demo | 10 rooftops across 6 cities |
| 🛰️ Verification | Google Earth Engine area pre-screen, admin sign-off |
| 👥 Roles | Owner · Business (seeker) · Admin |
| 🗺️ Map | Leaflet + Esri satellite imagery, filters by city / roof type / area |
| 🤖 Assistant | Gemini chat, Hindi + English, in-app |
| 🔌 API | 11 endpoints behind JWT auth, Swagger at `/docs` |
| 🆓 Cost to a roof owner | ₹0 — listing, verification and requests are free |

---

## 🖥️ Inside the product

### The live marketplace map

<div align="center">
  <img src="assets/marketplace-map.png" alt="VyomAcre live map with satellite imagery and verified rooftop pins" width="100%">
</div>

Every verified rooftop is a pin on Esri satellite imagery, with its area drawn as a footprint. Filter by city, roof type and minimum area, or flip to the dark base map for a street-level view. The right rail lists live properties as you pan.

<details>
<summary><b>Dark base map</b></summary>

<div align="center">
  <img src="assets/marketplace-map-dark.png" alt="VyomAcre map, dark base layer" width="100%">
</div>

</details>

### What could your roof earn?

<div align="center">
  <img src="assets/roof-calculator.png" alt="Roof income calculator" width="100%">
</div>

A city-aware slider that turns square feet into rupees — roughly ₹2.5/sq ft/month, city-adjusted, with a monthly figure beside the yearly one. It exists to answer the only question an owner actually has before signing up.

### Owner dashboard and inbox

<div align="center">
  <img src="assets/owner-dashboard.png" alt="Owner dashboard with verification and lease status" width="100%">
  <br><br>
  <img src="assets/owner-inbox.png" alt="Owner inbox with lease requests" width="100%">
</div>

Each listing carries its own state machine — **Submitted → Satellite verified → Leased** — and refreshes every 30 seconds. Lease requests land in the inbox with the business name, roof type and area; accepting one unlocks contact and moves the roof to leased.

### The business side

<div align="center">
  <img src="assets/seeker-marketplace.png" alt="Seeker marketplace with verified rooftops" width="100%">
</div>

A solar developer sees only verified, available rooftops, sends a request in one click, and tracks every proposal from the same screen.

### Admin mission control

<div align="center">
  <img src="assets/admin-panel.png" alt="Admin panel listing every roof with submitted and estimated area" width="100%">
</div>

Every roof in one grid: owner, phone, type, submitted area, Earth Engine estimate, coordinates, date and status. Verify, approve or flag in a single click, with tabs for pending, verified and flagged.

### Listing flow and the AI assistant

<div align="center">
  <img src="assets/list-roof.png" alt="List your roof form with map pin picker" width="100%">
  <br><br>
  <img src="assets/ai-assistant.png" alt="Gemini-powered Vyom Assistant chat" width="100%">
</div>

The owner form takes a roof type, address and a pin dropped on the map (or "detect my location"). The Vyom Assistant answers leasing questions in Hindi and English around the clock, with quick-start chips for the three questions everyone asks first.

---

## 🛰️ How it works

<div align="center">
  <img src="assets/how-it-works.png" alt="How VyomAcre works: list, verify, discover, accept" width="100%">
</div>

**1 · Owner lists the roof.** Pin drop on the map, roof type, area, photos. Two minutes, no paperwork.

**2 · Earth Engine pre-screens it.** A Google Earth Engine script estimates built-up area around the submitted coordinates and compares it with the claimed area. A large mismatch flags the listing for review. This is a **pre-screen, not a measurement** — the imagery is coarse, so the number is a sanity check that gets confirmed on a site visit before any deal closes. An admin marks the listing verified or flagged.

**3 · Businesses discover it.** Solar developers filter the live map by city, roof type and size, then send a lease request. The deal stays on-platform: no contact details are exposed until the owner accepts.

**4 · Owner accepts and earns.** Accepting unlocks contact, moves the roof to leased, and the roof becomes a monthly income stream for 20+ years. The business installs and maintains its own equipment — the owner never spends a rupee.

---

## 🎯 Who can do what

| Role | Can do | Cannot do |
|---|---|---|
| **Owner** | List roofs, see own verification status, accept/reject requests, read own inbox | See other owners' contact details, verify a listing |
| **Seeker (business)** | Browse verified roofs, send lease requests, track own requests | See an owner's phone number before acceptance |
| **Admin** | See every roof, verify / approve / flag / reject, platform stats | — (created directly in the database, never through signup) |

Auth is JWT-based (bcrypt hashing, python-jose tokens), with role gates enforced server-side on every route.

### Signing in

<div align="center">
  <img src="assets/login.png" alt="VyomAcre login screen" width="100%">
</div>

One form for all three roles — email or phone plus password. The backend returns a JWT and the role it carries, and the frontend routes straight to the right dashboard: owner, business or admin.

---

## 🧱 Stack

| Layer | What |
|---|---|
| Frontend | React 19, Vite, Tailwind, React Router 7, Leaflet + Esri imagery, Framer Motion, lucide icons |
| Backend | FastAPI, SQLAlchemy 2.0, Pydantic v2, JWT auth (bcrypt + python-jose) |
| Database | PostgreSQL (Neon in production) |
| Geospatial | Google Earth Engine (`earthengine-api`) |
| AI | Gemini via `google-generativeai` |
| Hosting | Vercel (frontend) · Render (backend) · Neon (database) |

---

## 🔌 API

Base URL: `https://devdoots-vyomacre-y0gr.onrender.com` — interactive docs at `/docs`.

| Method | Path | Who |
|---|---|---|
| POST | `/api/auth/signup`, `/api/auth/login` | public |
| GET | `/api/auth/me` | any signed-in user |
| GET | `/api/roofs`, `/api/roofs/verified` | public |
| POST | `/api/roofs/add` | owner |
| GET | `/api/roofs/{id}` | owner of that roof, or seeker after acceptance |
| PATCH | `/api/roofs/{id}/verify`, `/api/roofs/{id}/reject`, `/api/roofs/{id}/status` | admin |
| POST | `/api/lease-requests` | seeker |
| GET | `/api/lease-requests/mine` | seeker |
| PATCH | `/api/lease-requests/{id}` | owner — body `{"status": "accepted" \| "rejected"}` |
| GET | `/api/admin/roofs`, `/api/admin/stats` | admin |
| POST | `/api/ai/ask` | public |

```bash
curl -X POST https://devdoots-vyomacre-y0gr.onrender.com/api/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Rooftop list kaise karu?"}'
```

`PATCH /api/lease-requests/{id}` accepts only `accepted` or `rejected` — sending `leased` returns 422, because the lease status enum is deliberately separate from the roof status enum.

---

## 🚀 Run it locally

### Backend

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=any-long-random-string
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
GEMINI_API_KEY=...
```

```bash
uvicorn main:app --reload --port 8000
```

Swagger is at `http://localhost:8000/docs`; tables are created on startup.

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

`frontend/src/services/api.js` holds the API base URL — it points at the live Render backend by default; switch the constant to `http://127.0.0.1:8000` to run fully local.

### Earth Engine

`engine/` needs a service-account JSON and `earthengine authenticate`. Without it the verification call falls back and listings stay pending — the rest of the app works fine.

---

## 🗂️ Repository layout

```
backend/            FastAPI app
  main.py             entry point, CORS, startup table creation
  models.py           SQLAlchemy models (roofs, leases, zones, users)
  auth_*.py           users, signup/login, JWT
  routes/             auth, roofs, leases, admin, ai, zones
  services/           verification_service.py (Earth Engine calls)
  config.py           settings from environment
  database.py         engine + session
frontend/           React app
  src/components/     landing, maps, dashboards, forms, chatbot
  src/services/api.js API client
engine/             Earth Engine scripts (area estimate, zone scanning)
```

---

## ⚠️ Deployment notes

These cost us a day each, so they are written down.

- **CORS.** `CORS_ORIGINS` must list the deployed frontend URL, not just localhost. Missing it shows up as "login works locally, fails on Vercel".
- **SQLAlchemy is pinned below 2.1.** From 2.1 the `postgresql://` prefix resolves to `psycopg` (v3) instead of `psycopg2`, and the app dies at startup with `ModuleNotFoundError: No module named 'psycopg'`. `database.py` also forces the driver explicitly.
- **Neon, not a Render free database.** Render's free Postgres expires after 30 days and then refuses connections; the backend crashes on startup because it creates tables at boot. Neon's free tier does not expire.
- **Render free web services sleep** after 15 minutes. The first request takes about 50 seconds — wake it before a demo.
- **`google-generativeai` is deprecated** in favour of `google.genai`. It still works; the migration is pending.

---

## 🗺️ Status

Working end to end: signup → list a roof → admin verify → business requests → owner accepts → contact unlocks → roof marked leased.

**Next:** farmland and building listings (interest is already being collected in the [lead form](https://vyomacre-leads.vercel.app)), in-app agreements, payments, and account recovery.

---

## 👥 Team

Team Devdoots — Divyansh Kumar (TPM, backend and AI), Ritesh (maps and geospatial), Balram (API integration), Harsh (routing and frontend), Khushi (data and seeding).

Built for **Build with AI: Code for Communities**.

<sub>Screenshots and the demo video were captured from the app running locally against a seeded demo database — real components, real API, no mockups.</sub>
