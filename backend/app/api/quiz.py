from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models import models
from app.schemas.quiz import MCQQuestion, QuizResponse, QuizSession, QuizFinalResult
from app.services.cat_engine import cat_engine
import random
from typing import Dict

router = APIRouter(prefix="/quiz", tags=["Quiz"])

# In-memory store for active quiz sessions (In production, use Redis)
active_sessions: Dict[int, Dict] = {}

@router.post("/start/{match_result_id}")
async def start_quiz(match_result_id: int, db: Session = Depends(get_db)):
    match_result = None
    try:
        match_result = db.query(models.SkillMatchResult).filter(models.SkillMatchResult.id == match_result_id).first()
    except Exception:
        pass

    target_skills = []
    if match_result and match_result.missing_skills:
        target_skills = list(match_result.missing_skills)

    if not target_skills:
        target_skills = [
            "FastAPI", "Python", "PostgreSQL", "Docker", "Redis",
            "Distributed Systems", "Kubernetes", "TypeScript", "React", "Kafka", "System Design"
        ]

    random.shuffle(target_skills)
    session_id = random.randint(1000, 9999)

    active_sessions[session_id] = {
        "match_result_id": match_result_id,
        "current_difficulty": 3,
        "theta_ability": 0.0,  # Center of IRT scale [-3, +3]
        "questions_answered": 0,
        "total_correct": 0,
        "peak_difficulty": 3,
        "target_skills": target_skills,
        "skill_index": 0,
        "asked_question_ids": set(),
        "current_question": None
    }

    return {
        "session_id": session_id,
        "target_skills": target_skills,
        "initial_difficulty": 3,
        "theta_ability": 0.0
    }

@router.post("/next-question/{session_id}")
async def get_next_question(session_id: int):
    session = active_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Quiz session not found or expired.")

    skills = session.get("target_skills") or ["FastAPI", "Python", "PostgreSQL", "Docker", "Redis"]
    skill_idx = session.get("skill_index", 0)
    skill = skills[skill_idx % len(skills)]
    session["skill_index"] = skill_idx + 1

    asked_ids = session.setdefault("asked_question_ids", set())

    question = await cat_engine.generate_question(
        skill=skill,
        difficulty=session["current_difficulty"],
        theta=session["theta_ability"],
        asked_ids=asked_ids
    )

    item_id = getattr(question, "_item_id", None) or question.question
    asked_ids.add(item_id)
    asked_ids.add(question.question)

    session["current_question"] = question
    return question

@router.post("/submit-answer/{session_id}")
async def submit_answer(session_id: int, response: QuizResponse):
    session = active_sessions.get(session_id)
    if not session or not session["current_question"]:
        raise HTTPException(status_code=400, detail="No active question for this session.")

    question: MCQQuestion = session["current_question"]
    is_correct = response.selected_option_index == question.correct_option_index

    session["questions_answered"] += 1
    if is_correct:
        session["total_correct"] += 1

    # 2PL IRT Fisher Information ability update
    discrimination = question.item_discrimination_a or 1.2
    new_theta, new_diff = cat_engine.update_ability_irt_2pl(
        current_theta=session["theta_ability"],
        difficulty=session["current_difficulty"],
        is_correct=is_correct,
        a=discrimination
    )

    session["theta_ability"] = new_theta
    session["current_difficulty"] = new_diff
    session["peak_difficulty"] = max(session["peak_difficulty"], new_diff)
    session["current_question"] = None

    return {
        "correct": is_correct,
        "correct_answer": question.correct_option_index,
        "new_difficulty": new_diff,
        "theta_ability": new_theta,
        "item_difficulty_b": question.item_difficulty_b
    }

@router.post("/finish/{session_id}")
async def finish_quiz(session_id: int, db: Session = Depends(get_db)):
    session = active_sessions.pop(session_id, None)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    final_score = cat_engine.calculate_final_score(
        total_questions=session["questions_answered"],
        correct_answers=session["total_correct"],
        peak_difficulty=session["peak_difficulty"],
        final_theta=session["theta_ability"]
    )

    # Save result to DB if match_result exists
    match_result_id = session.get("match_result_id")
    try:
        match_result = db.query(models.SkillMatchResult).filter(models.SkillMatchResult.id == match_result_id).first()
        if match_result:
            quiz_result = models.QuizResult(
                match_result_id=match_result_id,
                score=final_score,
                difficulty_reached=session["peak_difficulty"]
            )
            db.add(quiz_result)
            db.commit()
            db.refresh(quiz_result)
    except Exception:
        db.rollback()

    return {
        "score": final_score,
        "difficulty_reached": session["peak_difficulty"],
        "theta_final": session["theta_ability"],
        "summary": f"Completed {session['questions_answered']} questions with {session['total_correct']} correct. Final IRT Ability Theta: {session['theta_ability']}."
    }
