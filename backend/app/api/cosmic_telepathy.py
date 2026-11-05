"""
SkillMatch DNA v14.0 — Cosmic Neural Noosphere Platform
Pillar 1: Photonic Sub-Cortical Neural Telepathy & Bi-Directional Synaptic Memory Transduction API Router.
"""

from fastapi import APIRouter, HTTPException, Query
from app.services.cosmic_telepathy_service import (
    cosmic_telepathy_service,
    IntuitionTransductionRequest,
    NeuroPacingRequest,
    EnclaveWatermarkRequest,
    C2PAAttestationRequest,
)

router = APIRouter(prefix="/cosmic-telepathy", tags=["Cosmic Telepathy & Light-Field (v14.0)"])


@router.post("/transduce-intuition")
async def transduce_intuition(req: IntuitionTransductionRequest):
    try:
        return cosmic_telepathy_service.transduce_intuition(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/neuro-pacing-consolidation")
async def neuro_pacing_consolidation(req: NeuroPacingRequest):
    try:
        return cosmic_telepathy_service.execute_neuro_pacing_consolidation(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/enclave-watermark")
async def enclave_watermark(req: EnclaveWatermarkRequest):
    try:
        return cosmic_telepathy_service.generate_enclave_watermark(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/c2pa-verify")
async def c2pa_verify(req: C2PAAttestationRequest):
    try:
        return cosmic_telepathy_service.verify_c2pa_attestation(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/telemetry-state")
async def get_telemetry_state(session_id: str = Query(..., description="Active session ID")):
    try:
        return cosmic_telepathy_service.get_telemetry_state(session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
