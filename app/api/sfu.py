"""
FastAPI Router for SFU Media Engine & WebAudio DSP Pipelines (v4.0 Enterprise Scale)
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.services.sfu_service import (
    sfu_media_service,
    SFUSessionNegotiationRequest,
    SFUSessionNegotiationResponse,
    AudioDSPMetricRequest,
    SpeechQualityIndexResponse
)

router = APIRouter(prefix="/sfu", tags=["SFU & WebAudio DSP"])

class ICERestartRequest(BaseModel):
    session_id: str

@router.post("/session/negotiate", response_model=SFUSessionNegotiationResponse)
async def negotiate_sfu_session(req: SFUSessionNegotiationRequest):
    """
    Negotiates the nearest low-latency SFU edge PoP (<15ms RTT) and returns
    ICE servers, credentials, and cascaded inference endpoint.
    """
    try:
        return sfu_media_service.negotiate_session(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SFU negotiation failed: {str(e)}")

@router.post("/ice-restart")
async def trigger_ice_restart(req: ICERestartRequest):
    """
    Executes an ICE restart failover within <100ms when candidate connection shifts
    (e.g., Wi-Fi to cellular) without dropping interview session state.
    """
    res = sfu_media_service.trigger_ice_restart(req.session_id)
    return res

@router.post("/dsp/evaluate-sqi", response_model=SpeechQualityIndexResponse)
async def evaluate_audio_dsp_quality(req: AudioDSPMetricRequest):
    """
    Evaluates browser WebAudio DSP stream: computes Signal-to-Noise Ratio (SNR),
    DeepFilterNet noise attenuation gain, and Speech Quality Index (SQI).
    """
    try:
        return sfu_media_service.evaluate_audio_dsp(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"DSP evaluation error: {str(e)}")

@router.get("/topology")
async def get_sfu_topology():
    """
    Returns global SFU edge cluster topology, active edge PoPs, and WebAudio DSP latency benchmarks.
    """
    return sfu_media_service.get_cluster_topology_metrics()
