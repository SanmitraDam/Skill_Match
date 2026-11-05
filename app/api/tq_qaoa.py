"""
SkillMatch DNA v13.0 — Topological Multiverse Quantum Annealing (TQ-QAOA) API Router
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.tq_qaoa_service import (
    tq_qaoa_service,
    OptimizeSquadRequest,
    SuperpositionCollapseRequest,
    EntangleSkillsRequest
)

router = APIRouter(prefix="/tq-qaoa", tags=["Topological Multiverse Quantum Annealing (TQ-QAOA)"])


@router.post("/optimize-squad")
async def optimize_squad(req: OptimizeSquadRequest):
    """
    Solves multi-species squad resource allocation via Majorana fermion TQ-QAOA (<1ms SLA).
    """
    try:
        return tq_qaoa_service.optimize_multispecies_squad(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/superposition-collapse")
async def superposition_collapse(req: SuperpositionCollapseRequest):
    """
    Collapses candidate capability matrices from quantum superposition into a definitive high-value role.
    """
    try:
        return tq_qaoa_service.collapse_skill_superposition(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/entangle-skills")
async def entangle_skills(req: EntangleSkillsRequest):
    """
    Entangles heterogeneous skill domains into a unified quantum Hamiltonian state.
    """
    try:
        return tq_qaoa_service.entangle_skill_domains(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/topology")
async def topology():
    """
    Returns hardware topology and coherence fidelity for the Majorana Anyon QPU backend.
    """
    try:
        return tq_qaoa_service.get_topology()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
