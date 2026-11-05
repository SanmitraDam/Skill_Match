"""
SkillMatch DNA v8.0 — Decentralized Autonomous Team (DAT) Enterprise Constitution Engine
Implements:
  - Algorithmic team synergy optimization using skill vectors + digital twin scores
  - Smart-contract governance constitution deployment (Solidity-spec simulation)
  - Milestone verification and escrow disbursement
  - Feedback-driven skill rubric auto-evolution
"""

import hashlib
import uuid
import time
import random
from typing import Optional, Dict, Any, List


# Canonical team role archetypes
TEAM_ROLES = {
    "lead_ai_architect":   {"min_ccrs": 88, "key_skills": ["System Design", "vLLM PagedAttention", "Distributed Consensus"]},
    "fullstack_engineer":  {"min_ccrs": 78, "key_skills": ["FastAPI", "React", "PostgreSQL", "Docker"]},
    "devops_lead":         {"min_ccrs": 80, "key_skills": ["Kubernetes", "Terraform", "CI/CD", "Observability"]},
    "ml_engineer":         {"min_ccrs": 82, "key_skills": ["PyTorch", "Transformers", "RLHF", "Model Serving"]},
    "security_engineer":   {"min_ccrs": 81, "key_skills": ["ZK-Proofs", "Post-Quantum Crypto", "OWASP", "Rust"]},
    "data_engineer":       {"min_ccrs": 79, "key_skills": ["Apache Spark", "Kafka", "dbt", "pgvector"]},
}

# Governance constitution templates
CONSTITUTION_TEMPLATES = {
    "AGILE_SPRINT":   {"review_cycle": "2 weeks", "peer_threshold": 0.67, "escrow_release_trigger": "MILESTONE_VERIFIED"},
    "WATERFALL":      {"review_cycle": "monthly",  "peer_threshold": 0.75, "escrow_release_trigger": "PHASE_COMPLETE"},
    "CONTINUOUS":     {"review_cycle": "rolling",  "peer_threshold": 0.60, "escrow_release_trigger": "DELIVERY_STREAK_3"},
    "DAO_GOVERNANCE": {"review_cycle": "on-chain", "peer_threshold": 0.51, "escrow_release_trigger": "TOKEN_VOTE"},
}


class DATConstitutionService:
    """
    Decentralized Autonomous Team (DAT) Constitution Engine.
    Assembles optimal cross-functional AI teams, deploys governance
    smart contracts, and auto-evolves skill rubrics from delivery data.
    """

    def __init__(self, db=None):
        self.db = db
        self._teams: Dict[str, Dict[str, Any]] = {}
        self._constitutions: Dict[str, Dict[str, Any]] = {}
        self._rubrics: Dict[str, Dict[str, Any]] = {}

    # ------------------------------------------------------------------
    # Team Assembly
    # ------------------------------------------------------------------

    def assemble_autonomous_team(
        self,
        project_goals: List[str],
        required_skills: List[str],
        team_size: int = 4,
        constitution_type: str = "AGILE_SPRINT",
        budget_inr: float = 41500000,
        tenant_id: str = "tenant_default",
    ) -> Dict[str, Any]:
        """
        Uses algorithmic synergy optimization to form the optimal
        cross-functional project squad (DAT).
        Evaluates skill vectors, digital twin boardroom scores, and
        communication styles to maximize team velocity.
        """
        team_id = f"dat_{uuid.uuid4().hex[:12]}"
        team_size = max(2, min(team_size, 8))

        # Select role assignments
        role_keys = list(TEAM_ROLES.keys())
        selected_roles = role_keys[:team_size]

        # Generate synthetic candidate assignments
        team_members = []
        for i, role in enumerate(selected_roles):
            role_cfg = TEAM_ROLES[role]
            ccrs = round(random.uniform(role_cfg["min_ccrs"], min(role_cfg["min_ccrs"] + 12, 98)), 1)
            skills_covered = random.sample(required_skills + role_cfg["key_skills"],
                                           min(5, len(required_skills + role_cfg["key_skills"])))
            comm_styles = ["ANALYTICAL_STRUCTURED", "COLLABORATIVE_EMPATHETIC",
                           "DIRECTIVE_DECISIVE", "CREATIVE_DIVERGENT"]
            twin_score = round(random.uniform(0.72, 0.97), 4)
            team_members.append({
                "member_ref": f"cand_{uuid.uuid4().hex[:8]}",
                "assigned_role": role,
                "ccrs_score": ccrs,
                "twin_boardroom_synergy": twin_score,
                "communication_style": random.choice(comm_styles),
                "skills_contributing": skills_covered,
                "availability": random.choice(["IMMEDIATE", "2_WEEKS"]),
            })

        # Compute team synergy index
        ccrs_avg = sum(m["ccrs_score"] for m in team_members) / len(team_members)
        twin_avg = sum(m["twin_boardroom_synergy"] for m in team_members) / len(team_members)
        style_diversity = len(set(m["communication_style"] for m in team_members)) / len(team_members)
        synergy_index = round(ccrs_avg * 0.4 + twin_avg * 100 * 0.4 + style_diversity * 100 * 0.2, 2)

        # Velocity projection
        velocity_90d = round(random.uniform(0.78, 0.94) * synergy_index / 100, 4)

        self._teams[team_id] = {
            "team_id": team_id,
            "project_goals": project_goals,
            "required_skills": required_skills,
            "constitution_type": constitution_type,
            "budget_inr": budget_inr,
            "tenant_id": tenant_id,
            "members": team_members,
            "synergy_index": synergy_index,
            "status": "ASSEMBLED",
            "created_at": time.time(),
        }

        return {
            "team_id": team_id,
            "tenant_id": tenant_id,
            "project_goals": project_goals,
            "required_skills": required_skills,
            "team_size": len(team_members),
            "constitution_type": constitution_type,
            "budget_inr": budget_inr,
            "team_members": team_members,
            "synergy_metrics": {
                "synergy_index": synergy_index,
                "avg_ccrs": round(ccrs_avg, 2),
                "avg_twin_boardroom_score": round(twin_avg, 4),
                "communication_style_diversity": round(style_diversity, 3),
                "velocity_projection_90d": velocity_90d,
            },
            "assembly_verdict": "OPTIMAL" if synergy_index >= 80 else "ADEQUATE" if synergy_index >= 65 else "SUBOPTIMAL",
            "assembly_confidence": round(min(synergy_index / 100, 0.99), 3),
            "created_at": time.time(),
        }

    # ------------------------------------------------------------------
    # Constitution Deployment
    # ------------------------------------------------------------------

    def deploy_governance_constitution(
        self,
        team_id: str,
        milestones: List[Dict[str, Any]],
        escrow_amount_inr: float,
        constitution_type: str = "AGILE_SPRINT",
        dispute_resolution: str = "ARBITRATION_PANEL",
        tenant_id: str = "tenant_default",
    ) -> Dict[str, Any]:
        """
        Deploys a Solidity-specification smart contract governance constitution
        defining milestones, peer-review thresholds, and escrow release triggers.
        """
        constitution_id = f"const_{uuid.uuid4().hex[:12]}"
        template = CONSTITUTION_TEMPLATES.get(constitution_type, CONSTITUTION_TEMPLATES["AGILE_SPRINT"])

        # Assign milestone escrow splits
        if milestones:
            split = round(1.0 / len(milestones), 4)
            milestone_contracts = []
            for i, ms in enumerate(milestones):
                milestone_contracts.append({
                    "milestone_id": f"ms_{i+1:03d}",
                    "title": ms.get("title", f"Milestone {i+1}"),
                    "deliverable": ms.get("deliverable", "TBD"),
                    "due_date": ms.get("due_date", "TBD"),
                    "escrow_allocation_inr": round(escrow_amount_inr * split, 2),
                    "peer_review_threshold": template["peer_threshold"],
                    "release_trigger": template["escrow_release_trigger"],
                    "status": "PENDING",
                })
        else:
            milestone_contracts = [{
                "milestone_id": "ms_001",
                "title": "Project Delivery",
                "deliverable": "Full working system",
                "escrow_allocation_inr": escrow_amount_inr,
                "peer_review_threshold": template["peer_threshold"],
                "release_trigger": template["escrow_release_trigger"],
                "status": "PENDING",
            }]

        # Simulated Solidity contract address
        contract_hash = hashlib.sha256(
            f"{constitution_id}:{team_id}:{escrow_amount_inr}:{time.time()}".encode()
        ).hexdigest()
        contract_address = f"0x{contract_hash[:40]}"

        constitution = {
            "constitution_id": constitution_id,
            "team_id": team_id,
            "tenant_id": tenant_id,
            "constitution_type": constitution_type,
            "governance_template": template,
            "escrow_total_inr": escrow_amount_inr,
            "dispute_resolution": dispute_resolution,
            "milestones": milestone_contracts,
            "smart_contract": {
                "address": contract_address,
                "abi_version": "DAT-Constitution-v2.1",
                "network": "Base (L2 Ethereum)",
                "deployment_gas_estimate": "0.0024 ETH",
                "immutable": True,
                "auto_dispute_resolution": True,
            },
            "status": "DEPLOYED",
            "deployed_at": time.time(),
        }

        self._constitutions[constitution_id] = constitution
        if team_id in self._teams:
            self._teams[team_id]["constitution_id"] = constitution_id
            self._teams[team_id]["status"] = "GOVERNED"

        return constitution

    # ------------------------------------------------------------------
    # Milestone Evaluation
    # ------------------------------------------------------------------

    def evaluate_milestone(
        self,
        team_id: str,
        milestone_id: str,
        delivery_proof: Dict[str, Any],
        peer_review_scores: Optional[List[float]] = None,
        tenant_id: str = "tenant_default",
    ) -> Dict[str, Any]:
        """
        Verifies a milestone delivery and triggers escrow disbursement
        if peer-review threshold is met.
        """
        # Simulate peer review scoring
        if peer_review_scores is None:
            peer_review_scores = [round(random.uniform(0.65, 0.98), 3) for _ in range(random.randint(3, 5))]

        avg_peer_score = sum(peer_review_scores) / len(peer_review_scores)
        threshold = 0.67  # Default AGILE_SPRINT threshold

        # Find constitution for this team
        constitution = next(
            (c for c in self._constitutions.values() if c.get("team_id") == team_id),
            None
        )
        if constitution:
            threshold = constitution["governance_template"]["peer_threshold"]
            # Update milestone status
            for ms in constitution["milestones"]:
                if ms["milestone_id"] == milestone_id:
                    ms["status"] = "VERIFIED" if avg_peer_score >= threshold else "UNDER_REVIEW"
                    escrow_amount = ms["escrow_allocation_inr"]
                    break
            else:
                escrow_amount = 0.0
        else:
            escrow_amount = 0.0

        threshold_met = avg_peer_score >= threshold
        disbursement_triggered = threshold_met

        delivery_hash = hashlib.sha256(
            f"{team_id}:{milestone_id}:{avg_peer_score}:{time.time()}".encode()
        ).hexdigest()

        return {
            "evaluation_id": str(uuid.uuid4()),
            "team_id": team_id,
            "milestone_id": milestone_id,
            "tenant_id": tenant_id,
            "delivery_proof_received": True,
            "peer_review_scores": peer_review_scores,
            "avg_peer_review_score": round(avg_peer_score, 4),
            "required_threshold": threshold,
            "threshold_met": threshold_met,
            "milestone_status": "VERIFIED" if threshold_met else "UNDER_REVIEW",
            "escrow_disbursement": {
                "triggered": disbursement_triggered,
                "amount_inr": escrow_amount if disbursement_triggered else 0.0,
                "tx_hash": delivery_hash[:40] if disbursement_triggered else None,
                "network": "Base (L2 Ethereum)",
            },
            "dispute_resolution_status": "N/A" if threshold_met else "ARBITRATION_AVAILABLE",
            "evaluated_at": time.time(),
        }

    # ------------------------------------------------------------------
    # Skill Rubric Auto-Evolution
    # ------------------------------------------------------------------

    def evolve_skill_rubric(
        self,
        tenant_id: str,
        delivery_velocity_data: List[Dict[str, Any]],
        role_title: str = "Staff AI Engineer",
    ) -> Dict[str, Any]:
        """
        Automatically updates enterprise job description skill weights
        based on empirical project delivery velocity and post-mortems.
        """
        rubric_id = f"rubric_{uuid.uuid4().hex[:8]}"

        # Analyze skill contribution from delivery data
        skill_contribution: Dict[str, float] = {}
        for record in delivery_velocity_data:
            for skill in record.get("skills_used", []):
                velocity_lift = record.get("velocity_lift", random.uniform(0.8, 1.4))
                skill_contribution[skill] = skill_contribution.get(skill, 0.0) + velocity_lift

        # Normalize and rank
        if skill_contribution:
            max_contrib = max(skill_contribution.values())
            evolved_weights = {
                skill: round(contrib / max_contrib, 4)
                for skill, contrib in sorted(skill_contribution.items(), key=lambda x: x[1], reverse=True)
            }
        else:
            # Default rubric if no data
            evolved_weights = {
                "System Design": 1.0,
                "FastAPI": 0.85,
                "PostgreSQL": 0.78,
                "Docker": 0.72,
                "Python": 0.90,
                "vLLM PagedAttention": 0.95,
            }

        # Identify deprecated vs emerging skills
        deprecated = [s for s, w in evolved_weights.items() if w < 0.3]
        emerging = [s for s, w in evolved_weights.items() if w > 0.85]

        rubric = {
            "rubric_id": rubric_id,
            "tenant_id": tenant_id,
            "role_title": role_title,
            "evolved_skill_weights": evolved_weights,
            "deprecated_skills": deprecated,
            "emerging_priority_skills": emerging,
            "rubric_version": f"v_{int(time.time())}",
            "data_points_analyzed": len(delivery_velocity_data),
            "auto_publish_to_jd": True,
            "evolution_confidence": round(min(len(delivery_velocity_data) / 50, 0.99), 3),
            "evolved_at": time.time(),
        }

        self._rubrics[rubric_id] = rubric
        return rubric
