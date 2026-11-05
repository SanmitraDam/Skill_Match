"""
SkillMatch DNA v10.0 — QAOA Multiverse Optimization & Quantum Superposition API Router
Endpoints:
- POST /qaoa/optimize-team           : Global Pareto-optimal team formation in <10ms via QAOA
- POST /qaoa/superposition-collapse  : Collapse career superposition into high-value role
- GET  /qaoa/multiverse-topology     : QPU hardware coherence, gate fidelity & multiverse metrics
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.qaoa_service import QAOAService

router = APIRouter(prefix="/qaoa", tags=["QAOA Multiverse Optimization"])

_qaoa_service = QAOAService()


class OptimizeTeamRequest(BaseModel):
    candidate_pool: Optional[List[Dict[str, Any]]] = Field(
        None,
        json_schema_extra={"example": [
            {"id": "cand_01", "name": "Alice", "domain": "Distributed Consensus", "synergy": 0.95},
            {"id": "cand_02", "name": "Bob", "domain": "Zero-Trust mTLS", "synergy": 0.93}
        ]}
    )
    role_requirements: List[str] = Field(
        ["Distributed Systems Architect", "Zero-Trust Security Lead"],
        json_schema_extra={"example": ["Distributed Systems Architect", "Zero-Trust Security Lead"]}
    )
    ansatz_depth_p: int = Field(4, json_schema_extra={"example": 4})
    gamma_params: Optional[List[float]] = Field(None, json_schema_extra={"example": [0.42, 0.84, 1.26, 1.68]})
    beta_params: Optional[List[float]] = Field(None, json_schema_extra={"example": [0.78, 0.39, 0.26, 0.19]})
    diversity_weight: float = Field(0.35, json_schema_extra={"example": 0.35})
    cost_weight: float = Field(0.25, json_schema_extra={"example": 0.25})


class SuperpositionCollapseRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_superposition_001"})
    superposition_trajectories: Optional[List[Dict[str, Any]]] = Field(
        None,
        json_schema_extra={"example": [
            {"role": "Staff Distributed AI Systems Architect", "probability_amplitude": 0.64, "expected_comp_inr": 31955000},
            {"role": "Principal Zero-Knowledge Cryptographic Auditor", "probability_amplitude": 0.26, "expected_comp_inr": 34860000}
        ]}
    )
    contract_binding_id: Optional[str] = Field(None, json_schema_extra={"example": "contract_singularity_992"})


@router.post("/optimize-team")
def optimize_team_formation(req: OptimizeTeamRequest):
    result = _qaoa_service.optimize_team_formation(
        candidate_pool=req.candidate_pool or [],
        role_requirements=req.role_requirements,
        ansatz_depth_p=req.ansatz_depth_p,
        gamma_params=req.gamma_params,
        beta_params=req.beta_params,
        diversity_weight=req.diversity_weight,
        cost_weight=req.cost_weight,
    )
    return {"status": "success", "optimization": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/superposition-collapse")
def collapse_skill_superposition(req: SuperpositionCollapseRequest):
    result = _qaoa_service.collapse_skill_superposition(
        candidate_id=req.candidate_id,
        superposition_trajectories=req.superposition_trajectories,
        contract_binding_id=req.contract_binding_id,
    )
    return {"status": "success", "measurement": result, **{k: v for k, v in result.items() if k != "status"}}


@router.get("/multiverse-topology")
def get_multiverse_topology():
    result = _qaoa_service.get_multiverse_topology()
    return {"status": "success", "topology": result, **{k: v for k, v in result.items() if k != "status"}}
