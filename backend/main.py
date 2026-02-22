"""SECG ERP — FastAPI Application

Main entry point. Run with:
    uvicorn backend.main:app --reload --port 8000

Production (Render):
    uvicorn backend.main:app --host 0.0.0.0 --port $PORT
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import api_router
from backend.core.config import settings
from backend.core.database import Base, engine


_DEFAULT_USERS = [
    {
        "email": "scarson@southeastenterprise.com",
        "username": "scarson",
        "full_name": "Samuel Carson",
        "password": "Southeast123!",
    },
    {
        "email": "matt@southeastenterprise.com",
        "username": "mseibert",
        "full_name": "Matt Seibert",
        "password": "Southeast123!",
    },
]


def _seed_admin_users(log) -> None:
    """Seed default admin users on every startup (skips if already present)."""
    from passlib.context import CryptContext
    from sqlalchemy.orm import Session
    from backend.core.database import SessionLocal
    from backend.models.extended import UserAccount
    pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
    db: Session = SessionLocal()
    try:
        for u in _DEFAULT_USERS:
            existing = db.query(UserAccount).filter(UserAccount.email == u["email"]).first()
            if not existing:
                user = UserAccount(
                    email=u["email"],
                    username=u["username"],
                    full_name=u["full_name"],
                    password_hash=pwd_ctx.hash(u["password"]),
                    is_active=True,
                )
                db.add(user)
                db.commit()
                log.info("SEED OK: created %s", u["email"])
            else:
                log.info("SEED SKIP: %s already exists (id=%s)", u["email"], existing.id)
        total = db.query(UserAccount).count()
        log.info("SEED DONE: %d total users in DB", total)
    except Exception as exc:
        log.error("SEED FAILED: %s", exc, exc_info=True)
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup if they don't exist, then seed admin users."""
    import logging
    log = logging.getLogger(__name__)
    try:
        Base.metadata.create_all(bind=engine)
        log.info("DB create_all succeeded")
    except Exception as exc:
        log.error("DB create_all FAILED: %s", exc, exc_info=True)
    _seed_admin_users(log)
    yield


app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS — allow all origins so Render subdomain mismatches can't break login
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
