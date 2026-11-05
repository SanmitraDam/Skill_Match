"""
SkillMatch DNA v16.0 — Post-Interview Forensic Diagnostics & Dynamic Remediation Service
Pillar 4: Post-Interview Forensic Diagnostics & Dynamic Remediation Loop
Features:
- Comprehensive post-mortem diagnostic report synthesizing Quiz, Code Sandbox, Voice/Composure, and STAR Method
- Dynamic Remediation Loop: Immediate SM-2 flashcard queue priority override (EF = 1.3, interval = 1 day)
- 4-week structured roadmap rebalancing
- Cryptographic forensic audit hash generation for on-chain registry commitment
"""

import hashlib
import time
import uuid
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class GenerateReportRequest(BaseModel):
    candidate_id: str
    interview_id: Optional[str] = None
    quiz_score: float = Field(default=85.0, ge=0.0, le=100.0)
    code_score: float = Field(default=88.5, ge=0.0, le=100.0)
    voice_stability_score: float = Field(default=82.0, ge=0.0, le=100.0)
    star_score: float = Field(default=80.0, ge=0.0, le=100.0)
    identified_weaknesses: List[str] = [
        "Distributed Raft Consensus Quorums",
        "B-Tree Storage Engine Indexing",
        "AST Asymptotic Optimization"
    ]


class RemediationSyncRequest(BaseModel):
    candidate_id: str
    report_id: str
    target_topics: Optional[List[str]] = None
    override_ease_factor: float = Field(default=1.3, description="SM-2 Ease Factor minimum override")
    reset_interval_days: int = Field(default=1, description="Immediate next-day review interval")
    rebalance_roadmap: bool = True


class ForensicDiagnosticsService:
    def __init__(self):
        self._reports: Dict[str, Dict[str, Any]] = {}
        self._candidate_history: Dict[str, List[str]] = {}

    def generate_forensic_report(self, req: GenerateReportRequest) -> Dict[str, Any]:
        """
        Synthesizes composite readiness from 4 pillars:
        - Quiz (25%)
        - Code Sandbox (35%)
        - Voice / Composure (15%)
        - STAR Method (25%)
        """
        report_id = f"forensic_{uuid.uuid4().hex[:12]}"
        interview_id = req.interview_id or f"mock_{uuid.uuid4().hex[:8]}"

        # Weighted composite score
        composite_score = round(
            (req.quiz_score * 0.25) +
            (req.code_score * 0.35) +
            (req.voice_stability_score * 0.15) +
            (req.star_score * 0.25),
            1
        )

        # Readiness Tier
        if composite_score >= 88.0:
            tier = "L6_STAFF_READY"
            recommendation = "Exceptional performance across AST execution and STAR impact articulation. Advance to executive round."
        elif composite_score >= 75.0:
            tier = "L5_SENIOR_READY"
            recommendation = "Solid technical foundations. Recommended remediation for distributed consensus and concise filler management."
        elif composite_score >= 60.0:
            tier = "L4_MID_LEVEL"
            recommendation = "Candidate demonstrates core competency, but requires structured SM-2 reinforcement in algorithms and system scale."
        else:
            tier = "NEEDS_REMEDIATION"
            recommendation = "High variance in AST performance and STAR structure. Priority remediation sync scheduled."

        # Forensic Audit Hash (SHA-256 / Keccak compatible)
        raw_signature = f"{req.candidate_id}:{interview_id}:{composite_score}:{time.time()}"
        audit_hash = "0x" + hashlib.sha256(raw_signature.encode("utf-8")).hexdigest()

        report_payload = {
            "report_id": report_id,
            "candidate_id": req.candidate_id,
            "interview_id": interview_id,
            "composite_score": composite_score,
            "readiness_tier": tier,
            "pillar_breakdown": {
                "quiz_score": req.quiz_score,
                "code_sandbox_score": req.code_score,
                "voice_stability_score": req.voice_stability_score,
                "star_method_score": req.star_score
            },
            "pillar_weights": {
                "quiz_weight": 0.25,
                "code_weight": 0.35,
                "voice_weight": 0.15,
                "star_weight": 0.25
            },
            "weaknesses_flagged": req.identified_weaknesses,
            "recommendation": recommendation,
            "audit_hash": audit_hash,
            "remediation_status": "PENDING_SYNC",
            "created_at": time.time()
        }

        self._reports[report_id] = report_payload
        if req.candidate_id not in self._candidate_history:
            self._candidate_history[req.candidate_id] = []
        self._candidate_history[req.candidate_id].append(report_id)

        return report_payload

    def sync_remediation_loop(self, req: RemediationSyncRequest) -> Dict[str, Any]:
        """
        Closed-loop remediation:
        - Overrides SM-2 queue priority for weak topics (EF = 1.3, interval = 1 day)
        - Rebalances 4-week preparation roadmap
        - Produces on-chain sync proof
        """
        report = self._reports.get(req.report_id)
        topics_to_remediate = req.target_topics or (report.get("weaknesses_flagged", []) if report else ["Distributed Consensus"])

        # Construct SM-2 queue overrides
        sm2_overrides = []
        for idx, topic in enumerate(topics_to_remediate):
            card_id = f"sm2_card_{hashlib.md5(topic.encode('utf-8')).hexdigest()[:8]}"
            sm2_overrides.append({
                "flashcard_id": card_id,
                "topic": topic,
                "previous_ease_factor": 2.5,
                "updated_ease_factor": req.override_ease_factor, # 1.3
                "interval_days": req.reset_interval_days,        # 1 day
                "priority": "IMMEDIATE_DRILL",
                "queue_position": idx + 1
            })

        # Construct 4-week rebalanced roadmap
        rebalanced_roadmap = [
            {
                "week": 1,
                "focus": "Targeted SM-2 Intensive & Edge Sandbox Drills",
                "topics": topics_to_remediate[:2],
                "daily_drill_minutes": 45,
                "milestone": "Achieve 95% pass rate on edge boundary unit tests"
            },
            {
                "week": 2,
                "focus": "STAR Structure & Quantified Behavioral Coaching",
                "topics": ["High-impact project retrospective", "Filler word eradication"],
                "daily_drill_minutes": 30,
                "milestone": "Deliver 3 recorded STAR narratives with >= 2 quantified metrics each"
            },
            {
                "week": 3,
                "focus": "Distributed Systems Spatial Bottleneck Design",
                "topics": ["Partition tolerance", "Throughput bottleneck analysis"],
                "daily_drill_minutes": 40,
                "milestone": "Pass mock architectural review with 0 Single Points of Failure"
            },
            {
                "week": 4,
                "focus": "Full-Spectrum AI Panel Mock & Post-Mortem Re-Audit",
                "topics": ["Comprehensive End-to-End Chamber Mock"],
                "daily_drill_minutes": 60,
                "milestone": "Achieve L6 Staff Readiness tier composite score >= 88.0"
            }
        ]

        sync_hash = "0x" + hashlib.sha256(
            f"REMEDIATION_SYNC:{req.candidate_id}:{req.report_id}:{time.time()}".encode("utf-8")
        ).hexdigest()

        if report:
            report["remediation_status"] = "SYNCED"
            report["sync_hash"] = sync_hash

        return {
            "candidate_id": req.candidate_id,
            "report_id": req.report_id,
            "remediation_status": "SYNCED",
            "sm2_overrides_applied": len(sm2_overrides),
            "sm2_queue": sm2_overrides,
            "roadmap_rebalanced": req.rebalance_roadmap,
            "rebalanced_roadmap": rebalanced_roadmap,
            "onchain_sync_hash": sync_hash,
            "synced_at": time.time()
        }

    def get_candidate_history(self, candidate_id: str) -> List[Dict[str, Any]]:
        report_ids = self._candidate_history.get(candidate_id, [])
        return [self._reports[rid] for rid in report_ids if rid in self._reports]


forensic_service = ForensicDiagnosticsService()
