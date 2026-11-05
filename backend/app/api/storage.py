import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, FileResponse
from app.models.database import SessionLocal
from app.models.models import StoredFile
from app.services.storage_service import DEFAULT_UPLOAD_DIR

router = APIRouter(prefix="/storage", tags=["Storage"])

@router.get("/{file_path:path}")
def get_file(file_path: str):
    """
    Streams stored assets (resumes, audio recordings, documents)
    directly from CockroachDB persistent storage or fallback local cache.
    """
    # 1. Check CockroachDB / PostgreSQL persistent storage first
    try:
        db = SessionLocal()
        try:
            stored = db.query(StoredFile).filter(StoredFile.filename == file_path).first()
            if stored and stored.content:
                return Response(
                    content=stored.content,
                    media_type=stored.mime_type or "application/octet-stream",
                    headers={"Content-Disposition": f"inline; filename=\"{os.path.basename(file_path)}\""}
                )
        finally:
            db.close()
    except Exception:
        pass

    # 2. Fallback to local disk /tmp cache if present
    local_path = os.path.join(str(DEFAULT_UPLOAD_DIR), file_path)
    if os.path.exists(local_path):
        return FileResponse(local_path)

    raise HTTPException(status_code=404, detail="Requested file not found in persistent storage.")

