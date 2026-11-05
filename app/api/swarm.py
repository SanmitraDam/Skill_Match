"""
SkillMatch DNA v6.0 - Swarm Intelligence API Router
Endpoints:
- GET /swarm/pools : List active talent liquidity pools
- POST /swarm/pools : Create new talent liquidity pool
- POST /swarm/bid : Submit candidate skill vector for automated pool bidding
- GET /swarm/equilibrium-bounty : Calculate ΔValue_skill market-clearing equilibrium
- GET /swarm/candidate-intelligence : Retrieve anonymous peer swarm telemetry
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.models.database import get_db
from app.services.swarm_market_service import SwarmMarketService

router = APIRouter(prefix="/swarm", tags=["Swarm Intelligence & Talent Liquidity"])

class CreateLiquidityPoolRequest(BaseModel):
    tenant_id: str = "tenant_default"
    title: str = Field(..., json_schema_extra={"example": "GenAI Infrastructure Liquidity Pool"})
    target_skills: List[str] = Field(
        ...,
        json_schema_extra={"example": ["vLLM PagedAttention", "Deep Learning / Transformers", "Distributed Consensus"]}
    )
    total_budget_inr: float = Field(20750000, json_schema_extra={"example": 20750000})

class SubmitSwarmBidRequest(BaseModel):
    pool_id: str = Field(..., json_schema_extra={"example": "pool_genai_infra_01"})
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_swarm_01"})
    candidate_skills: List[str] = Field(
        ...,
        json_schema_extra={"example": ["Python", "vLLM PagedAttention", "PostgreSQL", "Docker"]}
    )
    min_salary_inr: float = Field(13280000, json_schema_extra={"example": 13280000})
    contract_type: str = Field("FULL_TIME", json_schema_extra={"example": "FULL_TIME"})

@router.get("/pools")
def list_talent_liquidity_pools(
    tenant_id: str = "tenant_default",
    db: Session = Depends(get_db)
):
    service = SwarmMarketService(db)
    pools = service.list_liquidity_pools(tenant_id=tenant_id)
    return {"status": "success", "tenant_id": tenant_id, "pools": pools, "total_pools": len(pools)}

@router.post("/pools")
def create_talent_liquidity_pool(
    req: CreateLiquidityPoolRequest,
    db: Session = Depends(get_db)
):
    service = SwarmMarketService(db)
    pool = service.create_liquidity_pool(
        tenant_id=req.tenant_id,
        title=req.title,
        target_skills=req.target_skills,
        total_budget_inr=req.total_budget_inr
    )
    return {"status": "success", "pool": pool}

@router.post("/bid")
def submit_swarm_bid(
    req: SubmitSwarmBidRequest,
    db: Session = Depends(get_db)
):
    service = SwarmMarketService(db)
    bid = service.submit_swarm_bid(
        pool_id=req.pool_id,
        candidate_id=req.candidate_id,
        candidate_skills=req.candidate_skills,
        min_salary_inr=req.min_salary_inr,
        contract_type=req.contract_type
    )
    return {"status": "success", "bid": bid}

@router.get("/equilibrium-bounty")
def get_equilibrium_bounty(
    skill: str = Query("vLLM PagedAttention", description="Skill to evaluate market equilibrium lift"),
    db: Session = Depends(get_db)
):
    service = SwarmMarketService(db)
    result = service.calculate_swarm_equilibrium(target_skill=skill)
    return {"status": "success", **result}

@router.get("/candidate-intelligence")
def get_candidate_swarm_intelligence(
    role: str = Query("Staff Distributed Systems Engineer", description="Target role title"),
    db: Session = Depends(get_db)
):
    service = SwarmMarketService(db)
    intelligence = service.get_candidate_swarm_intelligence(role_title=role)
    return {"status": "success", "intelligence": intelligence}
