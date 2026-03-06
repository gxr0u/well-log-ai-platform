# Well Log System

Production-oriented prototype for ingesting LAS well-log files, storing raw files in S3, persisting parsed log data in PostgreSQL, visualizing curves vs depth, and generating AI-assisted interpretations.

## Project Structure

```
well-log-ai-system/
  backend/
    app/
      api/
      services/
      models/
      db/
      ai/
      main.py
    requirements.txt
    .env.example
  frontend/
    src/
      components/
      pages/
    package.json
```

## Phase 1 Status

Phase 1 scaffolds the repository structure and dependency files for backend and frontend.

## Run Locally

### Backend

1. Create a virtual environment.
2. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

3. Create `.env` from `backend/.env.example` and fill values.
4. Start API:

```bash
uvicorn app.main:app --reload --app-dir backend
```

### Frontend

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start dev server:

```bash
npm run dev
```

## S3 Storage (Optional)

To enable original LAS file storage in AWS S3:

1. Create an S3 bucket.
2. Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and `S3_BUCKET_NAME` in `backend/.env`.
3. Restart the backend server.

If these values are missing, uploads automatically fall back to local storage (`backend/uploads`).

## Notes

- No secrets are hardcoded.
- Later phases will implement LAS upload/parsing, S3 integration, DB models, and interpretation APIs.
