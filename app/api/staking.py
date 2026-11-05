"""
SkillMatch DNA v7.0 - Decentralized Skill Staking & Micro-Bounty API Router
Endpoints:
- GET /staking/opportunities : List candidate roadmap staking pools open for funding
- POST /staking/stake-candidate : Execute smart contract ISA pledge
- GET /staking/bounties : List active micro-bounties
- POST /staking/claim-bounty : Claim bounty, award on-chain micro-credential
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional

from app.models.database import get_db
from app.services.skill_staking_service import SkillStakingService

router = APIRouter(prefix="/staking", tags=["Decentralized Skill Staking & Micro-Bounties"])

class StakeCandidateRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_stake_884"})
    staker_wallet: str = Field(..., json_schema_extra={"example": "0x71C...49bE"})
    staked_amount_inr: float = Field(207500, json_schema_extra={"example": 207500})
    isa_percentage: float = Field(4.5, json_schema_extra={"example": 4.5})

class ClaimBountyRequest(BaseModel):
    bounty_id: str = Field(..., json_schema_extra={"example": "bounty_vllm_01"})
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_stake_884"})
    candidate_skills: Optional[List[str]] = None

@router.get("/opportunities")
def list_staking_opportunities():
    service = SkillStakingService()
    opportunities = service.list_staking_opportunities()
    return {"status": "success", "opportunities": opportunities}

@router.post("/stake-candidate")
def stake_candidate(
    req: StakeCandidateRequest,
    db: Session = Depends(get_db)
):
    service = SkillStakingService(db)
    contract = service.stake_in_candidate(
        candidate_id=req.candidate_id,
        staker_wallet=req.staker_wallet,
        staked_amount_inr=req.staked_amount_inr,
        isa_percentage=req.isa_percentage
    )
    return {"status": "success", "contract": contract}

@router.get("/bounties")
def list_bounties(
    target_skill: Optional[str] = Query(None, description="Filter by skill"),
    db: Session = Depends(get_db)
):
    service = SkillStakingService(db)
    bounties = service.list_micro_bounties(target_skill=target_skill)
    return {"status": "success", "bounties": bounties}

@router.post("/claim-bounty")
def claim_bounty(
    req: ClaimBountyRequest,
    db: Session = Depends(get_db)
):
    service = SkillStakingService(db)
    result = service.claim_micro_bounty(
        bounty_id=req.bounty_id,
        candidate_id=req.candidate_id,
        candidate_skills=req.candidate_skills
    )
    return {"status": "success", "claim_result": result, **result}
