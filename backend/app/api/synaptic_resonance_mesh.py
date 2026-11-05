"""
SkillMatch DNA Version 24.0: Trans-Neural Synaptic Resonance & Bi-Directional Mentorship Mesh API Router.
Pillar 1 of suggestion-v23.md:
- POST /synaptic-resonance/telemetry/ingest
- POST /synaptic-resonance/coherence-index/calculate
- POST /synaptic-resonance/spatial-memory/transduce
- POST /synaptic-resonance/cognitive-shield/evaluate
- GET  /synaptic-resonance/live-sessions
"""

from fastapi import APIRouter, HTTPException
from app.services.synaptic_resonance_mesh_service import (
    synaptic_resonance_mesh_service,
    IngestTelemetryRequest,
    CalculateSCIRequest,
    SpatialMemoryTransductionRequest,
    CognitiveShieldEvaluateRequest
)

router = APIRouter(prefix="/synaptic-resonance", tags=["Trans-Neural Synaptic Resonance (v24.0)"])


@router.post("/telemetry/ingest")
async def ingest_telemetry(req: IngestTelemetryRequest):
    try:
        return synaptic_resonance_mesh_service.ingest_telemetry(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/coherence-index/calculate")
async def calculate_coherence_index(req: CalculateSCIRequest):
    try:
        return synaptic_resonance_mesh_service.calculate_synaptic_coherence_index(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/spatial-memory/transduce")
async def transduce_spatial_memory(req: SpatialMemoryTransductionRequest):
    try:
        return synaptic_resonance_mesh_service.transduce_spatial_memory_tree(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cognitive-shield/evaluate")
async def evaluate_cognitive_shield(req: CognitiveShieldEvaluateRequest):
    try:
        return synaptic_resonance_mesh_service.evaluate_cognitive_load_shield(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/live-sessions")
async def get_live_sessions():
    try:
        return synaptic_resonance_mesh_service.get_live_sessions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
