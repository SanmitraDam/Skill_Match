"""Post-Hiring RLAHF Model Calibration Router — SkillMatch DNA v19.0"""
from fastapi import APIRouter
from app.services.rlahf_calibration_service import (
    RLAHFCalibrationService,
    PerformanceTelemetryEvent,
    CALBRequestBody,
)

router = APIRouter(prefix="/rlahf", tags=["RLAHF Calibration v19.0"])
_svc = RLAHFCalibrationService()


@router.post("/performance/ingest")
def ingest_performance_telemetry(event: PerformanceTelemetryEvent):
    """
    Ingest 30/60/90-day onboarding telemetry (GitHub PRs, Jira tickets, manager ratings)
    and compute CCRS → performance correlation.
    """
    return _svc.ingest_performance_telemetry(event).model_dump()


@router.post("/calibrate")
def calibrate_model(req: CALBRequestBody):
    """
    Recalibrate CAT item difficulty (b_i), discrimination (a_i), and skill vector
    weights for the specified skill domain based on accumulated telemetry.
    """
    return _svc.calibrate_model(req).model_dump()


@router.get("/model-weights")
def get_model_weights():
    """Return current global skill weights, CAT difficulty distribution, and prediction accuracy."""
    return _svc.get_model_weights().model_dump()


@router.get("/calibration-history")
def get_calibration_history():
    """Return recent calibration audit log entries."""
    return [entry.model_dump() for entry in _svc.get_calibration_history()]
