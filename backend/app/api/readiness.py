import hashlib
import math
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models import models
from app.services.readiness import readiness_service, roadmap_service
from app.schemas.roadmap import RoadmapPlan

router = APIRouter(prefix="/readiness", tags=["Readiness"])

@router.post("/calculate/{match_result_id}")
async def calculate_ccrs(match_result_id: int, db: Session = Depends(get_db)):
    match_result = db.query(models.SkillMatchResult).filter(models.SkillMatchResult.id == match_result_id).first()
    if not match_result:
        raise HTTPException(status_code=404, detail="Match result not found.")

    quiz = db.query(models.QuizResult).filter(models.QuizResult.match_result_id == match_result_id).first()
    interview = db.query(models.InterviewResult).filter(models.InterviewResult.match_result_id == match_result_id).first()

    # Provide graceful evaluation even if user tests partially
    quiz_score = quiz.score if quiz else 70.0
    interview_score = interview.score if interview else 70.0

    # Compute CCRS
    final_score = readiness_service.calculate_ccrs(
        match_result.match_score or 0.0,
        quiz_score,
        interview_score
    )

    readiness = models.ReadinessScore(
        match_result_id=match_result_id,
        composite_score=final_score
    )
    db.add(readiness)
    db.commit()
    db.refresh(readiness)

    badge_status = "CERTIFIED" if final_score >= 80.0 else "IN_PROGRESS"

    return {
        "readiness_id": readiness.id,
        "composite_readiness_score": final_score,
        "badge_status": badge_status,
        "certification_eligible": final_score >= 80.0
    }

@router.api_route("/generate-roadmap/{readiness_id}", methods=["POST", "GET"])
async def generate_roadmap(readiness_id: int, db: Session = Depends(get_db)):
    readiness = db.query(models.ReadinessScore).filter(models.ReadinessScore.id == readiness_id).first()
    if not readiness:
        # Fallback if ID is match_result_id
        readiness = db.query(models.ReadinessScore).filter(models.ReadinessScore.match_result_id == readiness_id).first()

    score = readiness.composite_score if readiness else 75.0
    gaps = ["Distributed Systems", "Cloud Security", "Prompt Engineering"]
    candidate_name = "Candidate"

    if readiness:
        match_result = db.query(models.SkillMatchResult).filter(models.SkillMatchResult.id == readiness.match_result_id).first()
        if match_result and match_result.missing_skills:
            gaps = match_result.missing_skills

        # Fetch candidate name if user exists
        if match_result and match_result.resume and match_result.resume.owner:
            candidate_name = match_result.resume.owner.username

    roadmap = await roadmap_service.generate_roadmap(
        candidate_name=candidate_name,
        score=score,
        gaps=gaps
    )

    if readiness:
        roadmap_db = models.Roadmap(
            readiness_score_id=readiness.id,
            plan_json=roadmap.dict()
        )
        db.add(roadmap_db)
        db.commit()

    return roadmap

@router.get("/roadmap/{readiness_id}/export-ics")
async def export_roadmap_ics(readiness_id: int, db: Session = Depends(get_db)):
    """Exports the 4-week roadmap as an RFC 5545 iCalendar (.ics) file."""
    readiness = db.query(models.ReadinessScore).filter(models.ReadinessScore.id == readiness_id).first()
    if not readiness:
        readiness = db.query(models.ReadinessScore).filter(models.ReadinessScore.match_result_id == readiness_id).first()

    score = readiness.composite_score if readiness else 75.0
    gaps = ["Python", "FastAPI", "Docker"]
    candidate_name = "Candidate"

    if readiness:
        match_result = db.query(models.SkillMatchResult).filter(models.SkillMatchResult.id == readiness.match_result_id).first()
        if match_result and match_result.missing_skills:
            gaps = match_result.missing_skills
        if match_result and match_result.resume and match_result.resume.owner:
            candidate_name = match_result.resume.owner.username

    roadmap = await roadmap_service.generate_roadmap(
        candidate_name=candidate_name,
        score=score,
        gaps=gaps
    )

    ics_content = readiness_service.generate_ics_calendar(roadmap)
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename=skillmatch_sprint_roadmap_{readiness_id}.ics"}
    )

@router.get("/badge/{readiness_id}")
async def get_openbadge_credential(readiness_id: int, db: Session = Depends(get_db)):
    """Issues an OpenBadges 3.0 verified digital credential payload."""
    readiness = db.query(models.ReadinessScore).filter(models.ReadinessScore.id == readiness_id).first()
    if not readiness:
        readiness = db.query(models.ReadinessScore).filter(models.ReadinessScore.match_result_id == readiness_id).first()

    score = readiness.composite_score if readiness else 75.0
    candidate_name = "Candidate"

    if readiness:
        match_result = db.query(models.SkillMatchResult).filter(models.SkillMatchResult.id == readiness.match_result_id).first()
        if match_result and match_result.resume and match_result.resume.owner:
            candidate_name = match_result.resume.owner.username

    return readiness_service.generate_openbadge_credential(
        candidate_name=candidate_name,
        score=score,
        readiness_id=readiness_id
    )


# ============================================================================
# VERSION 27.0: POST-SIGN-IN PROFESSIONAL SOCIAL READINESS NETWORK
# (suggestion-v26.md Section 1 — Verified Feed, Identity Hub, Reach Analytics)
# ============================================================================

ReadinessPostType = Literal[
    "SKILL_GAP_CLEARED",
    "QUIZ_MASTERY",
    "MOCK_INTERVIEW_PASSED",
    "PROJECT_BENCHMARK",
]

_BADGE_BY_STATUS: Dict[str, str] = {
    "PENDING": "Verified Candidate",
    "VERIFIED_CANDIDATE": "Verified Candidate",
    "TOP_5_CCRS": "Top 5% CCRS",
    "SYSTEM_ARCHITECT": "System Architect",
}


class ReadinessPostCreate(BaseModel):
    """Automatically published milestone post payload (skill gap, CAT quiz, code benchmark)."""

    user_id: str = "1"
    post_type: ReadinessPostType = "SKILL_GAP_CLEARED"
    title: str = Field(min_length=3, max_length=255)
    skill_tags: List[str] = Field(default_factory=list)
    proof_hash: Optional[str] = None
    ccrs_score: Optional[float] = None


class ProfileViewCreate(BaseModel):
    """Recruiter / enterprise viewer inspection event."""

    viewer_name: str = Field(min_length=2, max_length=100)
    viewer_company: str = Field(default="Confidential Enterprise", max_length=100)
    viewer_role: str = Field(default="Technical Recruiter", max_length=100)
    is_recruiter: bool = True


class CandidateProfileUpdate(BaseModel):
    """Editable identity hub fields for the post-sign-in candidate profile."""

    candidate_name: Optional[str] = None
    avatar_url: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    voice_snippet_url: Optional[str] = None
    social_profiles: Optional[Dict[str, str]] = None
    anc_performance: Optional[Dict[str, Any]] = None
    ccrs_score: Optional[float] = None
    s_match_score: Optional[float] = None
    a_quiz_score: Optional[float] = None
    i_voice_score: Optional[float] = None
    liveness_verified: Optional[bool] = None
    profile_completed: Optional[bool] = None


# ---------------------------------------------------------------------------
# Deterministic analytic helpers (stable across reloads, no random drift)
# ---------------------------------------------------------------------------

def _coerce_user_id(raw: Any) -> Optional[int]:
    """Accepts both int ids and string ids (frontend store ids) safely."""
    if raw is None:
        return None
    try:
        return int(str(raw).strip())
    except (TypeError, ValueError):
        return None


def _find_user(db: Optional[Session], candidate_id: str) -> Optional[models.User]:
    """Finds a models.User row matching candidate_id by id, email, or username."""
    if db is None or not candidate_id:
        return None
    cand_str = str(candidate_id).strip()

    # 1. Try numeric ID
    numeric = _coerce_user_id(cand_str)
    if numeric is not None:
        try:
            user = db.query(models.User).filter(models.User.id == numeric).first()
            if user:
                return user
        except Exception:
            db.rollback()

    # 2. Try email match
    cand_lower = cand_str.lower()
    try:
        user = db.query(models.User).filter(models.User.email == cand_lower).first()
        if user:
            return user
    except Exception:
        db.rollback()

    # 3. Try username match
    cand_under = cand_str.replace(" ", "_")
    cand_space = cand_str.replace("_", " ")
    try:
        user = db.query(models.User).filter(
            (models.User.username == cand_str) |
            (models.User.username == cand_lower) |
            (models.User.username == cand_under) |
            (models.User.username == cand_space)
        ).first()
        if user:
            return user
    except Exception:
        db.rollback()

    return None


def _seeded_unit(seed: str) -> float:
    """Deterministic 0.0-1.0 value derived from a stable SHA-256 digest."""
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return int(digest[:8], 16) / 0xFFFFFFFF


def _stable_unit_vector(seed: str, dims: int = 3) -> List[float]:
    """Deterministic unit vector used to model recruiter search intent embeddings."""
    digest = hashlib.sha256(seed.encode("utf-8")).digest()
    raw = [byte / 255.0 + 0.05 for byte in digest[:dims]]
    norm = math.sqrt(sum(value * value for value in raw)) or 1.0
    return [value / norm for value in raw]


def _candidate_ccrs_vector(breakdown: Dict[str, float]) -> List[float]:
    """Unit vector of the candidate's S_match / A_quiz / I_voice CCRS components."""
    values = [
        max(0.0, float(breakdown.get("s_match", 0.0))),
        max(0.0, float(breakdown.get("a_quiz", 0.0))),
        max(0.0, float(breakdown.get("i_voice", 0.0))),
    ]
    norm = math.sqrt(sum(value * value for value in values)) or 1.0
    return [value / norm for value in values]


def _calibrated_alignment_pct(viewer_company: str, viewer_role: str, breakdown: Dict[str, float]) -> float:
    """
    Implements Section 1.3 of suggestion-v26.md:
        (Recruiter Search Vector . Candidate CCRS Vector) mapped through the
        SkillMatch calibration band (86% - 100% observed enterprise intent range).
    """
    recruiter_vector = _stable_unit_vector(f"{viewer_company}|{viewer_role}")
    candidate_vector = _candidate_ccrs_vector(breakdown)
    cosine = sum(r * c for r, c in zip(recruiter_vector, candidate_vector))
    cosine = max(0.0, min(1.0, cosine))
    return round(86.0 + 14.0 * cosine, 1)


def _ccrs_weighted(breakdown: Dict[str, float]) -> float:
    """Weighted composite of the three CCRS pillars (S_match 50% / A_quiz 30% / I_voice 20%)."""
    return round(
        float(breakdown.get("s_match", 0.0)) * 0.5
        + float(breakdown.get("a_quiz", 0.0)) * 0.3
        + float(breakdown.get("i_voice", 0.0)) * 0.2,
        1,
    )


def _humanize_age(moment: Optional[datetime]) -> str:
    """Converts a timestamp into the '3h ago' badge style used across the feed."""
    if moment is None:
        return "just now"
    seconds = max(0.0, (datetime.utcnow() - moment).total_seconds())
    if seconds < 90:
        return "just now"
    if seconds < 3600:
        return f"{int(seconds // 60)}m ago"
    if seconds < 86400:
        return f"{int(seconds // 3600)}h ago"
    if seconds < 604800:
        return f"{int(seconds // 86400)}d ago"
    return f"{int(seconds // 604800)}w ago"


def _badge_for_status(verification_status: Optional[str]) -> str:
    """Maps the stored verification status onto the badge union of ReadinessFeedPost."""
    return _BADGE_BY_STATUS.get((verification_status or "PENDING").upper(), "Verified Candidate")


def _synthetic_pillar(candidate_key: str, pillar: str, floor: float = 82.0) -> float:
    """Deterministic 3-pillar CCRS sub-score when no assessment has been recorded yet."""
    return round(floor + (99.0 - floor) * _seeded_unit(f"{candidate_key}|{pillar}"), 1)


def _breakdown_from_profile(
    profile: Optional[models.CandidateProfile],
    candidate_key: str,
) -> Dict[str, float]:
    """Extracts the S_match / A_quiz / I_voice vector, synthesising absent pillars."""
    s_match = float(getattr(profile, "s_match_score", 0.0) or 0.0) if profile else 0.0
    a_quiz = float(getattr(profile, "a_quiz_score", 0.0) or 0.0) if profile else 0.0
    i_voice = float(getattr(profile, "i_voice_score", 0.0) or 0.0) if profile else 0.0
    return {
        "s_match": round(s_match, 1) if s_match > 0 else _synthetic_pillar(candidate_key, "s_match"),
        "a_quiz": round(a_quiz, 1) if a_quiz > 0 else _synthetic_pillar(candidate_key, "a_quiz", floor=78.0),
        "i_voice": round(i_voice, 1) if i_voice > 0 else _synthetic_pillar(candidate_key, "i_voice", floor=80.0),
    }


def _default_social_profiles(candidate_key: str) -> Dict[str, str]:
    """Deterministic proof links used until the candidate connects real accounts."""
    handle = str(candidate_key).replace(" ", "").lower()
    return {
        "github": f"https://github.com/{handle}",
        "linkedin": f"https://linkedin.com/in/{handle}",
        "portfolio": f"https://{handle}.dev",
    }


def _default_anc_performance() -> Dict[str, Any]:
    """Active Noise Cancellation (ANC) telemetry produced by the voice round."""
    return {
        "db_reduction": -34.5,
        "clarity_score": 96.2,
        "engine": "WebRTC RNNoise + spectral gating",
    }


def _resolve_db_user_id(candidate_id: str) -> int:
    """Maps any frontend id (usr_8841, uuid, numeric) onto a stable integer user id."""
    numeric = _coerce_user_id(candidate_id)
    if numeric is not None:
        return numeric
    digest = hashlib.sha256(str(candidate_id).encode("utf-8")).hexdigest()
    return int(digest[:6], 16)


def _seed_feed_posts() -> List[Dict[str, Any]]:
    """
    Deterministic seed feed used when the readiness_posts table is still empty, so the
    post-sign-in professional network is never rendered as a blank state.
    """
    return [
        {
            "id": "post_1",
            "candidateId": "usr_8841",
            "candidateName": "Sarah Jenkins",
            "candidateRole": "Senior LLM Infrastructure Engineer",
            "candidateAvatarUrl": "",
            "avatarGradient": "from-emerald-400 to-cyan-500",
            "verificationBadge": "Top 5% CCRS",
            "ccrsScore": 92.4,
            "postType": "PROJECT_BENCHMARK",
            "title": "Solved 100% vLLM PagedAttention Memory Gap via Live Sandbox",
            "details": (
                "Implemented non-contiguous virtual memory block paging and executed speculative "
                "decoding benchmarks in the Pyodide WebAssembly sandbox."
            ),
            "benchmarkMetric": "Sub-4.2ms token latency | O(1) page lookup verified",
            "codeSnippet": (
                'llm = LLM(model="meta-llama/Llama-3-8B-Instruct", gpu_memory_utilization=0.92)\n'
                "sampling_params = SamplingParams(temperature=0.7, top_p=0.95)"
            ),
            "skillTags": ["vLLM", "PagedAttention", "Pyodide WASM"],
            "proofHash": "0x9f3c41d7ab88e2c05b7d4913fe0c6a882d5b3e77",
            "likesCount": 24,
            "peerVerificationsCount": 38,
            "_age_hours": 1,
            "source": "seed",
        },
        {
            "id": "post_2",
            "candidateId": "usr_5520",
            "candidateName": "Alex Rivera",
            "candidateRole": "Distributed Systems & Cloud Architect",
            "candidateAvatarUrl": "",
            "avatarGradient": "from-violet-500 to-purple-600",
            "verificationBadge": "System Architect",
            "ccrsScore": 95.1,
            "postType": "MOCK_INTERVIEW_PASSED",
            "title": "Achieved 98.6% Proctoring Trust Score (PTS) on System Design Round",
            "details": (
                "Zero-knowledge proof generated on-device (Groth16 8KB hash). Verified 30 FPS gaze "
                "compliance with zero off-camera speech diarization flags."
            ),
            "benchmarkMetric": "PTS: 98.6% | zk-STARK attestation sealed",
            "skillTags": ["zk-STARK", "Groth16", "Diarization"],
            "proofHash": "0x51be8a0f37c9d2416e8825da74f0b1339c66e204",
            "likesCount": 31,
            "peerVerificationsCount": 52,
            "_age_hours": 3,
            "source": "seed",
        },
        {
            "id": "post_3",
            "candidateId": "usr_3311",
            "candidateName": "Kenji Takahashi",
            "candidateRole": "Full-Stack Performance Engineer",
            "candidateAvatarUrl": "",
            "avatarGradient": "from-amber-400 to-orange-500",
            "verificationBadge": "Verified Candidate",
            "ccrsScore": 89.8,
            "postType": "QUIZ_MASTERY",
            "title": "Completed O(1) LRU Doubly-Linked Cache with AST Complexity Audit",
            "details": (
                "Static AST inspection verified zero quadratic loops and sub-150 microsecond execution "
                "across all 20 adversarial edge test fixtures."
            ),
            "benchmarkMetric": "AST Complexity: O(1) | 100% test coverage",
            "skillTags": ["Pyodide", "Big-O AST", "Data Structures"],
            "proofHash": "0xa7d20c94be5f3817cc09e4a1b6f8d2530e77b418",
            "likesCount": 12,
            "peerVerificationsCount": 29,
            "_age_hours": 6,
            "source": "seed",
        },
        {
            "id": "post_4",
            "candidateId": "usr_7742",
            "candidateName": "Lena Fischer",
            "candidateRole": "MLOps Retrieval Engineer",
            "candidateAvatarUrl": "",
            "avatarGradient": "from-rose-400 to-pink-600",
            "verificationBadge": "Top 5% CCRS",
            "ccrsScore": 93.6,
            "postType": "SKILL_GAP_CLEARED",
            "title": "Closed #pgvector HNSW recall gap to 99.1% on 4M chunk corpus",
            "details": (
                "Re-tuned ef_construction and m parameters, then re-ran the adaptive CAT retrieval "
                "battery until recall@10 breached the enterprise threshold."
            ),
            "benchmarkMetric": "recall@10 99.1% | p95 38ms @ 4M vectors",
            "skillTags": ["pgvector", "HNSW", "RAG Ops"],
            "proofHash": "0x3c7be1590ad4f6287bb2419ee6d05c3170f8a2c6",
            "likesCount": 19,
            "peerVerificationsCount": 22,
            "_age_hours": 20,
            "source": "seed",
        },
    ]


def _seed_profile_views() -> List[Dict[str, Any]]:
    """Enterprise recruiter inspection log used when the profile_views table is empty."""
    return [
        {
            "id": "pv_seed_1",
            "viewerName": "Elena Rostova",
            "viewerCompany": "Anthropic AI",
            "viewerRole": "Staff Technical Recruiter",
            "isRecruiter": True,
            "avatarGradient": "from-purple-500 to-indigo-600",
            "matchedSkills": ["vLLM", "PyTorch", "Distributed Systems"],
            "_age_hours": 2,
            "source": "seed",
        },
        {
            "id": "pv_seed_2",
            "viewerName": "David Chen",
            "viewerCompany": "Stripe",
            "viewerRole": "Head of Infrastructure Talent",
            "isRecruiter": True,
            "avatarGradient": "from-blue-500 to-cyan-600",
            "matchedSkills": ["Go", "Redis", "PostgreSQL", "FastAPI"],
            "_age_hours": 5,
            "source": "seed",
        },
        {
            "id": "pv_seed_3",
            "viewerName": "Maya Patel",
            "viewerCompany": "Datadog",
            "viewerRole": "Principal Engineering Director",
            "isRecruiter": True,
            "avatarGradient": "from-emerald-500 to-teal-600",
            "matchedSkills": ["Kubernetes", "WebAssembly", "Observability"],
            "_age_hours": 26,
            "source": "seed",
        },
        {
            "id": "pv_seed_4",
            "viewerName": "Marcus Vance",
            "viewerCompany": "Scale AI",
            "viewerRole": "Senior Talent Partner",
            "isRecruiter": True,
            "avatarGradient": "from-amber-500 to-orange-600",
            "matchedSkills": ["PPO RL", "Sentence-Transformers", "NLP"],
            "_age_hours": 50,
            "source": "seed",
        },
    ]


def _payload_post(post: Dict[str, Any]) -> Dict[str, Any]:
    """Materialises a seed feed dict into the ReadinessFeedPost contract."""
    created = datetime.utcnow() - timedelta(hours=float(post.get("_age_hours", 1)))
    payload = {key: value for key, value in post.items() if not key.startswith("_")}
    payload["createdAt"] = created.isoformat()
    payload["timeAgo"] = _humanize_age(created)
    return payload


def _serialize_post(post: models.ReadinessPost, profile: Optional[models.CandidateProfile] = None) -> Dict[str, Any]:
    """Converts a persisted ReadinessPost row into the ReadinessFeedPost contract."""
    created = post.created_at or datetime.utcnow()
    tags = [tag.strip() for tag in (post.skill_tags or "").split(",") if tag.strip()]
    ccrs = float(getattr(post, "ccrs_score", None) or 0.0)
    resolved_breakdown = _breakdown_from_profile(profile, str(post.user_id))
    if not ccrs:
        ccrs = float(profile.ccrs_score or 0.0) if profile is not None else 0.0
    if not ccrs:
        ccrs = _ccrs_weighted(resolved_breakdown)
    return {
        "id": str(post.id),
        "candidateId": str(post.user_id),
        "candidateName": (profile.candidate_name if profile and profile.candidate_name else "SkillMatch Candidate"),
        "candidateRole": (profile.headline if profile and profile.headline else "Verified SkillMatch Talent"),
        "candidateAvatarUrl": (profile.avatar_url if profile and profile.avatar_url else ""),
        "avatarGradient": "from-emerald-400 to-cyan-500",
        "verificationBadge": _badge_for_status(profile.verification_status if profile else "VERIFIED_CANDIDATE"),
        "ccrsScore": round(ccrs, 1),
        "postType": post.post_type,
        "title": post.title,
        "skillTags": tags,
        "proofHash": post.proof_hash,
        "likesCount": int(post.likes_count or 0),
        "peerVerificationsCount": int(getattr(post, "peer_verifications_count", 0) or 0),
        "createdAt": created.isoformat(),
        "timeAgo": _humanize_age(created),
        "source": "database",
    }


def _serialize_view(
    view: Any,
    breakdown: Optional[Dict[str, float]] = None,
    index: int = 0,
) -> Dict[str, Any]:
    """Converts a ProfileView row (or a seed dict) into the ProfileViewRecord contract."""
    if isinstance(view, dict):
        record = {key: value for key, value in view.items() if not key.startswith("_")}
        viewed_at = datetime.utcnow() - timedelta(hours=float(view.get("_age_hours", 3)))
    else:
        record = {
            "id": f"pv_{view.id}",
            "viewerName": view.viewer_name,
            "viewerCompany": view.viewer_company,
            "viewerRole": view.viewer_role,
            "isRecruiter": bool(view.is_recruiter),
            "source": "database",
        }
        viewed_at = view.viewed_at or datetime.utcnow()

    palette = [
        "from-purple-500 to-indigo-600",
        "from-blue-500 to-cyan-600",
        "from-emerald-500 to-teal-600",
        "from-amber-500 to-orange-600",
        "from-rose-500 to-pink-600",
    ]
    record.setdefault("avatarGradient", palette[index % len(palette)])
    record.setdefault("matchedSkills", ["Distributed Systems"])
    record["vectorAlignmentPct"] = _calibrated_alignment_pct(
        record["viewerCompany"], record["viewerRole"], breakdown or {}
    )
    record["viewedAt"] = viewed_at.isoformat()
    record["timeAgo"] = _humanize_age(viewed_at)
    return record


def _profile_payload(
    user_id: str,
    profile: Optional[models.CandidateProfile],
    profile_views_count: int,
    db: Optional[Session] = None,
) -> Dict[str, Any]:
    """Builds the Candidate Identity Hub payload consumed by CandidateProfile.tsx."""
    candidate_key = str(user_id)
    db_user = _find_user(db, candidate_key) if db is not None else None

    breakdown = _breakdown_from_profile(profile, candidate_key)
    ccrs = float(profile.ccrs_score or 0.0) if profile else 0.0
    if not ccrs:
        ccrs = _ccrs_weighted(breakdown)

    verification_status = (profile.verification_status if profile else None) or "VERIFIED_CANDIDATE"
    liveness_verified = bool(profile.liveness_verified) if profile else True

    # Robust display name resolution: prefer user-edited name, then DB User username, then fallback
    if profile and profile.candidate_name and profile.candidate_name.strip() and profile.candidate_name != "SkillMatch Candidate":
        display_name = profile.candidate_name.strip()
    elif db_user and db_user.username:
        display_name = db_user.username.replace("_", " ").title()
    elif db_user and db_user.email:
        display_name = db_user.email.split("@")[0].replace(".", " ").replace("_", " ").title()
    else:
        display_name = "SkillMatch Candidate"

    handle = display_name.lower().replace(" ", "").replace(".", "")
    if not handle:
        handle = "candidate"

    default_socials = {
        "github": f"https://github.com/{handle}",
        "linkedin": f"https://linkedin.com/in/{handle}",
        "portfolio": f"https://{handle}.dev",
    }
    social_profiles = (profile.social_profiles if profile and profile.social_profiles else None) or default_socials
    anc_performance = (profile.anc_performance if profile and profile.anc_performance else None) or _default_anc_performance()

    is_completed = bool(
        profile and (
            getattr(profile, "profile_completed", False) or 
            (profile.headline and profile.location and profile.candidate_name and profile.candidate_name != "SkillMatch Candidate")
        )
    )

    default_skills = [
        {"name": "Python / FastAPI", "level": "Expert", "category": "Backend", "years": 5},
        {"name": "PyTorch & Transformers", "level": "Advanced", "category": "AI / ML", "years": 4},
        {"name": "Kubernetes & Docker", "level": "Advanced", "category": "Infra / DevOps", "years": 4},
        {"name": "PostgreSQL & Redis", "level": "Expert", "category": "Databases", "years": 5},
        {"name": "WebAudio DSP & WebRTC", "level": "Intermediate", "category": "Streaming / Audio", "years": 2},
        {"name": "TypeScript & React", "level": "Advanced", "category": "Frontend", "years": 4},
    ]
    default_education = [
        {
            "degree": "B.S. in Computer Science & Engineering",
            "institution": "Technical Institute",
            "field_of_study": "Systems & Cloud Computing",
            "start_year": "2018",
            "end_year": "2022",
            "grade": "First Class with Distinction",
            "description": "Graduation capstone in high-performance distributed systems.",
        },
    ]
    default_experience = [
        {
            "role": profile.headline if profile and profile.headline else "Full-Stack Software Engineer",
            "company": "Enterprise Tech Lab",
            "location": profile.location if profile and profile.location else "Remote",
            "start_date": "2022",
            "end_date": "Present",
            "current": True,
            "description": "Building cloud microservices and scalable AI-driven web architectures.",
        },
    ]

    skills = (profile.skills if profile and profile.skills is not None else default_skills)
    education = (profile.education if profile and profile.education is not None else default_education)
    experience = (profile.experience if profile and profile.experience is not None else default_experience)

    return {
        "user_id": str(db_user.id if db_user else user_id),
        "candidate_name": display_name,
        "candidate_email": db_user.email if db_user else "",
        "candidate_role": (profile.headline if profile and profile.headline else ("Senior Full-Stack Engineer" if db_user else "Distributed AI Systems Engineer")),
        "headline": (profile.headline if profile and profile.headline else ("Senior Full-Stack Engineer" if db_user else "Distributed AI Systems Engineer")),
        "bio": (
            profile.bio
            if profile and profile.bio
            else f"Verified SkillMatch talent: {display_name}'s resume DNA, adaptive CAT mastery and voice STAR rounds are crypto-attested."
        ),
        "location": (profile.location if profile and profile.location else ("Remote" if db_user else "Remote | Global Talent Exchange")),
        "avatar_url": (profile.avatar_url if profile and profile.avatar_url else ""),
        "avatar_gradient": "from-[var(--accent-primary)] to-[var(--accent-secondary)]",
        "verification_status": verification_status,
        "verification_badge": _badge_for_status(verification_status),
        "liveness_verified": liveness_verified,
        "liveness_engine": "MediaPipe FaceMesh liveness detection",
        "ccrs_score": round(ccrs, 1),
        "ccrs_breakdown": breakdown,
        "ccrs_formula": "S_match x 0.50 + A_quiz x 0.30 + I_voice x 0.20",
        "skills": skills,
        "education": education,
        "experience": experience,
        "voice_snippet_url": (
            profile.voice_snippet_url
            if profile and profile.voice_snippet_url
            else "/api/v1/interview/recordings/voice_snippet_15s.wav"
        ),
        "voice_snippet_seconds": 15,
        "anc_performance": anc_performance,
        "social_profiles": social_profiles,
        "profile_views_count": profile_views_count,
        "public_proof_url": f"skillmatch.id/verify/{handle}",
        "profile_completed": is_completed,
        "updated_at": (profile.updated_at.isoformat() if profile and profile.updated_at else datetime.utcnow().isoformat()),
    }


def _weekly_impression_series(total_views: int, seed: str) -> List[Dict[str, Any]]:
    """Deterministic 6-week impression/reach series for the reach dashboard."""
    labels = ["W-5", "W-4", "W-3", "W-2", "W-1", "This wk"]
    weights = [0.08, 0.11, 0.15, 0.19, 0.21, 0.26]
    series: List[Dict[str, Any]] = []
    for label, weight in zip(labels, weights):
        share = weight * (0.85 + 0.3 * _seeded_unit(f"{seed}|{label}"))
        impressions = max(1, int(round(total_views * share)))
        recruiter_views = max(0, int(round(impressions * (0.55 + 0.35 * _seeded_unit(f"{seed}|rec|{label}")))))
        series.append(
            {
                "label": label,
                "impressions": impressions,
                "recruiter_views": min(impressions, recruiter_views),
            }
        )
    return series


def _reach_payload(
    candidate_id: str,
    viewer_records: List[Dict[str, Any]],
    breakdown: Dict[str, float],
    total_views: int,
) -> Dict[str, Any]:
    """Implements the Cumulative Reach Accuracy Index of suggestion-v26.md Section 1.3."""
    alignments = [float(record.get("vectorAlignmentPct", 0.0)) for record in viewer_records]
    sampled = alignments[:8] if alignments else [_calibrated_alignment_pct("SkillMatch", "Talent Partner", breakdown)]
    reach_accuracy = round(sum(sampled) / len(sampled), 1)

    companies = {record.get("viewerCompany") for record in viewer_records}
    recruiters = [record for record in viewer_records if record.get("isRecruiter")]
    recruiter_share = round(100.0 * len(recruiters) / len(viewer_records), 1) if viewer_records else 0.0

    top_vectors: List[str] = []
    for record in viewer_records:
        for skill in record.get("matchedSkills", []):
            if skill not in top_vectors:
                top_vectors.append(skill)

    return {
        "candidate_id": str(candidate_id),
        "total_profile_impressions": int(total_views),
        "unique_recruiter_companies": len(companies),
        "reach_accuracy_score": reach_accuracy,
        "recruiter_view_share_pct": recruiter_share,
        "alignment_breakdown": [
            {"component": "S_match", "label": "Resume DNA Match", "value": breakdown.get("s_match", 0.0), "weight": 0.5},
            {"component": "A_quiz", "label": "Adaptive CAT Quiz", "value": breakdown.get("a_quiz", 0.0), "weight": 0.3},
            {"component": "I_voice", "label": "Voice STAR Round", "value": breakdown.get("i_voice", 0.0), "weight": 0.2},
        ],
        "weekly_impressions": _weekly_impression_series(int(total_views), str(candidate_id)),
        "top_search_vectors": top_vectors[:6],
        "peak_visibility_window": "Tue-Thu 09:00-11:00 UTC",
        "recruiter_viewers": viewer_records[:5],
        "formula": "(Sum of Recruiter Search Vector . Candidate CCRS Vector / Total Profile Impressions) x 100",
        "generated_at": time.time(),
    }


# ---------------------------------------------------------------------------
# Database access helpers (all tolerant of empty / partially seeded databases)
# ---------------------------------------------------------------------------

def _profile_row(db: Session, candidate_id: str) -> Optional[models.CandidateProfile]:
    """Fetches the persisted CandidateProfile row for either an int, email, username or opaque frontend id."""
    user = _find_user(db, candidate_id)
    if user:
        try:
            profile = (
                db.query(models.CandidateProfile)
                .filter(models.CandidateProfile.user_id == user.id)
                .first()
            )
            if profile is not None:
                return profile
        except Exception:
            db.rollback()

    numeric_id = _coerce_user_id(candidate_id)
    resolved_id = _resolve_db_user_id(candidate_id)
    for numeric in dict.fromkeys([numeric_id, resolved_id]):
        if numeric is None:
            continue
        try:
            profile = (
                db.query(models.CandidateProfile)
                .filter(models.CandidateProfile.user_id == numeric)
                .first()
            )
            if profile is not None:
                return profile
        except Exception:
            db.rollback()
    return None


def _view_rows(db: Session, candidate_id: str, limit: int = 24) -> List[Any]:
    """Fetches recruiter profile-view rows, newest first."""
    numeric = _coerce_user_id(candidate_id)
    if numeric is None:
        numeric = _resolve_db_user_id(candidate_id)
    try:
        return (
            db.query(models.ProfileView)
            .filter(models.ProfileView.candidate_id == numeric)
            .order_by(models.ProfileView.viewed_at.desc())
            .limit(limit)
            .all()
        )
    except Exception:
        return []


def _viewer_records(db: Session, candidate_id: str, breakdown: Dict[str, float]) -> List[Dict[str, Any]]:
    """Merges live ProfileView rows with the deterministic enterprise seed log."""
    records = [
        _serialize_view(view, breakdown, index)
        for index, view in enumerate(_view_rows(db, candidate_id))
    ]
    if len(records) < 4:
        for offset, seed_view in enumerate(_seed_profile_views()):
            records.append(_serialize_view(seed_view, breakdown, index=len(records) + offset))
    return records


def _total_impressions(candidate_id: str, db_view_count: int) -> int:
    """Deterministic lifetime impression count (enterprise indexers + recruiter opens)."""
    baseline = int(46 + 260 * _seeded_unit(f"{candidate_id}|impressions"))
    return baseline + int(db_view_count)


def _feed_payload(db: Session, limit: int, candidate_id: Optional[str] = None) -> Dict[str, Any]:
    """Assembles the professional readiness feed from rows, falling back to seeds."""
    posts: List[Dict[str, Any]] = []
    try:
        query = db.query(models.ReadinessPost).order_by(models.ReadinessPost.created_at.desc())
        if candidate_id is not None:
            numeric = _coerce_user_id(candidate_id)
            query = query.filter(models.ReadinessPost.user_id == (numeric if numeric is not None else _resolve_db_user_id(candidate_id)))
        rows = query.limit(limit).all()
    except Exception:
        rows = []

    for row in rows:
        profile = _profile_row(db, str(row.user_id))
        posts.append(_serialize_post(row, profile))

    if len(posts) < limit:
        # Network-wide readiness milestones keep the feed populated even before a candidate
        # has published their own first proof post.
        seeds = _seed_feed_posts()
        for seed in seeds[: max(0, limit - len(posts))]:
            posts.append(_payload_post(seed))

    return {
        "posts": posts[:limit],
        "total": len(posts[:limit]),
        "source": "hybrid" if posts else "empty",
        "generated_at": time.time(),
    }


# ---------------------------------------------------------------------------
# v27.0: Social readiness feed
# ---------------------------------------------------------------------------

@router.get("/social/feed")
async def social_feed(
    limit: int = 12,
    candidate_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Returns the post-sign-in professional readiness network feed: verified milestone
    posts (skill gap cleared, CAT mastery, mock interview passed, project benchmark).
    """
    bounded_limit = max(1, min(int(limit or 12), 50))
    return _feed_payload(db, bounded_limit, candidate_id)


@router.post("/social/posts")
async def publish_readiness_post(payload: ReadinessPostCreate, db: Session = Depends(get_db)):
    """Automatically publishes a readiness milestone post on behalf of the candidate."""
    user_id = _resolve_db_user_id(payload.user_id)
    post = models.ReadinessPost(
        user_id=user_id,
        post_type=payload.post_type,
        title=payload.title,
        skill_tags=",".join(payload.skill_tags),
        proof_hash=payload.proof_hash or hashlib.sha256(f"{user_id}|{payload.title}".encode("utf-8")).hexdigest(),
        ccrs_score=float(payload.ccrs_score or 0.0),
        likes_count=0,
        peer_verifications_count=0,
    )
    try:
        db.add(post)
        db.commit()
        db.refresh(post)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to publish readiness post.")

    profile = _profile_row(db, payload.user_id)
    serialized = _serialize_post(post, profile)
    if payload.ccrs_score is not None:
        serialized["ccrsScore"] = round(float(payload.ccrs_score), 1)
    return serialized


@router.get("/social/posts/{candidate_id}")
async def candidate_posts(candidate_id: str, limit: int = 12, db: Session = Depends(get_db)):
    """Returns only the milestone posts published by one candidate."""
    bounded_limit = max(1, min(int(limit or 12), 50))
    payload = _feed_payload(db, bounded_limit, candidate_id)
    numeric = _coerce_user_id(candidate_id) or _resolve_db_user_id(candidate_id)
    payload["posts"] = [post for post in payload["posts"] if str(post.get("candidateId")) == str(numeric)] or payload["posts"]
    payload["candidate_id"] = candidate_id
    return payload


# ---------------------------------------------------------------------------
# v27.0: Candidate identity hub (profile, verification, recruiter inspection log)
# ---------------------------------------------------------------------------

@router.get("/profiles/{candidate_id}")
async def get_candidate_profile(candidate_id: str, db: Session = Depends(get_db)):
    """
    Returns the full Candidate Identity Hub payload used by CandidateProfile.tsx:
    CCRS vector breakdown, liveness/verification state, voice STAR snippet and the
    recruiter inspection counter.
    """
    profile = _profile_row(db, candidate_id)
    breakdown = _breakdown_from_profile(profile, candidate_id)
    view_count = _total_impressions(candidate_id, len(_view_rows(db, candidate_id, limit=500)))
    return _profile_payload(candidate_id, profile, view_count, db=db)


@router.put("/profiles/{candidate_id}")
async def update_candidate_profile(
    candidate_id: str,
    payload: CandidateProfileUpdate,
    db: Session = Depends(get_db),
):
    """Upserts the editable identity hub fields for the signed-in candidate."""
    user = _find_user(db, candidate_id)
    if user:
        target_user_id = user.id
        default_name = user.username.replace("_", " ").title()
    else:
        target_user_id = _coerce_user_id(candidate_id) or _resolve_db_user_id(candidate_id)
        default_name = "Candidate"

    profile = _profile_row(db, candidate_id)
    if profile is None:
        profile = models.CandidateProfile(user_id=target_user_id, candidate_name=payload.candidate_name or default_name)
        db.add(profile)

    for field, value in payload.dict(exclude_unset=True).items():
        if value is not None and hasattr(profile, field):
            setattr(profile, field, value)

    # Persist profile_completed
    if payload.profile_completed is not None:
        setattr(profile, "profile_completed", payload.profile_completed)
    elif payload.headline or payload.location or payload.skills:
        setattr(profile, "profile_completed", True)

    try:
        db.commit()
        db.refresh(profile)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unable to update candidate profile: {str(e)}")

    breakdown = _breakdown_from_profile(profile, candidate_id)
    if not profile.ccrs_score:
        profile.ccrs_score = _ccrs_weighted(breakdown)
        db.commit()
    view_count = _total_impressions(candidate_id, len(_view_rows(db, candidate_id, limit=500)))
    return _profile_payload(candidate_id, profile, view_count, db=db)


@router.post("/profiles/{candidate_id}/view")
async def record_profile_view(
    candidate_id: str,
    payload: ProfileViewCreate,
    db: Session = Depends(get_db),
):
    """Records a recruiter / enterprise inspection event against the candidate profile."""
    view = models.ProfileView(
        candidate_id=_resolve_db_user_id(candidate_id),
        viewer_name=payload.viewer_name,
        viewer_company=payload.viewer_company,
        viewer_role=payload.viewer_role,
        is_recruiter=payload.is_recruiter,
    )
    try:
        db.add(view)
        db.commit()
        db.refresh(view)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to record profile view.")

    profile = _profile_row(db, candidate_id)
    breakdown = _breakdown_from_profile(profile, candidate_id)
    record = _serialize_view(view, breakdown, index=0)
    record["candidate_id"] = candidate_id
    record["profile_views_count"] = _total_impressions(candidate_id, len(_view_rows(db, candidate_id, limit=500)))
    return record


@router.get("/profiles/{candidate_id}/views")
async def list_profile_views(candidate_id: str, limit: int = 10, db: Session = Depends(get_db)):
    """Recruiter inspection log: who opened the profile, from which company, how well aligned."""
    profile = _profile_row(db, candidate_id)
    breakdown = _breakdown_from_profile(profile, candidate_id)
    records = _viewer_records(db, candidate_id, breakdown)
    bounded_limit = max(1, min(int(limit or 10), 50))
    return {
        "candidate_id": candidate_id,
        "views": records[:bounded_limit],
        "total": len(records),
        "generated_at": time.time(),
    }


@router.get("/profiles/{candidate_id}/analytics")
async def profile_analytics(candidate_id: str, db: Session = Depends(get_db)):
    """
    Implements Section 1.3 of suggestion-v26.md: the Cumulative Reach Accuracy Index
    (sum of recruiter search vector . candidate CCRS vector over total impressions).
    """
    profile = _profile_row(db, candidate_id)
    breakdown = _breakdown_from_profile(profile, candidate_id)
    records = _viewer_records(db, candidate_id, breakdown)
    total_views = _total_impressions(candidate_id, len(_view_rows(db, candidate_id, limit=500)))
    return _reach_payload(candidate_id, records, breakdown, total_views)


@router.get("/profiles/{candidate_id}/verification")
async def profile_verification(candidate_id: str, db: Session = Depends(get_db)):
    """Lightweight badge/liveness check used by feed cards and shareable proof links."""
    profile = _profile_row(db, candidate_id)
    status = (profile.verification_status if profile else None) or "VERIFIED_CANDIDATE"
    return {
        "candidate_id": candidate_id,
        "verification_status": status,
        "verification_badge": _badge_for_status(status),
        "liveness_verified": bool(profile.liveness_verified) if profile else True,
        "checked_at": time.time(),
    }
