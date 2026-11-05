"""
SkillMatch DNA v11.0 — Synaptic Engram Telemetry & Synthetic Co-Processor API Router
Endpoints:
- POST /synaptic/ingest-engram    : Ingest NIRS + HD-EEG stream to map real-time synaptic engram formation
- POST /synaptic/coprocessor-sync  : Zero-latency (<1ms) bi-directional AI co-processor memory offload
- POST /synaptic/scaffolding       : Sub-saccadic cognitive scaffolding on prefrontal saturation
- GET  /synaptic/telemetry-state   : Query live synaptic engram telemetry & co-processor status
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.synaptic_service import SynapticService

router = APIRouter(prefix="/synaptic", tags=["Synaptic Engram Telemetry & Synthetic Co-Processor"])

_synaptic_service = SynapticService()


class IngestEngramRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_synaptic_001"})
    nirs_delta_hbo2: float = Field(14.8, json_schema_extra={"example": 14.8})
    nirs_delta_hbr: float = Field(-4.2, json_schema_extra={"example": -4.2})
    hd_eeg_gamma_power: float = Field(0.88, json_schema_extra={"example": 0.88})
    hd_eeg_theta_power: float = Field(0.32, json_schema_extra={"example": 0.32})
    session_id: Optional[str] = Field(None, json_schema_extra={"example": "sess_synaptic_001"})
    tenant_id: str = "tenant_default"


class CoprocessorSyncRequest(BaseModel):
    session_id: str = Field(..., json_schema_extra={"example": "sess_synaptic_001"})
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_synaptic_001"})
    offload_task: str = Field("SYNTAX_AST_VERIFICATION", json_schema_extra={"example": "SYNTAX_AST_VERIFICATION"})
    active_memory_variables: Optional[List[str]] = Field(
        None,
        json_schema_extra={"example": ["tail_ptr", "ring_buffer_capacity", "cas_expected"]}
    )


class ScaffoldingRequest(BaseModel):
    session_id: str = Field(..., json_schema_extra={"example": "sess_synaptic_001"})
    cognitive_reserve: float = Field(0.22, json_schema_extra={"example": 0.22})
    current_challenge: str = Field(
        "Distributed Consensus Split-Brain Prevention",
        json_schema_extra={"example": "Distributed Consensus Split-Brain Prevention"}
    )


@router.post("/ingest-engram")
def ingest_engram(req: IngestEngramRequest):
    result = _synaptic_service.ingest_engram_stream(
        candidate_id=req.candidate_id,
        nirs_delta_hbo2=req.nirs_delta_hbo2,
        nirs_delta_hbr=req.nirs_delta_hbr,
        hd_eeg_gamma_power=req.hd_eeg_gamma_power,
        hd_eeg_theta_power=req.hd_eeg_theta_power,
        session_id=req.session_id,
        tenant_id=req.tenant_id,
    )
    return {"status": "success", "engram": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/coprocessor-sync")
def coprocessor_sync(req: CoprocessorSyncRequest):
    result = _synaptic_service.coprocessor_sync(
        session_id=req.session_id,
        candidate_id=req.candidate_id,
        offload_task=req.offload_task,
        active_memory_variables=req.active_memory_variables,
    )
    return {"status": "success", "coprocessor": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/scaffolding")
def generate_scaffolding(req: ScaffoldingRequest):
    result = _synaptic_service.generate_scaffolding(
        session_id=req.session_id,
        cognitive_reserve=req.cognitive_reserve,
        current_challenge=req.current_challenge,
    )
    return {"status": "success", "scaffolding": result, **{k: v for k, v in result.items() if k != "status"}}


@router.get("/telemetry-state")
def get_telemetry_state(
    session_id: str = Query("sess_synaptic_001", description="Synaptic Session ID")
):
    result = _synaptic_service.get_telemetry_state(session_id=session_id)
    return {"status": "success", "telemetry": result, **{k: v for k, v in result.items() if k != "status"}}
