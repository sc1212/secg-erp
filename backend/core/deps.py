"""FastAPI dependency injection — database sessions and common utilities."""

from typing import Generator

from sqlalchemy.orm import Session

from backend.core.database import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """Yield a database session per request, auto-closing on completion."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
