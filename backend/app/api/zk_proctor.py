"""
SkillMatch DNA v18.0 — Zero-Knowledge Proctoring API Router
Pillar 1: Client-Side zk-SNARK Proof Verification & Ephemeral Stream Purging
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.zk_proctor_service import (
    zk_proctor_service,
    ZKProofVerifyRequest,
    GenerateProofRequest,
    PurgeStreamRequest
)

router = APIRouter(prefix="/proctor/zk", tags=["Zero-Knowledge Proctoring"])


@router.post("/verify-proof")
@router.post("/verify")
async def verify_zk_proctor_proof(req: ZKProofVerifyRequest) -> Dict[str, Any]:
    """
    Verifies client-side 8KB Groth16 zk-SNARK proctoring proof in <2ms,
    confirming assessment authenticity without accessing private media streams.
    """
    try:
        return zk_proctor_service.verify_zk_proof(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-proof-statement")
@router.post("/generate-proof")
async def generate_proof_statement(req: GenerateProofRequest) -> Dict[str, Any]:
    """
    Generates circuit public parameter statement and client-side proof mock.
    """
    try:
        return zk_proctor_service.generate_proof(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/purge-stream")
async def purge_ephemeral_stream(req: PurgeStreamRequest) -> Dict[str, Any]:
    """
    Purges volatile memory video/audio buffers and biometric embeddings
    to guarantee zero retention under GDPR Art. 9, Illinois BIPA, and CCPA.
    """
    try:
        return zk_proctor_service.purge_stream(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
