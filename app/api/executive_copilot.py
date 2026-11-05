"""
Autonomous AI Executive Strategy Co-Pilot API Router — SkillMatch DNA v20.0
Pillar 2: Executive Workforce Strategy Co-Pilot & 3D Capability Matrix
"""
from fastapi import APIRouter
from typing import Any, Dict, List
from app.services.executive_copilot_service import (
    executive_copilot_service,
    ExecutiveQueryRequest,
    ExecutiveQueryResponse,
    ScenarioSimulationRequest,
    ScenarioSimulationResponse,
    BottleneckAlert,
    UpskillingProposalRequest,
    UpskillingProposal
)

router = APIRouter(prefix="/executive", tags=["AI Executive Workforce Strategy Co-Pilot"])


@router.post("/copilot/query", response_model=ExecutiveQueryResponse)
def query_executive_copilot(req: ExecutiveQueryRequest):
    """Processes natural language C-suite talent and capability queries."""
    return executive_copilot_service.answer_executive_query(req)


@router.post("/scenario/simulate", response_model=ScenarioSimulationResponse)
def simulate_workforce_scenario(req: ScenarioSimulationRequest):
    """Runs predictive scenario simulation for strategic technology transitions."""
    return executive_copilot_service.run_scenario(req)


@router.get("/scarcity/alerts", response_model=List[BottleneckAlert])
def get_scarcity_bottleneck_alerts():
    """Lists 60-day early warning talent scarcity bottlenecks."""
    return executive_copilot_service.list_bottlenecks()


@router.post("/proposal/generate", response_model=UpskillingProposal)
def generate_upskilling_proposal(req: UpskillingProposalRequest):
    """Generates a 1-click executive upskilling proposal with budget & cohort roadmap."""
    return executive_copilot_service.generate_proposal(req)


@router.get("/capability-matrix")
def get_enterprise_capability_matrix():
    """Retrieves full corporate workforce capability matrix."""
    return executive_copilot_service.get_capability_matrix()
