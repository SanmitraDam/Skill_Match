import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# CockroachDB Cloud version string compatibility
if "cockroach" in db_url.lower():
    try:
        from sqlalchemy.dialects.postgresql.base import PGDialect
        PGDialect._get_server_version_info = lambda *args: (15, 0)
    except Exception:
        pass

if "sslmode=verify-full" in db_url and "sslrootcert=" not in db_url:
    db_url = db_url.replace("sslmode=verify-full", "sslmode=require")
elif "sqlite" in db_url and os.environ.get("VERCEL") and not db_url.startswith("sqlite:////tmp"):
    db_url = "sqlite:////tmp/skillmatch.db"

engine = create_engine(
    db_url,
    connect_args={"check_same_thread": False} if "sqlite" in db_url else {},
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def ensure_schema_compatibility(target_engine):
    """Ensures existing SQLite databases are non-destructively updated with newer columns."""
    try:
        with target_engine.connect() as conn:
            tables = ["users", "resumes", "job_descriptions", "skill_match_results", "candidate_skill_vectors"]
            for tbl in tables:
                try:
                    result = conn.execute(text(f"PRAGMA table_info({tbl})")).fetchall()
                    col_names = [row[1] for row in result]
                    if col_names and "tenant_id" not in col_names:
                        conn.execute(text(f"ALTER TABLE {tbl} ADD COLUMN tenant_id VARCHAR DEFAULT 'tenant_default'"))
                        conn.commit()
                except Exception:
                    pass

            # v27.0 social readiness network columns (heals databases created before the
            # post-sign-in identity hub existed; new tables are handled by create_all).
            v27_columns = {
                "candidate_profiles": [
                    ("candidate_name", "VARCHAR(255)"),
                    ("avatar_url", "VARCHAR(500)"),
                ],
                "readiness_posts": [
                    ("peer_verifications_count", "INTEGER DEFAULT 0"),
                    ("ccrs_score", "FLOAT DEFAULT 0"),
                ],
            }
            for tbl, columns in v27_columns.items():
                try:
                    result = conn.execute(text(f"PRAGMA table_info({tbl})")).fetchall()
                    col_names = [row[1] for row in result]
                    for column, ddl_type in columns:
                        if col_names and column not in col_names:
                            conn.execute(text(f"ALTER TABLE {tbl} ADD COLUMN {column} {ddl_type}"))
                            conn.commit()
                except Exception:
                    pass
    except Exception:
        pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
