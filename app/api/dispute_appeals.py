"""
SkillMatch DNA v18.0 — Incident Dispute Appeals API Router
Pillar 3: Automated Incident Dispute Resolution & HITL Appeals Engine
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.services.dispute_appeals_service import (
    dispute_appeals_service,
    SubmitDisputeAppealRequest,
    AIReevaluateAppealRequest
)

router = APIRouter(tags=["Dispute Appeals"])


@router.post("/proctor/disputes/submit")
@router.post("/proctor/disputes/submit-appeal")
@router.post("/proctor/dispute/submit")
@router.post("/proctor/dispute/submit-appeal")
async def submit_dispute_appeal(req: SubmitDisputeAppealRequest) -> Dict[str, Any]:
    """
    Submits a candidate dispute appeal with privacy-masked forensic clip reference.
    """
    try:
        return dispute_appeals_service.submit_appeal(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/proctor/disputes/{appeal_id}/privacy-clip")
@router.get("/proctor/dispute/{appeal_id}/privacy-clip")
async def get_privacy_masked_clip(appeal_id: str) -> Dict[str, Any]:
    """
    Retrieves privacy-masked forensic clip metadata (blurred face, voice pitch-shifted, GDPR Art. 9 compliant).
    """
    try:
        return dispute_appeals_service.get_privacy_clip(appeal_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/proctor/disputes/{appeal_id}/re-evaluate")
@router.post("/proctor/disputes/ai-reevaluate")
@router.post("/proctor/dispute/{appeal_id}/re-evaluate")
@router.post("/proctor/dispute/ai-reevaluate")
async def ai_reevaluate_appeal(req: AIReevaluateAppealRequest, appeal_id: str = None) -> Dict[str, Any]:
    """
    Executes multi-modal AI Incident Re-Evaluator agent to determine benign vs fraudulent context.
    """
    try:
        if appeal_id and not req.appeal_id:
            req.appeal_id = appeal_id
        return dispute_appeals_service.ai_reevaluate_appeal(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/proctor/disputes/appeals/{candidate_id}")
@router.get("/proctor/dispute/appeals/{candidate_id}")
async def get_candidate_appeals(candidate_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves all past and active appeals for a candidate.
    """
    try:
        return dispute_appeals_service.get_candidate_appeals(candidate_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
