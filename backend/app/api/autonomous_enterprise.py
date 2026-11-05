"""
SkillMatch DNA v10.0 — Autonomous AI Enterprises (Zero-Human Corporations) API Router
Endpoints:
- POST /enterprise/create-autonomous-entity : Charter self-funding, self-governing AI corporate entity
- POST /enterprise/hire-candidate          : Autonomously hire candidate zkDID with streaming payroll
- POST /enterprise/stream-payroll          : Release continuous per-block INR/equity micro-payments
- POST /enterprise/arbitrate-dispute       : Sub-500ms zero-bias autonomous AI judicial arbitration
- GET  /enterprise/directory               : Query autonomous corporate registry & active treasuries
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.autonomous_enterprise_service import AutonomousEnterpriseService

router = APIRouter(prefix="/enterprise", tags=["Autonomous AI Enterprises & AI Judicial Court"])

_enterprise_service = AutonomousEnterpriseService()


class CreateAutonomousEntityRequest(BaseModel):
    entity_name: str = Field(..., json_schema_extra={"example": "Aether Photonic Mesh DAO"})
    mission_charter: str = Field(
        ...,
        json_schema_extra={"example": "Autonomously orchestrate low-latency quantum routing protocols across global edge pops."}
    )
    initial_treasury_inr: float = Field(207500000, json_schema_extra={"example": 207500000})
    total_equity_shares: int = Field(10000000, json_schema_extra={"example": 10000000})
    tenant_id: str = "tenant_default"


class HireCandidateRequest(BaseModel):
    entity_id: str = Field(..., json_schema_extra={"example": "entity_ai_synth_grid"})
    candidate_zk_did: str = Field(..., json_schema_extra={"example": "did:zk:skillos:7f8a9b1c2d3e"})
    role_title: str = Field("Staff Photonic Infrastructure Engineer", json_schema_extra={"example": "Staff Photonic Infrastructure Engineer"})
    rate_per_block_inr: float = Field(6.64, json_schema_extra={"example": 6.64})
    equity_allocation: int = Field(5000, json_schema_extra={"example": 5000})


class StreamPayrollRequest(BaseModel):
    hire_id: str = Field(..., json_schema_extra={"example": "hire_sample_001"})
    blocks_elapsed: int = Field(1500, json_schema_extra={"example": 1500})


class ArbitrateDisputeRequest(BaseModel):
    hire_id: str = Field(..., json_schema_extra={"example": "hire_sample_001"})
    dispute_reason: str = Field(
        ...,
        json_schema_extra={"example": "Milestone delivery: photonic kernel latency verification"}
    )
    git_commit_sha: str = Field("7f8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b", json_schema_extra={"example": "7f8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b"})
    test_coverage_pct: float = Field(98.6, json_schema_extra={"example": 98.6})
    dispute_amount_inr: float = Field(1037500, json_schema_extra={"example": 1037500})


@router.post("/create-autonomous-entity")
def create_autonomous_entity(req: CreateAutonomousEntityRequest):
    result = _enterprise_service.create_autonomous_entity(
        entity_name=req.entity_name,
        mission_charter=req.mission_charter,
        initial_treasury_inr=req.initial_treasury_inr,
        total_equity_shares=req.total_equity_shares,
        tenant_id=req.tenant_id,
    )
    return {"status": "success", "enterprise": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/hire-candidate")
def hire_candidate(req: HireCandidateRequest):
    result = _enterprise_service.hire_candidate(
        entity_id=req.entity_id,
        candidate_zk_did=req.candidate_zk_did,
        role_title=req.role_title,
        rate_per_block_inr=req.rate_per_block_inr,
        equity_allocation=req.equity_allocation,
    )
    return {"status": "success", "hire": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/stream-payroll")
def stream_payroll(req: StreamPayrollRequest):
    result = _enterprise_service.stream_payroll(
        hire_id=req.hire_id,
        blocks_elapsed=req.blocks_elapsed,
    )
    return {"status": "success", "streaming": result, **{k: v for k, v in result.items() if k != "status"}}


@router.post("/arbitrate-dispute")
def arbitrate_dispute(req: ArbitrateDisputeRequest):
    result = _enterprise_service.arbitrate_dispute(
        hire_id=req.hire_id,
        dispute_reason=req.dispute_reason,
        git_commit_sha=req.git_commit_sha,
        test_coverage_pct=req.test_coverage_pct,
        dispute_amount_inr=req.dispute_amount_inr,
    )
    return {"status": "success", "arbitration": result, **{k: v for k, v in result.items() if k != "status"}}


@router.get("/directory")
def get_enterprise_directory():
    result = _enterprise_service.get_directory()
    return {"status": "success", "directory": result, **{k: v for k, v in result.items() if k != "status"}}
