"""
SkillMatch DNA v7.0 - Digital Twin Workforce Simulations API Router
Endpoints:
- POST /digital-twin/sync : Synchronize digital twin memory with latest benchmarks
- POST /digital-twin/simulate-boardroom : Execute multi-agent synthetic boardroom crisis scenario
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional

from app.models.database import get_db
from app.services.digital_twin_simulation import DigitalTwinSimulationService

router = APIRouter(prefix="/digital-twin", tags=["Digital Twin Workforce Simulations"])

class SyncDigitalTwinRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_twin_992"})
    technical_skills: Optional[List[str]] = Field(
        None,
        json_schema_extra={"example": ["vLLM PagedAttention", "Distributed Consensus", "FastAPI"]}
    )
    communication_style: str = Field(
        "ANALYTICAL_STRUCTURED",
        json_schema_extra={"example": "ANALYTICAL_STRUCTURED"}
    )
    recent_cat_theta: float = Field(2.45, json_schema_extra={"example": 2.45})

class RunSimulationRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_twin_992"})
    scenario_name: str = Field(
        "Global Payment Gateway Concurrency Outage & Database Failover",
        json_schema_extra={"example": "Global Payment Gateway Concurrency Outage & Database Failover"}
    )
    candidate_skills: Optional[List[str]] = Field(
        None,
        json_schema_extra={"example": ["vLLM PagedAttention", "Distributed Consensus", "PostgreSQL"]}
    )

@router.post("/sync")
def sync_digital_twin(
    req: SyncDigitalTwinRequest,
    db: Session = Depends(get_db)
):
    service = DigitalTwinSimulationService(db)
    profile = service.sync_digital_twin(
        candidate_id=req.candidate_id,
        technical_skills=req.technical_skills,
        communication_style=req.communication_style,
        recent_cat_theta=req.recent_cat_theta
    )
    return {"status": "success", "profile": profile}

@router.post("/simulate-boardroom")
def simulate_boardroom(
    req: RunSimulationRequest,
    db: Session = Depends(get_db)
):
    service = DigitalTwinSimulationService(db)
    simulation = service.run_boardroom_simulation(
        candidate_id=req.candidate_id,
        scenario_name=req.scenario_name,
        candidate_skills=req.candidate_skills
    )
    return {"status": "success", "simulation": simulation}
