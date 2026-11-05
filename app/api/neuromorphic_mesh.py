"""
SkillMatch DNA Version 26.0: Neuromorphic Mesh API Router.
Pillar 1 of suggestion-v25.md:
- POST /neuromorphic-mesh/photonic/vmm
- POST /neuromorphic-mesh/snn/spikes
- GET  /neuromorphic-mesh/hardware-status
"""

from fastapi import APIRouter, HTTPException
from app.services.neuromorphic_mesh_service import (
    neuromorphic_mesh_service,
    PhotonicVMMRequest,
    SNNSpikeProcessRequest
)

router = APIRouter(prefix="/neuromorphic-mesh", tags=["Neuromorphic Photonic Mesh (v26.0)"])


@router.post("/photonic/vmm")
async def execute_photonic_vmm(req: PhotonicVMMRequest):
    try:
        return neuromorphic_mesh_service.simulate_photonic_vmm(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/snn/spikes")
async def process_snn_spikes(req: SNNSpikeProcessRequest):
    try:
        return neuromorphic_mesh_service.process_snn_spikes(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hardware-status")
async def get_hardware_status():
    try:
        return neuromorphic_mesh_service.get_hardware_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
