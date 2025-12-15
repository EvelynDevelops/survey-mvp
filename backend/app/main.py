from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api.routes import health, auth, surveys, public, dashboard

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Survey MVP API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(surveys.router)
app.include_router(public.router)
app.include_router(dashboard.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Survey MVP API"}
