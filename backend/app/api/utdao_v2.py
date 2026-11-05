"""
SkillMatch DNA v14.0 — Cosmic Neural Noosphere Platform
Pillar 3: Self-Evolving Multi-Species Universal Talent DAOs (UTDAO v2.0) & Algorithmic Yield (aUBI) API Router.
"""

from fastapi import APIRouter, HTTPException
from app.services.utdao_v2_service import (
    utdao_v2_service,
    GuildCharterRequest,
    SkillCollateralRequest,
    AUBIClaimRequest,
    EquityStreamRequest,
)

router = APIRouter(prefix="/utdao-v2", tags=["UTDAO v2.0 & aUBI Skill Vaults (v14.0)"])


@router.post("/charter-guild")
async def charter_guild(req: GuildCharterRequest):
    try:
        return utdao_v2_service.charter_guild(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/collateralize-skill")
async def collateralize_skill(req: SkillCollateralRequest):
    return utdao_v2_service.collateralize_skill_vector(req)


@router.post("/claim-aubi")
async def claim_aubi(req: AUBIClaimRequest):
    try:
        return utdao_v2_service.claim_aubi(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream-equity")
async def stream_equity(req: EquityStreamRequest):
    try:
        return utdao_v2_service.stream_equity_and_dividends(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/directory")
async def get_directory():
    try:
        return utdao_v2_service.get_directory()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
