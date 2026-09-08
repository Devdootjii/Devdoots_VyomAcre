# ⚡ VyomAcre Backend

Backend service of the **VyomAcre** platform.

The backend will provide APIs and application logic to connect the
frontend, database, and geospatial engine.

---

## 🎯 Responsibilities

The backend will handle:

- 🏠 Property owner information
- 📍 Rooftop and space information
- 🔌 REST APIs
- 🗄️ Database communication
- 🌍 Communication with the geospatial engine
- ✅ Verified space information

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Framework | FastAPI |
| Language | Python |
| Database | PostgreSQL |
| API | REST |

---

## 🔌 API Endpoints

### Add Roof / Space

```http
POST /api/roofs/add