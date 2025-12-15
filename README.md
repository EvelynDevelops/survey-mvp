# Survey MVP

A full-stack survey platform MVP for creating, publishing, and responding to surveys.

Built with Next.js, FastAPI, and PostgreSQL, and deployed using Vercel and Google Cloud Run.

## Project Structure

```
survey-mvp/
├── frontend/          # Next.js frontend
│   ├── app/          # Next.js App Router
│   ├── components/   # React components
│   ├── lib/          # Utilities and types
│   ├── package.json
│   └── next.config.js
├── backend/          # FastAPI backend
│   ├── app/          # FastAPI application code
│   ├── Dockerfile    # Backend containerization config
│   ├── requirements.txt
│   └── pyproject.toml
└── docker-compose.yml # Docker Compose configuration
```

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL 15
- JWT Authentication
- Passlib (bcrypt)

## Local Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server runs at: http://localhost:3000

### Backend Development

```bash
cd backend
pip install -r requirements.txt
docker-compose up -d db
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Backend API runs at: http://localhost:8000

API Documentation:
- Swagger UI: http://localhost:8000/docs

## Build & Deploy

### Frontend Build

Build the Next.js application:

```bash
cd frontend
npm run build
```

The build generates an optimized production build. Deployed on **Vercel**.

### Backend Deployment

Backend uses Docker containerization and is deployed on **Google Cloud Run**:

```bash
cd backend
docker build -t survey-mvp-backend .
docker run -p 8000:8000 survey-mvp-backend
```

Or use docker-compose:

```bash
docker-compose up -d
```

### Production Environment

- **Frontend**: Deployed on Vercel
- **Backend**: Dockerized FastAPI app on Google Cloud Run
- **Database**: Cloud SQL (PostgreSQL)

## Key Features

- User authentication (JWT)
- Survey creation and editing
- Survey publishing with public URLs
- Public survey response submission
- CSV export of survey responses
- API-driven frontend/backend separation
- Real-time form validation

## Possible Improvements

- Add unit and end-to-end tests
- Shared types between frontend and backend
- Survey analytics and dashboards
- Improved error handling and observability
- Response pagination and filtering
- Survey templates
- Conditional logic and branching
- File upload support for responses
- File uploads for responses (not implemented yet; planned: pre-signed URLs + GCS + DB metadata)

