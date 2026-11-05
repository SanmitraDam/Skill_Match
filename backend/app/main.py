import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.models.database import engine, Base, ensure_schema_compatibility
from app.models import models

STATIC_DIR = Path(__file__).resolve().parent / "static"

# Master Unified Platform Routers strictly mapped to suggestion.md (v26.0 Master Blueprint)
from app.api import (
    auth,
    telemetry,
    skills,
    dna_matrix,
    quiz,
    rl_adaptive,
    interview,
    readiness,
    flashcards,
    sandbox,
    behavioral,
    forensic,
    vision_proctor,
    audio_proctor,
    browser_guard,
    proctoring_pts,
    zk_proctor,
    ats_gateway,
    offer_clearance,
    rlahf_calibration,
    talent_exchange,
    talent_mobility,
    cv,
    storage,
)

models.Base.metadata.create_all(bind=engine)
ensure_schema_compatibility(engine)

# Seed sample resumes for instant local demo if not present
from app.models.database import SessionLocal
with SessionLocal() as db_session:
    if db_session.query(models.Resume).count() == 0:
        sample_1 = models.Resume(
            file_path="Sample_FullStack_Engineer_Resume.pdf",
            extracted_text="Full-Stack Engineer experienced in Python, Go, Angular, FastAPI, PostgreSQL, Git, Docker, and microservices.",
            parsed_skills=["python", "go", "angular", "fastapi", "postgresql", "git", "docker", "linux"]
        )
        sample_2 = models.Resume(
            file_path="Sample_AI_Engineer_Resume.pdf",
            extracted_text="AI/ML Engineer with deep knowledge of Python, PyTorch, SpaCy, Scikit-Learn, Pandas, NumPy, FastAPI, and pgvector.",
            parsed_skills=["python", "pytorch", "spacy", "scikit-learn", "pandas", "numpy", "fastapi", "pgvector"]
        )
        db_session.add_all([sample_1, sample_2])
        db_session.commit()

os.makedirs(STATIC_DIR / "audio" / "recordings", exist_ok=True)

app = FastAPI(
    title="SkillMatch DNA — Unified Master Architecture Platform",
    description="Production Input DNA Matrix, Adaptive CAT Quiz Studio, Voice AI Mock Interview, WASM Live Code Sandbox, Multi-Modal AI Proctoring, and Enterprise ATS Talent Exchange.",
    version="26.0.0-MASTER-UNIFIED-PLATFORM"
)

# Enable CORS for localhost and deployed frontend applications (Vercel)
raw_origins = getattr(settings, "ALLOWED_ORIGINS", "*")
if raw_origins and raw_origins != "*":
    cors_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
else:
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")

# Core Unified Architectural Pillar Routers (suggestion.md)

# Authentication & Base Telemetry
app.include_router(auth.router)
app.include_router(telemetry.router)

# Pillar 1: Production Input DNA Matrix & Skills Ingestion
app.include_router(skills.router)
app.include_router(dna_matrix.router)

# Pillar 2: Gamified Adaptive CAT Quiz Studio & PPO Agent
app.include_router(quiz.router)
app.include_router(rl_adaptive.router)

# Pillar 3: Spatial Voice AI Mock Interview Room
app.include_router(interview.router)
app.include_router(readiness.router)

# Pillar 4: Browser-Based WASM Live Coding Sandbox & Forensics
app.include_router(sandbox.router)
app.include_router(behavioral.router)
app.include_router(forensic.router)

# Pillar 5: Topic-Wise Spatial Flashcards & SM-2 Spaced Repetition
app.include_router(flashcards.router)

# Pillar 6: Multi-Modal AI Proctoring & Zero-Knowledge Compliance
app.include_router(vision_proctor.router)
app.include_router(audio_proctor.router)
app.include_router(browser_guard.router)
app.include_router(proctoring_pts.router)
app.include_router(zk_proctor.router)

# Pillar 7: Enterprise ATS Integration & Global Talent Exchange
app.include_router(ats_gateway.router)
app.include_router(offer_clearance.router)
app.include_router(rlahf_calibration.router)
app.include_router(talent_exchange.router)
app.include_router(talent_mobility.router)
app.include_router(cv.router)

# API v1 Aliases for Gateway & Client Compatibility
app.include_router(auth.router, prefix="/api/v1")
app.include_router(skills.router, prefix="/api/v1")
app.include_router(dna_matrix.router, prefix="/api/v1")
app.include_router(quiz.router, prefix="/api/v1")
app.include_router(interview.router, prefix="/api/v1")
app.include_router(readiness.router, prefix="/api/v1")
app.include_router(flashcards.router, prefix="/api/v1")
app.include_router(sandbox.router, prefix="/api/v1")
app.include_router(behavioral.router, prefix="/api/v1")
app.include_router(forensic.router, prefix="/api/v1")
app.include_router(ats_gateway.router, prefix="/api/v1")
app.include_router(offer_clearance.router, prefix="/api/v1")
app.include_router(rlahf_calibration.router, prefix="/api/v1")
app.include_router(talent_exchange.router, prefix="/api/v1")
app.include_router(telemetry.router, prefix="/api/v1")
app.include_router(vision_proctor.router, prefix="/api/v1")
app.include_router(audio_proctor.router, prefix="/api/v1")
app.include_router(browser_guard.router, prefix="/api/v1")
app.include_router(proctoring_pts.router, prefix="/api/v1")
app.include_router(zk_proctor.router, prefix="/api/v1")
app.include_router(cv.router, prefix="/api/v1")
app.include_router(storage.router, prefix="/api/v1")

# Gateway alias endpoints
app.add_api_route("/api/v1/resume/upload", skills.parse_resume, methods=["POST"], tags=["Gateway Aliases"])
app.add_api_route("/api/v1/jd/analyze", skills.parse_jd, methods=["POST"], tags=["Gateway Aliases"])
app.add_api_route("/api/v1/match/{resume_id}/{jd_id}", skills.match_skills_get, methods=["GET"], tags=["Gateway Aliases"])
app.add_api_route("/api/v1/readiness/roadmap/{readiness_id}", readiness.generate_roadmap, methods=["POST", "GET"], tags=["Gateway Aliases"], operation_id="gateway_alias_generate_roadmap")

@app.get("/")
async def root(request: Request):
    accept = request.headers.get("accept", "")
    host = request.headers.get("host", "localhost:3000")
    if "application/json" in accept and "text/html" not in accept:
        return {
            "message": "Welcome to SkillMatch DNA Master Unified Architecture Platform.",
            "ui": f"http://{host}/",
            "docs": f"http://{host}/docs",
            "version": app.version
        }
    index_file = STATIC_DIR / "index.html"
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "message": "Welcome to SkillMatch DNA Master Unified Architecture Platform.",
        "ui": f"http://{host}/",
        "docs": f"http://{host}/docs",
        "version": app.version
    }

@app.get("/api/health")
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "SkillMatch DNA AI Engine",
        "version": app.version,
        "blueprint": "suggestion.md"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
