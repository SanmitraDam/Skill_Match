"""
CV Builder & ATS Checker Router — SkillMatch DNA v2.1
Implements Module 4 (FR-06 & FR-07) from prd-v2.md
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import os
import re
from app.services.ats_checker import ats_checker_service
from app.services.pdf_export_service import generate_pdf_from_cv
from app.services.parser import parser

router = APIRouter(prefix="/cv", tags=["CV Builder & ATS Checker v2.1"])

class ParseResumeTextRequest(BaseModel):
    resume_text: str = Field(..., description="Raw text or markdown of the resume")

@router.post("/parse-resume-file")
async def parse_resume_file(file: UploadFile = File(...)):
    """
    Parses an uploaded resume file (PDF, DOCX, TXT, MD) into structured resume fields
    (name, email, phone, location, role, social profiles, skills, experience, education, summary)
    for interactive in-place customization in the CV Builder.
    """
    try:
        content = await file.read()
        raw_text = parser.extract_text(file_bytes=content, filename=file.filename or "resume.pdf")
        if not raw_text.strip():
            raw_text = content.decode("utf-8", errors="ignore")
        parsed = ats_checker_service.parse_resume_content(raw_text)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume file: {str(e)}")

@router.post("/parse-resume-text")
async def parse_resume_text(req: ParseResumeTextRequest):
    """
    Parses raw resume text or markdown into structured resume fields
    for interactive in-place customization in the CV Builder.
    """
    try:
        parsed = ats_checker_service.parse_resume_content(req.resume_text)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume text: {str(e)}")


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

class ExportPDFRequest(BaseModel):
    structured_cv: Optional[Dict[str, Any]] = Field(default_factory=dict)
    cv_markdown: Optional[str] = Field(default="")
    candidate_name: Optional[str] = Field(default="Candidate")
    target_role: Optional[str] = Field(default="Professional")

@router.post("/export-pdf")
async def export_cv_pdf(req: ExportPDFRequest):
    """
    Synthesizes and downloads a clean, professional, ATS-compliant PDF of the tailored resume.
    """
    try:
        pdf_bytes = generate_pdf_from_cv(
            structured_cv=req.structured_cv or {},
            cv_markdown=req.cv_markdown or ""
        )
        safe_name = re.sub(r'[^a-zA-Z0-9_-]', '_', req.candidate_name or "Tailored_CV").strip('_')
        if not safe_name:
            safe_name = "Tailored_CV"
        filename = f"{safe_name}_Resume.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF export failed: {str(e)}")
