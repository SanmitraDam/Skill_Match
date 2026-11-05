"""
SkillMatch DNA v16.0 — Multimodal Behavioral Analytics Router
Pillar 2: Multimodal Behavioral & STAR Method Analytics Engine
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.behavioral_service import (
    behavioral_service,
    STARParseRequest,
    ProsodyAnalyzeRequest
)

router = APIRouter(prefix="/behavioral", tags=["Behavioral Analytics"])


@router.post("/star-parse")
async def parse_star_framework(req: STARParseRequest) -> Dict[str, Any]:
    """
    Parses candidate interview answers into the STAR method
    (Situation 15%, Task 15%, Action 50%, Result 20%) and detects empirical quantified impacts.
    """
    try:
        return behavioral_service.parse_star_structure(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/prosody-analyze")
async def analyze_vocal_prosody(req: ProsodyAnalyzeRequest) -> Dict[str, Any]:
    """
    Tracks speech pace (optimal 130-150 wpm), vocal fillers ('um', 'like'),
    and computes the Composure Index.
    """
    try:
        return behavioral_service.analyze_prosody_and_composure(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
