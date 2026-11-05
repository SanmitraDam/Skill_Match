"""
SkillMatch DNA v7.0 - Bio-Neural Cognitive Telemetry API Router
Endpoints:
- POST /bioneural/process-telemetry : Evaluate rPPG, pupillometry, and compute CFRS score
- GET /bioneural/profile : Retrieve candidate cognitive resilience baseline
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional

from app.models.database import get_db
from app.services.bioneural_service import BioNeuralService

router = APIRouter(prefix="/bioneural", tags=["Bio-Neural Cognitive Telemetry"])

class ProcessTelemetryRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_bio_771"})
    reasoning_accuracy: float = Field(0.92, json_schema_extra={"example": 0.92})
    heart_rate_bpm: float = Field(72.5, json_schema_extra={"example": 72.5})
    hrv_rmssd_ms: float = Field(54.0, json_schema_extra={"example": 54.0})
    pupil_dilation_mm: float = Field(3.2, json_schema_extra={"example": 3.2})
    acoustic_jitter_percent: float = Field(0.85, json_schema_extra={"example": 0.85})
    tenant_id: str = "tenant_default"

@router.post("/process-telemetry")
def process_bioneural_telemetry(
    req: ProcessTelemetryRequest,
    db: Session = Depends(get_db)
):
    service = BioNeuralService(db)
    result = service.evaluate_bioneural_telemetry(
        candidate_id=req.candidate_id,
        reasoning_accuracy=req.reasoning_accuracy,
        heart_rate_bpm=req.heart_rate_bpm,
        hrv_rmssd_ms=req.hrv_rmssd_ms,
        pupil_dilation_mm=req.pupil_dilation_mm,
        acoustic_jitter_percent=req.acoustic_jitter_percent,
        tenant_id=req.tenant_id
    )
    return {"status": "success", "session": result, **result}


@router.get("/profile")
def get_bioneural_profile(
    candidate_id: str = Query("cand_bio_771", description="Candidate identifier"),
    db: Session = Depends(get_db)
):
    service = BioNeuralService(db)
    profile = service.get_candidate_bio_profile(candidate_id=candidate_id)
    return {"status": "success", "profile": profile}
