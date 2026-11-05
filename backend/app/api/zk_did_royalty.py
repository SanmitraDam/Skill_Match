"""
SkillMatch DNA v9.0 — zkDID & Autonomous Skill Micro-Royalty API Router
Endpoints:
- POST /zk-did/issue                    : Issue anonymous, self-sovereign zkDID
- POST /zk-did/accrue-reputation        : Accrue zero-knowledge reputation score
- POST /royalty/register-skill-node     : Index monetizable skill asset (code/architecture)
- POST /royalty/disburse-micro-royalty  : Trigger instant smart-contract micro-royalty payout
- GET  /royalty/ledger                  : Query lifetime micro-royalty earnings and ledger
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.zk_did_royalty_service import ZKDIDRoyaltyService

router = APIRouter(prefix="", tags=["zkDIDs & Skill Micro-Royalty Engine"])

_zk_royalty_service = ZKDIDRoyaltyService()


class IssueZKDIDRequest(BaseModel):
    candidate_seed: Optional[str] = Field(None, json_schema_extra={"example": "cand_secret_seed_991"})
    credential_claims: Optional[List[str]] = Field(
        None,
        json_schema_extra={"example": ["CAT_LEVEL_5_DISTRIBUTED_SYSTEMS", "RECURSIVE_STARK_VERIFIED"]}
    )
    tenant_id: str = "tenant_default"


class AccrueReputationRequest(BaseModel):
    zk_did: str = Field(..., json_schema_extra={"example": "did:zk:skillos:7f8a9b1c2d3e"})
    credential_type: str = Field(..., json_schema_extra={"example": "CAT_QUIZ_MASTERY"})
    score: float = Field(..., json_schema_extra={"example": 4.8})
    proof_hash: Optional[str] = Field(None, json_schema_extra={"example": "0xabc123..."})


class RegisterSkillNodeRequest(BaseModel):
    zk_did: str = Field(..., json_schema_extra={"example": "did:zk:skillos:7f8a9b1c2d3e"})
    skill_title: str = Field(..., json_schema_extra={"example": "Consistent Hashing Ring Architecture Blueprint"})
    asset_cid: str = Field(..., json_schema_extra={"example": "ipfs://bafybeihdwdcefghij..."})
    royalty_per_use_inr: float = Field(207.5, json_schema_extra={"example": 207.5})
    asset_type: str = Field("ARCHITECTURE_BLUEPRINT", json_schema_extra={"example": "ARCHITECTURE_BLUEPRINT"})


class DisburseRoyaltyRequest(BaseModel):
    skill_node_id: str = Field(..., json_schema_extra={"example": "node_7f8a9b1c2d3e"})
    consumer_id: str = Field("enterprise_agent_mesh", json_schema_extra={"example": "enterprise_agent_mesh"})
    usage_count: int = Field(1, json_schema_extra={"example": 1})
    token_symbol: str = Field("INR", json_schema_extra={"example": "INR"})


@router.post("/zk-did/issue")
def issue_anonymous_zk_did(req: IssueZKDIDRequest):
    result = _zk_royalty_service.issue_anonymous_zk_did(
        candidate_seed=req.candidate_seed,
        credential_claims=req.credential_claims,
        tenant_id=req.tenant_id,
    )
    return {"status": "success", "zk_did": result["zk_did"], "zk_did_record": result, **{k: v for k, v in result.items() if k not in ("status", "zk_did")}}


@router.post("/zk-did/accrue-reputation")
def accrue_zk_reputation(req: AccrueReputationRequest):
    result = _zk_royalty_service.accrue_zk_reputation(
        zk_did=req.zk_did,
        credential_type=req.credential_type,
        score=req.score,
        proof_hash=req.proof_hash,
    )
    return {"status": "success", "reputation_event": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/royalty/register-skill-node")
def register_skill_node(req: RegisterSkillNodeRequest):
    result = _zk_royalty_service.register_skill_node(
        zk_did=req.zk_did,
        skill_title=req.skill_title,
        asset_cid=req.asset_cid,
        royalty_per_use_inr=req.royalty_per_use_inr,
        asset_type=req.asset_type,
    )
    return {"status": "success", "skill_node": result, "skill_node_id": result["skill_node_id"], **{k: v for k, v in result.items() if k != "status"}}


@router.post("/royalty/disburse-micro-royalty")
def disburse_micro_royalty(req: DisburseRoyaltyRequest):
    result = _zk_royalty_service.disburse_micro_royalty(
        skill_node_id=req.skill_node_id,
        consumer_id=req.consumer_id,
        usage_count=req.usage_count,
        token_symbol=req.token_symbol,
    )
    return {"status": "success", "disbursement": result, **{k: v for k, v in result.items() if k != "status"}}


@router.get("/royalty/ledger")
def get_royalty_ledger(
    zk_did: str = Query("did:zk:skillos:7f8a9b1c2d3e", description="Zero-Knowledge DID")
):
    result = _zk_royalty_service.get_royalty_ledger(zk_did=zk_did)
    return {"status": "success", "ledger": result}
