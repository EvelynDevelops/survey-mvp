# Survey MVP

A monorepo project containing both frontend and backend applications.

## Project Structure

```
survey-mvp/
├── frontend/          # Next.js frontend
│   ├── app/          # Next.js App Router
│   ├── package.json
│   └── next.config.js
├── backend/          # FastAPI backend
│   ├── app/          # FastAPI application code
│   ├── Dockerfile    # Backend containerization config
│   ├── requirements.txt
│   └── pyproject.toml
└── docker-compose.yml # Docker Compose configuration
```

## Development Guide

### Database Setup

Start PostgreSQL database:

```bash
make db-start
```

Verify database connection:

```bash
make db-verify
```

For more database commands, see [DATABASE.md](DATABASE.md)

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server will run at http://localhost:3000

### Backend Development

#### Option 1: Run Locally

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend API will run at http://localhost:8000

#### Option 2: Run with Docker

```bash
docker-compose up --build
```

Backend API will run at http://localhost:8000

### API Documentation

FastAPI auto-generated API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Build & Deploy

### Frontend Build

Frontend uses Next.js static export:

```bash
cd frontend
npm run build
```

Build output is in `frontend/out/` directory, ready to deploy to static hosting services (Vercel, Netlify, S3, etc.).

### Backend Deployment

Backend uses Docker containerization:

```bash
cd backend
docker build -t survey-mvp-backend .
docker run -p 8000:8000 survey-mvp-backend
```

Or use docker-compose:

```bash
docker-compose up -d
```

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript

### Backend
- FastAPI
- Python 3.11
- Uvicorn
- PostgreSQL 15

## License

MIT
