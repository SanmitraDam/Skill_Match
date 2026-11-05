"""
Universal Skill Value Index & Career Resiliency API Router — SkillMatch DNA v20.0
Pillar 4: SMVI Trends, Skill Half-Life & Proactive Micro-Learning Injection
"""
from fastapi import APIRouter
from typing import Any, Dict, List
from app.services.career_resiliency_service import (
    career_resiliency_service,
    SkillMarketMetric,
    CalculateResiliencyRequest,
    CandidateResiliencyReport,
    MicroLearningChallenge,
    InjectMicroLearningRequest
)

router = APIRouter(prefix="/resiliency", tags=["Career Resiliency & SMVI"])


@router.get("/smvi/market-trends", response_model=List[SkillMarketMetric])
def get_smvi_market_trends():
    """Returns real-time Skill Market Value Index (SMVI) across technical capabilities."""
    return career_resiliency_service.get_market_trends()


@router.post("/candidate/calculate", response_model=CandidateResiliencyReport)
def calculate_candidate_career_resiliency(req: CalculateResiliencyRequest):
    """Calculates personalized Career Resiliency Score (CRS) and 6-month projected decay."""
    return career_resiliency_service.calculate_resiliency(req)


@router.post("/micro-learning/inject", response_model=List[MicroLearningChallenge])
def inject_micro_learning_challenges(req: InjectMicroLearningRequest):
    """Injects 5-minute proactive micro-learning challenges into candidate's active FlashcardStudio."""
    return career_resiliency_service.inject_micro_learning(req)


@router.get("/challenges/{candidate_id}", response_model=List[MicroLearningChallenge])
def get_candidate_micro_challenges(candidate_id: str):
    """Retrieves active injected challenges for candidate."""
    return career_resiliency_service.get_candidate_challenges(candidate_id)
