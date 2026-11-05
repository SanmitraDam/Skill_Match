"""
FastAPI Router for Reinforcement Learning from Assessment Feedback (RLAF) (v5.0)
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional

from app.services.rlaf_service import (
    rlaf_service,
    HiringFeedbackRecord,
    RLAFRewardResult,
    DualEvaluatorCritiqueRequest,
    DualEvaluatorCritiqueResponse
)

router = APIRouter(prefix="/rlaf", tags=["Reinforcement Learning from Assessment Feedback"])

@router.post("/feedback", response_model=RLAFRewardResult)
async def log_hiring_outcome_feedback(record: HiringFeedbackRecord):
    """
    Logs real-world hiring outcome (interview callback, 90-day retention, bias variance)
    and computes RLAF reward. Automatically triggers DPO fine-tuning checkpoints.
    """
    try:
        return rlaf_service.log_hiring_outcome(record)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to log RLAF feedback: {str(e)}")

@router.post("/critique-turn", response_model=DualEvaluatorCritiqueResponse)
async def evaluate_interview_critique(req: DualEvaluatorCritiqueRequest):
    """
    Dual-Evaluator Multi-Agent Reflection Loop:
    Secondary Critique Agent inspects Interviewer Agent scoring to prevent halo effects and drift.
    """
    try:
        return rlaf_service.execute_dual_evaluator_reflection(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Critique evaluation failed: {str(e)}")

@router.get("/metrics")
async def get_rlaf_metrics():
    """Returns RLAF closed-loop telemetry, cumulative reward, and quarantined bias items."""
    return rlaf_service.get_rlaf_metrics()
