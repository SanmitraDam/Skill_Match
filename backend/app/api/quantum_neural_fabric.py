"""
Quantum-Neural Knowledge Fabric API Router — SkillMatch DNA v21.0
Pillar 2: 1,024-Qubit Quantum Hilbert Space Projections & Photonic QKE
"""
from fastapi import APIRouter
from typing import Any, Dict, List
from app.services.quantum_neural_fabric_service import (
    quantum_neural_fabric_service,
    QuantumStateProjectionRequest,
    QuantumStateProjectionResponse,
    PhotonicQKEMatchRequest,
    PhotonicQKEMatchResponse,
    BioNeuralIntentSyncRequest,
    BioNeuralIntentSyncResponse
)

router = APIRouter(prefix="/quantum-fabric", tags=["Quantum-Neural Knowledge Fabric"])


@router.post("/hilbert/project", response_model=QuantumStateProjectionResponse)
@router.post("/hilbert-project", response_model=QuantumStateProjectionResponse)
def project_skills_to_quantum_hilbert_space(req: QuantumStateProjectionRequest):
    """Projects multi-dimensional candidate skills into a 1,024-qubit quantum state manifold."""
    return quantum_neural_fabric_service.project_to_hilbert_space(req)


@router.post("/photonic/qke-match", response_model=PhotonicQKEMatchResponse)
@router.post("/photonic-qke", response_model=PhotonicQKEMatchResponse)
def compute_photonic_qke_similarity(req: PhotonicQKEMatchRequest):
    """Computes sub-nanosecond Photonic Quantum Kernel Estimator (QKE) affinity score."""
    return quantum_neural_fabric_service.photonic_qke_similarity(req)


@router.post("/bio-neural/sync-intent", response_model=BioNeuralIntentSyncResponse)
@router.post("/transduce-intent", response_model=BioNeuralIntentSyncResponse)
def synchronize_bioneural_intent(req: BioNeuralIntentSyncRequest):
    """Synchronizes non-invasive HD-EEG / NIRS brainwave telemetry into executable specs."""
    return quantum_neural_fabric_service.sync_bioneural_intent(req)


@router.get("/state-manifold")
@router.get("/lattice-topology")
def get_quantum_manifold_overview():
    """Returns quantum Hilbert manifold parameters and optical resonator health."""
    return quantum_neural_fabric_service.get_manifold_overview()
