from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class WeightedGap(BaseModel):
    skill: str
    category: str
    criticality: str  # high, medium, standard
    gap_weight: float

class SkillTaxonomy(BaseModel):
    hard_technical: List[str] = []
    soft_skills: List[str] = []
    domain_tools: List[str] = []

class SkillGapReport(BaseModel):
    match_score: float = Field(..., ge=0.0, le=100.0)
    matched_skills: List[str]
    missing_critical_skills: List[str]
    recommended_quiz_focus: List[str]
    match_id: Optional[int] = None
    taxonomy: Optional[SkillTaxonomy] = None
    weighted_gaps: Optional[List[WeightedGap]] = None
    social_profiles: Optional[Dict[str, Optional[str]]] = None
    pii_anonymized: bool = False

class ResumeUpload(BaseModel):
    file_path: str

class JobDescriptionUpload(BaseModel):
    text: str

class UserSkills(BaseModel):
    skills: List[str]

class SkillMatchRequest(BaseModel):
    resume_id: int
    jd_id: int
