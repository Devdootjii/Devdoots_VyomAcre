"""
migrate_sqlite_to_postgres.py
Divyansh — Phase 1, T4 (Step 6): move existing local SQLite data into the
new Render PostgreSQL database.

Usage:
    python migrate_sqlite_to_postgres.py \
        --sqlite-path ./vyomacre.db \
        --postgres-url "postgresql+psycopg2://user:pass@host:5432/vyomacre"

Only run this ONCE, right after switching DATABASE_URL to Postgres and
before real users start signing up on the Postgres database — it does not
merge/dedupe, it just copies rows across. Safe to skip entirely if there's
no real data worth keeping (e.g. only test/dummy rows so far) — in that
case just let create_all() build empty tables on Postgres and move on.

Order matters: users -> roof_listings -> scanned_zones -> lease_requests,
because lease_requests.roof_id is a foreign key into roof_listings.
"""

import argparse
import sys
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parent))

from auth_models import User  # noqa: E402
from database import Base  # noqa: E402
from models import LeaseRequest, RoofListing, ScannedZone  # noqa: E402

# Order matters — respects foreign key dependencies.
TABLES_IN_ORDER = [User, RoofListing, ScannedZone, LeaseRequest]


def migrate(sqlite_path: str, postgres_url: str) -> None:
    sqlite_engine = create_engine(f"sqlite:///{sqlite_path}")
    postgres_engine = create_engine(postgres_url)

    SQLiteSession = sessionmaker(bind=sqlite_engine)
    PostgresSession = sessionmaker(bind=postgres_engine)

    # Make sure the target tables exist (mirrors what main.py's startup
    # event does — safe/idempotent, only creates what's missing).
    Base.metadata.create_all(bind=postgres_engine)

    src = SQLiteSession()
    dst = PostgresSession()

    total_migrated = 0
    try:
        for model in TABLES_IN_ORDER:
            rows = src.query(model).all()
            print(f"{model.__tablename__}: {len(rows)} row(s) found in SQLite")

            for row in rows:
                # Detach from the source session and re-insert into the
                # destination — merge() handles "already exists" (same PK)
                # gracefully by updating instead of erroring, so the script
                # is safe to re-run if it fails partway through.
                src.expunge(row)
                dst.merge(row)

            dst.commit()
            total_migrated += len(rows)
            print(f"{model.__tablename__}: migrated.")

        print(f"\nDone — {total_migrated} row(s) migrated across {len(TABLES_IN_ORDER)} tables.")

    except Exception:
        dst.rollback()
        print("\nMigration failed and was rolled back for the table in progress. "
              "Already-committed earlier tables are unaffected. Re-run after fixing the issue — "
              "merge() makes this safe to retry.")
        raise
    finally:
        src.close()
        dst.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate VyomAcre data from SQLite to PostgreSQL.")
    parser.add_argument("--sqlite-path", default="./vyomacre.db", help="Path to the local SQLite file.")
    parser.add_argument("--postgres-url", required=True, help="Target PostgreSQL connection URL.")
    args = parser.parse_args()

    if not Path(args.sqlite_path).exists():
        print(f"No SQLite file found at {args.sqlite_path} — nothing to migrate. "
              "If this is a fresh setup with no real data yet, that's fine, skip this script.")
        sys.exit(0)

    migrate(args.sqlite_path, args.postgres_url)