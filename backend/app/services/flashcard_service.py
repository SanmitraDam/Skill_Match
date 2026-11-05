"""
SkillMatch DNA v15.0 — Multi-Stage Interview Readiness & Topic-Wise Spatial Flashcard Engine
Service implementing:
1. Automated Skill-Gap to Flashcard Taxonomy Synthesis across 5 topics
2. SuperMemo-2 (SM-2) Spaced Repetition Algorithm
3. Biometric Hesitation Calibration (>8.0s latency penalty)
4. 15-minute Pre-Interview "Cram & Refresh" Rapid Review Deck
5. Structured 5-Stage Closed-Loop Interview Readiness Pipeline Gating
"""

import time
import math
import uuid
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import HTTPException


class FlashcardItem(BaseModel):
    card_id: str = Field(..., description="Unique card identifier UUID")
    topic: str = Field(..., description="Category: Core CS | System Design | Specialized Stack Tools | Algorithmic Data Structures | Behavioral Leadership")
    sub_skill: str = Field(..., description="Target skill tag")
    question: str = Field(..., description="Prompt or technical scenario question")
    answer: str = Field(..., description="Comprehensive answer with key points")
    code_snippet: Optional[str] = Field(None, description="Syntax-highlighted code sample")
    difficulty_level: int = Field(default=3, ge=1, le=5, description="Card difficulty (1-5)")
    explanation_diagram_svg: Optional[str] = Field(None, description="Inline SVG diagram definition")
    ease_factor: float = Field(default=2.5, ge=1.3)
    interval_days: int = Field(default=1, ge=1)
    repetition_count: int = Field(default=0, ge=0)


class TopicFlashcardDeck(BaseModel):
    deck_id: str
    target_job_title: str
    total_cards: int
    topics_covered: List[str]
    cards: List[FlashcardItem]


class FlashcardGenerateRequest(BaseModel):
    target_job_title: str = "Senior Full-Stack & AI Systems Engineer"
    missing_skills: List[str] = ["vLLM", "WebRTC", "Redis", "Dynamic Programming", "STAR Conflict Resolution"]
    matched_skills: List[str] = ["Python", "FastAPI", "PostgreSQL", "Docker", "Git"]


class CardReviewRequest(BaseModel):
    card_id: str
    quality_rating: int = Field(..., ge=0, le=5, description="0=Blackout, 1=Again, 2=Hard, 3=Passable, 4=Good, 5=Easy")
    hesitation_seconds: float = Field(default=3.2, ge=0.0, description="Latency before answer reveal")
    current_interval: int = Field(default=1, ge=1)
    current_ef: float = Field(default=2.5, ge=1.3)
    repetition_count: int = Field(default=0, ge=0)


class PipelineAdvanceRequest(BaseModel):
    candidate_id: str
    candidate_name: str = "Candidate Sovereign"
    target_stage: int = Field(..., ge=1, le=5)
    match_score: float = Field(default=0.82, ge=0.0, le=1.0)
    flashcard_completion_ratio: float = Field(default=0.88, ge=0.0, le=1.0)
    quiz_ability_score: float = Field(default=3.8, ge=0.0, le=5.0)
    voice_interview_score: float = Field(default=0.84, ge=0.0, le=1.0)
    ccrs_final_score: float = Field(default=0.86, ge=0.0, le=1.0)


class FlashcardService:
    TOPIC_CATEGORIES = [
        "Core CS & Language Fundamentals",
        "System Design & Distributed Architecture",
        "Specialized Stack Tools",
        "Algorithmic Data Structures & Complexity",
        "Behavioral Leadership & STAR Scenarios"
    ]

    def __init__(self):
        self._decks: Dict[str, TopicFlashcardDeck] = {}
        self._cards: Dict[str, FlashcardItem] = {}
        self._pipeline_states: Dict[str, Dict[str, Any]] = {}

    def _determine_topic(self, skill: str) -> str:
        s = skill.lower()
        if any(k in s for k in ["redis", "kafka", "distributed", "architecture", "microservice", "consensus", "cache", "load balancer"]):
            return "System Design & Distributed Architecture"
        elif any(k in s for k in ["vllm", "webrtc", "spacy", "pymupdf", "r3f", "three", "torch", "docker", "k8s"]):
            return "Specialized Stack Tools"
        elif any(k in s for k in ["tree", "graph", "dp", "dynamic programming", "complexity", "sort", "algorithm", "binary"]):
            return "Algorithmic Data Structures & Complexity"
        elif any(k in s for k in ["star", "conflict", "behavioral", "leadership", "scenario", "ownership", "stakeholder"]):
            return "Behavioral Leadership & STAR Scenarios"
        else:
            return "Core CS & Language Fundamentals"

    def generate_deck(self, req: FlashcardGenerateRequest) -> TopicFlashcardDeck:
        """
        Synthesizes missing critical skills and job description requirements
        into an adaptive topic-wise flashcard hierarchy.
        """
        deck_id = f"deck_{uuid.uuid4().hex[:12]}"
        cards_list: List[FlashcardItem] = []

        all_target_skills = req.missing_skills + req.matched_skills[:2]
        topics_found = set()

        for idx, skill in enumerate(all_target_skills):
            topic = self._determine_topic(skill)
            topics_found.add(topic)
            card_id = f"card_{uuid.uuid4().hex[:8]}"

            # Synthesize specialized questions, answers, code snippets and SVG diagrams
            if topic == "System Design & Distributed Architecture":
                question = f"In {skill} architecture, how do you handle cache invalidation and race conditions under multi-node horizontal scaling?"
                answer = f"1. Employ write-through with two-phase commit or asynchronous cache invalidation via Redis Streams.\n2. Leverage distributed locking with Redlock to prevent thundering herd problems.\n3. Guarantee eventual consistency with idempotent event sourcing."
                code = "async def update_resource_with_lock(key: str, data: dict):\n    async with redis_client.lock(f'lock:{key}', timeout=5):\n        await db.save(data)\n        await redis_client.delete(f'cache:{key}')"
                svg = '<svg width="200" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="40" x="10" y="20" fill="#3b82f6" rx="6"/><text x="25" y="45" fill="#fff" font-size="12">App</text><path d="M 90 40 L 120 40" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/><rect width="80" height="40" x="120" y="20" fill="#10b981" rx="6"/><text x="135" y="45" fill="#fff" font-size="12">Cache</text></svg>'
            elif topic == "Specialized Stack Tools":
                question = f"How does {skill} optimize runtime memory allocation and throughput in high-concurrency systems?"
                answer = f"1. Offloads heavy computation via native C++/CUDA bindings.\n2. Uses zero-copy memory buffers and PagedAttention/KV-caching to eliminate fragmentation.\n3. Maximizes batching density with continuous dynamic scheduling."
                code = f"# Initializing high-throughput {skill} engine\nengine = EngineBuilder.from_pretrained('model-q4').set_kv_cache_limit_gb(16).build()"
                svg = '<svg width="200" height="80" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="40" r="30" fill="#8b5cf6"/><text x="35" y="45" fill="#fff" font-size="12">KV</text><path d="M 80 40 L 120 40" stroke="#94a3b8" stroke-width="2"/><rect width="60" height="40" x="120" y="20" fill="#06b6d4" rx="6"/><text x="130" y="45" fill="#fff" font-size="12">GPU</text></svg>'
            elif topic == "Algorithmic Data Structures & Complexity":
                question = f"What is the optimal time and space complexity to solve a multidimensional {skill} problem, and how do you avoid redundant subproblem calculations?"
                answer = f"1. Formulate recurrence relation: DP[i][j] = min(DP[i-1][j], DP[i][j-1]) + cost.\n2. Space-optimize from O(N*M) to O(min(N,M)) using rolling array buffers.\n3. Time Complexity: O(N*M) vs O(2^(N+M)) naive recursion."
                code = "def optimal_substructure(arr):\n    dp = [0] * (len(arr) + 1)\n    for i in range(1, len(arr) + 1):\n        dp[i] = max(dp[i-1], dp[i-2] + arr[i-1])\n    return dp[-1]"
                svg = '<svg width="200" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="30" x="20" y="25" fill="#f59e0b" rx="4"/><rect width="40" height="30" x="80" y="25" fill="#f59e0b" rx="4"/><rect width="40" height="30" x="140" y="25" fill="#10b981" rx="4"/></svg>'
            elif topic == "Behavioral Leadership & STAR Scenarios":
                question = f"Describe a situation where you had a critical technical disagreement regarding {skill}. How did you resolve it using the STAR method?"
                answer = f"Situation: Disagreement on architectural migration deadline.\nTask: Reconcile system stability with product release targets.\nAction: Benchmarked latency bottlenecks and presented data-driven tradeoffs.\nResult: Adopted staged migration with zero customer downtime."
                code = None
                svg = '<svg width="200" height="80" xmlns="http://www.w3.org/2000/svg"><polygon points="100,15 115,55 155,55 125,75 135,115 100,90 65,115 75,75 45,55 85,55" fill="#ec4899"/></svg>'
            else:
                question = f"In {skill}, how does the runtime handle concurrency, GIL/event loop mechanics, and thread synchronization?"
                answer = f"1. Non-blocking asynchronous I/O via cooperative multitasking.\n2. Thread pools for blocking CPU-bound workloads.\n3. Atomic variables and synchronization primitives preventing data races."
                code = "import asyncio\n\nasync def concurrent_task():\n    results = await asyncio.gather(*(fetch_data(i) for i in range(10)))\n    return results"
                svg = None

            card = FlashcardItem(
                card_id=card_id,
                topic=topic,
                sub_skill=skill,
                question=question,
                answer=answer,
                code_snippet=code,
                difficulty_level=min(5, max(1, 2 + (idx % 4))),
                explanation_diagram_svg=svg,
                ease_factor=2.5,
                interval_days=1,
                repetition_count=0
            )
            cards_list.append(card)
            self._cards[card_id] = card

        deck = TopicFlashcardDeck(
            deck_id=deck_id,
            target_job_title=req.target_job_title,
            total_cards=len(cards_list),
            topics_covered=sorted(list(topics_found)),
            cards=cards_list
        )
        self._decks[deck_id] = deck
        return deck

    def review_card_sm2(self, req: CardReviewRequest) -> Dict[str, Any]:
        """
        Executes SuperMemo-2 spaced repetition update with biometric hesitation calibration:
        If hesitation_seconds > 8.0s and rating >= 4, penalize to rating = 2 ('Hard').
        """
        rating = req.quality_rating
        hesitation_calibrated = False

        if req.hesitation_seconds > 8.0 and rating >= 4:
            rating = 2 # Downgrade to 'Hard'
            hesitation_calibrated = True

        # Calculate new Ease Factor (EF')
        # EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        q = rating
        delta_ef = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
        new_ef = max(1.3, req.current_ef + delta_ef)

        # Calculate new interval
        if q < 3:
            new_repetition = 0
            new_interval = 1 # Review tomorrow
        else:
            if req.repetition_count == 0:
                new_interval = 1
            elif req.repetition_count == 1:
                new_interval = 6
            else:
                new_interval = round(req.current_interval * new_ef)
            new_repetition = req.repetition_count + 1

        # Update card in memory if present
        if req.card_id in self._cards:
            self._cards[req.card_id].ease_factor = round(new_ef, 3)
            self._cards[req.card_id].interval_days = new_interval
            self._cards[req.card_id].repetition_count = new_repetition

        return {
            "card_id": req.card_id,
            "original_quality_rating": req.quality_rating,
            "effective_quality_rating": q,
            "hesitation_seconds": req.hesitation_seconds,
            "hesitation_recalibrated": hesitation_calibrated,
            "new_ease_factor": round(new_ef, 3),
            "new_interval_days": new_interval,
            "new_repetition_count": new_repetition,
            "next_review_due": f"in {new_interval} day(s)",
            "sm2_algorithm_status": "SUPERMEMO_2_UPDATED"
        }

    def get_cram_deck(self, deck_id: Optional[str] = None, max_cards: int = 15) -> Dict[str, Any]:
        """
        Pre-Interview Rapid Review Mode: Returns high-impact, low-mastery flashcards
        for a 15-minute cram session 1 hour before an interview.
        """
        all_cards = list(self._cards.values())
        # Sort by lowest ease factor and highest difficulty
        all_cards.sort(key=lambda c: (c.ease_factor, -c.difficulty_level))
        selected_cards = all_cards[:max_cards]

        return {
            "deck_id": deck_id or "cram_rapid_deck",
            "cram_mode": "PRE_INTERVIEW_15_MIN_RAPID_REFRESH",
            "total_cram_cards": len(selected_cards),
            "estimated_review_minutes": 15,
            "cards": selected_cards
        }

    def evaluate_readiness_pipeline(self, candidate_id: str) -> Dict[str, Any]:
        """
        Evaluates current status across the 5 structured closed-loop readiness stages:
        Stage 1: Match Score >= 60%
        Stage 2: Flashcard Completion >= 80%
        Stage 3: Adaptive CAT Quiz Ability >= 3.5
        Stage 4: Voice Interview Score >= 75%
        Stage 5: Boardroom Simulation CCRS >= 80%
        """
        state = self._pipeline_states.get(candidate_id, {
            "candidate_id": candidate_id,
            "stage_1_match_score": 0.82,
            "stage_2_flashcard_mastery": 0.85,
            "stage_3_cat_quiz_ability": 3.8,
            "stage_4_voice_interview_score": 0.78,
            "stage_5_ccrs_certification": 0.84,
            "current_active_stage": 5
        })

        s1_passed = state["stage_1_match_score"] >= 0.60
        s2_passed = s1_passed and (state["stage_2_flashcard_mastery"] >= 0.80)
        s3_passed = s2_passed and (state["stage_3_cat_quiz_ability"] >= 3.5)
        s4_passed = s3_passed and (state["stage_4_voice_interview_score"] >= 0.75)
        s5_passed = s4_passed and (state["stage_5_ccrs_certification"] >= 0.80)

        stages = [
            {
                "stage_number": 1,
                "name": "Resume & Job DNA Vector Alignment",
                "metric_label": "384D Vector Match Score",
                "metric_value": f"{state['stage_1_match_score'] * 100:.1f}%",
                "gating_threshold": ">= 60.0%",
                "status": "PASSED" if s1_passed else "LOCKED",
                "is_unlocked": True
            },
            {
                "stage_number": 2,
                "name": "Topic-Wise Spatial Flashcard Drill",
                "metric_label": "SM-2 Topic Deck Mastery",
                "metric_value": f"{state['stage_2_flashcard_mastery'] * 100:.1f}%",
                "gating_threshold": ">= 80.0%",
                "status": "PASSED" if s2_passed else ("IN_PROGRESS" if s1_passed else "LOCKED"),
                "is_unlocked": s1_passed
            },
            {
                "stage_number": 3,
                "name": "Gamified Adaptive CAT Quiz Testing",
                "metric_label": "IRT Latent Ability Rating (Theta)",
                "metric_value": f"{state['stage_3_cat_quiz_ability']:.1f} / 5.0",
                "gating_threshold": ">= 3.5 / 5.0",
                "status": "PASSED" if s3_passed else ("IN_PROGRESS" if s2_passed else "LOCKED"),
                "is_unlocked": s2_passed
            },
            {
                "stage_number": 4,
                "name": "Spatial Voice AI Mock Interview Room",
                "metric_label": "Voice Articulation & Delivery",
                "metric_value": f"{state['stage_4_voice_interview_score'] * 100:.1f}%",
                "gating_threshold": ">= 75.0%",
                "status": "PASSED" if s4_passed else ("IN_PROGRESS" if s3_passed else "LOCKED"),
                "is_unlocked": s3_passed
            },
            {
                "stage_number": 5,
                "name": "Boardroom Simulation & CCRS Final Certification",
                "metric_label": "Composite Career Readiness Score",
                "metric_value": f"{state['stage_5_ccrs_certification'] * 100:.1f}%",
                "gating_threshold": ">= 80.0%",
                "status": "CERTIFIED" if s5_passed else ("IN_PROGRESS" if s4_passed else "LOCKED"),
                "is_unlocked": s4_passed
            }
        ]

        return {
            "candidate_id": candidate_id,
            "all_stages_completed": s5_passed,
            "current_active_stage": state.get("current_active_stage", 5),
            "stages": stages,
            "w3c_credential_minted": s5_passed,
            "pipeline_certification_status": "OFFICIALLY_CERTIFIED_INTERVIEW_READY" if s5_passed else "READINESS_IN_PROGRESS"
        }

    def advance_stage(self, req: PipelineAdvanceRequest) -> Dict[str, Any]:
        """
        Validates readiness thresholds and advances candidate along the 5 stages.
        """
        if req.target_stage == 2 and req.match_score < 0.60:
            raise HTTPException(status_code=400, detail="Cannot advance to Stage 2: Stage 1 Match Score below 60.0% threshold.")
        elif req.target_stage == 3 and req.flashcard_completion_ratio < 0.80:
            raise HTTPException(status_code=400, detail="Cannot advance to Stage 3: Stage 2 Flashcard Mastery below 80.0% threshold.")
        elif req.target_stage == 4 and req.quiz_ability_score < 3.5:
            raise HTTPException(status_code=400, detail="Cannot advance to Stage 4: Stage 3 CAT Quiz Ability below 3.5 / 5.0 threshold.")
        elif req.target_stage == 5 and req.voice_interview_score < 0.75:
            raise HTTPException(status_code=400, detail="Cannot advance to Stage 5: Stage 4 Voice Interview Score below 75.0% threshold.")

        self._pipeline_states[req.candidate_id] = {
            "candidate_id": req.candidate_id,
            "stage_1_match_score": req.match_score,
            "stage_2_flashcard_mastery": req.flashcard_completion_ratio,
            "stage_3_cat_quiz_ability": req.quiz_ability_score,
            "stage_4_voice_interview_score": req.voice_interview_score,
            "stage_5_ccrs_certification": req.ccrs_final_score,
            "current_active_stage": req.target_stage
        }

        return {
            "status": "STAGE_ADVANCED",
            "candidate_id": req.candidate_id,
            "new_stage": req.target_stage,
            "pipeline_evaluation": self.evaluate_readiness_pipeline(req.candidate_id)
        }


flashcard_service = FlashcardService()
