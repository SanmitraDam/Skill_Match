"""
SkillMatch DNA Version 25.0: Reinforcement Learning with Verifiable Rewards (RLVR) & DPO API Router.
Pillar 3 of suggestion-v24.md:
- POST /rlvr-copilot/evaluate-reward
- POST /rlvr-copilot/socratic-hint
- POST /rlvr-copilot/dpo/calibrate
"""

from fastapi import APIRouter, HTTPException
from app.services.rlvr_copilot_service import (
    rlvr_copilot_service,
    RLVREvaluateRequest,
    SocraticHintRequest,
    DPOCalibrateRequest
)

router = APIRouter(prefix="/rlvr-copilot", tags=["RLVR & DPO Socratic Co-Pilot (v25.0)"])


@router.post("/evaluate-reward")
async def evaluate_reward(req: RLVREvaluateRequest):
    try:
        return rlvr_copilot_service.evaluate_rlvr_reward(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/socratic-hint")
async def socratic_hint(req: SocraticHintRequest):
    try:
        return rlvr_copilot_service.generate_socratic_hint(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dpo/calibrate")
async def dpo_calibrate(req: DPOCalibrateRequest):
    try:
        return rlvr_copilot_service.calibrate_dpo_preference(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
