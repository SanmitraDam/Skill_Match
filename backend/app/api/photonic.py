"""
SkillMatch DNA v12.0 — Photonic Light-Field Spatial Holography & Non-Invasive Sub-Cortical Telepathy API Router
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.photonic_service import (
    photonic_service,
    PhotonicRenderRequest,
    SubCorticalIntuitionRequest,
    BCASScoreRequest
)

router = APIRouter(prefix="/photonic", tags=["Photonic Light-Field & Sub-Cortical Telepathy"])


@router.post("/render-lightfield")
async def render_lightfield(req: PhotonicRenderRequest):
    """
    Renders 360° glasses-free volumetric light-field spatial hologram with micro-lens ray casting.
    """
    try:
        return photonic_service.render_lightfield_spatial_hologram(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/synthesize-intuition")
async def synthesize_intuition(req: SubCorticalIntuitionRequest):
    """
    Translates pre-verbal problem-solving intuition into 3D holographic architecture models.
    """
    try:
        return photonic_service.synthesize_subcortical_intuition(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bcas-score")
async def bcas_score(req: BCASScoreRequest):
    """
    Computes Bio-Resonance Cognitive Alignment Score (BCAS) measuring neuro-coherence in multi-agent simulations.
    """
    try:
        return photonic_service.compute_bcas_score(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/telemetry-state")
async def telemetry_state(session_id: str = "default_session"):
    """
    Retrieves the current state of the photonic light-field and sub-cortical telemetry stream.
    """
    try:
        return photonic_service.get_telemetry_state(session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
