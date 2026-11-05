"""
FastAPI Router for Autonomous Multi-Agent Negotiation & Self-Healing Networks (v5.0)
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.services.agent_negotiation import (
    agent_negotiation_service,
    CandidateAgentPreferences,
    RecruiterAgentCriteria,
    NegotiationSessionState,
    SelfHealingCurriculum
)

router = APIRouter(prefix="/agents", tags=["Autonomous Agentic Ecosystem"])

class StartNegotiationRequest(BaseModel):
    tenant_id: Optional[str] = "tenant_default"
    candidate_preferences: CandidateAgentPreferences
    recruiter_criteria: RecruiterAgentCriteria

class AdvanceTurnRequest(BaseModel):
    session_id: str
    challenge_solution_summary: Optional[str] = "Implemented idempotent deduplication using Redis keys with 60s TTL and Raft consensus."
    tenant_id: Optional[str] = "tenant_default"

class SynthesizeGapRequest(BaseModel):
    candidate_id: str
    emerging_skill: str
    current_ccrs: Optional[float] = 82.0

class CompleteChallengeRequest(BaseModel):
    candidate_id: str
    skill: str
    baseline_ccrs: Optional[float] = 82.0
    score: Optional[float] = 95.0

@router.post("/negotiate/start", response_model=NegotiationSessionState)
async def start_agent_negotiation(req: StartNegotiationRequest, db: Session = Depends(get_db)):
    """Initiates an autonomous MCP negotiation round between candidate and recruiter AI agents."""
    try:
        return agent_negotiation_service.start_negotiation(
            candidate_pref=req.candidate_preferences,
            recruiter_crit=req.recruiter_criteria,
            tenant_id=req.tenant_id or "tenant_default",
            db=db
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Negotiation start failed: {str(e)}")

@router.post("/negotiate/step", response_model=NegotiationSessionState)
async def advance_agent_negotiation(req: AdvanceTurnRequest, db: Session = Depends(get_db)):
    """Advances the negotiation turn, submits challenge solution proof, and clears mutual agreement."""
    try:
        return agent_negotiation_service.advance_negotiation_turn(
            session_id=req.session_id,
            challenge_solution_summary=req.challenge_solution_summary or "",
            tenant_id=req.tenant_id or "tenant_default",
            db=db
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Negotiation step failed: {str(e)}")

@router.get("/negotiate/{session_id}")
async def get_negotiation_session(session_id: str):
    """Retrieves current MCP conversation history and settlement status for session."""
    session = agent_negotiation_service.active_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Negotiation session not found")
    return session

@router.post("/self-healing/synthesize-gap", response_model=SelfHealingCurriculum)
async def synthesize_self_healing_gap(req: SynthesizeGapRequest):
    """Generates an interactive 3D WebAssembly coding sandbox and AI tutor curriculum for an emerging skill gap."""
    return agent_negotiation_service.synthesize_self_healing_pathway(
        candidate_id=req.candidate_id,
        emerging_skill=req.emerging_skill,
        current_ccrs=req.current_ccrs or 82.0
    )

@router.post("/self-healing/complete-challenge")
async def complete_synthetic_challenge(req: CompleteChallengeRequest):
    """Dynamically re-benchmarks the candidate's CCRS score in real-time upon challenge completion."""
    return agent_negotiation_service.complete_synthetic_challenge(
        candidate_id=req.candidate_id,
        skill=req.skill,
        baseline_ccrs=req.baseline_ccrs or 82.0,
        score=req.score or 95.0
    )
