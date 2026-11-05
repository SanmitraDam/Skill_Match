"""
SkillMatch DNA v11.0 — Self-Evolving Autonomous Enterprise Guilds API Router
Endpoints:
- POST /guild/charter            : Charter self-evolving autonomous enterprise guild with liquidity vault
- POST /guild/recruit-talent     : Recruit candidate zkDID with real-time dividend streaming
- POST /guild/collateralize-skill: Lock verified skill vector (Dk >= 4.8, CCRS >= 85%) for zero-interest credit line
- POST /guild/draw-credit        : Disburse non-custodial zero-interest credit to candidate wallet
- GET  /guild/directory          : Query active enterprise guilds, liquidity vaults & credit facilities
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.autonomous_guild_service import AutonomousGuildService

router = APIRouter(prefix="/guild", tags=["Self-Evolving Autonomous Enterprise Guilds & Skill Credit"])

_guild_service = AutonomousGuildService()


class CharterGuildRequest(BaseModel):
    guild_name: str = Field(..., json_schema_extra={"example": "Noosphere Quantum Optics Guild"})
    repository_url: str = Field(..., json_schema_extra={"example": "https://github.com/noosphere-mesh/photonic-consensus-core"})
    initial_vault_inr: float = Field(415000000, json_schema_extra={"example": 415000000})
    total_governance_shares: int = Field(10000000, json_schema_extra={"example": 10000000})
    sprint_objective: Optional[str] = Field(None, json_schema_extra={"example": "Integrate Majorana Anyon braid compiler."})


class RecruitTalentRequest(BaseModel):
    guild_id: str = Field(..., json_schema_extra={"example": "guild_quantum_optics"})
    candidate_zk_did: str = Field(..., json_schema_extra={"example": "did:zk:skillos:7f8a9b1c2d3e"})
    role_title: str = Field("Principal Quantum Systems Guildmaster", json_schema_extra={"example": "Principal Quantum Systems Guildmaster"})
    rate_per_block_inr: float = Field(12.45, json_schema_extra={"example": 12.45})
    equity_shares: int = Field(10000, json_schema_extra={"example": 10000})


class CollateralizeSkillRequest(BaseModel):
    candidate_zk_did: str = Field(..., json_schema_extra={"example": "did:zk:skillos:7f8a9b1c2d3e"})
    skill_name: str = Field("Fault-Tolerant Distributed Consensus & Rust WASM", json_schema_extra={"example": "Fault-Tolerant Distributed Consensus & Rust WASM"})
    proficiency_score: float = Field(4.92, json_schema_extra={"example": 4.92})
    ccrs_rating_pct: float = Field(92.5, json_schema_extra={"example": 92.5})


class DrawCreditRequest(BaseModel):
    candidate_zk_did: str = Field(..., json_schema_extra={"example": "did:zk:skillos:7f8a9b1c2d3e"})
    amount_inr: float = Field(996000, json_schema_extra={"example": 996000})


@router.post("/charter")
def charter_guild(req: CharterGuildRequest):
    result = _guild_service.charter_guild(
        guild_name=req.guild_name,
        repository_url=req.repository_url,
        initial_vault_inr=req.initial_vault_inr,
        total_governance_shares=req.total_governance_shares,
        sprint_objective=req.sprint_objective,
    )
    return {"status": "success", "guild": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/recruit-talent")
def recruit_talent(req: RecruitTalentRequest):
    result = _guild_service.recruit_talent(
        guild_id=req.guild_id,
        candidate_zk_did=req.candidate_zk_did,
        role_title=req.role_title,
        rate_per_block_inr=req.rate_per_block_inr,
        equity_shares=req.equity_shares,
    )
    return {"status": "success", "membership": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/collateralize-skill")
def collateralize_skill(req: CollateralizeSkillRequest):
    result = _guild_service.collateralize_skill(
        candidate_zk_did=req.candidate_zk_did,
        skill_name=req.skill_name,
        proficiency_score=req.proficiency_score,
        ccrs_rating_pct=req.ccrs_rating_pct,
    )
    return {"status": "success", "credit_facility": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/draw-credit")
def draw_credit(req: DrawCreditRequest):
    result = _guild_service.draw_credit(
        candidate_zk_did=req.candidate_zk_did,
        amount_inr=req.amount_inr,
    )
    return {"status": "success", "disbursement": result, **{k: v for k, v in result.items() if k != "status"}}


@router.get("/directory")
def get_guild_directory():
    result = _guild_service.get_directory()
    return {"status": "success", "directory": result, **{k: v for k, v in result.items() if k != "status"}}
