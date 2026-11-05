"""
SkillMatch DNA v9.0 — Quantum Vector Kernel & Photonic Compute API Router
Endpoints:
- POST /quantum/vqe-project     : Map classical vector to 1,024-qubit VQE state |ψ⟩
- POST /quantum/qke-similarity  : Compute Quantum Match Score |<ψ_resume|ψ_job>|^2
- POST /quantum/photonic-search : Sub-50ns Photonic Optical Processing Unit vector search
- GET  /quantum/qubit-topology  : Hardware coherence time, gate fidelity, and OPU metrics
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.quantum_kernel_service import QuantumKernelService

router = APIRouter(prefix="/quantum", tags=["Quantum Vector Kernel & Photonic Compute"])

_quantum_service = QuantumKernelService()


class VQEProjectRequest(BaseModel):
    classical_vector: List[float] = Field(
        ...,
        json_schema_extra={"example": [0.12, -0.45, 0.78, 0.22, 0.05]}
    )
    num_qubits: int = Field(1024, json_schema_extra={"example": 1024})
    ansatz_depth: int = Field(4, json_schema_extra={"example": 4})


class QKESimilarityRequest(BaseModel):
    vector_a: List[float] = Field(
        ...,
        json_schema_extra={"example": [0.15, 0.82, 0.44, -0.12]}
    )
    vector_b: List[float] = Field(
        ...,
        json_schema_extra={"example": [0.18, 0.79, 0.41, -0.09]}
    )
    target_role: Optional[str] = Field("Staff AI Systems Architect", json_schema_extra={"example": "Staff AI Systems Architect"})


class PhotonicSearchRequest(BaseModel):
    query_vector: List[float] = Field(
        ...,
        json_schema_extra={"example": [0.25, 0.55, -0.14, 0.88]}
    )
    candidate_pool_size: int = Field(10000000, json_schema_extra={"example": 10000000})


@router.post("/vqe-project")
def vqe_project_embedding(req: VQEProjectRequest):
    result = _quantum_service.vqe_project_embedding(
        classical_vector=req.classical_vector,
        num_qubits=req.num_qubits,
        ansatz_depth=req.ansatz_depth,
    )
    return {"status": "success", "projection": result, **result}


@router.post("/qke-similarity")
def qke_similarity(req: QKESimilarityRequest):
    result = _quantum_service.qke_quantum_similarity(
        vector_a=req.vector_a,
        vector_b=req.vector_b,
        target_role=req.target_role,
    )
    return {"status": "success", "quantum_match": result, **result}


@router.post("/photonic-search")
def photonic_search(req: PhotonicSearchRequest):
    result = _quantum_service.photonic_optical_search(
        query_vector=req.query_vector,
        candidate_pool_size=req.candidate_pool_size,
    )
    return {"status": "success", "search": result, **result}


@router.get("/qubit-topology")
def get_qubit_topology():
    result = _quantum_service.get_qubit_topology()
    return {"status": "success", "topology": result}
