# 🚀 VyomAcre

### Connecting Empty Spaces with the Right Opportunities.

VyomAcre is a platform that connects companies looking for suitable
rooftops, land, or other spaces with property owners who have
available spaces.

> **Discover. Connect. Build.**

---

## 🌍 About VyomAcre

VyomAcre is a space discovery and connection platform designed
to bridge the gap between property owners and companies looking
for suitable rooftops, land, or other usable spaces.

The platform brings space information, location data, geospatial
processing, and an interactive map experience together in one
centralized system.

### 🎯 Our Goal

To make it easier to discover suitable spaces and create a
structured connection between space owners and companies.

---

## 🎯 Problem Statement

Companies may need suitable rooftops, land, or other spaces for
their business requirements, while property owners may have
available spaces but lack an efficient way to reach potential
companies.

This creates a discovery and connectivity gap.

### The Challenge

- 🏢 Companies need suitable locations
- 🏠 Property owners have available spaces
- 📍 Location and space information can be difficult to organize
- 🔎 Finding suitable spaces can be time-consuming
- 🤝 Owners and companies need a structured way to connect

---

## 💡 Our Solution

VyomAcre provides a centralized platform to organize and discover
suitable spaces.

The system is designed around three major components:

- 🖥️ **Frontend** — User interface and interactive map experience
- ⚡ **Backend** — APIs and application logic
- 🌍 **Geospatial Engine** — Location and space processing

Together, these components create a workflow from space
onboarding to discovery and connection.

---

## ⚙️ How VyomAcre Works

```text
        🏠 Property Owner
               │
               ▼
       Owner Onboarding
               │
               ▼
      Space Information
               │
               ▼
    🌍 Geospatial Processing
               │
               ▼
        Verified Spaces
               │
               ▼
       🗺️ Map Dashboard
               │
               ▼
      🏢 Company Discovery
               │
               ▼
            🤝 Connect
```

---

## ✨ Key Features

- 🏠 **Property Owner Onboarding**
  - Owners can submit their available space details.

- 📍 **Location-Based Information**
  - Store important location and space information.

- 🗺️ **Interactive Map Dashboard**
  - Visualize suitable spaces through a map-based interface.

- 🌍 **Geospatial Processing**
  - Process location-based information to identify suitable spaces.

- 🔎 **Space Discovery**
  - Help companies discover potentially suitable spaces.

- 🔌 **REST API Integration**
  - Connect the frontend, backend, and geospatial engine through APIs.

- 🔐 **Secure Configuration**
  - Keep API keys, database credentials, and other secrets in environment variables.

- ☁️ **Cloud-Ready Architecture**
  - Designed for frontend, backend, and database cloud deployment.

---

## 🏗️ System Architecture

VyomAcre follows a modular monorepo architecture:

```text
Devdoots_VyomAcre
│
├── frontend/
│   └── User Interface & Map Dashboard
│
├── backend/
│   └── FastAPI APIs & Application Logic
│
└── engine/
    └── Geospatial Processing
```

### 🖥️ Frontend

The frontend handles the user-facing experience, including the
property owner onboarding flow and map dashboard.

### ⚡ Backend

The backend provides the APIs and application logic required to
manage space information and communicate with the frontend.

### 🌍 Geospatial Engine

The engine handles geospatial processing and location-based
analysis for suitable spaces.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Styling | Tailwind CSS |
| Backend | FastAPI |
| Database | PostgreSQL |
| Geospatial | Python / Google Earth Engine |
| Version Control | Git & GitHub |

---

## 📁 Project Structure

```text
Devdoots_VyomAcre/
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── OwnerForm.jsx
│       │   └── MapDashboard.jsx
│       │
│       └── services/
│           └── api.js
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── routes/
│       └── roof_api.py
│
├── engine/
│   ├── scanner.py
│   └── processor.py
│
├── .gitignore
└── README.md
```

---

## 🔌 API Documentation

### 1. Add Roof / Space

```http
POST /api/roofs/add
```

Used to submit property owner and space information.

#### Request Fields

```json
{
  "owner_name": "Owner Name",
  "phone_number": "Phone Number",
  "area_sqft": 1500,
  "roof_type": "Concrete",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "photos": []
}
```

---

### 2. Engine Sync

```http
POST /api/engine/sync
```

Used to synchronize geospatial analysis results.

#### Request Fields

```json
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "estimated_area_sqft": 1500,
  "sunlight_hours_per_day": 8,
  "verification_score": 0.95
}
```

---

### 3. Get Verified Spaces

```http
GET /api/roofs/verified
```

Returns verified spaces available for discovery.

#### Response Fields

```json
{
  "roof_id": 1,
  "area_sqft": 1500,
  "coordinates": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "status": "verified"
}
```

---

## 🔐 Environment Variables

Sensitive information such as API keys, database credentials,
and other secrets should never be hardcoded.

Create a `.env` file for local development.

```env
DATABASE_URL=your_database_url
GEE_API_KEY=your_gee_api_key
VITE_API_BASE_URL=your_backend_url
```

> ⚠️ Never commit your real `.env` file to GitHub.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Devdootjii/Devdoots_VyomAcre.git
```

### 2. Enter the Project

```bash
cd Devdoots_VyomAcre
```

### 3. Install Dependencies

Install the dependencies according to the individual
`frontend`, `backend`, and `engine` configurations.

### 4. Configure Environment

Create your local `.env` file and add the required environment
variables.

### 5. Run the Application

Start the frontend, backend, and geospatial engine according to
their respective development configurations.

---

## ☁️ Deployment

The planned deployment architecture includes:

```text
Frontend
   │
   ▼
Vercel

Backend
   │
   ▼
Render / Railway

Database
   │
   ▼
Supabase / Render PostgreSQL
```

---

## 👥 Team Devdoots

| Member | Responsibility |
|---|---|
| **Divyansh** | TPM & Backend |
| **Balram** | Geospatial Engine |
| **Aryan** | Frontend UI/UX |
| **Ritesh** | Map Dashboard |
| **Harsh** | Scrum Master & QA |
| **Khushi** | Cloud & Resource Management |

---

## 🛣️ Roadmap

- [x] Repository & project structure
- [x] Team role distribution
- [ ] Frontend onboarding flow
- [ ] Interactive map dashboard
- [ ] Backend API implementation
- [ ] Geospatial engine integration
- [ ] Database integration
- [ ] Cloud deployment
- [ ] End-to-end platform testing

---

## 🤝 Contributing

VyomAcre follows a feature-branch and pull-request workflow.

```text
main
 │
 ├── feature / fix / docs branch
 │
 ▼
Pull Request
 │
 ▼
Code Review
 │
 ▼
Merge
```

Please create a separate branch for your work and submit a pull
request instead of pushing directly to `main`.

---

## 📜 License

This project is developed by **Team Devdoots**.

License information will be added as the project progresses.

---

<p align="center">
  Built with ❤️ by <strong>Team Devdoots</strong>
</p>

