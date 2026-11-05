from pydantic import BaseModel
from typing import List, Dict, Optional

class ResumeParseResponse(BaseModel):
    resume_id: int
    skills: List[str]
    taxonomy: Dict[str, List[str]]
    social_profiles: Dict[str, Optional[str]]
    pii_anonymized: bool

class JDParseResponse(BaseModel):
    jd_id: int
    required_skills: List[str]
    taxonomy: Dict[str, List[str]]
