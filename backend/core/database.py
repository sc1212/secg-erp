"""Database engine, session factory, and base model."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from backend.core.config import settings

engine = create_engine(
    settings.database_url,
    echo=settings.echo_sql,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()


def get_session():
    """Yield a database session, auto-closing on exit."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
