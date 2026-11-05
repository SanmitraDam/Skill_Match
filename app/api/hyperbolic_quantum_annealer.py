"""
SkillMatch DNA Version 24.0: Hyperbolic Multiverse Quantum Annealing & Topological Skill Collapse API Router.
Pillar 2 of suggestion-v23.md:
- POST /hyperbolic-quantum/poincare-project
- POST /hyperbolic-quantum/majorana-braid-anneal
- POST /hyperbolic-quantum/team-equilibrium/solve
- POST /hyperbolic-quantum/superposition/collapse
- GET  /hyperbolic-quantum/manifold-metrics
"""

from fastapi import APIRouter, HTTPException
from app.services.hyperbolic_quantum_annealer_service import (
    hyperbolic_quantum_annealer_service,
    PoincareProjectRequest,
    MajoranaBraidAnnealRequest,
    TeamEquilibriumSolveRequest,
    SuperpositionCollapseRequest
)

router = APIRouter(prefix="/hyperbolic-quantum", tags=["Hyperbolic Multiverse Quantum Annealing (v24.0)"])


@router.post("/poincare-project")
async def poincare_project(req: PoincareProjectRequest):
    try:
        return hyperbolic_quantum_annealer_service.poincare_project(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/majorana-braid-anneal")
async def majorana_braid_anneal(req: MajoranaBraidAnnealRequest):
    try:
        return hyperbolic_quantum_annealer_service.majorana_braid_topological_anneal(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/team-equilibrium/solve")
async def solve_team_equilibrium(req: TeamEquilibriumSolveRequest):
    try:
        return hyperbolic_quantum_annealer_service.solve_team_equilibrium(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/superposition/collapse")
async def collapse_superposition(req: SuperpositionCollapseRequest):
    try:
        return hyperbolic_quantum_annealer_service.collapse_superposition_career_profile(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/manifold-metrics")
async def get_manifold_metrics():
    try:
        return hyperbolic_quantum_annealer_service.get_manifold_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
