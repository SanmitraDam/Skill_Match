"""
SkillMatch DNA Version 24.0: Recursive Plonky3 Cross-Quantum Zero-Knowledge Meritocracy Rollups API Router.
Pillar 4 of suggestion-v23.md:
- POST /zk-meritocracy-rollup/bundle
- POST /zk-meritocracy-rollup/verify-bias-free
- POST /zk-meritocracy-rollup/compliance/red-team
- GET  /zk-meritocracy-rollup/proof/{zkdid}
"""

from fastapi import APIRouter, HTTPException
from app.services.zk_plonky3_meritocracy_rollup_service import (
    zk_plonky3_meritocracy_rollup_service,
    BundleRollupRequest,
    VerifyBiasFreeRollupRequest,
    RegulatoryRedTeamAuditRequest
)

router = APIRouter(prefix="/zk-meritocracy-rollup", tags=["Recursive Plonky3 Meritocracy Rollups (v24.0)"])


@router.post("/bundle")
async def bundle_rollup(req: BundleRollupRequest):
    try:
        return zk_plonky3_meritocracy_rollup_service.bundle_recursive_rollup(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-bias-free")
async def verify_bias_free(req: VerifyBiasFreeRollupRequest):
    try:
        return zk_plonky3_meritocracy_rollup_service.verify_bias_free_rollup(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compliance/red-team")
async def red_team_audit(req: RegulatoryRedTeamAuditRequest):
    try:
        return zk_plonky3_meritocracy_rollup_service.run_regulatory_red_team_audit(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/proof/{zkdid}")
async def get_proof(zkdid: str):
    try:
        return zk_plonky3_meritocracy_rollup_service.get_proof_record(zkdid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
