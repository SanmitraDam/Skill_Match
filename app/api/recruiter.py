from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.models.database import get_db
from app.models import models
from app.api.auth import get_current_user
from app.services.vector_matcher import vector_matcher
from app.services.parser import parser

router = APIRouter(prefix="/recruiter", tags=["Recruiter Portal"])

@router.get("/candidates")
async def get_candidate_rankings(
    min_ccrs: float = Query(0.0, ge=0.0, le=100.0),
    skill_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns ranked candidates based on Composite Career Readiness Score (CCRS)
    and verified component evaluations.
    """
    matches = db.query(models.SkillMatchResult).all()
    candidate_list = []

    for m in matches:
        resume = m.resume
        jd = m.jd
        quiz = m.quiz_result
        interview = m.interview_result
        readiness = m.readiness_score

        candidate_name = resume.owner.username if resume and resume.owner else f"Candidate #{m.id}"
        candidate_email = resume.owner.email if resume and resume.owner else f"candidate_{m.id}@skillmatch.dev"

        ccrs_val = readiness.composite_score if readiness else (
            round((m.match_score * 0.3) + ((quiz.score if quiz else 70.0) * 0.35) + ((interview.score if interview else 70.0) * 0.35), 1)
        )

        if ccrs_val < min_ccrs:
            continue

        matched_skills = m.matched_skills or []
        if skill_filter and skill_filter.lower() not in [s.lower() for s in matched_skills]:
            continue

        socials = parser.extract_social_profiles(resume.extracted_text or "") if resume else {}

        candidate_list.append({
            "match_id": m.id,
            "candidate_name": candidate_name,
            "candidate_email": candidate_email,
            "ccrs": ccrs_val,
            "certification_status": "CERTIFIED" if ccrs_val >= 80.0 else "IN_PROGRESS",
            "match_score": m.match_score,
            "quiz_score": quiz.score if quiz else None,
            "quiz_peak_difficulty": quiz.difficulty_reached if quiz else None,
            "interview_score": interview.score if interview else None,
            "matched_skills_count": len(matched_skills),
            "matched_skills": matched_skills[:5],
            "missing_skills": (m.missing_skills or [])[:3],
            "social_profiles": socials
        })

    # Rank candidates by CCRS descending
    candidate_list.sort(key=lambda x: x["ccrs"], reverse=True)
    for idx, c in enumerate(candidate_list, 1):
        c["rank"] = idx

    return {
        "total_candidates": len(candidate_list),
        "rankings": candidate_list
    }

@router.get("/candidate/{match_id}/details")
async def get_candidate_deep_dive(match_id: int, db: Session = Depends(get_db)):
    """Provides a hiring manager diagnostic deep dive into a candidate's verified DNA."""
    match = db.query(models.SkillMatchResult).filter(models.SkillMatchResult.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Candidate evaluation record not found.")

    resume = match.resume
    quiz = match.quiz_result
    interview = match.interview_result
    readiness = match.readiness_score

    skills = resume.parsed_skills or [] if resume else []
    taxonomy = parser.categorize_skills(skills)
    socials = parser.extract_social_profiles(resume.extracted_text or "") if resume else {}

    return {
        "match_id": match.id,
        "candidate_name": resume.owner.username if resume and resume.owner else "Candidate",
        "match_score": match.match_score,
        "matched_skills": match.matched_skills,
        "missing_skills": match.missing_skills,
        "taxonomy": taxonomy,
        "social_profiles": socials,
        "quiz_evaluation": {
            "score": quiz.score if quiz else "Not Completed",
            "peak_difficulty": quiz.difficulty_reached if quiz else "N/A"
        },
        "interview_evaluation": {
            "score": interview.score if interview else "Not Completed",
            "feedback": interview.feedback if interview else {}
        },
        "composite_readiness_score": readiness.composite_score if readiness else None,
        "certification_status": "CERTIFIED" if (readiness and readiness.composite_score >= 80.0) else "IN_PROGRESS"
    }
