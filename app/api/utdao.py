"""
SkillMatch DNA v12.0 — Universal Talent DAOs (UTDAOs) & Algorithmic Skill Yield (aUBI) API Router
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.utdao_service import (
    utdao_service,
    CreateUTDAORequest,
    MintSyntheticSkillRequest,
    ClaimAUBIRequest,
    GrantRDProposalRequest
)

router = APIRouter(prefix="/utdao", tags=["Universal Talent DAOs & aUBI Yield"])


@router.post("/create-dao")
async def create_dao(req: CreateUTDAORequest):
    """
    Charters a worker-owned Universal Talent DAO (UTDAO) managing planetary skill liquidity.
    """
    try:
        return utdao_service.create_talent_dao(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mint-synthetic")
async def mint_synthetic(req: MintSyntheticSkillRequest):
    """
    Mints synthetic financial assets backed by verified future earning potential (CCRS >= 90.0%).
    """
    try:
        res = utdao_service.mint_synthetic_skill_asset(req)
        if res.get("status") == "rejected":
            raise HTTPException(status_code=400, detail=res.get("reason"))
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/claim-aubi")
async def claim_aubi(req: ClaimAUBIRequest):
    """
    Claims continuous Algorithmic Universal Skill Yield (aUBI) accrued from AI compute queries.
    """
    try:
        return utdao_service.claim_aubi_yield(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/grant-r-and-d")
async def grant_r_and_d(req: GrantRDProposalRequest):
    """
    Submits an open-source R&D grant proposal to a Universal Talent DAO treasury.
    """
    try:
        return utdao_service.submit_rd_grant_proposal(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/directory")
async def directory():
    """
    Returns all registered Universal Talent DAOs across the planetary federation.
    """
    try:
        return utdao_service.list_daos()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
