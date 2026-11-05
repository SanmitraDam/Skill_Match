"""
SkillMatch DNA v7.0 - Dynamic Micro-LoRA Adapter Fusion & Multi-Jurisdictional Compliance API Router
Endpoints:
- POST /lora/fuse-adapters : Fuse domain-specific micro-LoRA adapters in < 15ms
- POST /compliance/multi-jurisdiction-audit : Audit candidate across EU AI Act, NYC LL144, CA AB331, and US EEOC
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Dict, Optional

from app.models.database import get_db
from app.services.lora_compliance_service import DynamicLoRAComplianceService

router = APIRouter(tags=["Dynamic LoRA Fusion & Multi-Jurisdictional Compliance"])

class FuseAdaptersRequest(BaseModel):
    base_model: str = "meta-llama/Llama-3.3-70B-Instruct"
    role_skills: List[str] = Field(
        ...,
        json_schema_extra={"example": ["vLLM PagedAttention", "WebRTC SFU", "Rust"]}
    )

class MultiJurisdictionAuditRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_global_881"})
    tenant_id: str = "tenant_default"
    selection_rates: Optional[Dict[str, float]] = None

@router.post("/lora/fuse-adapters")
def fuse_adapters(req: FuseAdaptersRequest):
    service = DynamicLoRAComplianceService()
    result = service.fuse_micro_lora_adapters(
        base_model=req.base_model,
        role_skills=req.role_skills
    )
    return {"status": "success", "fused_specification": result}

@router.post("/compliance/multi-jurisdiction-audit")
def audit_multi_jurisdiction(
    req: MultiJurisdictionAuditRequest,
    db: Session = Depends(get_db)
):
    service = DynamicLoRAComplianceService(db)
    result = service.audit_multi_jurisdiction_compliance(
        candidate_id=req.candidate_id,
        tenant_id=req.tenant_id,
        selection_rates=req.selection_rates
    )
    return {"status": "success", "audit_result": result, **result}
