from pydantic import BaseModel, Field
from typing import List, Dict

class WeeklyGoal(BaseModel):
    week: int
    focus_skill: str
    learning_objectives: List[str]
    suggested_resources: List[str]

class RoadmapPlan(BaseModel):
    candidate_name: str
    readiness_score: float
    weekly_plan: List[WeeklyGoal]
    final_advice: str
