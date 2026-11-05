"""
SkillMatch DNA v11.0 — Topological Quantum Neural Embeddings & Multiverse Annealing API Router
Endpoints:
- POST /topological/braid-embedding    : Project classical vectors into Majorana non-Abelian braid state space
- POST /topological/braid-match        : Compute braid invariance match score & emergent synergy lift
- POST /topological/anneal-market      : Sub-millisecond (<1ms) global market equilibrium solver
- GET  /topological/hardware-topology  : Query Majorana zero mode QPU coherence & braid fidelity
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.topological_quantum_service import TopologicalQuantumService

router = APIRouter(prefix="/topological", tags=["Topological Quantum Neural Embeddings (TQ)"])

_topological_service = TopologicalQuantumService()


class BraidEmbeddingRequest(BaseModel):
    classical_vector: List[float] = Field(
        ...,
        json_schema_extra={"example": [0.15, -0.42, 0.88, 0.31, -0.19, 0.44, 0.65]}
    )
    num_majorana_modes: int = Field(64, json_schema_extra={"example": 64})
    braid_sequence_length: int = Field(8, json_schema_extra={"example": 8})


class BraidMatchRequest(BaseModel):
    vector_resume: List[float] = Field(
        ...,
        json_schema_extra={"example": [0.22, 0.85, 0.41, -0.12, 0.64]}
    )
    vector_job: List[float] = Field(
        ...,
        json_schema_extra={"example": [0.20, 0.82, 0.44, -0.09, 0.61]}
    )
    skill_domains: Optional[List[str]] = Field(
        None,
        json_schema_extra={"example": ["Distributed Consensus", "Rust WebAssembly", "WebRTC SFU Media"]}
    )


class AnnealMarketRequest(BaseModel):
    candidate_count: int = Field(500000, json_schema_extra={"example": 500000})
    enterprise_role_count: int = Field(12000, json_schema_extra={"example": 12000})
    target_equilibrium_metric: str = Field("GLOBAL_VELOCITY_MAX", json_schema_extra={"example": "GLOBAL_VELOCITY_MAX"})


@router.post("/braid-embedding")
def project_braid_embedding(req: BraidEmbeddingRequest):
    result = _topological_service.braid_embedding(
        classical_vector=req.classical_vector,
        num_majorana_modes=req.num_majorana_modes,
        braid_sequence_length=req.braid_sequence_length,
    )
    return {"status": "success", "braid": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/braid-match")
def compute_braid_match(req: BraidMatchRequest):
    result = _topological_service.compute_braid_match(
        vector_resume=req.vector_resume,
        vector_job=req.vector_job,
        skill_domains=req.skill_domains,
    )
    return {"status": "success", "topological_match": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/anneal-market")
def anneal_multiverse_market(req: AnnealMarketRequest):
    result = _topological_service.anneal_multiverse_market(
        candidate_count=req.candidate_count,
        enterprise_role_count=req.enterprise_role_count,
        target_equilibrium_metric=req.target_equilibrium_metric,
    )
    return {"status": "success", "market_equilibrium": result, **{k: v for k, v in result.items() if k != "status"}}


@router.get("/hardware-topology")
def get_hardware_topology():
    result = _topological_service.get_hardware_topology()
    return {"status": "success", "hardware": result, **{k: v for k, v in result.items() if k != "status"}}
