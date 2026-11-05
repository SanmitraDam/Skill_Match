"""Temporary probe: confirm SQLite foreign-key enforcement for social models."""
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.models.database import SessionLocal, engine
from app.models import models

print("dialect:", engine.dialect.name)
with engine.connect() as conn:
    print("PRAGMA foreign_keys =", conn.exec_driver_sql("PRAGMA foreign_keys").scalar())

db = SessionLocal()
try:
    post = models.ReadinessPost(
        user_id=987654,
        post_type="QUIZ_MASTERY",
        title="probe",
        skill_tags="probe",
    )
    db.add(post)
    db.commit()
    print("insert without matching user OK, id =", post.id)
    db.delete(post)
    db.commit()
except Exception as exc:  # noqa: BLE001
    db.rollback()
    print("insert FAILED:", type(exc).__name__, exc)
finally:
    db.close()
