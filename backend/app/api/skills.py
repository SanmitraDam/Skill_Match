from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import os
import io
from app.models.database import get_db
from app.models import models
from app.services.parser import parser
from app.services.vector_matcher import vector_matcher
from app.services.storage_service import storage_service
from app.schemas.skills import SkillGapReport, UserSkills, JobDescriptionUpload, SkillMatchRequest
from app.schemas.parser_responses import ResumeParseResponse, JDParseResponse

router = APIRouter(prefix="/skills", tags=["Skills"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}

@router.post("/parse-resume", response_model=ResumeParseResponse)
async def parse_resume(
    file: UploadFile = File(...),
    anonymize_pii: bool = Query(False, description="Scrub emails and phone numbers for bias-free matching"),
    db: Session = Depends(get_db)
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    try:
        await file.seek(0)
    except Exception:
        pass
    safe_filename = os.path.basename(file.filename or "resume.pdf")

    # Read uploaded content in-memory (serverless and read-only safe)
    content = await file.read()

    # Save to persistent storage (CockroachDB / Cloud)
    file_path_in_db = await storage_service.save_file(io.BytesIO(content), safe_filename, "resumes")

    try:
        # Extract text in-memory from bytes (no disk required)
        raw_text = parser.extract_text(file_bytes=content, filename=safe_filename)
        if not raw_text.strip():
            raw_text = content.decode("utf-8", errors="ignore")

        social_profiles = parser.extract_social_profiles(raw_text)

        processed_text = raw_text
        if anonymize_pii:
            processed_text = parser.scrub_pii(raw_text)

        skills = parser.extract_skills(processed_text)
        taxonomy = parser.categorize_skills(skills)

        resume = models.Resume(
            file_path=file_path_in_db,
            extracted_text=processed_text,
            parsed_skills=skills
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)

        return {
            "resume_id": resume.id,
            "skills": skills,
            "taxonomy": taxonomy,
            "social_profiles": social_profiles,
            "pii_anonymized": anonymize_pii
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")

@router.post("/parse-jd", response_model=JDParseResponse)
async def parse_jd(
    data: Optional[JobDescriptionUpload] = None,
    text: Optional[str] = None,
    db: Session = Depends(get_db)
):
    jd_text = data.text if data and data.text else (text or "")
    if not jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")

    # Guardrail isolation delimiters
    isolated_text = f"<job_description>\n{jd_text.strip()}\n</job_description>"
    skills = parser.extract_skills(isolated_text)
    taxonomy = parser.categorize_skills(skills)

    jd = models.JobDescription(
        text=jd_text,
        required_skills=skills
    )
    db.add(jd)
    db.commit()
    db.refresh(jd)

    return {
        "jd_id": jd.id,
        "required_skills": skills,
        "taxonomy": taxonomy
    }

@router.post("/match", response_model=SkillGapReport)
async def match_skills_post(
    req: Optional[SkillMatchRequest] = None,
    resume_id: Optional[int] = None,
    jd_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    r_id = req.resume_id if req else resume_id
    j_id = req.jd_id if req else jd_id
    if r_id is None or j_id is None:
        raise HTTPException(status_code=400, detail="Both resume_id and jd_id are required.")

    return await _execute_match(r_id, j_id, db)

@router.get("/match/{resume_id}/{jd_id}", response_model=SkillGapReport)
async def match_skills_get(resume_id: int, jd_id: int, db: Session = Depends(get_db)):
    return await _execute_match(resume_id, jd_id, db)

async def _execute_match(resume_id: int, jd_id: int, db: Session):
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    jd = db.query(models.JobDescription).filter(models.JobDescription.id == jd_id).first()

    if not resume or not jd:
        raise HTTPException(status_code=404, detail="Resume or Job Description not found.")

    social_profiles = parser.extract_social_profiles(resume.extracted_text or "")
    is_anonymized = "[EMAIL_REDACTED]" in (resume.extracted_text or "")

    from app.services.skill_match import match_resume_to_jd

    if resume.extracted_text and jd.text:
        match_rep = match_resume_to_jd(resume.extracted_text, jd.text)
        leg = match_rep.to_legacy(social=social_profiles, anon=is_anonymized)
        report = SkillGapReport(
            match_score=leg["match_score"],
            matched_skills=leg["matched_skills"],
            missing_critical_skills=leg["missing_critical_skills"],
            recommended_quiz_focus=leg["recommended_quiz_focus"],
            taxonomy=leg["taxonomy"],
            weighted_gaps=leg["weighted_gaps"],
            social_profiles=social_profiles,
            pii_anonymized=is_anonymized
        )
    else:
        report = vector_matcher.generate_gap_report(
            resume_skills=resume.parsed_skills or [],
            jd_skills=jd.required_skills or [],
            social_profiles=social_profiles,
            pii_anonymized=is_anonymized
        )

    match_result = models.SkillMatchResult(
        resume_id=resume.id,
        jd_id=jd.id,
        match_score=report.match_score,
        matched_skills=report.matched_skills,
        missing_skills=report.missing_critical_skills
    )
    db.add(match_result)
    db.commit()
    db.refresh(match_result)

    report.match_id = match_result.id
    return report
