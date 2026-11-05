"""
CV Builder & ATS Checker Router — SkillMatch DNA v2.1
Implements Module 4 (FR-06 & FR-07) from prd-v2.md
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.ats_checker import ats_checker_service

router = APIRouter(prefix="/cv", tags=["CV Builder & ATS Checker v2.1"])

class GenerateTailoredCVRequest(BaseModel):
    profile_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    custom_details: Optional[str] = Field(default="")
    job_description: str = Field(..., description="Target Job Description text")
    target_role: Optional[str] = Field(default=None, description="Target job title or role")

class ATSCheckRequest(BaseModel):
    cv_text: str = Field(..., description="Full resume/CV text or markdown to check")
    job_description: str = Field(..., description="Target Job Description text")

@router.post("/generate-tailored")
async def generate_tailored_cv(req: GenerateTailoredCVRequest):
    """
    Synthesizes a tailored CV specifically aligned with the target job description:
    - Restructures experience bullet points with action verbs and metrics
    - Injects target JD keywords into summary and technical competencies
    - Incorporates supplementary achievements from custom_details
    - Returns formatted Markdown, structured JSON, and instant ATS score evaluation.
    """
    try:
        result = ats_checker_service.generate_tailored_cv(
            profile_data=req.profile_data or {},
            custom_details=req.custom_details or "",
            jd_text=req.job_description,
            target_role=req.target_role
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate tailored CV: {str(e)}")

@router.post("/ats-check")
async def check_ats_compatibility(req: ATSCheckRequest):
    """
    Evaluates a CV against target JD requirements:
    - Calculates ATS Compatibility Score (0–100%)
    - Highlights matched keywords and missing recommended terms
    - Identifies formatting alerts and delivers actionable improvements.
    """
    try:
        evaluation = ats_checker_service.calculate_ats_score(
            cv_text=req.cv_text,
            jd_text=req.job_description
        )
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ATS check failed: {str(e)}")
