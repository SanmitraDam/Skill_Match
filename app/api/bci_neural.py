"""
SkillMatch DNA v8.0 - Brain-Computer Interface Neural Cognitive Engine API Router
Endpoints:
- POST /bci/ingest-telemetry      : Ingest EEG spectral bands, compute EngagementIndex = β/(α+θ)
- POST /bci/update-bcat           : Update CAT item difficulty Dk based on neural engagement
- POST /bci/generate-certificate  : Issue cryptographic Neural Focus Certificate
- GET  /bci/session-profile       : Retrieve candidate BCI cognitive profile
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional

from app.models.database import get_db
from app.services.bci_neural_service import BCINeuralService

router = APIRouter(prefix="/bci", tags=["BCI Neural Cognitive Engine"])

_bci_service = BCINeuralService()  # Singleton to preserve session state


class IngestEEGRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_bci_001"})
    theta_power: float = Field(0.45, json_schema_extra={"example": 0.45})
    alpha_power: float = Field(0.38, json_schema_extra={"example": 0.38})
    beta_power: float = Field(0.72, json_schema_extra={"example": 0.72})
    gamma_power: Optional[float] = Field(None, json_schema_extra={"example": 0.12})
    session_id: Optional[str] = Field(None, json_schema_extra={"example": "sess_bci_abc123"})
    sampling_rate_hz: int = Field(256, json_schema_extra={"example": 256})
    tenant_id: str = "tenant_default"


class UpdateBCATRequest(BaseModel):
    session_id: str = Field(..., json_schema_extra={"example": "sess_bci_abc123"})
    engagement_index: float = Field(1.6, json_schema_extra={"example": 1.6})
    current_theta: float = Field(1.2, json_schema_extra={"example": 1.2})
    current_difficulty: Optional[float] = Field(None, json_schema_extra={"example": 2.5})


class GenerateCertificateRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_bci_001"})
    session_id: str = Field(..., json_schema_extra={"example": "sess_bci_abc123"})
    tenant_id: str = "tenant_default"


@router.post("/ingest-telemetry")
def ingest_eeg_telemetry(req: IngestEEGRequest):
    result = _bci_service.ingest_eeg_telemetry(
        candidate_id=req.candidate_id,
        theta_power=req.theta_power,
        alpha_power=req.alpha_power,
        beta_power=req.beta_power,
        gamma_power=req.gamma_power,
        session_id=req.session_id,
        sampling_rate_hz=req.sampling_rate_hz,
        tenant_id=req.tenant_id,
    )
    return {"status": "success", "telemetry": result, **result}


@router.post("/update-bcat")
def update_bcat_difficulty(req: UpdateBCATRequest):
    result = _bci_service.update_bcat_difficulty(
        session_id=req.session_id,
        engagement_index=req.engagement_index,
        current_theta=req.current_theta,
        current_difficulty=req.current_difficulty,
    )
    return {"status": "success", "bcat_update": result, **result}


@router.post("/generate-certificate")
def generate_neural_certificate(req: GenerateCertificateRequest):
    result = _bci_service.generate_neural_focus_certificate(
        candidate_id=req.candidate_id,
        session_id=req.session_id,
        tenant_id=req.tenant_id,
    )
    return {"status": "success", "certificate": result}


@router.get("/session-profile")
def get_bci_session_profile(
    candidate_id: str = Query("cand_bci_001", description="Candidate identifier"),
    tenant_id: str = Query("tenant_default", description="Tenant identifier"),
):
    result = _bci_service.get_bci_session_profile(
        candidate_id=candidate_id, tenant_id=tenant_id
    )
    return {"status": "success", "profile": result}
