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
    match_result = db.query(models.SkillMatchResult).filter(models.SkillMatchResult.id == match_result_id).first()
    if not match_result:
        raise HTTPException(status_code=404, detail="Match result not found.")

    target_skills = match_result.missing_skills or ["Python", "FastAPI", "SQL"]
    session_id = random.randint(1000, 9999)

    active_sessions[session_id] = {
        "match_result_id": match_result_id,
        "current_difficulty": 3,
        "theta_ability": 0.0,  # Center of IRT scale [-3, +3]
        "questions_answered": 0,
        "total_correct": 0,
        "peak_difficulty": 3,
        "target_skills": target_skills,
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

    skill = random.choice(session["target_skills"])
    question = await cat_engine.generate_question(
        skill=skill,
        difficulty=session["current_difficulty"],
        theta=session["theta_ability"]
    )

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

    # Save result to DB
    quiz_result = models.QuizResult(
        match_result_id=session["match_result_id"],
        score=final_score,
        difficulty_reached=session["peak_difficulty"]
    )
    db.add(quiz_result)
    db.commit()
    db.refresh(quiz_result)

    return {
        "score": final_score,
        "difficulty_reached": session["peak_difficulty"],
        "theta_final": session["theta_ability"],
        "summary": f"Completed {session['questions_answered']} questions with {session['total_correct']} correct. Final IRT Ability Theta: {session['theta_ability']}."
    }
