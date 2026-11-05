from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SpeechMetrics(BaseModel):
    cadence_wpm: float = 0.0
    filler_words_count: int = 0
    filler_words_detected: List[str] = []
    pacing_rating: str = "Optimal (120-160 WPM)"
    total_words: int = 0
    articulation_rate: float = 3.8
    hesitation_index: float = 4.5
    pause_count: int = 2
    snr_db: float = 28.6
    sqi_clarity: float = 0.95

class InterviewEvaluation(BaseModel):
    technical_accuracy_score: float = Field(..., ge=0.0, le=100.0)
    communication_clarity_score: float = Field(..., ge=0.0, le=100.0)
    architectural_depth_score: float = 85.0
    tradeoff_analysis_score: float = 80.0
    failure_modes_score: float = 78.0
    key_strengths: List[str]
    key_improvement_areas: List[str]
    overall_feedback: str
    speech_metrics: Optional[SpeechMetrics] = None
    concept_coverage: Optional[Dict[str, List[str]]] = None
    rubric_breakdown: Optional[Dict[str, Any]] = None
    latency_telemetry: Optional[Dict[str, Any]] = None
    research_recommendations: Optional[List[str]] = None

class InterviewQuestion(BaseModel):
    question_text: str
    audio_url: str
    skill_targeted: str

class InterviewResponse(BaseModel):
    audio_file_path: str
    transcript: Optional[str] = None

