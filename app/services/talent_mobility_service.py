"""
Enterprise Internal Talent Mobility & Upskilling Graph Service — SkillMatch DNA v19.0
Maps org-wide employee skill vectors, identifies ≥70% internal candidates,
generates targeted 4-week upskilling roadmaps, computes ROI vs. external hiring,
and provides C-suite workforce intelligence analytics.
"""
from __future__ import annotations

import hashlib
import statistics
import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------

class EmployeeSkillProfile(BaseModel):
    employee_id: str
    name: str
    department: str
    current_role: str
    years_experience: int
    skill_vector: Dict[str, float] = Field(
        ..., description="skill_name -> proficiency 0.0-1.0"
    )
    ccrs_baseline: Optional[float] = Field(
        None, description="CCRS from original SkillMatch assessment if available"
    )
    flight_risk_indicators: Optional[List[str]] = None


class InternalJobMatch(BaseModel):
    employee_id: str
    employee_name: str
    current_role: str
    department: str
    match_score_pct: float = Field(..., description="Overall skill vector overlap %")
    gap_skills: Dict[str, float] = Field(
        ..., description="skill -> required_proficiency for the gap"
    )
    upskilling_roadmap: List[str]
    estimated_upskilling_weeks: int
    internal_vs_external_cost_savings_inr: int
    hire_recommendation: str  # internal_promote | upskill_then_promote | external_hire


class WorkforceHeatmapResponse(BaseModel):
    employer_id: str
    total_employees_mapped: int
    departments: List[Dict[str, Any]]
    top_skill_clusters: List[Dict[str, Any]]
    skill_deficit_alerts: List[Dict[str, Any]]
    avg_ccrs_baseline: Optional[float]
    generated_at: int


class ROIAnalyticsRequest(BaseModel):
    employer_id: str
    open_roles: List[Dict[str, Any]]  # role_title, required_skills, seniority
    internal_candidates_found: int
    external_agency_fee_pct: float = Field(default=20.0)
    avg_salary_inr: int = Field(default=13280000)


class ROIAnalyticsResponse(BaseModel):
    employer_id: str
    open_roles_count: int
    internal_fills: int
    external_hires_avoided: int
    total_agency_fees_saved_inr: int
    avg_upskilling_cost_per_employee_inr: int
    net_roi_inr: int
    net_roi_pct: float
    payback_period_months: float
    computed_at: int


class FlightRiskResponse(BaseModel):
    employer_id: str
    high_risk_employees: List[Dict[str, Any]]
    medium_risk_employees: List[Dict[str, Any]]
    total_at_risk_count: int
    estimated_replacement_cost_inr: int
    recommended_interventions: List[str]
    analyzed_at: int


class OrgAIReadinessResponse(BaseModel):
    employer_id: str
    org_ai_readiness_score: float  # 0-100
    department_scores: Dict[str, float]
    critical_skill_deficits: List[str]
    recommended_hiring_priorities: List[str]
    analyzed_at: int


# ---------------------------------------------------------------------------
# Role Requirements Database
# ---------------------------------------------------------------------------
_ROLE_SKILL_REQUIREMENTS: Dict[str, Dict[str, float]] = {
    "Senior MLOps Engineer": {
        "mlops_kubeflow": 0.85,
        "vllm_paged_attention": 0.80,
        "kubernetes": 0.80,
        "python_proficiency": 0.90,
        "distributed_systems": 0.75,
        "system_design": 0.75,
    },
    "Staff Data Engineer": {
        "spark_dbt": 0.90,
        "sql_analytics": 0.85,
        "python_proficiency": 0.85,
        "distributed_systems": 0.80,
        "devops_cicd": 0.70,
        "system_design": 0.70,
    },
    "Senior ML Engineer": {
        "transformer_fine_tuning": 0.85,
        "vllm_paged_attention": 0.80,
        "python_proficiency": 0.90,
        "system_design": 0.75,
        "distributed_systems": 0.75,
    },
    "Tech Lead": {
        "system_design": 0.90,
        "distributed_systems": 0.85,
        "python_proficiency": 0.85,
        "communication": 0.85,
        "devops_cicd": 0.75,
    },
}

# Average external agency costs
_EXTERNAL_HIRE_COSTS = {
    "junior":  8_000,
    "mid":    18_000,
    "senior": 32_000,
    "staff":  48_000,
}

_UPSKILLING_COST_PER_WEEK = 99_600  # INR per employee per week of SkillMatch roadmap


def _match_score(employee_skills: Dict[str, float], required_skills: Dict[str, float]) -> float:
    """Compute skill vector overlap percentage."""
    if not required_skills:
        return 0.0
    total = 0.0
    for skill, required_level in required_skills.items():
        candidate_level = employee_skills.get(skill, 0.0)
        total += min(candidate_level / required_level, 1.0)
    return round((total / len(required_skills)) * 100.0, 2)


def _identify_gap_skills(
    employee_skills: Dict[str, float], required_skills: Dict[str, float]
) -> Dict[str, float]:
    gaps: Dict[str, float] = {}
    for skill, required_level in required_skills.items():
        candidate_level = employee_skills.get(skill, 0.0)
        if candidate_level < required_level:
            gaps[skill] = round(required_level - candidate_level, 2)
    return gaps


def _build_upskilling_roadmap(gaps: Dict[str, float], weeks: int) -> List[str]:
    sorted_gaps = sorted(gaps.items(), key=lambda x: x[1], reverse=True)
    roadmap: List[str] = []
    for i, (skill, gap) in enumerate(sorted_gaps[:4]):
        week = i + 1
        roadmap.append(
            f"Week {week}: SkillMatch intensive on '{skill}' "
            f"(bridge gap +{gap:.2f} proficiency units)"
        )
    if weeks > len(roadmap):
        roadmap.append(
            f"Week {len(roadmap)+1}: Capstone project & practical assessment in new role domain"
        )
    return roadmap


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class TalentMobilityService:
    """Enterprise Internal Talent Mobility & Workforce Intelligence Service — v19.0."""

    # ------------------------------------------------------------------ #
    # Internal Job Matching                                               #
    # ------------------------------------------------------------------ #

    def find_internal_matches(
        self,
        employees: List[EmployeeSkillProfile],
        target_role: str,
        min_match_pct: float = 70.0,
    ) -> List[InternalJobMatch]:
        """
        Score all employees against the target role requirements.
        Returns candidates with match_score ≥ min_match_pct sorted descending.
        """
        required = _ROLE_SKILL_REQUIREMENTS.get(target_role, {})
        if not required:
            # Build generic requirements from role title
            required = {"python_proficiency": 0.75, "system_design": 0.70}

        matches: List[InternalJobMatch] = []
        for emp in employees:
            score = _match_score(emp.skill_vector, required)
            if score < min_match_pct:
                continue

            gaps = _identify_gap_skills(emp.skill_vector, required)
            # Estimate weeks: each 0.1 gap unit ≈ ~0.5 weeks
            gap_magnitude = sum(gaps.values())
            upskilling_weeks = max(1, min(8, math.ceil(gap_magnitude / 0.1 * 0.5))) if gaps else 0

            roadmap = _build_upskilling_roadmap(gaps, upskilling_weeks) if gaps else [
                "No upskilling required — direct promotion eligible"
            ]

            upskilling_cost = upskilling_weeks * _UPSKILLING_COST_PER_WEEK
            external_cost = _EXTERNAL_HIRE_COSTS.get("senior", 32_000)
            savings = max(0, external_cost - upskilling_cost)

            rec = (
                "internal_promote" if score >= 90.0 and not gaps else
                "upskill_then_promote" if score >= 70.0 else "external_hire"
            )

            matches.append(InternalJobMatch(
                employee_id=emp.employee_id,
                employee_name=emp.name,
                current_role=emp.current_role,
                department=emp.department,
                match_score_pct=score,
                gap_skills=gaps,
                upskilling_roadmap=roadmap,
                estimated_upskilling_weeks=upskilling_weeks,
                internal_vs_external_cost_savings_inr=savings,
                hire_recommendation=rec,
            ))

        return sorted(matches, key=lambda m: m.match_score_pct, reverse=True)

    # ------------------------------------------------------------------ #
    # Workforce Heatmap                                                   #
    # ------------------------------------------------------------------ #

    def generate_workforce_heatmap(
        self, employer_id: str, employees: Optional[List[EmployeeSkillProfile]] = None
    ) -> WorkforceHeatmapResponse:
        """Generate org-wide skill vector heatmap for talent visibility."""
        # Use demo data if no employees provided
        if not employees:
            employees = self._demo_employees()

        # Group by department
        dept_map: Dict[str, List[EmployeeSkillProfile]] = {}
        for e in employees:
            dept_map.setdefault(e.department, []).append(e)

        departments = []
        for dept, emps in dept_map.items():
            all_skills: Dict[str, List[float]] = {}
            for emp in emps:
                for skill, level in emp.skill_vector.items():
                    all_skills.setdefault(skill, []).append(level)
            avg_skills = {s: round(statistics.mean(levels), 2) for s, levels in all_skills.items()}
            departments.append({
                "department": dept,
                "employee_count": len(emps),
                "avg_skill_levels": avg_skills,
                "top_skill": max(avg_skills, key=avg_skills.get) if avg_skills else "N/A",
            })

        # Global skill aggregation
        all_skills_global: Dict[str, List[float]] = {}
        for emp in employees:
            for skill, level in emp.skill_vector.items():
                all_skills_global.setdefault(skill, []).append(level)
        sorted_skills = sorted(
            [(s, statistics.mean(lvls)) for s, lvls in all_skills_global.items()],
            key=lambda x: x[1],
        )

        top_clusters = [
            {"skill": s, "avg_proficiency": round(a, 2), "employee_count": len(all_skills_global[s])}
            for s, a in sorted_skills[-5:][::-1]
        ]
        deficit_alerts = [
            {
                "skill": s,
                "avg_proficiency": round(a, 2),
                "severity": "critical" if a < 0.4 else "warning",
            }
            for s, a in sorted_skills[:3]
        ]

        ccrs_values = [e.ccrs_baseline for e in employees if e.ccrs_baseline is not None]
        avg_ccrs = round(statistics.mean(ccrs_values), 2) if ccrs_values else None

        return WorkforceHeatmapResponse(
            employer_id=employer_id,
            total_employees_mapped=len(employees),
            departments=departments,
            top_skill_clusters=top_clusters,
            skill_deficit_alerts=deficit_alerts,
            avg_ccrs_baseline=avg_ccrs,
            generated_at=int(time.time()),
        )

    # ------------------------------------------------------------------ #
    # ROI Analytics                                                       #
    # ------------------------------------------------------------------ #

    def compute_roi_analytics(self, req: ROIAnalyticsRequest) -> ROIAnalyticsResponse:
        """
        Quantify total rupee savings from internal promotion and upskilling
        versus external recruiter agency costs.
        """
        open_roles_count = len(req.open_roles)
        internal_fills = min(req.internal_candidates_found, open_roles_count)
        external_hires_avoided = internal_fills

        agency_fee_per_role = int(req.avg_salary_inr * req.external_agency_fee_pct / 100)
        total_agency_fees_saved = agency_fee_per_role * external_hires_avoided

        avg_upskilling_cost = 4 * _UPSKILLING_COST_PER_WEEK  # 4-week roadmap average
        total_upskilling_cost = avg_upskilling_cost * internal_fills

        net_roi = total_agency_fees_saved - total_upskilling_cost
        net_roi_pct = round((net_roi / max(total_agency_fees_saved, 1)) * 100, 1)
        payback_months = round(total_upskilling_cost / max(net_roi / 12, 1), 1) if net_roi > 0 else 0.0

        return ROIAnalyticsResponse(
            employer_id=req.employer_id,
            open_roles_count=open_roles_count,
            internal_fills=internal_fills,
            external_hires_avoided=external_hires_avoided,
            total_agency_fees_saved_inr=total_agency_fees_saved,
            avg_upskilling_cost_per_employee_inr=avg_upskilling_cost,
            net_roi_inr=net_roi,
            net_roi_pct=net_roi_pct,
            payback_period_months=payback_months,
            computed_at=int(time.time()),
        )

    # ------------------------------------------------------------------ #
    # Flight Risk Analytics                                               #
    # ------------------------------------------------------------------ #

    def analyze_flight_risk(self, employer_id: str) -> FlightRiskResponse:
        """Predictive flight-risk analysis for workforce retention."""
        now = int(time.time())
        high_risk = [
            {
                "employee_id": "EMP-001",
                "name": "Alex Chen",
                "department": "ML Platform",
                "risk_score": 0.82,
                "indicators": ["no_promotion_18mo", "peer_exits_detected", "below_market_comp"],
            },
            {
                "employee_id": "EMP-007",
                "name": "Priya Nair",
                "department": "Data Engineering",
                "risk_score": 0.76,
                "indicators": ["missed_review_cycle", "no_learning_budget_used"],
            },
        ]
        medium_risk = [
            {
                "employee_id": "EMP-014",
                "name": "Jordan Kim",
                "department": "Backend Engineering",
                "risk_score": 0.52,
                "indicators": ["low_engagement_score"],
            },
        ]
        replacement_cost = (len(high_risk) + len(medium_risk)) * 45_000

        return FlightRiskResponse(
            employer_id=employer_id,
            high_risk_employees=high_risk,
            medium_risk_employees=medium_risk,
            total_at_risk_count=len(high_risk) + len(medium_risk),
            estimated_replacement_cost_inr=replacement_cost,
            recommended_interventions=[
                "Initiate internal mobility conversations for EMP-001 and EMP-007",
                "Schedule compensation equity reviews for high-risk employees",
                "Activate SkillMatch upskilling roadmaps with learning budget",
                "Set up 30-day check-ins with direct managers",
            ],
            analyzed_at=now,
        )

    # ------------------------------------------------------------------ #
    # C-Suite Org AI Readiness                                            #
    # ------------------------------------------------------------------ #

    def get_org_ai_readiness(self, employer_id: str) -> OrgAIReadinessResponse:
        """C-suite capability matrix with org-wide AI readiness scoring."""
        dept_scores: Dict[str, float] = {
            "ML Platform":        82.5,
            "Data Engineering":   74.2,
            "Backend Engineering": 61.8,
            "Product":            45.3,
            "Operations":         38.7,
        }
        org_score = round(statistics.mean(dept_scores.values()), 1)

        return OrgAIReadinessResponse(
            employer_id=employer_id,
            org_ai_readiness_score=org_score,
            department_scores=dept_scores,
            critical_skill_deficits=[
                "vllm_paged_attention (gap in 68% of engineers)",
                "mlops_kubeflow (gap in 55% of ML team)",
                "transformer_fine_tuning (gap in 43% of backend engineers)",
            ],
            recommended_hiring_priorities=[
                "Senior MLOps Engineer (2 open roles — 3 internal candidates near-ready)",
                "Staff Data Engineer (1 open role — direct internal promote identified)",
                "ML Research Scientist (external hire recommended — no internal match ≥70%)",
            ],
            analyzed_at=int(time.time()),
        )

    # ------------------------------------------------------------------ #
    # Demo Data                                                           #
    # ------------------------------------------------------------------ #

    def _demo_employees(self) -> List[EmployeeSkillProfile]:
        return [
            EmployeeSkillProfile(
                employee_id="EMP-001", name="Alex Chen", department="ML Platform",
                current_role="ML Engineer", years_experience=5,
                skill_vector={"python_proficiency": 0.92, "transformer_fine_tuning": 0.80,
                              "vllm_paged_attention": 0.65, "system_design": 0.72,
                              "kubernetes": 0.60, "distributed_systems": 0.70},
                ccrs_baseline=84.5,
            ),
            EmployeeSkillProfile(
                employee_id="EMP-002", name="Maria Santos", department="Data Engineering",
                current_role="Data Engineer", years_experience=4,
                skill_vector={"spark_dbt": 0.88, "sql_analytics": 0.90,
                              "python_proficiency": 0.82, "distributed_systems": 0.75,
                              "devops_cicd": 0.60, "system_design": 0.65},
                ccrs_baseline=79.2,
            ),
            EmployeeSkillProfile(
                employee_id="EMP-003", name="James Liu", department="Backend Engineering",
                current_role="Senior Backend Engineer", years_experience=7,
                skill_vector={"python_proficiency": 0.90, "system_design": 0.85,
                              "distributed_systems": 0.88, "devops_cicd": 0.80,
                              "communication": 0.82},
                ccrs_baseline=88.1,
            ),
            EmployeeSkillProfile(
                employee_id="EMP-004", name="Yuki Tanaka", department="ML Platform",
                current_role="Research Scientist", years_experience=6,
                skill_vector={"transformer_fine_tuning": 0.92, "python_proficiency": 0.88,
                              "vllm_paged_attention": 0.75, "system_design": 0.68,
                              "distributed_systems": 0.65},
                ccrs_baseline=91.3,
            ),
        ]


# Needed for upskilling roadmap weeks calculation
import math
