"""
Decentralized Skill Liquidity Staking & Autonomous Yield Treasury API Router — SkillMatch DNA v22.0
Pillar 3: Skill Vector Collateralization, Zero-Interest Credit & Yield AMM Pools
"""
from fastapi import APIRouter
from typing import Any, Dict, List
from app.services.skill_treasury_vault_service import (
    skill_treasury_vault_service,
    SkillCollateralDeposit,
    CreditLineIssueRequest,
    CreditLinePosition,
    MicroRoyaltyRepayRequest,
    MicroRoyaltyRepayResponse,
    YieldAMMPool
)

router = APIRouter(prefix="/treasury", tags=["Decentralized Skill Treasury Vault"])


@router.post("/collateralize-skill", response_model=SkillCollateralDeposit)
def collateralize_candidate_skill(payload: Dict[str, Any]):
    """Collateralizes candidate verified skill vector (CCRS >= 85%) for non-custodial credit access."""
    candidate_id = payload.get("candidate_id", "cand-default")
    zkdid = payload.get("zkdid", "zkdid:default")
    verified_ccrs = float(payload.get("verified_ccrs", 90.0))
    skills = payload.get("skills", ["Rust", "eBPF", "WebAssembly"])
    return skill_treasury_vault_service.collateralize_skill_vector(candidate_id, zkdid, verified_ccrs, skills)


@router.post("/credit-line/issue", response_model=CreditLinePosition)
def issue_zero_interest_credit_line(req: CreditLineIssueRequest):
    """Issues zero-interest educational or incubation credit line against locked skill collateral."""
    return skill_treasury_vault_service.issue_zero_interest_credit(req)


@router.post("/repay/micro-royalty", response_model=MicroRoyaltyRepayResponse)
def auto_repay_via_micro_royalty(req: MicroRoyaltyRepayRequest):
    """Applies incoming enterprise consortia micro-royalties to clear credit line balance."""
    return skill_treasury_vault_service.repay_with_micro_royalties(req)


@router.get("/yield-pools", response_model=List[YieldAMMPool])
def get_skill_yield_amm_pools():
    """Returns active decentralized skill yield staking pools and TVL."""
    return skill_treasury_vault_service.get_yield_pools()
