"""
SkillMatch DNA Version 25.0: Closed-Loop RLAHF Performance Telemetry API Router.
Pillar 4 of suggestion-v24.md:
- POST /rlahf-closed-loop/telemetry/ingest
- POST /rlahf-closed-loop/retrain/trigger
- GET  /rlahf-closed-loop/calibration-status
"""

from fastapi import APIRouter, HTTPException
from app.services.rlahf_closed_loop_service import (
    rlahf_closed_loop_service,
    IngestTelemetryBatchRequest,
    TriggerRetrainRequest
)

router = APIRouter(prefix="/rlahf-closed-loop", tags=["Closed-Loop RLAHF Telemetry (v25.0)"])


@router.post("/telemetry/ingest")
async def ingest_telemetry(req: IngestTelemetryBatchRequest):
    try:
        return rlahf_closed_loop_service.ingest_outcome_telemetry(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/retrain/trigger")
async def trigger_retrain(req: TriggerRetrainRequest):
    try:
        return rlahf_closed_loop_service.trigger_vllm_retraining(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/calibration-status")
async def get_calibration_status():
    try:
        return rlahf_closed_loop_service.get_calibration_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
