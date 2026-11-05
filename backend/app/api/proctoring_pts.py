"""
SkillMatch DNA v17.0 — Proctoring Trust Score (PTS) & Forensic Audit Router
Pillar 5: Real-Time Proctoring Trust Score (PTS) & Cryptographic Forensic Audit Log
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.proctoring_pts_service import (
    proctoring_pts_service,
    CalculatePTSRequest,
    GenerateAuditLogRequest
)

router = APIRouter(prefix="/proctor/pts", tags=["Proctoring Trust Score & Audit"])


@router.post("/calculate")
async def calculate_proctoring_trust_score(req: CalculatePTSRequest) -> Dict[str, Any]:
    """
    Synthesizes multi-modal anomaly telemetry into dynamic Proctoring Trust Score (PTS)
    with strict pillar weightings (Gaze 15%, Face 25%, Audio 25%, Browser 20%, Typing 15%).
    """
    try:
        return proctoring_pts_service.calculate_pts(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-audit-log")
async def generate_forensic_audit_log(req: GenerateAuditLogRequest) -> Dict[str, Any]:
    """
    Generates an Ed25519-signed cryptographic forensic incident audit package
    ready for on-chain commitment to ProctoringIntegrityRegistry.sol.
    """
    try:
        return proctoring_pts_service.generate_audit_package(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/session/{session_id}")
async def get_proctoring_session(session_id: str) -> Dict[str, Any]:
    """
    Retrieves current multi-modal proctoring telemetry and trust metrics for a session.
    """
    try:
        return proctoring_pts_service.get_session(session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
