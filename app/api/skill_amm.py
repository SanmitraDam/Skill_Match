"""
SkillMatch DNA v10.0 — SkillAMM Automated Market Maker & Cross-Chain Bridge API Router
Endpoints:
- POST /amm/create-pool           : Initialize tokenized skill liquidity pool (SkillSwap)
- POST /amm/swap-skill             : Execute constant-product skill license token swap
- POST /amm/add-liquidity          : Add liquidity and mint LP tokens
- POST /amm/claim-yield            : Claim passive APY yield & micro-royalties
- GET  /amm/pools                  : Query active skill AMM pools and TVL stats
- POST /cross-chain/bridge-proof   : Bridge zk-STARK holographic proofs across Web3 chains
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.skill_amm_service import SkillAMMService

router = APIRouter(prefix="", tags=["SkillAMM Decentralized Liquidity & Cross-Chain Mesh"])

_amm_service = SkillAMMService()


class CreatePoolRequest(BaseModel):
    skill_name: str = Field(..., json_schema_extra={"example": "Lock-Free Ring Buffer for Sub-50ns Photonic Telemetry"})
    candidate_zk_did: str = Field(..., json_schema_extra={"example": "did:zk:skillos:7f8a9b1c2d3e"})
    initial_skill_reserve: float = Field(10000.0, json_schema_extra={"example": 10000.0})
    initial_inr_reserve: float = Field(2075000, json_schema_extra={"example": 2075000})
    skill_token_symbol: Optional[str] = Field(None, json_schema_extra={"example": "SKILL-PHOTONIC"})


class SwapSkillRequest(BaseModel):
    pool_id: str = Field(..., json_schema_extra={"example": "pool_photonic_buffer_inr"})
    buyer_zk_did: str = Field(..., json_schema_extra={"example": "did:zk:enterprise:alpha"})
    inr_in: float = Field(20750, json_schema_extra={"example": 20750})


class AddLiquidityRequest(BaseModel):
    pool_id: str = Field(..., json_schema_extra={"example": "pool_photonic_buffer_inr"})
    provider_zk_did: str = Field(..., json_schema_extra={"example": "did:zk:skillos:7f8a9b1c2d3e"})
    skill_amount: float = Field(500.0, json_schema_extra={"example": 500.0})
    inr_amount: float = Field(124500, json_schema_extra={"example": 124500})


class ClaimYieldRequest(BaseModel):
    pool_id: str = Field(..., json_schema_extra={"example": "pool_photonic_buffer_inr"})
    candidate_zk_did: str = Field(..., json_schema_extra={"example": "did:zk:skillos:7f8a9b1c2d3e"})


class BridgeProofRequest(BaseModel):
    proof_id: str = Field(..., json_schema_extra={"example": "proof_stark_9921"})
    source_chain: str = Field("ethereum_arbitrum", json_schema_extra={"example": "ethereum_arbitrum"})
    target_chain: str = Field("solana", json_schema_extra={"example": "solana"})
    credential_hash: Optional[str] = Field(None, json_schema_extra={"example": "0xstark_credential_hash"})
    candidate_zk_did: str = Field("did:zk:skillos:7f8a9b1c2d3e", json_schema_extra={"example": "did:zk:skillos:7f8a9b1c2d3e"})


@router.post("/amm/create-pool")
def create_amm_pool(req: CreatePoolRequest):
    result = _amm_service.create_pool(
        skill_name=req.skill_name,
        candidate_zk_did=req.candidate_zk_did,
        initial_skill_reserve=req.initial_skill_reserve,
        initial_inr_reserve=req.initial_inr_reserve,
        skill_token_symbol=req.skill_token_symbol,
    )
    return {"status": "success", "pool": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/amm/swap-skill")
def swap_skill(req: SwapSkillRequest):
    result = _amm_service.swap_skill(
        pool_id=req.pool_id,
        buyer_zk_did=req.buyer_zk_did,
        inr_in=req.inr_in,
    )
    return {"status": "success", "swap": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/amm/add-liquidity")
def add_amm_liquidity(req: AddLiquidityRequest):
    result = _amm_service.add_liquidity(
        pool_id=req.pool_id,
        provider_zk_did=req.provider_zk_did,
        skill_amount=req.skill_amount,
        inr_amount=req.inr_amount,
    )
    return {"status": "success", "liquidity": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/amm/claim-yield")
def claim_amm_yield(req: ClaimYieldRequest):
    result = _amm_service.claim_yield(
        pool_id=req.pool_id,
        candidate_zk_did=req.candidate_zk_did,
    )
    return {"status": "success", "claim": result, **{k: v for k, v in result.items() if k != "status"}}


@router.get("/amm/pools")
def get_amm_pools():
    result = _amm_service.get_pools()
    return {"status": "success", "data": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/cross-chain/bridge-proof")
def bridge_proof_cross_chain(req: BridgeProofRequest):
    result = _amm_service.bridge_proof_cross_chain(
        proof_id=req.proof_id,
        source_chain=req.source_chain,
        target_chain=req.target_chain,
        credential_hash=req.credential_hash,
        candidate_zk_did=req.candidate_zk_did,
    )
    return {"status": "success", "bridge": result, **{k: v for k, v in result.items() if k != "status"}}
