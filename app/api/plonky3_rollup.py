"""
SkillMatch DNA v14.0 — Cosmic Neural Noosphere Platform
Pillar 4: Cross-Quantum Plonky3 zk-STARK Multi-Chain Rollups & Anti-Spoofing Enclaves API Router.
"""

from fastapi import APIRouter, HTTPException
from app.services.plonky3_rollup_service import (
    plonky3_rollup_service,
    RecursiveBundleRequest,
    MultiChainVerifyRequest,
    C2PAAttestationVerifyRequest,
)

router = APIRouter(prefix="/plonky3-rollup", tags=["Plonky3 Multi-Chain Rollups (v14.0)"])


@router.post("/bundle-recursive")
async def bundle_recursive(req: RecursiveBundleRequest):
    try:
        return plonky3_rollup_service.bundle_recursive_proof(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-multichain")
async def verify_multichain(req: MultiChainVerifyRequest):
    try:
        return plonky3_rollup_service.verify_multichain_proof(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/c2pa-attestation")
async def c2pa_attestation(req: C2PAAttestationVerifyRequest):
    try:
        return plonky3_rollup_service.verify_c2pa_attestation(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/batches")
async def get_batches():
    try:
        return plonky3_rollup_service.get_batches()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
