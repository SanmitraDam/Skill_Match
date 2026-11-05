"""
SkillMatch DNA v8.0 - Planetary Autonomous Talent Grid API Router
Endpoints:
- POST /grid/route-demand          : Route enterprise demand to geo-optimal edge node
- POST /grid/simulate-allocation   : Simulate edge node assignment for a region
- POST /grid/cross-border-settle   : Execute cross-border stablecoin payroll settlement
- GET  /grid/topology              : Live planetary edge node topology
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.models.database import get_db
from app.services.planetary_grid_service import PlanetaryGridService

router = APIRouter(prefix="/grid", tags=["Planetary Autonomous Talent Grid"])

_grid_service = PlanetaryGridService()


class RouteDemandRequest(BaseModel):
    project_requirements: Dict[str, Any] = Field(
        ...,
        json_schema_extra={"example": {
            "title": "GenAI Infrastructure Buildout",
            "required_skills": ["vLLM PagedAttention", "Kubernetes", "FastAPI"],
            "team_size": 4,
            "budget_inr": 66400000
        }}
    )
    candidate_region_hint: Optional[str] = Field(None, json_schema_extra={"example": "US East"})
    urgency: str = Field("STANDARD", json_schema_extra={"example": "HIGH"})
    tenant_id: str = "tenant_default"


class SimulateAllocationRequest(BaseModel):
    region: str = Field(..., json_schema_extra={"example": "EU Central"})
    skill_requirements: List[str] = Field(
        ...,
        json_schema_extra={"example": ["vLLM PagedAttention", "WebRTC SFU", "Rust"]}
    )
    team_size: int = Field(3, json_schema_extra={"example": 3})


class CrossBorderSettleRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_grid_441"})
    country_from: str = Field("US", json_schema_extra={"example": "US"})
    country_to: str = Field("IN", json_schema_extra={"example": "IN"})
    gross_amount_inr: float = Field(1245000, json_schema_extra={"example": 1245000})
    stablecoin: str = Field("INR", json_schema_extra={"example": "INR"})
    milestone_id: Optional[str] = Field(None, json_schema_extra={"example": "ms_002"})
    tenant_id: str = "tenant_default"


@router.post("/route-demand")
def route_talent_demand(req: RouteDemandRequest):
    result = _grid_service.route_talent_demand(
        project_requirements=req.project_requirements,
        candidate_region_hint=req.candidate_region_hint,
        urgency=req.urgency,
        tenant_id=req.tenant_id,
    )
    return {"status": "success", "routing": result}


@router.post("/simulate-allocation")
def simulate_edge_allocation(req: SimulateAllocationRequest):
    result = _grid_service.simulate_edge_allocation(
        region=req.region,
        skill_requirements=req.skill_requirements,
        team_size=req.team_size,
    )
    return {"status": "success", "allocation": result}


@router.post("/cross-border-settle")
def cross_border_settle(req: CrossBorderSettleRequest):
    result = _grid_service.execute_cross_border_settlement(
        candidate_id=req.candidate_id,
        country_from=req.country_from,
        country_to=req.country_to,
        gross_amount_inr=req.gross_amount_inr,
        stablecoin=req.stablecoin,
        milestone_id=req.milestone_id,
        tenant_id=req.tenant_id,
    )
    return {"status": "success", "settlement": result}


@router.get("/topology")
def get_grid_topology():
    result = _grid_service.get_grid_topology()
    return {"status": "success", "topology": result}
