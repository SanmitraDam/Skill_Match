"""
SkillMatch DNA v16.0 — Post-Interview Forensic Diagnostics Router
Pillar 4: Post-Interview Forensic Diagnostics & Dynamic Remediation Loop
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.services.forensic_service import (
    forensic_service,
    GenerateReportRequest,
    RemediationSyncRequest
)

router = APIRouter(prefix="/forensic", tags=["Forensic Diagnostics"])


@router.post("/generate-report")
async def generate_forensic_post_mortem(req: GenerateReportRequest) -> Dict[str, Any]:
    """
    Synthesizes interview post-mortem report from Quiz, Sandbox, Voice, and STAR scores.
    """
    try:
        return forensic_service.generate_forensic_report(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/remediation-sync")
async def sync_closed_loop_remediation(req: RemediationSyncRequest) -> Dict[str, Any]:
    """
    Executes dynamic remediation loop: overrides SM-2 queue priority (EF = 1.3, interval = 1 day)
    and rebalances 4-week preparation roadmap.
    """
    try:
        return forensic_service.sync_remediation_loop(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{candidate_id}")
async def get_candidate_forensic_history(candidate_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves all past forensic reports and remediation sync records for a candidate.
    """
    try:
        return forensic_service.get_candidate_history(candidate_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
