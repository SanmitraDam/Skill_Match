from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import fitz  # PyMuPDF
import spacy
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import json
import asyncio
import httpx
import edge_tts
from faster_whisper import WhisperModel
import os

nlp = spacy.load("en_core_web_sm")
embedder = SentenceTransformer('all-MiniLM-L6-v2')
stt_model = WhisperModel("base", device="cpu", compute_type="int8")

app = FastAPI(title="SkillMatch AI Internal Service")

class MatchRequest(BaseModel):
    resume_text: str
    jd_text: str

class MatchResponse(BaseModel):
    score: float
    matched_skills: List[str]
    missing_skills: List[str]

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    difficulty: int
    skill: str

class AIWorker:
    def extract_skills(self, text: str) -> List[str]:
        # Simplified keyword matching for prototype
        keywords = {"python", "go", "angular", "postgresql", "pgvector", "react native", "fastapi", "javascript", "typescript"}
        text_lower = text.lower()
        return [s for s in keywords if s in text_lower]

    def calculate_match(self, resume_text: str, jd_text: str) -> MatchResponse:
        resume_vec = embedder.encode([resume_text])[0].reshape(1, -1)
        jd_vec = embedder.encode([jd_text])[0].reshape(1, -1)
        score = float(cosine_similarity(resume_vec, jd_vec)[0][0] * 100)

        res_skills = set(self.extract_skills(resume_text))
        jd_skills = set(self.extract_skills(jd_text))

        return MatchResponse(
            score=score,
            matched_skills=list(res_skills.intersection(jd_skills)),
            missing_skills=list(jd_skills - res_skills)
        )

ai_worker = AIWorker()

@app.post("/analyze/match", response_model=MatchResponse)
async def analyze_match(req: MatchRequest):
    return ai_worker.calculate_match(req.resume_text, req.jd_text)

@app.post("/quiz/generate")
async def generate_quiz_question(skill: str, difficulty: int):
    # In a real scenario, this calls Groq/Gemini
    return {
        "question": f"Explain a complex scenario where {skill} is essential.",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_index": 0,
        "difficulty": difficulty,
        "skill": skill
    }

@app.post("/voice/tts")
async def text_to_speech(text: str, filename: str):
    path = f"static/audio/{filename}"
    communicate = edge_tts.Communicate(text, "en-US-ChristopherNeural")
    await communicate.save(path)
    return {"url": path}

@app.post("/voice/stt")
async def speech_to_text(file_path: str):
    segments, _ = stt_model.transcribe(file_path)
    return {"transcript": " ".join([s.text for s in segments])}

if __name__ == "__main__":
    import uvicorn
    # Create audio dir
    os.makedirs("static/audio", exist_ok=True)
    uvicorn.run(app, host="0.0.0.0", port=8001)
