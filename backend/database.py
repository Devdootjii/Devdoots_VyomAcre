"""
database.py
SQLAlchemy engine, session factory, and declarative base for VyomAcre.
Connection string is pulled from environment via `config.settings`
(DATABASE_URL) — no credentials are hardcoded here.

PostGIS note: the target Postgres instance should have the `postgis`
extension enabled (`CREATE EXTENSION IF NOT EXISTS postgis;`). Geometry
columns can be added later via GeoAlchemy2 without changing this setup.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,   # verifies connections before use, avoids stale-connection errors
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    future=True,
)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a DB session per-request
    and guarantees it is closed afterwards.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()