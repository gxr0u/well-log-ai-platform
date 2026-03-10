# Well Log AI Platform

Production-ready cloud platform for **ingesting LAS well-log files, storing structured log data, visualizing curves vs depth, and generating AI-assisted interpretations.**

The system supports large well log datasets and provides an end-to-end workflow from **file upload → database ingestion → interactive visualization → AI interpretation**.

---

# Live Demo

Frontend
https://well-log-ai-platform.vercel.app

Backend API
https://well-log-api.onrender.com

API Documentation
https://well-log-api.onrender.com/docs

---

# System Architecture

```
User
 │
 ▼
React Frontend (Vercel)
 │
 ▼
FastAPI Backend (Render)
 │
 ├── LAS Parsing (lasio + pandas)
 ├── Log Ingestion Pipeline
 ├── AI Interpretation API
 │
 ▼
PostgreSQL Database
 │
 ▼
(Optional) AWS S3 Storage for raw LAS files
```

---

# Key Features

### LAS File Upload

* Supports standard **.LAS well log files**
* Validates format and parses curve metadata

### High Performance Log Ingestion

* Uses **vectorized pandas processing**
* Batch database inserts for fast ingestion
* Handles large well logs efficiently

### Interactive Log Viewer

* Plot multiple curves vs depth
* Dynamic depth range filtering
* Designed for large log datasets

### AI Assisted Interpretation

* Generates geological interpretations from selected logs
* Provides structured insights for petrophysical analysis

### Cloud Deployment

* Fully deployed cloud system
* Frontend: **Vercel**
* Backend: **Render**
* Database: **PostgreSQL**

---

# Technology Stack

## Backend

* **FastAPI**
* **SQLAlchemy**
* **PostgreSQL**
* **pandas**
* **lasio**

## Frontend

* **React**
* **TypeScript**
* **Vite**
* **Axios**

## Infrastructure

* **Render (API hosting)**
* **Vercel (frontend hosting)**
* **AWS S3 (optional file storage)**

---

# Project Structure

```
well-log-ai-platform
│
├── backend
│   ├── app
│   │   ├── api
│   │   │   ├── upload_api.py
│   │   │   ├── logs_api.py
│   │   │   ├── wells_api.py
│   │   │   └── interpret_api.py
│   │   │
│   │   ├── services
│   │   │   ├── las_parser.py
│   │   │   ├── log_service.py
│   │   │   └── s3_service.py
│   │   │
│   │   ├── models
│   │   │   ├── well.py
│   │   │   └── well_log_data.py
│   │   │
│   │   ├── db
│   │   │   └── database.py
│   │   │
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
└── frontend
    ├── src
    │   ├── components
    │   ├── pages
    │   └── services
    │
    ├── package.json
    └── vite.config.ts
```

---

# Run Locally

## Backend

Create virtual environment

```
python -m venv .venv
```

Activate

```
.venv\Scripts\activate
```

Install dependencies

```
pip install -r backend/requirements.txt
```

Create `.env`

```
cp backend/.env.example backend/.env
```

Run API

```
uvicorn app.main:app --reload --app-dir backend
```

Backend will start at

```
http://127.0.0.1:8000
```

API docs

```
http://127.0.0.1:8000/docs
```

---

## Frontend

```
cd frontend
npm install
npm run dev
```

Frontend will run at

```
http://localhost:5173
```

---

# Environment Variables

### Backend

```
DATABASE_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=
```

### Frontend

```
VITE_API_BASE_URL=https://well-log-api.onrender.com
```

---

# Performance Optimization

The ingestion pipeline is optimized for large LAS datasets:

* Vectorized **pandas transformations**
* Batch database inserts
* Efficient memory usage
* Reduced API latency

Typical ingestion times:

| Log Size | Time     |
| -------- | -------- |
| 5k rows  | ~3–5 s   |
| 10k rows | ~5–8 s   |
| 20k rows | ~10–12 s |

---
# Deployment Limitations

The backend is deployed on **Render Free Tier**, which has the following constraints:

* **512 MB RAM**
* **Single CPU**
* **Service sleeps after inactivity**

## Cold Start Behavior

When the backend has been idle, Render puts the service to sleep.
The first request may take **10–20 seconds** while the server wakes up.

If the frontend shows a **Network Error** during upload:

1. Wait a few seconds
2. Retry the request

This is expected behavior on free-tier infrastructure.

## Memory Limits

Large LAS files may temporarily exceed the **512MB memory limit**, which can cause the instance to restart with an error similar to:

```
Instance failed: jbrn2
Ran out of memory (used over 512MB)
```

This happens because LAS files are parsed into in-memory pandas DataFrames before being inserted into the database.

For production deployments, this can be resolved by:

* Increasing server memory
* Using a streaming ingestion pipeline
* Processing logs in chunks instead of loading the full dataset at once

## Upload Performance

Large well log files may take **30–90 seconds** to ingest due to:

* LAS parsing
* Data normalization
* Database insertion

Using **PostgreSQL bulk ingestion** instead of SQLite significantly improves ingestion speed and is recommended for production deployments.


# Future Improvements

* GPU accelerated log visualization
* Petrophysical calculations
* Multi-well comparison dashboard
* Advanced AI interpretation models
* Streaming ingestion for very large wells

---

# Security

* No secrets committed to repository
* Environment variables used for credentials
* Backend CORS configured for production deployment

---

# License

MIT License
