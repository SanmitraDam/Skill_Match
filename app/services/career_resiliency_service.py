"""
Universal Skill Value Index & Automated Career Resiliency Engine — SkillMatch DNA v20.0
Pillar 4: Skill Market Value Index (SMVI), Personalized Skill Half-Life & Proactive Micro-Learning
Calculates real-time tech appreciation/depreciation rates, computes candidate Career Resiliency
Scores (CRS), and injects 5-minute daily micro-challenges into FlashcardStudio before decay occurs.
"""
from __future__ import annotations

import math
import time
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class SkillMarketMetric(BaseModel):
    skill: str
    category: str
    smvi_index: float # 0 - 100
    annual_trend_pct: float # e.g. +35.2% appreciation or -15.4% depreciation
    demand_velocity: str # SURGING, STABLE, DECLINING
    half_life_years: float # Estimated years until 50% obsolescence
    median_hourly_rate_inr: float


class CandidateSkillInput(BaseModel):
    skill: str
    proficiency_pct: float
    last_practiced_days_ago: int = 0


class CalculateResiliencyRequest(BaseModel):
    candidate_id: str
    ccrs_score: float
    skills: List[CandidateSkillInput]
    alpha: float = 0.45
    beta: float = 0.35
    gamma: float = 0.20


class CandidateResiliencyReport(BaseModel):
    candidate_id: str
    career_resiliency_score: float # CRS
    ccrs_score: float
    skill_diversity_index: float
    obsolescence_risk_pct: float
    at_risk_skills: List[str]
    appreciating_skills: List[str]
    resiliency_tier: str # IMMUNIZED, ADAPTIVE, AT_RISK
    projected_decay_6_months_pct: float
    recommended_micro_actions: List[str]
    timestamp: float = Field(default_factory=time.time)


class MicroLearningChallenge(BaseModel):
    challenge_id: str
    target_skill: str
    headline: str
    estimated_minutes: int = 5
    challenge_type: str # RAPID_FLASHCARD, CODE_SNIPPET_DEBUG, ARCHITECTURE_CHOICE
    question: str
    options: List[str]
    correct_option_index: int
    explanation: str
    crs_points_boost: float = 2.5


class InjectMicroLearningRequest(BaseModel):
    candidate_id: str
    target_skills: Optional[List[str]] = None


# ---------------------------------------------------------------------------
# Service Implementation
# ---------------------------------------------------------------------------

class CareerResiliencyService:
    def __init__(self):
        # Global Skill Market Value Index (SMVI) registry
        self._market_metrics: Dict[str, SkillMarketMetric] = {
            "ebpf": SkillMarketMetric(
                skill="eBPF",
                category="Systems & Kernel",
                smvi_index=94.5,
                annual_trend_pct=35.2,
                demand_velocity="SURGING",
                half_life_years=8.5,
                median_hourly_rate_inr=13695
            ),
            "webassembly": SkillMarketMetric(
                skill="WebAssembly",
                category="Systems & Web",
                smvi_index=91.0,
                annual_trend_pct=28.4,
                demand_velocity="SURGING",
                half_life_years=7.8,
                median_hourly_rate_inr=12450
            ),
            "rust": SkillMarketMetric(
                skill="Rust",
                category="Languages",
                smvi_index=93.8,
                annual_trend_pct=31.0,
                demand_velocity="SURGING",
                half_life_years=9.0,
                median_hourly_rate_inr=12035
            ),
            "langchain": SkillMarketMetric(
                skill="LangChain / Agentic AI",
                category="AI & Agents",
                smvi_index=96.2,
                annual_trend_pct=48.5,
                demand_velocity="SURGING",
                half_life_years=4.2,
                median_hourly_rate_inr=14525
            ),
            "pytorch": SkillMarketMetric(
                skill="PyTorch",
                category="Machine Learning",
                smvi_index=88.5,
                annual_trend_pct=14.2,
                demand_velocity="STABLE",
                half_life_years=6.5,
                median_hourly_rate_inr=11620
            ),
            "fastapi": SkillMarketMetric(
                skill="FastAPI",
                category="Backend",
                smvi_index=85.0,
                annual_trend_pct=11.5,
                demand_velocity="STABLE",
                half_life_years=5.5,
                median_hourly_rate_inr=9545
            ),
            "react": SkillMarketMetric(
                skill="React",
                category="Frontend",
                smvi_index=82.0,
                annual_trend_pct=3.5,
                demand_velocity="STABLE",
                half_life_years=4.0,
                median_hourly_rate_inr=8715
            ),
            "jquery": SkillMarketMetric(
                skill="jQuery",
                category="Legacy Web",
                smvi_index=22.4,
                annual_trend_pct=-18.6,
                demand_velocity="DECLINING",
                half_life_years=1.2,
                median_hourly_rate_inr=4565
            ),
            "cobol": SkillMarketMetric(
                skill="COBOL",
                category="Legacy Enterprise",
                smvi_index=35.0,
                annual_trend_pct=-8.0,
                demand_velocity="DECLINING",
                half_life_years=2.0,
                median_hourly_rate_inr=6640
            )
        }

        # Candidate active injected challenges: candidate_id -> list of challenges
        self._injected_challenges: Dict[str, List[MicroLearningChallenge]] = {}

    def get_market_trends(self) -> List[SkillMarketMetric]:
        return list(self._market_metrics.values())

    def calculate_resiliency(self, req: CalculateResiliencyRequest) -> CandidateResiliencyReport:
        """
        Computes Career Resiliency Score (CRS):
        CRS = alpha * CCRS + beta * SkillDiversityIndex - gamma * ObsolescenceRisk
        """
        if not req.skills:
            return CandidateResiliencyReport(
                candidate_id=req.candidate_id,
                career_resiliency_score=req.ccrs_score * req.alpha,
                ccrs_score=req.ccrs_score,
                skill_diversity_index=0.0,
                obsolescence_risk_pct=50.0,
                at_risk_skills=[],
                appreciating_skills=[],
                resiliency_tier="AT_RISK",
                projected_decay_6_months_pct=12.0,
                recommended_micro_actions=["Add verified modern skills to your profile"]
            )

        categories = set()
        depreciation_penalties = []
        at_risk: List[str] = []
        appreciating: List[str] = []

        for item in req.skills:
            key = item.skill.lower()
            metric = self._market_metrics.get(key)
            if metric:
                categories.add(metric.category)
                if metric.annual_trend_pct < 0 or metric.demand_velocity == "DECLINING":
                    at_risk.append(item.skill)
                    depreciation_penalties.append(abs(metric.annual_trend_pct))
                elif metric.annual_trend_pct > 15:
                    appreciating.append(item.skill)
            else:
                # Default generic tech category
                categories.add("Software Engineering")

            # Days since practice penalty
            if item.last_practiced_days_ago > 60:
                depreciation_penalties.append(min(25.0, item.last_practiced_days_ago * 0.1))

        # Skill Diversity Index (0 - 100)
        # Shannon-like diversity factor
        diversity_score = min(100.0, (len(categories) * 22.0) + (len(req.skills) * 3.5))

        # Obsolescence Risk (0 - 100%)
        if depreciation_penalties:
            obsolescence_risk = min(100.0, sum(depreciation_penalties) / max(len(req.skills), 1))
        else:
            obsolescence_risk = max(5.0, 30.0 - (len(appreciating) * 8.0))

        # CRS Formula
        raw_crs = (
            (req.alpha * req.ccrs_score) +
            (req.beta * diversity_score) -
            (req.gamma * obsolescence_risk)
        )
        crs = round(max(10.0, min(100.0, raw_crs)), 1)

        tier = "IMMUNIZED" if crs >= 80.0 else ("ADAPTIVE" if crs >= 60.0 else "AT_RISK")
        decay_6m = round(max(1.2, (obsolescence_risk * 0.18)), 1)

        actions = []
        if at_risk:
            actions.append(f"Refactor skills away from legacy tooling: {', '.join(at_risk[:2])}")
        if not appreciating:
            actions.append("Adopt high-SMVI appreciating capabilities (e.g. eBPF, Rust, Agentic LLMs)")
        actions.append(f"Complete 5-minute daily FlashcardStudio micro-challenges to counteract {decay_6m}% projected decay")

        return CandidateResiliencyReport(
            candidate_id=req.candidate_id,
            career_resiliency_score=crs,
            ccrs_score=req.ccrs_score,
            skill_diversity_index=round(diversity_score, 1),
            obsolescence_risk_pct=round(obsolescence_risk, 1),
            at_risk_skills=at_risk,
            appreciating_skills=appreciating,
            resiliency_tier=tier,
            projected_decay_6_months_pct=decay_6m,
            recommended_micro_actions=actions
        )

    def inject_micro_learning(self, req: InjectMicroLearningRequest) -> List[MicroLearningChallenge]:
        """
        Injects 5-minute daily micro-challenges directly into candidate's active FlashcardStudio.
        """
        target_skills = req.target_skills or ["eBPF", "WebAssembly", "Rust"]
        challenges: List[MicroLearningChallenge] = []

        challenge_templates = [
            {
                "skill": "eBPF",
                "headline": "Kernel Probe Memory Safety",
                "question": "What is the primary constraint enforced by the in-kernel eBPF verifier?",
                "options": [
                    "Programs must terminate without unbounded loops and only access bounded memory",
                    "Programs must run with root privileges and have direct swap access",
                    "Programs can execute arbitrary x86 machine instructions without translation",
                    "Programs are compiled strictly via Python bytecode"
                ],
                "correct": 0,
                "explanation": "The eBPF verifier statically proves termination (DAG analysis, bounded loops) and checks pointer bounds to guarantee kernel stability."
            },
            {
                "skill": "WebAssembly",
                "headline": "WASM Linear Memory Semantics",
                "question": "How does WebAssembly achieve memory isolation in browser and server runtimes?",
                "options": [
                    "Through sandboxed contiguous 32/64-bit linear byte arrays bounds-checked at runtime",
                    "By allowing direct hardware pointers into host virtual address space",
                    "By disabling all garbage collection and dynamic allocation entirely",
                    "Through OS-level chroot jails on every function invocation"
                ],
                "correct": 0,
                "explanation": "WebAssembly executes within a sandboxed linear memory buffer where loads/stores cannot access host memory outside the allocated page bounds."
            },
            {
                "skill": "Rust",
                "headline": "Ownership & Borrow Checker Concurrency",
                "question": "Which trait in Rust signals that a type is safe to transfer ownership across thread boundaries?",
                "options": [
                    "Send",
                    "Sync",
                    "Copy",
                    "Deref"
                ],
                "correct": 0,
                "explanation": "The 'Send' marker trait indicates that ownership of the type can be transferred between threads safely without data races."
            }
        ]

        for tmpl in challenge_templates:
            if any(ts.lower() in tmpl["skill"].lower() for ts in target_skills) or len(challenges) < 2:
                cid = f"mc-{uuid.uuid4().hex[:8]}"
                ch = MicroLearningChallenge(
                    challenge_id=cid,
                    target_skill=tmpl["skill"],
                    headline=tmpl["headline"],
                    estimated_minutes=5,
                    challenge_type="RAPID_FLASHCARD",
                    question=tmpl["question"],
                    options=tmpl["options"],
                    correct_option_index=tmpl["correct"],
                    explanation=tmpl["explanation"],
                    crs_points_boost=2.5
                )
                challenges.append(ch)

        self._injected_challenges[req.candidate_id] = challenges
        return challenges

    def get_candidate_challenges(self, candidate_id: str) -> List[MicroLearningChallenge]:
        return self._injected_challenges.get(candidate_id, [])


# Global singleton
career_resiliency_service = CareerResiliencyService()
