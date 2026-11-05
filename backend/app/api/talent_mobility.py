"""Enterprise Internal Talent Mobility & Upskilling Graph Router — SkillMatch DNA v19.0"""
from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.talent_mobility_service import (
    TalentMobilityService,
    EmployeeSkillProfile,
    ROIAnalyticsRequest,
)

router = APIRouter(prefix="/mobility", tags=["Talent Mobility v19.0"])
_svc = TalentMobilityService()


class InternalMatchRequest(BaseModel):
    employees: List[EmployeeSkillProfile]
    target_role: str
    min_match_pct: float = 70.0


class HeatmapRequest(BaseModel):
    employer_id: str
    employees: Optional[List[EmployeeSkillProfile]] = None


@router.post("/internal-match")
def find_internal_matches(req: InternalMatchRequest):
    """
    Score all employees against the target role requirements and return
    candidates with ≥ min_match_pct overlap, including gap skills and
    4-week upskilling roadmaps.
    """
    results = _svc.find_internal_matches(req.employees, req.target_role, req.min_match_pct)
    return [m.model_dump() for m in results]


@router.post("/skill-map")
def generate_workforce_heatmap(req: HeatmapRequest):
    """Generate org-wide skill vector heatmap for talent visibility and deficit alerts."""
    return _svc.generate_workforce_heatmap(req.employer_id, req.employees).model_dump()


@router.get("/workforce-heatmap")
def get_workforce_heatmap(employer_id: str):
    """Get workforce heatmap using demo data for a given employer."""
    return _svc.generate_workforce_heatmap(employer_id).model_dump()


@router.post("/roi-analytics")
def compute_roi_analytics(req: ROIAnalyticsRequest):
    """
    Compute total rupee savings achieved by internal promotion and upskilling
    versus external recruiter agency costs.
    """
    return _svc.compute_roi_analytics(req).model_dump()


@router.get("/flight-risk")
def analyze_flight_risk(employer_id: str):
    """Predictive flight-risk analysis for workforce retention planning."""
    return _svc.analyze_flight_risk(employer_id).model_dump()


@router.get("/org-ai-readiness")
def get_org_ai_readiness(employer_id: str):
    """C-suite AI readiness score with department breakdown and skill deficits."""
    return _svc.get_org_ai_readiness(employer_id).model_dump()
