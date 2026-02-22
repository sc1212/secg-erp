"""SECG ERP — FastAPI Application

Main entry point. Run with:
    uvicorn backend.main:app --reload --port 8000

Production (Railway):
    uvicorn backend.main:app --host 0.0.0.0 --port $PORT
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import api_router
from backend.core.config import settings
from backend.core.database import Base, engine


def _seed_admin_user(log) -> None:
    """Create the default admin user from env vars if not already present."""
    email = os.getenv("ADMIN_EMAIL", "")
    password = os.getenv("ADMIN_PASSWORD", "")
    username = os.getenv("ADMIN_USERNAME", "")
    full_name = os.getenv("ADMIN_FULL_NAME", "")
    if not (email and password and username and full_name):
        return
    try:
        from passlib.context import CryptContext
        from sqlalchemy.orm import Session
        from backend.core.database import SessionLocal
        from backend.models.extended import UserAccount
        pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
        db: Session = SessionLocal()
        try:
            existing = db.query(UserAccount).filter(UserAccount.email == email).first()
            if not existing:
                user = UserAccount(
                    email=email,
                    username=username,
                    full_name=full_name,
                    password_hash=pwd_ctx.hash(password),
                    is_active=True,
                )
                db.add(user)
                db.commit()
                log.info("Admin user seeded: %s", email)
        finally:
            db.close()
    except Exception as exc:
        log.warning("Admin user seeding failed: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup if they don't exist, then seed admin user."""
    import logging
    log = logging.getLogger(__name__)
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        log.warning("DB not ready, skipping create_all: %s", exc)
    _seed_admin_user(log)
    yield


app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS — hardcoded production + local origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://secg-erp.onrender.com",
        "https://secg-erp-pj9h.onrender.com",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
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
