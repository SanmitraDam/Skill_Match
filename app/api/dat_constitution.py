"""
SkillMatch DNA v8.0 - Decentralized Autonomous Team (DAT) Enterprise Constitution API Router
Endpoints:
- POST /dat/assemble-team        : AI-optimized autonomous team assembly
- POST /dat/deploy-constitution  : Deploy smart contract governance constitution
- POST /dat/evaluate-milestone   : Verify milestone delivery, trigger escrow disbursement
- POST /dat/evolve-rubric        : Auto-evolve enterprise skill rubric from delivery data
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.models.database import get_db
from app.services.dat_constitution_service import DATConstitutionService

router = APIRouter(prefix="/dat", tags=["DAT Enterprise Constitutions"])

_dat_service = DATConstitutionService()


class AssembleTeamRequest(BaseModel):
    project_goals: List[str] = Field(
        ...,
        json_schema_extra={"example": ["Build real-time AI inference pipeline", "Deploy globally on edge mesh"]}
    )
    required_skills: List[str] = Field(
        ...,
        json_schema_extra={"example": ["vLLM PagedAttention", "Kubernetes", "FastAPI", "React"]}
    )
    team_size: int = Field(4, json_schema_extra={"example": 4})
    constitution_type: str = Field("AGILE_SPRINT", json_schema_extra={"example": "AGILE_SPRINT"})
    budget_inr: float = Field(41500000, json_schema_extra={"example": 41500000})
    tenant_id: str = "tenant_default"


class DeployConstitutionRequest(BaseModel):
    team_id: str = Field(..., json_schema_extra={"example": "dat_abc123def456"})
    milestones: List[Dict[str, Any]] = Field(
        ...,
        json_schema_extra={"example": [
            {"title": "MVP Backend", "deliverable": "REST API + DB", "due_date": "2026-11-01"},
            {"title": "Frontend Integration", "deliverable": "React UI", "due_date": "2026-12-01"},
            {"title": "Production Launch", "deliverable": "Global deployment", "due_date": "2027-01-15"}
        ]}
    )
    escrow_amount_inr: float = Field(41500000, json_schema_extra={"example": 41500000})
    constitution_type: str = Field("AGILE_SPRINT", json_schema_extra={"example": "AGILE_SPRINT"})
    dispute_resolution: str = Field("ARBITRATION_PANEL", json_schema_extra={"example": "ARBITRATION_PANEL"})
    tenant_id: str = "tenant_default"


class EvaluateMilestoneRequest(BaseModel):
    team_id: str = Field(..., json_schema_extra={"example": "dat_abc123def456"})
    milestone_id: str = Field("ms_001", json_schema_extra={"example": "ms_001"})
    delivery_proof: Dict[str, Any] = Field(
        {},
        json_schema_extra={"example": {"repo_url": "https://github.com/org/repo", "commit_sha": "abc123"}}
    )
    peer_review_scores: Optional[List[float]] = Field(
        None,
        json_schema_extra={"example": [0.92, 0.88, 0.95, 0.79]}
    )
    tenant_id: str = "tenant_default"


class EvolveRubricRequest(BaseModel):
    tenant_id: str = "tenant_default"
    role_title: str = Field("Staff AI Engineer", json_schema_extra={"example": "Staff AI Engineer"})
    delivery_velocity_data: List[Dict[str, Any]] = Field(
        [],
        json_schema_extra={"example": [
            {"skills_used": ["vLLM PagedAttention", "FastAPI"], "velocity_lift": 1.35},
            {"skills_used": ["Kubernetes", "Docker"], "velocity_lift": 1.12},
        ]}
    )


@router.post("/assemble-team")
def assemble_autonomous_team(req: AssembleTeamRequest):
    result = _dat_service.assemble_autonomous_team(
        project_goals=req.project_goals,
        required_skills=req.required_skills,
        team_size=req.team_size,
        constitution_type=req.constitution_type,
        budget_inr=req.budget_inr,
        tenant_id=req.tenant_id,
    )
    return {"status": "success", "team": result}


@router.post("/deploy-constitution")
def deploy_governance_constitution(req: DeployConstitutionRequest):
    result = _dat_service.deploy_governance_constitution(
        team_id=req.team_id,
        milestones=req.milestones,
        escrow_amount_inr=req.escrow_amount_inr,
        constitution_type=req.constitution_type,
        dispute_resolution=req.dispute_resolution,
        tenant_id=req.tenant_id,
    )
    return {"status": "success", "constitution": result}


@router.post("/evaluate-milestone")
def evaluate_milestone(req: EvaluateMilestoneRequest):
    result = _dat_service.evaluate_milestone(
        team_id=req.team_id,
        milestone_id=req.milestone_id,
        delivery_proof=req.delivery_proof,
        peer_review_scores=req.peer_review_scores,
        tenant_id=req.tenant_id,
    )
    return {"status": "success", "evaluation": result}


@router.post("/evolve-rubric")
def evolve_skill_rubric(req: EvolveRubricRequest):
    result = _dat_service.evolve_skill_rubric(
        tenant_id=req.tenant_id,
        delivery_velocity_data=req.delivery_velocity_data,
        role_title=req.role_title,
    )
    return {"status": "success", "rubric": result}
