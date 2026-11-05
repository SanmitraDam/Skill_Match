"""
SkillMatch DNA v18.0 — Enterprise Governance & CCRS Analytics API Router
Pillar 4: Enterprise Recruiter Integrity Analytics & Governance Dashboard
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from app.services.enterprise_governance_service import (
    enterprise_governance_service,
    CohortAnalyticsRequest,
    CalculateFinalCCRSRequest,
    GenerateCertificateRequest
)

router = APIRouter(tags=["Enterprise Governance"])


@router.post("/governance/cohort/analytics")
@router.post("/proctor/governance/cohort/analytics")
@router.post("/proctor/governance/cohort-analytics")
@router.get("/governance/cohort/analytics")
@router.get("/proctor/governance/cohort-analytics")
async def get_cohort_integrity_analytics(req: Optional[CohortAnalyticsRequest] = None) -> Dict[str, Any]:
    """
    Retrieves cohort-wide candidate integrity analytics, average PTS, and infraction distributions.
    """
    try:
        return enterprise_governance_service.get_cohort_analytics(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/governance/candidate/{candidate_id}/calibrated-ccrs")
@router.post("/proctor/governance/candidate/{candidate_id}/calibrated-ccrs")
@router.post("/proctor/governance/calculate-final-ccrs")
async def calculate_final_ccrs(req: CalculateFinalCCRSRequest, candidate_id: str = None) -> Dict[str, Any]:
    """
    Calculates calibrated CCRS applying the proctoring trust safety multiplier.
    """
    try:
        return enterprise_governance_service.calculate_final_ccrs(req, candidate_id=candidate_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/governance/candidate/{candidate_id}/compliance-certificate")
@router.post("/proctor/governance/candidate/{candidate_id}/compliance-certificate")
@router.post("/proctor/governance/generate-certificate")
async def generate_compliance_certificate(req: GenerateCertificateRequest, candidate_id: str = None) -> Dict[str, Any]:
    """
    Generates an Ed25519 cryptographically signed compliance audit certificate.
    """
    try:
        return enterprise_governance_service.generate_compliance_certificate(req, candidate_id=candidate_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
