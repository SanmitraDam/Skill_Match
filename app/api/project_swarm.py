"""
Multi-Agent Fractional Project Swarm API Router — SkillMatch DNA v20.0
Pillar 3: Fractional Squad Assembler & Smart Escrow Milestone Clearance
"""
from fastapi import APIRouter
from typing import Any, Dict, List
from app.services.project_swarm_service import (
    project_swarm_service,
    AssembleSwarmRequest,
    ProjectSwarmSquad,
    MilestoneVerificationRequest,
    RoyaltyDistribution
)

router = APIRouter(prefix="/swarm/project", tags=["Multi-Agent Fractional Project Swarms"])


@router.post("/assemble", response_model=ProjectSwarmSquad)
def assemble_hybrid_swarm(req: AssembleSwarmRequest):
    """Dynamically compiles a hybrid squad combining internal staff, fractional experts, and AI agents."""
    return project_swarm_service.assemble_squad(req)


@router.get("/active-squads", response_model=List[ProjectSwarmSquad])
def list_active_swarm_squads():
    """Lists all active project swarm squads."""
    return project_swarm_service.list_squads()


@router.get("/{squad_id}", response_model=ProjectSwarmSquad)
def get_swarm_squad(squad_id: str):
    """Retrieves specific squad details, milestones, and members."""
    squad = project_swarm_service.get_squad(squad_id)
    if not squad:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Squad not found")
    return squad


@router.post("/milestone/verify")
def verify_squad_milestone(req: MilestoneVerificationRequest):
    """Verifies unit tests, code review score, and manager sign-off to disburse escrow funds."""
    return project_swarm_service.verify_milestone(req)


@router.get("/royalties/{squad_id}", response_model=RoyaltyDistribution)
def get_squad_royalty_distribution(squad_id: str):
    """Calculates micro-equity and royalty distribution for squad members."""
    return project_swarm_service.calculate_royalties(squad_id)
