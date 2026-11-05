"""
SkillMatch DNA v10.0 — Direct Cortical Knowledge Consolidation API Router
Endpoints:
- POST /cortical/consolidate-memory : Induce Theta/Gamma phase-locking & 10x memory consolidation
- POST /cortical/remediate-gap      : Deliver sub-saccadic micro-learning stimuli during refractory periods
- POST /cortical/thought-to-code    : Zero-latency thought-to-code compilation (>500 WPM)
- GET  /cortical/telemetry-state    : Query live cortical telemetry and coherence status
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.cortical_service import CorticalService

router = APIRouter(prefix="/cortical", tags=["Direct Cortical Knowledge Consolidation"])

_cortical_service = CorticalService()


class ConsolidateMemoryRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_cortical_001"})
    session_id: Optional[str] = Field(None, json_schema_extra={"example": "sess_cortical_901"})
    theta_freq_hz: float = Field(6.0, json_schema_extra={"example": 6.0})
    gamma_freq_hz: float = Field(40.0, json_schema_extra={"example": 40.0})
    current_phase_coherence: float = Field(0.88, json_schema_extra={"example": 0.88})
    tenant_id: str = "tenant_default"


class RemediateGapRequest(BaseModel):
    session_id: str = Field(..., json_schema_extra={"example": "sess_cortical_901"})
    concept_impasse: str = Field(..., json_schema_extra={"example": "CONSENSUS"})
    candidate_id: str = Field("cand_cortical_001", json_schema_extra={"example": "cand_cortical_001"})


class ThoughtToCodeRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_cortical_001"})
    intent_prompt: str = Field(
        ...,
        json_schema_extra={"example": "Lock-free ring buffer for sub-50ns photonic telemetry stream"}
    )
    target_language: str = Field("rust", json_schema_extra={"example": "rust"})
    session_id: Optional[str] = Field(None, json_schema_extra={"example": "sess_cortical_901"})


@router.post("/consolidate-memory")
def consolidate_memory(req: ConsolidateMemoryRequest):
    result = _cortical_service.consolidate_memory(
        candidate_id=req.candidate_id,
        session_id=req.session_id,
        theta_freq_hz=req.theta_freq_hz,
        gamma_freq_hz=req.gamma_freq_hz,
        current_phase_coherence=req.current_phase_coherence,
        tenant_id=req.tenant_id,
    )
    return {"status": "success", "consolidation": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/remediate-gap")
def remediate_neural_gap(req: RemediateGapRequest):
    result = _cortical_service.remediate_gap(
        session_id=req.session_id,
        concept_impasse=req.concept_impasse,
        candidate_id=req.candidate_id,
    )
    return {"status": "success", "remediation": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/thought-to-code")
def compile_thought_to_code(req: ThoughtToCodeRequest):
    result = _cortical_service.thought_to_code(
        candidate_id=req.candidate_id,
        intent_prompt=req.intent_prompt,
        target_language=req.target_language,
        session_id=req.session_id,
    )
    return {"status": "success", "compilation": result, **{k: v for k, v in result.items() if k != "status"}}


@router.get("/telemetry-state")
def get_cortical_telemetry_state(
    session_id: str = Query("sess_cortical_901", description="Cortical session ID")
):
    result = _cortical_service.get_telemetry_state(session_id=session_id)
    return {"status": "success", "telemetry": result, **{k: v for k, v in result.items() if k != "status"}}
