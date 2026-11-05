"""
FastAPI Router for Zero-Knowledge Proofs (zk-SNARKs) & W3C Verifiable Credentials (v5.0)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.services.zkp_service import (
    zkp_service,
    ZKProofStatement,
    ZKProofResult,
    ZKProofPayload,
    W3CVerifiableCredential
)

router = APIRouter(prefix="/zkp", tags=["Zero-Knowledge Proofs & DID"])

class VerifyProofRequest(BaseModel):
    proof: ZKProofPayload
    public_signals: List[str]

class IssueCredentialRequest(BaseModel):
    candidate_id: str
    role_title: str
    ccrs: float = 88.5
    tenant_id: Optional[str] = "tenant_default"

@router.post("/generate-proof", response_model=ZKProofResult)
async def generate_zk_proof(req: ZKProofStatement):
    """
    Generates a Groth16 zero-knowledge proof establishing candidate CCRS >= threshold
    without leaking candidate identity, raw resume text, or exact quiz answers.
    """
    try:
        return zkp_service.generate_groth16_proof(req)
    except AssertionError as ae:
        raise HTTPException(status_code=400, detail=str(ae))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proof generation failed: {str(e)}")

@router.post("/verify")
async def verify_zk_proof(req: VerifyProofRequest):
    """
    Cryptographically verifies Groth16 zk-SNARK proof bilinear pairings in < 5ms.
    """
    try:
        return zkp_service.verify_groth16_proof(req.proof, req.public_signals)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Verification failed: {str(e)}")

@router.post("/issue-credential", response_model=W3CVerifiableCredential)
async def issue_verifiable_credential(req: IssueCredentialRequest):
    """Issues W3C-compliant JSON-LD Verifiable Credential anchored to candidate DID."""
    try:
        return zkp_service.issue_w3c_verifiable_credential(
            candidate_id=req.candidate_id,
            role_title=req.role_title,
            ccrs=req.ccrs,
            tenant_id=req.tenant_id or "tenant_default"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Credential issuance failed: {str(e)}")
