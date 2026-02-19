"""SECG ERP — FastAPI Application

Main entry point. Run with:
    uvicorn backend.main:app --reload --port 8000

Production (Railway):
    uvicorn backend.main:app --host 0.0.0.0 --port $PORT
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import api_router
from backend.core.config import settings
from backend.core.database import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup if they don't exist (dev convenience).
    In production, use Alembic migrations instead.
    """
    if settings.debug:
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS — allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routes under /api
app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/health")
def health_check():
    """Health check endpoint for Railway / load balancers."""
    return {"status": "ok", "version": settings.api_version}


@app.get("/")
def root():
    """Root redirect to API docs."""
    return {
        "app": "SECG ERP",
        "version": settings.api_version,
        "docs": "/api/docs",
        "health": "/health",
    }
