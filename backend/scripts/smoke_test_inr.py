# -*- coding: utf-8 -*-
"""Runtime smoke test: exercise migrated services and print INR outputs."""
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

# 1. Offer clearance: salary oracle + offer package
from app.services.offer_clearance_service import OfferClearanceService, MarketValueRequest, GenerateOfferRequest

svc = OfferClearanceService()
mv = svc.estimate_market_value(MarketValueRequest(
    candidate_id="c1", ccrs=88.0,
    skill_vector={"rust": 0.9, "system_design": 0.85},
    role_title="Senior Backend Engineer", years_of_experience=6, location="Bengaluru",
))
print("salary_range_inr:", mv.salary_range_inr)
print("equity_range_inr:", mv.equity_range_inr)
offer = svc.generate_offer(GenerateOfferRequest(
    candidate_id="c1", application_id="a1", employer_id="e1", ccrs=88.0, pts=90.0,
    skill_vector={"rust": 0.9}, role_title="Senior Backend Engineer",
    years_of_experience=6, location="Bengaluru", equity_cliff_months=12, vesting_months=48,
))
print("offer base_salary_inr:", offer.base_salary_inr, "| signing:", offer.signing_bonus_inr, "| shares:", offer.equity_shares)

# 2. Executive copilot ROI math
from app.services.executive_copilot_service import ExecutiveCopilotService, ScenarioSimulationRequest

cop = ExecutiveCopilotService()
try:
    roi = cop.run_scenario(ScenarioSimulationRequest(
        scenario_name="Rust migration", target_skills=["Rust"], timeline_months=4, budget_inr=12450000.0,
    ))
    print("external_cost_inr:", roi.external_recruitment_cost_inr, "| internal:", roi.internal_training_cost_inr)
except Exception as e:
    print("copilot scenario:", type(e).__name__, e)

# 3. Multi-species guild vault
from app.services.multi_species_enterprise_guild_service import (
    MultiSpeciesEnterpriseGuildService, DepositSkillCollateralVaultRequest,
)
mg = MultiSpeciesEnterpriseGuildService()
resp = mg.deposit_skill_collateral_vault(DepositSkillCollateralVaultRequest(
    candidate_id="c9", zkdid="did:zk:x1", verified_ccrs=89.5, verified_pts=91.0,
    primary_skill="Rust",
))
print("vault max_credit_limit_inr:", resp.get("max_zero_interest_credit_inr"), "(expect ₹18.57 L = 1857125)")

# 4. Skill treasury valuation (Base ₹8.3 L)
from app.services.skill_treasury_vault_service import SkillTreasuryVaultService

st = SkillTreasuryVaultService()
dep = st.collateralize_skill_vector("c2", "did:zk:x2", 92.0, ["Rust", "eBPF", "WebAssembly"])
print("collateral_valuation_inr:", dep.collateral_valuation_inr)

# 5. UTDao AUBI yield (Base ₹99.60/h -> daily 2390.40 at 100 score)
from app.services.utdao_service import UTDAOService, ClaimAUBIRequest

ut = UTDAOService()
claim = ut.claim_aubi_yield(ClaimAUBIRequest(candidate_id="c3", zk_did_commitment="0xabc", engram_contribution_score=100.0))
print("daily_yield_rate_inr:", claim["claim"]["daily_yield_rate_inr"], "(expect 2390.4)")
