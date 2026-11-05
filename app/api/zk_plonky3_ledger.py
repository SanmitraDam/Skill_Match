"""
SkillMatch DNA Version 26.0: Cross-Chain Plonky3 zk-STARK Ledger API Router.
Pillar 4 of suggestion-v25.md:
- POST /zk-plonky3-ledger/generate-proof
- POST /zk-plonky3-ledger/verify-compliance
- GET  /zk-plonky3-ledger/status
"""

from fastapi import APIRouter, HTTPException
from app.services.zk_plonky3_ledger_service import (
    zk_plonky3_ledger_service,
    GenerateLedgerProofRequest,
    VerifyComplianceRequest
)

router = APIRouter(prefix="/zk-plonky3-ledger", tags=["Plonky3 zk-STARK Ledger & Bias-Free Compliance (v26.0)"])


@router.post("/generate-proof")
async def generate_ledger_proof(req: GenerateLedgerProofRequest):
    try:
        return zk_plonky3_ledger_service.generate_recursive_ledger_proof(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-compliance")
async def verify_compliance(req: VerifyComplianceRequest):
    try:
        return zk_plonky3_ledger_service.verify_bias_free_compliance(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_ledger_status():
    try:
        return zk_plonky3_ledger_service.get_ledger_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
