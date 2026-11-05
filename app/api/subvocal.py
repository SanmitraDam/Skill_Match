"""
SkillMatch DNA v9.0 — Subvocal Neural Cognitive Engine API Router
Endpoints:
- POST /subvocal/ingest-semg          : Ingest sEMG stream, decode thought-speed code tokens (~300+ WPM)
- POST /subvocal/scaffolding         : Bio-adaptive cognitive augmentation & visual spatial scaffolding
- POST /subvocal/enclave-attestation : Hardware-Enclave neural watermarking & zero-knowledge proof
- GET  /subvocal/telemetry-state     : Query live subvocal co-pilot status & telemetry
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.subvocal_service import SubvocalService

router = APIRouter(prefix="/subvocal", tags=["Subvocal Neural Co-Piloting"])

_subvocal_service = SubvocalService()


class IngestSEMGRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_subvocal_001"})
    semg_channels: List[float] = Field(
        [14.2, 18.5, 11.9, 15.3],
        json_schema_extra={"example": [14.2, 18.5, 11.9, 15.3]}
    )
    sampling_rate_hz: int = Field(1000, json_schema_extra={"example": 1000})
    session_id: Optional[str] = Field(None, json_schema_extra={"example": "sess_subvocal_123"})
    context_hint: Optional[str] = Field(None, json_schema_extra={"example": "Distributed System Architecture"})
    tenant_id: str = "tenant_default"


class ScaffoldingRequest(BaseModel):
    session_id: str = Field(..., json_schema_extra={"example": "sess_subvocal_123"})
    cognitive_friction_index: float = Field(0.72, json_schema_extra={"example": 0.72})
    current_task: Optional[str] = Field(None, json_schema_extra={"example": "Distributed Lock Consensus"})


class EnclaveAttestationRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_subvocal_001"})
    session_id: str = Field(..., json_schema_extra={"example": "sess_subvocal_123"})
    enclave_type: str = Field("ARM_TRUSTZONE", json_schema_extra={"example": "ARM_TRUSTZONE"})
    tenant_id: str = "tenant_default"


@router.post("/ingest-semg")
def ingest_semg(req: IngestSEMGRequest):
    result = _subvocal_service.ingest_semg_stream(
        candidate_id=req.candidate_id,
        semg_channels=req.semg_channels,
        sampling_rate_hz=req.sampling_rate_hz,
        session_id=req.session_id,
        context_hint=req.context_hint,
        tenant_id=req.tenant_id,
    )
    return {"status": "success", "subvocal": result, **result}


@router.post("/scaffolding")
def request_bio_adaptive_scaffolding(req: ScaffoldingRequest):
    result = _subvocal_service.generate_bio_adaptive_scaffolding(
        session_id=req.session_id,
        cognitive_friction_index=req.cognitive_friction_index,
        current_task=req.current_task,
    )
    return {"status": "success", "scaffolding": result}


@router.post("/enclave-attestation")
def issue_enclave_attestation(req: EnclaveAttestationRequest):
    result = _subvocal_service.issue_enclave_neural_attestation(
        candidate_id=req.candidate_id,
        session_id=req.session_id,
        enclave_type=req.enclave_type,
        tenant_id=req.tenant_id,
    )
    return {"status": "success", "attestation": result}


@router.get("/telemetry-state")
def get_subvocal_telemetry(
    candidate_id: str = Query("cand_subvocal_001", description="Candidate identifier"),
    tenant_id: str = Query("tenant_default", description="Tenant identifier")
):
    result = _subvocal_service.get_telemetry_state(
        candidate_id=candidate_id, tenant_id=tenant_id
    )
    return {"status": "success", "telemetry": result}
