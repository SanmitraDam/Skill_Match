from pydantic import BaseModel, Field
from typing import List, Optional

class MCQQuestion(BaseModel):
    question: str
    options: List[str] = Field(..., min_length=4, max_length=4)
    correct_option_index: int = Field(..., ge=0, le=3)
    difficulty: int = Field(..., ge=1, le=5)
    skill_targeted: str
    code_snippet: Optional[str] = None
    question_type: str = "mcq"  # "mcq" or "code_challenge"
    theta_ability: Optional[float] = None
    item_difficulty_b: Optional[float] = None
    item_discrimination_a: Optional[float] = None

class QuizResponse(BaseModel):
    question_id: int
    selected_option_index: int

class QuizSession(BaseModel):
    session_id: int
    current_difficulty: int
    questions_answered: int
    total_correct: int
    target_skills: List[str]
    theta_ability: float = 0.0

class QuizFinalResult(BaseModel):
    score: float
    difficulty_reached: int
    theta_final: Optional[float] = None
    performance_summary: str
