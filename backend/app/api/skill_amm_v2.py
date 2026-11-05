"""
SkillMatch DNA Version 26.0: Planetary Skill AMM Pools & aUBI API Router.
Pillar 3 of suggestion-v25.md:
- POST /skill-amm-v2/create-pool
- POST /skill-amm-v2/swap
- POST /skill-amm-v2/claim-aubi
- GET  /skill-amm-v2/metrics
"""

from fastapi import APIRouter, HTTPException
from app.services.skill_amm_v2_service import (
    skill_amm_v2_service,
    CreatePoolRequest,
    SwapAssetRequest,
    ClaimAUBIRequest
)

router = APIRouter(prefix="/skill-amm-v2", tags=["Planetary Skill AMM v2.0 & aUBI (v26.0)"])


@router.post("/create-pool")
async def create_skill_pool(req: CreatePoolRequest):
    try:
        return skill_amm_v2_service.create_skill_pool(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/swap")
async def swap_skill_liquidity(req: SwapAssetRequest):
    try:
        return skill_amm_v2_service.swap_skill_liquidity(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/claim-aubi")
async def claim_aubi(req: ClaimAUBIRequest):
    try:
        return skill_amm_v2_service.claim_aubi_yield(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_planetary_metrics():
    try:
        return skill_amm_v2_service.get_planetary_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
