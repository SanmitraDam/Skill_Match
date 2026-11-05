"""
Smart Contract Offer Clearance & Salary Benchmarking Service — SkillMatch DNA v19.0
Provides skill-weighted market-value estimation, dynamic offer package assembly,
on-chain commitment generation, and automated IT provisioning triggers.
"""
from __future__ import annotations

import hashlib
import secrets
import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------

class MarketValueRequest(BaseModel):
    candidate_id: str
    ccrs: float = Field(..., ge=0.0, le=100.0)
    skill_vector: Dict[str, float] = Field(
        ..., description="skill_name -> proficiency 0-1"
    )
    role_title: str
    years_of_experience: int = Field(..., ge=0, le=50)
    location: str = Field(default="US-Remote", description="ISO country-city code")


class MarketValueResult(BaseModel):
    candidate_id: str
    role_title: str
    salary_range_inr: Dict[str, int]  # p25, p50, p75, p90
    equity_range_inr: Dict[str, int]
    ccrs_premium_pct: float = Field(..., description="CCRS > 80 unlocks a premium %")
    data_sources: List[str]
    computed_at: int


class GenerateOfferRequest(BaseModel):
    candidate_id: str
    application_id: str
    employer_id: str
    role_title: str
    ccrs: float
    pts: float
    skill_vector: Dict[str, float]
    years_of_experience: int = Field(default=3)
    location: str = Field(default="US-Remote")
    equity_cliff_months: int = Field(default=12)
    vesting_months: int = Field(default=48)


class OfferPackage(BaseModel):
    offer_id: str
    candidate_id: str
    application_id: str
    employer_id: str
    role_title: str
    base_salary_inr: int
    signing_bonus_inr: int
    annual_bonus_pct: float
    equity_shares: int
    equity_cliff_months: int
    vesting_months: int
    pre_onboarding_goals: List[str]
    on_chain_commitment: str  # keccak256-style hex
    docusign_envelope_id: str
    status: str  # draft | pending_acceptance | accepted | revoked
    generated_at: int
    valid_until: int


class AcceptOfferRequest(BaseModel):
    offer_id: str
    candidate_id: str
    signature_payload: str  # e-signature or wallet sig
    accept_timestamp: int


class OfferAcceptanceResult(BaseModel):
    offer_id: str
    candidate_id: str
    on_chain_tx_hash: str
    provisioning_triggered: bool
    provisioning_actions: List[str]
    accepted_at: int


# ---------------------------------------------------------------------------
# Labor Market Oracle Constants
# ---------------------------------------------------------------------------
# Base salary bands (INR) keyed by (role_category, experience_bucket)
_SALARY_MATRIX: Dict[str, Dict[str, Dict[str, int]]] = {
    "ml_ai": {
        "junior": {"p25": 8_715_000, "p50": 10_375_000, "p75": 12_284_000, "p90": 14_110_000},
        "mid":    {"p25": 11_205_000, "p50": 13_280_000, "p75": 15_355_000, "p90": 17_845_000},
        "senior": {"p25": 14_110_000, "p50": 16_600_000, "p75": 19_920_000, "p90": 23_655_000},
        "staff":  {"p25": 17_845_000, "p50": 21_580_000, "p75": 25_730_000, "p90": 30_710_000},
    },
    "software_engineering": {
        "junior": {"p25": 7_470_000, "p50": 9_130_000, "p75": 10_790_000, "p90": 12_865_000},
        "mid":    {"p25": 9_960_000, "p50": 12_035_000, "p75": 13_944_000, "p90": 16_185_000},
        "senior": {"p25": 12_450_000, "p50": 14_940_000, "p75": 17_845_000, "p90": 21_165_000},
        "staff":  {"p25": 15_770_000, "p50": 19_090_000, "p75": 22_825_000, "p90": 27_390_000},
    },
    "data_engineering": {
        "junior": {"p25": 7_055_000, "p50": 8_715_000, "p75": 10_375_000, "p90": 12_284_000},
        "mid":    {"p25": 9_545_000, "p50": 11_454_000, "p75": 13_446_000, "p90": 15_604_000},
        "senior": {"p25": 12_035_000, "p50": 14_525_000, "p75": 17_430_000, "p90": 20_584_000},
        "staff":  {"p25": 15_355_000, "p50": 18_260_000, "p75": 21_995_000, "p90": 26_145_000},
    },
    "default": {
        "junior": {"p25": 6_640_000, "p50": 8_300_000, "p75": 9_794_000, "p90": 11_620_000},
        "mid":    {"p25": 8_300_000, "p50": 9_960_000, "p75": 11_786_000, "p90": 13_695_000},
        "senior": {"p25": 10_624_000, "p50": 12_865_000, "p75": 15_355_000, "p90": 18_260_000},
        "staff":  {"p25": 13_695_000, "p50": 16_600_000, "p75": 19_920_000, "p90": 24_070_000},
    },
}

_PRE_ONBOARDING_GOALS_BY_ROLE = {
    "ml": [
        "Complete SkillMatch vLLM PagedAttention micro-course (Week 1)",
        "Reproduce employer's internal model serving benchmark (Week 2)",
        "Submit first PR to internal ML platform repo (Week 3-4)",
    ],
    "software": [
        "Complete SkillMatch System Design Fundamentals roadmap (Week 1)",
        "Set up local dev environment and pass integration test suite (Week 2)",
        "Shadow senior engineer on one production feature (Week 3-4)",
    ],
    "data": [
        "Complete SkillMatch dbt + Spark certification roadmap (Week 1-2)",
        "Deploy a sample pipeline to employer's data lake (Week 3)",
        "Present pipeline performance analysis to team (Week 4)",
    ],
    "default": [
        "Complete SkillMatch onboarding assessment roadmap (Week 1)",
        "Meet with cross-functional stakeholders (Week 2)",
        "Deliver first documented deliverable (Week 3-4)",
    ],
}


def _classify_role(role_title: str) -> str:
    t = role_title.lower()
    if any(k in t for k in ("ml", "machine learning", "ai ", "nlp", "llm", "mlops")):
        return "ml_ai"
    if any(k in t for k in ("data engineer", "analytics engineer", "etl", "spark", "dbt")):
        return "data_engineering"
    if any(k in t for k in ("software", "backend", "frontend", "fullstack", "swe")):
        return "software_engineering"
    return "default"


def _classify_experience(yoe: int) -> str:
    if yoe <= 2:   return "junior"
    if yoe <= 5:   return "mid"
    if yoe <= 9:   return "senior"
    return "staff"


def _ccrs_premium(ccrs: float) -> float:
    """CCRS ≥ 80 → up to +12% premium; linear between 80-100."""
    if ccrs < 80.0:
        return 0.0
    return round(((ccrs - 80.0) / 20.0) * 12.0, 2)


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class OfferClearanceService:
    """Smart Contract Offer Clearance & Salary Oracle for SkillMatch DNA v19.0."""

    # ------------------------------------------------------------------ #
    # Market Value Estimation                                             #
    # ------------------------------------------------------------------ #

    def estimate_market_value(self, req: MarketValueRequest) -> MarketValueResult:
        """
        Compute skill-weighted salary oracle.
        Sources: Lightcast, Radford, Levels.fyi (simulated bands).
        CCRS ≥ 80 unlocks a performance premium up to +12%.
        """
        role_cat = _classify_role(req.role_title)
        exp_bucket = _classify_experience(req.years_of_experience)
        bands = _SALARY_MATRIX.get(role_cat, _SALARY_MATRIX["default"])[exp_bucket]

        premium_pct = _ccrs_premium(req.ccrs)
        premium_mult = 1.0 + premium_pct / 100.0

        # Apply skill density bonus: each skill above 0.8 proficiency adds 0.5% cap 5%
        high_prof_count = sum(1 for v in req.skill_vector.values() if v >= 0.8)
        skill_bonus = min(high_prof_count * 0.005, 0.05)
        total_mult = premium_mult + skill_bonus

        salary_range = {k: int(v * total_mult) for k, v in bands.items()}

        # Equity: ~0.04% – 0.25% of ₹4150 Cr company at p50
        equity_base = {
            "p25": 1_245_000, "p50": 2_490_000, "p75": 5_395_000, "p90": 9_960_000
        }
        equity_range = {k: int(v * total_mult) for k, v in equity_base.items()}

        return MarketValueResult(
            candidate_id=req.candidate_id,
            role_title=req.role_title,
            salary_range_inr=salary_range,
            equity_range_inr=equity_range,
            ccrs_premium_pct=premium_pct,
            data_sources=["Lightcast 2024Q4", "Radford Global Tech Survey", "Levels.fyi"],
            computed_at=int(time.time()),
        )

    # ------------------------------------------------------------------ #
    # Offer Package Assembly                                              #
    # ------------------------------------------------------------------ #

    def generate_offer(self, req: GenerateOfferRequest) -> OfferPackage:
        """
        Assemble a transparent digital offer package and generate
        an on-chain commitment hash for HiringClearance.sol.
        """
        mv_req = MarketValueRequest(
            candidate_id=req.candidate_id,
            ccrs=req.ccrs,
            skill_vector=req.skill_vector,
            role_title=req.role_title,
            years_of_experience=req.years_of_experience,
            location=req.location,
        )
        mv = self.estimate_market_value(mv_req)

        base_salary = mv.salary_range_inr["p50"]
        signing_bonus = int(base_salary * 0.05)                # 5% signing bonus
        annual_bonus_pct = 15.0 if req.ccrs >= 80 else 10.0   # CCRS-gated bonus tier

        role_cat = _classify_role(req.role_title)
        goals_key = (
            "ml" if role_cat == "ml_ai" else
            "software" if role_cat == "software_engineering" else
            "data" if role_cat == "data_engineering" else "default"
        )
        pre_onboarding_goals = _PRE_ONBOARDING_GOALS_BY_ROLE[goals_key]

        offer_id = f"OFFER-{secrets.token_hex(6).upper()}"
        commitment_input = (
            f"{offer_id}:{req.candidate_id}:{req.employer_id}:"
            f"{base_salary}:{req.ccrs:.3f}:{req.pts:.3f}"
        ).encode()
        on_chain_commitment = "0x" + hashlib.sha256(commitment_input).hexdigest()

        now = int(time.time())
        return OfferPackage(
            offer_id=offer_id,
            candidate_id=req.candidate_id,
            application_id=req.application_id,
            employer_id=req.employer_id,
            role_title=req.role_title,
            base_salary_inr=base_salary,
            signing_bonus_inr=signing_bonus,
            annual_bonus_pct=annual_bonus_pct,
            equity_shares=int(mv.equity_range_inr["p50"] / 10),  # shares at ₹830 strike
            equity_cliff_months=req.equity_cliff_months,
            vesting_months=req.vesting_months,
            pre_onboarding_goals=pre_onboarding_goals,
            on_chain_commitment=on_chain_commitment,
            docusign_envelope_id=f"DSG-{secrets.token_hex(8).upper()}",
            status="pending_acceptance",
            generated_at=now,
            valid_until=now + 7 * 24 * 3600,  # 7-day acceptance window
        )

    # ------------------------------------------------------------------ #
    # Offer Acceptance & Smart Contract Execution                         #
    # ------------------------------------------------------------------ #

    def accept_offer(self, req: AcceptOfferRequest) -> OfferAcceptanceResult:
        """
        Process candidate offer acceptance.
        Generates an on-chain tx hash (simulated Ethereum tx) and triggers
        automated IT provisioning pipeline.
        """
        tx_hash = "0x" + hashlib.sha256(
            f"{req.offer_id}:{req.candidate_id}:{req.signature_payload}:{req.accept_timestamp}".encode()
        ).hexdigest()

        provisioning_actions = [
            f"Okta/Entra ID SSO account created for candidate {req.candidate_id}",
            "GitHub organization invite dispatched",
            "Slack workspace onboarding DM sent",
            "Hardware equipment shipping order placed (MacBook Pro 16\")",
            "Day-1 onboarding calendar blocks scheduled",
        ]

        return OfferAcceptanceResult(
            offer_id=req.offer_id,
            candidate_id=req.candidate_id,
            on_chain_tx_hash=tx_hash,
            provisioning_triggered=True,
            provisioning_actions=provisioning_actions,
            accepted_at=req.accept_timestamp,
        )

    def get_offer(self, offer_id: str) -> Dict[str, Any]:
        """Retrieve offer status by ID (simulated lookup)."""
        return {
            "offer_id": offer_id,
            "status": "pending_acceptance",
            "message": "Offer is awaiting candidate digital signature",
            "retrieved_at": int(time.time()),
        }
