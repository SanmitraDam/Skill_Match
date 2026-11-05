"""
Skill Federation & ZK Clearinghouse API Router — SkillMatch DNA v20.0
Pillar 1: Cross-Enterprise Credential Federation & Consortium Node Mesh
"""
from fastapi import APIRouter, HTTPException
from typing import Any, Dict, List
from app.services.skill_federation_service import (
    skill_federation_service,
    ConsortiumNode,
    FederatedSkillPassport,
    CandidateVerificationRequest,
    ConsentRevocationRequest,
    AntiCollusionAuditRequest
)
from pydantic import BaseModel

router = APIRouter(prefix="/federation", tags=["Cross-Enterprise Skill Federation"])


class IssuePassportRequest(BaseModel):
    candidate_id: str
    zkdid: str
    origin_enterprise: str
    ccrs_score: float
    pts_score: float
    verified_skills: List[str]
    zk_proctor_proof_hash: str = ""


@router.post("/passport/issue", response_model=FederatedSkillPassport)
def issue_federated_passport(req: IssuePassportRequest):
    """Issues a cryptographically signed cross-enterprise skill passport."""
    return skill_federation_service.issue_passport(
        candidate_id=req.candidate_id,
        zkdid=req.zkdid,
        origin_enterprise=req.origin_enterprise,
        ccrs_score=req.ccrs_score,
        pts_score=req.pts_score,
        verified_skills=req.verified_skills,
        zk_proctor_proof_hash=req.zk_proctor_proof_hash or None
    )


@router.post("/verify")
def verify_candidate_federation(req: CandidateVerificationRequest):
    """Instant 1-click cross-company candidate verification."""
    result = skill_federation_service.verify_candidate(req)
    return result


@router.post("/consent/revoke")
def revoke_enterprise_consent(req: ConsentRevocationRequest):
    """Candidate sovereign consent revocation via zkDID."""
    return skill_federation_service.revoke_consent(req)


@router.get("/mesh/nodes", response_model=List[ConsortiumNode])
def list_consortium_mesh_nodes():
    """Lists all active cross-enterprise verification mesh nodes."""
    return skill_federation_service.list_consortium_nodes()


@router.post("/anti-collusion/audit")
def audit_anti_collusion_pow(req: AntiCollusionAuditRequest):
    """Verifies proof-of-work attestation to prevent enterprise credential inflation."""
    return skill_federation_service.verify_anti_collusion_pow(req)


@router.get("/candidate/{zkdid}/status")
def get_candidate_federation_status(zkdid: str):
    """Retrieves all active federated passports and consent statuses for a zkDID."""
    return skill_federation_service.get_candidate_federation_status(zkdid)
