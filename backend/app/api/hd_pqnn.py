"""
SkillMatch DNA v14.0 — Cosmic Neural Noosphere Platform
Pillar 2: Hyper-Dimensional Non-Euclidean Photonic Quantum Neural Mesh (HD-PQNN) API Router.
"""

from fastapi import APIRouter, HTTPException
from app.services.hd_pqnn_service import (
    hd_pqnn_service,
    PoincareProjectionRequest,
    HyperbolicMatchRequest,
    PhotonicMultiplyRequest,
)

router = APIRouter(prefix="/hd-pqnn", tags=["HD-PQNN Photonic Quantum Mesh (v14.0)"])


@router.post("/poincare-project")
async def poincare_project(req: PoincareProjectionRequest):
    try:
        return hd_pqnn_service.project_to_poincare(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/hyperbolic-match")
async def hyperbolic_match(req: HyperbolicMatchRequest):
    try:
        return hd_pqnn_service.compute_hyperbolic_match(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/photonic-optical-multiply")
async def photonic_optical_multiply(req: PhotonicMultiplyRequest):
    try:
        return hd_pqnn_service.simulate_photonic_optical_multiply(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/topology")
async def get_topology():
    try:
        return hd_pqnn_service.get_topology()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
