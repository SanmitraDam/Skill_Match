"""
Multi-Agent Fractional Project Swarm Assembler Service — SkillMatch DNA v20.0
Pillar 3: Fractional Squad Assembly, Algorithmic Complementarity & Smart Escrow
Dynamically compiles hybrid squads combining internal staff, verified fractional talent,
and autonomous AI agents under smart contract milestone escrow governance.
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

class SwarmMember(BaseModel):
    member_id: str
    name: str
    member_type: str # INTERNAL_STAFF, FRACTIONAL_EXPERT, AI_AGENT
    role: str
    verified_skills: List[str]
    ccrs_score: float
    allocation_pct: float
    rate_inr_hr: float
    wallet_address: str


class ProjectMilestone(BaseModel):
    milestone_id: str
    title: str
    escrow_amount_inr: float
    due_week: int
    unit_tests_required: int
    is_completed: bool = False
    is_disbursed: bool = False
    verification_hash: Optional[str] = None


class AssembleSwarmRequest(BaseModel):
    project_name: str
    required_skills: List[str]
    budget_inr: float = 4980000
    duration_weeks: int = 6
    internal_staff_count: int = 2
    fractional_expert_count: int = 1
    ai_agent_count: int = 2


class ProjectSwarmSquad(BaseModel):
    squad_id: str
    project_name: str
    complementarity_score: float # 0 - 100%
    skill_coverage_pct: float
    total_budget_inr: float
    escrow_contract_address: str
    members: List[SwarmMember]
    milestones: List[ProjectMilestone]
    status: str = "ACTIVE"
    created_at: float = Field(default_factory=time.time)


class MilestoneVerificationRequest(BaseModel):
    squad_id: str
    milestone_id: str
    unit_test_pass: bool
    code_review_score: float # 0 - 100%
    manager_approved: bool
    tx_hash: Optional[str] = None


class RoyaltyDistribution(BaseModel):
    squad_id: str
    total_royalty_points: int
    distributions: List[Dict[str, Any]]
    distributed_at: float = Field(default_factory=time.time)


# ---------------------------------------------------------------------------
# Service Implementation
# ---------------------------------------------------------------------------

class ProjectSwarmService:
    def __init__(self):
        self._squads: Dict[str, ProjectSwarmSquad] = {}
        self._seed_default_squad()

    def _seed_default_squad(self):
        squad_id = "squad-swarm-alpha-01"
        members = [
            SwarmMember(
                member_id="mem-int-01",
                name="Siddharth Rao",
                member_type="INTERNAL_STAFF",
                role="Lead Systems Engineer",
                verified_skills=["Rust", "WebAssembly", "FastAPI"],
                ccrs_score=89.2,
                allocation_pct=60.0,
                rate_inr_hr=7885,
                wallet_address="0x71C...aB39"
            ),
            SwarmMember(
                member_id="mem-int-02",
                name="Claire Dupont",
                member_type="INTERNAL_STAFF",
                role="Backend Architect",
                verified_skills=["Python", "Docker", "PostgreSQL"],
                ccrs_score=86.4,
                allocation_pct=50.0,
                rate_inr_hr=7470,
                wallet_address="0x94B...eC21"
            ),
            SwarmMember(
                member_id="mem-frac-01",
                name="Takahiro Mori",
                member_type="FRACTIONAL_EXPERT",
                role="WebRTC / eBPF Kernel Specialist",
                verified_skills=["eBPF", "WebRTC", "C++", "Linux Kernel"],
                ccrs_score=94.8,
                allocation_pct=30.0,
                rate_inr_hr=13695,
                wallet_address="0x42F...d87A"
            ),
            SwarmMember(
                member_id="agent-cr-01",
                name="Sentinel Code Reviewer Agent",
                member_type="AI_AGENT",
                role="Automated Static & Semantic Verifier",
                verified_skills=["Static Analysis", "Vulnerability Scanner", "AST Diff"],
                ccrs_score=98.0,
                allocation_pct=100.0,
                rate_inr_hr=996,
                wallet_address="0xAgent...01"
            ),
            SwarmMember(
                member_id="agent-qa-02",
                name="Fuzzing QA Sentinel Agent",
                member_type="AI_AGENT",
                role="Autonomous Test Harness & Load Generator",
                verified_skills=["E2E Testing", "Fuzzing", "Chaos Engineering"],
                ccrs_score=97.5,
                allocation_pct=100.0,
                rate_inr_hr=830,
                wallet_address="0xAgent...02"
            )
        ]

        milestones = [
            ProjectMilestone(
                milestone_id="ms-01",
                title="Sprint 1: Architecture Specification & Core Kernel Sandbox",
                escrow_amount_inr=1245000,
                due_week=2,
                unit_tests_required=25,
                is_completed=True,
                is_disbursed=True,
                verification_hash="0x9f8e7d6c5b4a3f2e1d0c"
            ),
            ProjectMilestone(
                milestone_id="ms-02",
                title="Sprint 2: WebRTC / eBPF High-Throughput Pipeline",
                escrow_amount_inr=2075000,
                due_week=4,
                unit_tests_required=45,
                is_completed=False,
                is_disbursed=False
            ),
            ProjectMilestone(
                milestone_id="ms-03",
                title="Sprint 3: Production Rollout & Post-Mortem Audit",
                escrow_amount_inr=1660000,
                due_week=6,
                unit_tests_required=60,
                is_completed=False,
                is_disbursed=False
            )
        ]

        self._squads[squad_id] = ProjectSwarmSquad(
            squad_id=squad_id,
            project_name="High-Throughput Spatial Media Pipeline",
            complementarity_score=93.6,
            skill_coverage_pct=96.0,
            total_budget_inr=4980000,
            escrow_contract_address="0xSwarmEscrow7f9a2b4c8e1d3f5a0b2c",
            members=members,
            milestones=milestones
        )

    def assemble_squad(self, req: AssembleSwarmRequest) -> ProjectSwarmSquad:
        """
        Dynamically compiles a hybrid squad matching requested skills.
        Calculates algorithmic complementarity based on skill overlap, velocity, and synergy.
        """
        squad_id = f"squad-{uuid.uuid4().hex[:8]}"

        members: List[SwarmMember] = []

        # Internal staff allocation
        for i in range(req.internal_staff_count):
            members.append(SwarmMember(
                member_id=f"mem-int-{i+1}",
                name=f"Internal Lead {i+1}",
                member_type="INTERNAL_STAFF",
                role="Core Systems Contributor",
                verified_skills=req.required_skills[:max(1, len(req.required_skills)//2)],
                ccrs_score=87.5 + (i * 2.0),
                allocation_pct=50.0,
                rate_inr_hr=7055,
                wallet_address=f"0xStaff{uuid.uuid4().hex[:6]}"
            ))

        # Fractional expert allocation
        for j in range(req.fractional_expert_count):
            members.append(SwarmMember(
                member_id=f"mem-frac-{j+1}",
                name=f"Fractional Specialist {j+1}",
                member_type="FRACTIONAL_EXPERT",
                role="Domain Architecture Authority",
                verified_skills=req.required_skills[max(1, len(req.required_skills)//2):],
                ccrs_score=93.0 + (j * 1.5),
                allocation_pct=35.0,
                rate_inr_hr=12450,
                wallet_address=f"0xFrac{uuid.uuid4().hex[:6]}"
            ))

        # Autonomous AI agents
        agent_roles = [
            ("Code Reviewer Sentinel", ["Static Analysis", "Code Audit"], 12.0),
            ("Autonomous QA Fuzzer", ["Fuzzing", "E2E Testing"], 10.0),
            ("DevOps CI Orchestrator", ["Continuous Integration", "WASM Bench"], 8.0)
        ]
        for k in range(min(req.ai_agent_count, len(agent_roles))):
            role_name, agent_skills, hourly = agent_roles[k]
            members.append(SwarmMember(
                member_id=f"agent-ai-{k+1}",
                name=f"Autonomous {role_name}",
                member_type="AI_AGENT",
                role=role_name,
                verified_skills=agent_skills,
                ccrs_score=97.0,
                allocation_pct=100.0,
                rate_inr_hr=hourly,
                wallet_address=f"0xAgent{uuid.uuid4().hex[:6]}"
            ))

        # Complementarity score
        skill_coverage = min(100.0, round((len(members) / max(len(req.required_skills), 1)) * 92.0, 1))
        complementarity = min(98.5, round(82.0 + (len(members) * 2.5), 1))

        # Generate milestones
        milestone_budget = req.budget_inr / 3.0
        milestones = [
            ProjectMilestone(
                milestone_id=f"ms-{squad_id}-01",
                title="Phase 1: Proof of Concept & High-Throughput Kernel",
                escrow_amount_inr=round(milestone_budget * 0.3, 2),
                due_week=max(1, req.duration_weeks // 3),
                unit_tests_required=20
            ),
            ProjectMilestone(
                milestone_id=f"ms-{squad_id}-02",
                title="Phase 2: Full Integration & Agentic Validation",
                escrow_amount_inr=round(milestone_budget * 0.4, 2),
                due_week=max(2, (req.duration_weeks * 2) // 3),
                unit_tests_required=40
            ),
            ProjectMilestone(
                milestone_id=f"ms-{squad_id}-03",
                title="Phase 3: Production Rollout & Final Clearance",
                escrow_amount_inr=round(milestone_budget * 0.3, 2),
                due_week=req.duration_weeks,
                unit_tests_required=50
            )
        ]

        squad = ProjectSwarmSquad(
            squad_id=squad_id,
            project_name=req.project_name,
            complementarity_score=complementarity,
            skill_coverage_pct=skill_coverage,
            total_budget_inr=req.budget_inr,
            escrow_contract_address=f"0xSwarmEscrow{uuid.uuid4().hex[:12]}",
            members=members,
            milestones=milestones
        )

        self._squads[squad_id] = squad
        return squad

    def get_squad(self, squad_id: str) -> Optional[ProjectSwarmSquad]:
        return self._squads.get(squad_id)

    def list_squads(self) -> List[ProjectSwarmSquad]:
        return list(self._squads.values())

    def verify_milestone(self, req: MilestoneVerificationRequest) -> Dict[str, Any]:
        """
        Performance-based escrow release verification.
        Requires unit test pass, code review score >= 80%, and manager sign-off.
        """
        squad = self._squads.get(req.squad_id)
        if not squad:
            return {"status": "ERROR", "message": "Squad not found"}

        milestone = next((m for m in squad.milestones if m.milestone_id == req.milestone_id), None)
        if not milestone:
            return {"status": "ERROR", "message": "Milestone not found in squad"}

        cleared = req.unit_test_pass and req.code_review_score >= 80.0 and req.manager_approved

        if cleared:
            milestone.is_completed = True
            milestone.is_disbursed = True
            milestone.verification_hash = f"0xHash{uuid.uuid4().hex[:16]}"

        return {
            "squad_id": req.squad_id,
            "milestone_id": req.milestone_id,
            "disbursed": cleared,
            "escrow_amount_inr": milestone.escrow_amount_inr,
            "verification_hash": milestone.verification_hash,
            "unit_tests_passed": req.unit_test_pass,
            "code_review_score": req.code_review_score,
            "manager_approval": req.manager_approved,
            "smart_contract_status": "FUNDS_DISBURSED_TO_WALLETS" if cleared else "HELD_IN_ESCROW"
        }

    def calculate_royalties(self, squad_id: str) -> RoyaltyDistribution:
        """
        Computes micro-equity / royalty points based on code contribution volume
        and system performance metrics.
        """
        squad = self._squads.get(squad_id)
        total_points = 10000

        if not squad:
            return RoyaltyDistribution(squad_id=squad_id, total_royalty_points=0, distributions=[])

        distributions = []
        member_count = len(squad.members)
        base_share = total_points // max(member_count, 1)

        for member in squad.members:
            # Weight by CCRS and allocation
            weight = (member.ccrs_score / 100.0) * (member.allocation_pct / 100.0)
            allocated = int(base_share * (0.5 + weight))
            distributions.append({
                "member_id": member.member_id,
                "name": member.name,
                "member_type": member.member_type,
                "wallet": member.wallet_address,
                "royalty_points": allocated,
                "royalty_share_pct": round((allocated / total_points) * 100.0, 2)
            })

        return RoyaltyDistribution(
            squad_id=squad_id,
            total_royalty_points=total_points,
            distributions=distributions
        )


# Global singleton
project_swarm_service = ProjectSwarmService()
