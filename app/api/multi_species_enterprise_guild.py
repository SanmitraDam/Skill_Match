"""
SkillMatch DNA Version 24.0: Self-Sovereign Multi-Species Enterprise Guilds API Router.
Pillar 3 of suggestion-v23.md:
- POST /multi-species-guild/charter
- POST /multi-species-guild/recruit-hybrid-squad
- POST /multi-species-guild/ci-milestone/stream-dividends
- POST /multi-species-guild/skill-collateral/vault
- POST /multi-species-guild/credit-line/draw
- POST /multi-species-guild/micro-royalty/repay
- GET  /multi-species-guild/directory
"""

from fastapi import APIRouter, HTTPException
from app.services.multi_species_enterprise_guild_service import (
    multi_species_enterprise_guild_service,
    CharterMultiSpeciesGuildRequest,
    RecruitHybridSquadRequest,
    StreamCIDividendsRequest,
    DepositSkillCollateralVaultRequest,
    DrawGuildCreditRequest,
    RepayGuildMicroRoyaltyRequest
)

router = APIRouter(prefix="/multi-species-guild", tags=["Multi-Species Enterprise Guilds (v24.0)"])


@router.post("/charter")
async def charter_guild(req: CharterMultiSpeciesGuildRequest):
    try:
        return multi_species_enterprise_guild_service.charter_multi_species_guild(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recruit-hybrid-squad")
async def recruit_hybrid_squad(req: RecruitHybridSquadRequest):
    try:
        return multi_species_enterprise_guild_service.recruit_hybrid_squad(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ci-milestone/stream-dividends")
async def stream_ci_dividends(req: StreamCIDividendsRequest):
    try:
        return multi_species_enterprise_guild_service.stream_ci_dividends(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/skill-collateral/vault")
async def deposit_skill_collateral(req: DepositSkillCollateralVaultRequest):
    try:
        return multi_species_enterprise_guild_service.deposit_skill_collateral_vault(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/credit-line/draw")
async def draw_credit(req: DrawGuildCreditRequest):
    try:
        return multi_species_enterprise_guild_service.draw_guild_credit(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/micro-royalty/repay")
async def repay_micro_royalty(req: RepayGuildMicroRoyaltyRequest):
    try:
        return multi_species_enterprise_guild_service.repay_micro_royalty(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/directory")
async def get_directory():
    try:
        return multi_species_enterprise_guild_service.get_guild_directory()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
