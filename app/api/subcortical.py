"""
SkillMatch DNA v13.0 — Direct Sub-Cortical Bio-Synthetic Knowledge Transfer & Engram Compilation API Router
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.subcortical_service import (
    subcortical_service,
    EngramTransferRequest,
    CoProcessorStreamRequest,
    ThoughtToSystemRequest
)

router = APIRouter(prefix="/subcortical", tags=["Sub-Cortical Knowledge Transfer & Thought-to-System"])


@router.post("/engram-transfer")
async def engram_transfer(req: EngramTransferRequest):
    """
    Closed-loop sub-cortical engram transfer with optogenetic neuro-pacing and Theta/Gamma phase-locking.
    """
    try:
        return subcortical_service.execute_engram_transfer(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/coprocessor-stream")
async def coprocessor_stream(req: CoProcessorStreamRequest):
    """
    Zero-latency (<1ms) bi-directional synthetic co-processing bus streaming visual memory trees.
    """
    try:
        return subcortical_service.stream_coprocessor_bus(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/thought-to-system")
async def thought_to_system(req: ThoughtToSystemRequest):
    """
    Compiles abstract architectural intent directly into compiled WASM/Rust/Python modules at >500 WPM thought speed.
    """
    try:
        return subcortical_service.compile_thought_to_system(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/telemetry-state")
async def telemetry_state(session_id: str = "default_session"):
    """
    Retrieves the current state of the sub-cortical engram transfer and co-processor bus.
    """
    try:
        return subcortical_service.get_telemetry_state(session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
