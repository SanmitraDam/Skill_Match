"""
FastAPI Router for Production Input DNA Matrix Engine (v26.0)
Exposes enterprise endpoints for PDF parsing, Lightcast taxonomy alignment,
and 384-d dense vector cosine matching.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.dna_matrix_engine import dna_engine, SkillGapReport

router = APIRouter(prefix="/dna-matrix", tags=["Input DNA Matrix"])

class MatchSkillsRequest(BaseModel):
    candidate_skills: List[str]
    required_skills: List[str]

class ParseSkillsRequest(BaseModel):
    text: str

@router.get("/health")
def dna_matrix_health():
    """Health check for Production Input DNA Matrix Engine."""
    return {
        "status": "OPERATIONAL",
        "engine": "DNAMatrixEngine-v26.0",
        "embedding_model": "all-MiniLM-L6-v2",
        "vector_dim": 384,
        "taxonomy": "Lightcast Open Skills Alignment",
        "sla": "<=150ms stream extraction"
    }

@router.post("/parse-skills")
def parse_skills_from_text(req: ParseSkillsRequest):
    """Extracts and canonicalizes technical skills from raw text."""
    skills = dna_engine.parse_skills(req.text)
    return {
        "count": len(skills),
        "skills": skills
    }

@router.post("/match", response_model=SkillGapReport)
def compute_skill_dna_match(req: MatchSkillsRequest):
    """Computes 384-d vector cosine similarity and gap partitioning."""
    return dna_engine.compute_skill_dna_match(req.candidate_skills, req.required_skills)

@router.post("/parse-resume")
async def parse_resume_document(file: UploadFile = File(...)):
    """Uploads a resume PDF and extracts text and canonical skills in <= 150 ms."""
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        raw_text = dna_engine.extract_text_from_pdf(content)
        skills = dna_engine.parse_skills(raw_text)
        return {
            "filename": file.filename,
            "word_count": len(raw_text.split()),
            "skills": skills,
            "raw_text_preview": raw_text[:500]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting PDF: {str(e)}")

@router.post("/full-pipeline", response_model=SkillGapReport)
async def full_ingestion_pipeline(
    file: UploadFile = File(...),
    jd_text: str = Form(...)
):
    """Executes full multi-stage pipeline: PDF Ingestion -> Lightcast Normalization -> Dense Matching."""
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        return dna_engine.execute_pipeline(content, jd_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")
