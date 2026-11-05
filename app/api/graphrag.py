"""
FastAPI Router for Graph-Vector Fusion (GraphRAG) & Labor Market Stream Mining (v5.0)
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.services.graphrag_service import (
    graphrag_service,
    HybridMatchResult,
    LaborMarketTrend
)

router = APIRouter(prefix="/graphrag", tags=["GraphRAG & Labor Market Mining"])

class HybridMatchRequest(BaseModel):
    candidate_id: Optional[str] = "cand_001"
    job_id: Optional[str] = "jd_001"
    candidate_skills: List[str] = Field(
        default_factory=lambda: ["Python", "FastAPI", "Docker", "Linux Networking"]
    )
    job_required_skills: List[str] = Field(
        default_factory=lambda: ["Python", "FastAPI", "Kubernetes", "vLLM PagedAttention", "Distributed Consensus"]
    )

class IngestStreamRequest(BaseModel):
    postings_count: int = Field(1500, ge=10, le=50000)

@router.post("/hybrid-match", response_model=HybridMatchResult)
async def calculate_hybrid_match(req: HybridMatchRequest):
    """
    Computes hybrid Graph-Vector relevance:
    Combines dense cosine similarity (65%) with Knowledge Graph prerequisite depth traversal (35%).
    """
    try:
        return graphrag_service.calculate_hybrid_relevance(
            candidate_skills=req.candidate_skills,
            job_required_skills=req.job_required_skills,
            candidate_id=req.candidate_id or "cand_001",
            job_id=req.job_id or "jd_001"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"GraphRAG match failed: {str(e)}")

@router.get("/prerequisites/{skill}")
async def get_skill_prerequisites(skill: str):
    """Retrieves deep prerequisite dependency tree for a target skill."""
    return graphrag_service.get_prerequisite_tree(skill)

@router.get("/adjacencies/{skill}")
async def get_skill_adjacencies(skill: str):
    """Discovers non-obvious career transition bridge paths."""
    return {
        "source_skill": skill,
        "adjacent_career_bridges": graphrag_service.get_adjacent_careers(skill)
    }

@router.get("/market-trends", response_model=List[LaborMarketTrend])
async def get_labor_market_trends():
    """Returns live labor market demand surge index and dynamic skill criticality weights."""
    return list(graphrag_service.market_trends.values())

@router.post("/ingest-job-stream")
async def ingest_live_job_market_stream(req: IngestStreamRequest):
    """Simulates real-time ingestion from job boards and ATS webhooks to re-index skill weights."""
    return graphrag_service.ingest_live_market_stream(req.postings_count)
