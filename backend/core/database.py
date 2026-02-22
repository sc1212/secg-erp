"""Database engine, session factory, and base model."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from backend.core.config import settings

_url = settings.database_url

# Render Postgres external URLs require SSL; add sslmode if not already present
_connect_args = {}
if _url.startswith("postgresql") and "render.com" in _url and "sslmode" not in _url:
    _connect_args = {"sslmode": "require"}

engine = create_engine(
    _url,
    echo=settings.echo_sql,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    connect_args=_connect_args,
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
