"""
SkillMatch DNA v8.0 - Zero-Trust Holographic Skill Proofs (zk-STARKs) API Router
Endpoints:
- POST /zk-stark/generate-proof  : Generate recursive Plonky2/Halo2 STARK proof (<= 12 KB)
- POST /zk-stark/verify-proof    : Verify proof in < 2ms
- POST /zk-stark/watermark       : Apply C2PA neural watermark (deepfake resistance)
- GET  /zk-stark/career-ledger   : Universal Career Ledger for a candidate
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.models.database import get_db
from app.services.zk_stark_service import ZKStarkService

router = APIRouter(prefix="/zk-stark", tags=["zk-STARK Holographic Proofs"])

_stark_service = ZKStarkService()


class GenerateSTARKProofRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_stark_992"})
    proof_components: List[str] = Field(
        [],
        json_schema_extra={"example": ["CAT_SCORE_PROOF", "VOICE_EVAL_PROOF", "CODE_COMMIT_PROOF", "CCRS_AGGREGATE"]}
    )
    min_ccrs_threshold: float = Field(80.0, json_schema_extra={"example": 80.0})
    actual_ccrs: float = Field(88.5, json_schema_extra={"example": 88.5})
    target_role: str = Field("Staff AI Engineer", json_schema_extra={"example": "Staff AI Engineer"})
    tenant_id: str = "tenant_default"


class VerifySTARKProofRequest(BaseModel):
    proof_id: str = Field(..., json_schema_extra={"example": "stark_abc123def456789a"})
    proof_hex: Optional[str] = Field(None, json_schema_extra={"example": "0xabcd..."})
    public_signals: Optional[Dict[str, Any]] = Field(
        None,
        json_schema_extra={"example": {"meets_ccrs_threshold": True, "target_role": "Staff AI Engineer"}}
    )


class C2PAWatermarkRequest(BaseModel):
    session_id: str = Field(..., json_schema_extra={"example": "sess_assess_771"})
    media_type: str = Field("WEBCAM_FRAME", json_schema_extra={"example": "WEBCAM_FRAME"})
    candidate_id: Optional[str] = Field(None, json_schema_extra={"example": "cand_stark_992"})
    hardware_attestation_token: Optional[str] = Field(None, json_schema_extra={"example": "tpm_token_abc123"})


@router.post("/generate-proof")
def generate_recursive_stark_proof(req: GenerateSTARKProofRequest):
    result = _stark_service.generate_recursive_stark_proof(
        candidate_id=req.candidate_id,
        proof_components=req.proof_components,
        min_ccrs_threshold=req.min_ccrs_threshold,
        actual_ccrs=req.actual_ccrs,
        target_role=req.target_role,
        tenant_id=req.tenant_id,
    )
    return {"status": "success", "proof": result}


@router.post("/verify-proof")
def verify_stark_proof(req: VerifySTARKProofRequest):
    result = _stark_service.verify_stark_proof(
        proof_id=req.proof_id,
        proof_hex=req.proof_hex,
        public_signals=req.public_signals,
    )
    return {"status": "success", "verification": result}


@router.post("/watermark")
def apply_c2pa_watermark(req: C2PAWatermarkRequest):
    result = _stark_service.apply_c2pa_neural_watermark(
        session_id=req.session_id,
        media_type=req.media_type,
        candidate_id=req.candidate_id,
        hardware_attestation_token=req.hardware_attestation_token,
    )
    return {"status": "success", "watermark": result}


@router.get("/career-ledger")
def get_universal_career_ledger(
    candidate_id: str = Query("cand_stark_992", description="Candidate identifier"),
    tenant_id: str = Query("tenant_default", description="Tenant identifier"),
):
    result = _stark_service.get_universal_career_ledger(
        candidate_id=candidate_id,
        tenant_id=tenant_id,
    )
    return {"status": "success", "ledger": result}
