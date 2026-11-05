"""
SkillMatch DNA v9.0 — Human-AI Collaborative Squad API Router
Endpoints:
- POST /squad/delegate-task          : Delegate engineering task to AI co-workers
- POST /squad/evaluate-collaboration : Compute Collaborative Velocity & Leadership Matrix
- POST /squad/token-economy          : Evaluate candidate token economy & reasoning density
- GET  /squad/live-status            : Live agent co-worker status & productivity metrics
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.human_ai_squad_service import HumanAISquadService

router = APIRouter(prefix="/squad", tags=["Human-AI Collaborative Squads"])

_squad_service = HumanAISquadService()


class DelegateTaskRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_leader_001"})
    task_description: str = Field(
        ...,
        json_schema_extra={"example": "Design an event-sourced audit log that survives multi-region split-brain."}
    )
    target_agent: str = Field("ARCHITECT", json_schema_extra={"example": "ARCHITECT"})
    prompt_context: Optional[str] = Field(None, json_schema_extra={"example": "Kafka + ScyllaDB deployment"})
    session_id: Optional[str] = Field(None, json_schema_extra={"example": "squad_sess_abc123"})


class EvaluateCollaborationRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_leader_001"})
    session_id: Optional[str] = Field(None, json_schema_extra={"example": "squad_sess_abc123"})
    iterations_count: int = Field(4, json_schema_extra={"example": 4})


class TokenEconomyRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_leader_001"})
    total_prompt_tokens: int = Field(450, json_schema_extra={"example": 450})
    total_completion_tokens: int = Field(2800, json_schema_extra={"example": 2800})
    milestones_achieved: int = Field(3, json_schema_extra={"example": 3})


@router.post("/delegate-task")
def delegate_task(req: DelegateTaskRequest):
    result = _squad_service.delegate_task(
        candidate_id=req.candidate_id,
        task_description=req.task_description,
        target_agent=req.target_agent,
        prompt_context=req.prompt_context,
        session_id=req.session_id,
    )
    return {"status": "success", "delegation": result, **result}


@router.post("/evaluate-collaboration")
def evaluate_collaboration(req: EvaluateCollaborationRequest):
    result = _squad_service.evaluate_collaboration_matrix(
        candidate_id=req.candidate_id,
        session_id=req.session_id,
        iterations_count=req.iterations_count,
    )
    return {"status": "success", "evaluation": result, **result}


@router.post("/token-economy")
def evaluate_token_economy(req: TokenEconomyRequest):
    result = _squad_service.evaluate_token_economy(
        candidate_id=req.candidate_id,
        total_prompt_tokens=req.total_prompt_tokens,
        total_completion_tokens=req.total_completion_tokens,
        milestones_achieved=req.milestones_achieved,
    )
    return {"status": "success", "token_economy": result, **result}


@router.get("/live-status")
def get_squad_live_status(
    candidate_id: str = Query("cand_leader_001", description="Candidate identifier")
):
    result = _squad_service.get_live_status(candidate_id=candidate_id)
    return {"status": "success", "squad_status": result}
