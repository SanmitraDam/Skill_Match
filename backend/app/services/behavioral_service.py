"""
SkillMatch DNA v16.0 — Multimodal Behavioral & STAR Method Analytics Service
Pillar 2: Multimodal Behavioral & STAR Method Analytics Engine
Features:
- Automated STAR NLP structure parser (Situation 15%, Task 15%, Action 50%, Result 20%)
- Empirical quantified impact detector (percentages, rupee metrics, millisecond latencies, scale multipliers)
- Speech pace tracking (optimal 130-150 wpm)
- Vocal filler word tracking ("um", "uh", "like", "basically", "you know", etc.)
- Composure Index calculation (0.0 - 100.0)
"""

import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class STARParseRequest(BaseModel):
    candidate_id: str
    response_text: str
    question_context: Optional[str] = "Describe a complex distributed systems challenge you resolved."


class ProsodyAnalyzeRequest(BaseModel):
    candidate_id: str
    audio_transcript: str
    duration_seconds: float = Field(default=60.0, gt=0.0)
    pitch_variance_hz: Optional[float] = 14.2


class BehavioralAnalyticsService:
    def __init__(self):
        # STAR indicator lexicons
        self.situation_keywords = [
            "when i was", "at company", "we had a situation", "context was",
            "working at", "our team was", "the legacy system", "in my previous role",
            "the problem started", "back when", "initially"
        ]
        self.task_keywords = [
            "my responsibility was", "i was tasked with", "the goal was", "we needed to",
            "my objective", "we were required to", "the requirement was", "task was to",
            "i had to ensure", "my role required"
        ]
        self.action_keywords = [
            "i implemented", "i designed", "i refactored", "i migrated", "i architected",
            "i orchestrated", "we deployed", "i configured", "i investigated", "i engineered",
            "i built", "i analyzed", "i resolved", "i wrote", "i introduced", "i optimized"
        ]
        self.result_keywords = [
            "as a result", "consequently", "resulting in", "we achieved", "improved by",
            "reduced latency", "saved", "increased throughput", "delivered", "outcome was",
            "the system scaled to", "prevented downtime", "cut costs"
        ]

        # Vocal fillers
        self.filler_patterns = [
            r"\bum\b", r"\buh\b", r"\blike\b", r"\bbasically\b",
            r"\byou know\b", r"\bactually\b", r"\bsort of\b", r"\bkind of\b"
        ]

        # Empirical quantified impact patterns
        self.impact_patterns = [
            r"\d+(\.\d+)?%",                    # e.g., 45%, 99.99%
            r"₹\s*\d+([.,]\d+)*(\s*[kK]|\s*[lL](akh)?|\s*[cC]r(ore)?)?",  # e.g., ₹1.25 Cr, ₹12 L
            r"\$\d+([kKmMbB]|\s*million|\s*k)?", # legacy USD (e.g., $150k, $2.4M)
            r"\d+\s*ms\b",                      # e.g., 120ms, 45 ms
            r"\d+x\b",                          # e.g., 10x, 3x
            r"\d+\s*(req/s|rps|tps|qps|tb|gb)\b" # e.g., 50000 rps, 10 tb
        ]

    def parse_star_structure(self, req: STARParseRequest) -> Dict[str, Any]:
        """
        Parses transcript into Situation (15%), Task (15%), Action (50%), and Result (20%).
        Validates quantified impact metrics.
        """
        text_lower = req.response_text.lower()
        sentences = [s.strip() for s in re.split(r"[.!?]+", req.response_text) if s.strip()]

        situation_matches = []
        task_matches = []
        action_matches = []
        result_matches = []

        for sent in sentences:
            sent_l = sent.lower()
            matched = False

            if any(kw in sent_l for kw in self.result_keywords):
                result_matches.append(sent)
                matched = True
            if any(kw in sent_l for kw in self.action_keywords):
                action_matches.append(sent)
                matched = True
            if any(kw in sent_l for kw in self.task_keywords):
                task_matches.append(sent)
                matched = True
            if any(kw in sent_l for kw in self.situation_keywords) or (not matched and len(situation_matches) == 0):
                situation_matches.append(sent)

        # Ensure defaults if text is compact
        if not action_matches and len(sentences) > 0:
            action_matches.append(sentences[len(sentences) // 2])
        if not result_matches and len(sentences) > 1:
            result_matches.append(sentences[-1])

        # Sub-scores out of 100
        sit_score = min(100.0, 40.0 + len(situation_matches) * 30.0)
        task_score = min(100.0, 40.0 + len(task_matches) * 30.0)
        action_score = min(100.0, 50.0 + len(action_matches) * 25.0)

        # Quantified impact detection
        quantified_impacts = []
        for pattern in self.impact_patterns:
            matches = re.findall(pattern, req.response_text, re.IGNORECASE)
            if matches:
                for m in matches:
                    val = m[0] if isinstance(m, tuple) else m
                    if val and val not in quantified_impacts:
                        quantified_impacts.append(str(val))

        has_quantified_impact = len(quantified_impacts) > 0
        result_score = min(100.0, (50.0 + len(result_matches) * 20.0) + (30.0 if has_quantified_impact else 0.0))

        # Weightings: Situation 15%, Task 15%, Action 50%, Result 20%
        composite_star_score = round(
            (sit_score * 0.15) +
            (task_score * 0.15) +
            (action_score * 0.50) +
            (result_score * 0.20),
            1
        )

        return {
            "candidate_id": req.candidate_id,
            "composite_star_score": composite_star_score,
            "weights": {
                "situation_weight": 0.15,
                "task_weight": 0.15,
                "action_weight": 0.50,
                "result_weight": 0.20
            },
            "sub_scores": {
                "situation_score": sit_score,
                "task_score": task_score,
                "action_score": action_score,
                "result_score": result_score
            },
            "star_segments": {
                "situation": situation_matches,
                "task": task_matches,
                "action": action_matches,
                "result": result_matches
            },
            "quantified_impacts_detected": quantified_impacts,
            "has_empirical_impact": has_quantified_impact,
            "star_compliance_verdict": "COMPLIANT" if composite_star_score >= 75.0 else "NEEDS_IMPROVEMENT"
        }

    def analyze_prosody_and_composure(self, req: ProsodyAnalyzeRequest) -> Dict[str, Any]:
        """
        Analyzes speech pace (130-150 wpm optimal), vocal filler words,
        pitch variance, and calculates Composure Index.
        """
        words = re.findall(r"\b[A-Za-z0-9'-]+\b", req.audio_transcript)
        word_count = len(words)
        duration_minutes = max(0.01, req.duration_seconds / 60.0)

        # 1. Words Per Minute (WPM)
        wpm = round(word_count / duration_minutes, 1)

        # Pace evaluation: optimal is 130 - 150
        if 130.0 <= wpm <= 150.0:
            pace_rating = "OPTIMAL"
            pace_score = 100.0
        elif 115.0 <= wpm < 130.0 or 150.0 < wpm <= 165.0:
            pace_rating = "ACCEPTABLE"
            pace_score = 85.0
        elif wpm > 165.0:
            pace_rating = "TOO_FAST"
            pace_score = max(50.0, 100.0 - (wpm - 165.0) * 1.5)
        else:
            pace_rating = "TOO_SLOW"
            pace_score = max(50.0, 100.0 - (115.0 - wpm) * 1.5)

        # 2. Vocal Fillers
        filler_breakdown: Dict[str, int] = {}
        total_fillers = 0
        transcript_lower = req.audio_transcript.lower()

        for pattern in self.filler_patterns:
            matches = re.findall(pattern, transcript_lower)
            clean_name = pattern.replace(r"\b", "").strip()
            if matches:
                filler_breakdown[clean_name] = len(matches)
                total_fillers += len(matches)

        filler_ratio = round((total_fillers / max(1, word_count)) * 100.0, 2)
        filler_penalty = min(40.0, filler_ratio * 6.0)

        # 3. Composure Index (C_composure)
        # Steady pitch variance (10 - 25 Hz is conversational, >35 is agitated/nervous)
        pitch_score = 100.0
        if req.pitch_variance_hz:
            if req.pitch_variance_hz > 30.0:
                pitch_score -= min(30.0, (req.pitch_variance_hz - 30.0) * 2.0)

        composure_index = round(
            max(0.0, min(100.0, (pace_score * 0.45) + ((100.0 - filler_penalty) * 0.40) + (pitch_score * 0.15))),
            1
        )

        return {
            "candidate_id": req.candidate_id,
            "word_count": word_count,
            "duration_seconds": req.duration_seconds,
            "words_per_minute": wpm,
            "pace_rating": pace_rating,
            "optimal_pace_window_wpm": [130, 150],
            "total_filler_count": total_fillers,
            "filler_ratio_percent": filler_ratio,
            "filler_breakdown": filler_breakdown,
            "composure_index": composure_index,
            "vocal_stability": "EXCELLENT" if composure_index >= 85.0 else ("GOOD" if composure_index >= 70.0 else "NERVOUS_PACE")
        }


behavioral_service = BehavioralAnalyticsService()
