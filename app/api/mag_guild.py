"""
SkillMatch DNA v13.0 — Multi-Species Autonomous Guilds (MAGs) & SkillSwap v2.0 API Router
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.mag_guild_service import (
    mag_guild_service,
    CharterGuildRequest,
    HireSpeciesRequest,
    StreamBlockPayrollRequest,
    SwapSkillLiquidityRequest
)

router = APIRouter(prefix="/mag", tags=["Multi-Species Autonomous Guilds & SkillSwap v2.0"])


@router.post("/charter-guild")
async def charter_guild(req: CharterGuildRequest):
    """
    Charters a Multi-Species Autonomous Guild (MAG) / Zero-Human Corporate Entity.
    """
    try:
        return mag_guild_service.charter_multi_species_guild(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/hire-species")
async def hire_species(req: HireSpeciesRequest):
    """
    Hires a worker from any species (Human zkDID, AI Agent Worker, or Hardware QPU Cluster).
    """
    try:
        return mag_guild_service.hire_species_worker(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream-block-payroll")
async def stream_block_payroll(req: StreamBlockPayrollRequest):
    """
    Streams block-by-block INR and equity token micro-payments based on elapsed blocks.
    """
    try:
        return mag_guild_service.stream_block_payroll(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/swap-skill-liquidity")
async def swap_skill_liquidity(req: SwapSkillLiquidityRequest):
    """
    Executes a constant-product SkillSwap v2.0 AMM swap for verified skill assets (D_k >= 4.5).
    """
    try:
        res = mag_guild_service.swap_skill_liquidity(req)
        if res.get("status") == "rejected":
            raise HTTPException(status_code=400, detail=res.get("reason"))
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/directory")
async def directory():
    """
    Returns the planetary registry of Multi-Species Autonomous Guilds and active SkillSwap v2.0 pools.
    """
    try:
        return mag_guild_service.list_guilds()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
