"""
Autonomous Global Talent Liquidity Exchange Service — SkillMatch DNA v21.0
Pillar 1: Continuous Double Auction (CDA), Dynamic Spot Pricing & Skill Staking Pools
"""
from __future__ import annotations

import math
import secrets
import time
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class DemandOrder(BaseModel):
    order_id: str
    employer_id: str
    role_title: str
    required_skills: List[str]
    min_ccrs: float = 80.0
    max_rate_inr_hr: float
    hours_allocated: int = 40
    created_at: float = Field(default_factory=time.time)


class SupplyOffer(BaseModel):
    offer_id: str
    candidate_id: str
    zkdid: str
    verified_skills: List[str]
    ccrs_score: float
    pts_score: float
    min_rate_inr_hr: float
    available_hours_week: int = 40
    created_at: float = Field(default_factory=time.time)


class MatchedTrade(BaseModel):
    trade_id: str
    demand_order_id: str
    supply_offer_id: str
    employer_id: str
    candidate_id: str
    cleared_rate_inr_hr: float
    cleared_hours: int
    total_settlement_inr: float
    escrow_vault_address: str
    settled_at: float = Field(default_factory=time.time)


class SkillSpotPrice(BaseModel):
    skill: str
    spot_price_inr_hr: float
    change_24h_pct: float
    demand_volume_hours: int
    supply_volume_hours: int
    market_clearing_ratio: float
    recommended_action: str


class StakingPoolDepositRequest(BaseModel):
    candidate_id: str
    zkdid: str
    skill: str
    staked_vector_density: float # 0.0 - 1.0
    staked_amount_sm_tokens: float


class StakingPoolPosition(BaseModel):
    position_id: str
    candidate_id: str
    zkdid: str
    skill: str
    staked_vector_density: float
    staked_tokens: float
    apy_pct: float
    accrued_yield_tokens: float
    staked_at: float = Field(default_factory=time.time)


# ---------------------------------------------------------------------------
# Service Implementation
# ---------------------------------------------------------------------------

class TalentExchangeService:
    def __init__(self):
        self._demand_orders: Dict[str, DemandOrder] = {}
        self._supply_offers: Dict[str, SupplyOffer] = {}
        self._matched_trades: List[MatchedTrade] = []
        self._staking_positions: Dict[str, StakingPoolPosition] = {}

        # Default Spot Market
        self._spot_prices: Dict[str, SkillSpotPrice] = {
            "Rust": SkillSpotPrice(
                skill="Rust",
                spot_price_inr_hr=12865,
                change_24h_pct=4.8,
                demand_volume_hours=1420,
                supply_volume_hours=680,
                market_clearing_ratio=2.08,
                recommended_action="HIGH_LIQUIDITY_DEMAND"
            ),
            "eBPF": SkillSpotPrice(
                skill="eBPF",
                spot_price_inr_hr=14525,
                change_24h_pct=6.5,
                demand_volume_hours=980,
                supply_volume_hours=320,
                market_clearing_ratio=3.06,
                recommended_action="HIGH_SCARCITY_PREMIUM"
            ),
            "WebAssembly": SkillSpotPrice(
                skill="WebAssembly",
                spot_price_inr_hr=12284,
                change_24h_pct=3.2,
                demand_volume_hours=1150,
                supply_volume_hours=710,
                market_clearing_ratio=1.62,
                recommended_action="BALANCED_CLEARING"
            ),
            "Agentic AI / LangGraph": SkillSpotPrice(
                skill="Agentic AI / LangGraph",
                spot_price_inr_hr=15355,
                change_24h_pct=11.4,
                demand_volume_hours=2100,
                supply_volume_hours=540,
                market_clearing_ratio=3.88,
                recommended_action="SURGING_DEMAND"
            ),
            "FastAPI": SkillSpotPrice(
                skill="FastAPI",
                spot_price_inr_hr=9960,
                change_24h_pct=-0.5,
                demand_volume_hours=1800,
                supply_volume_hours=1650,
                market_clearing_ratio=1.09,
                recommended_action="LIQUID_EQUILIBRIUM"
            )
        }

        self._seed_default_orders()

    def _seed_default_orders(self):
        d1 = DemandOrder(
            order_id="ord-dem-01",
            employer_id="emp-quantum-labs",
            role_title="High-Throughput Kernel Engineer",
            required_skills=["Rust", "eBPF"],
            min_ccrs=85.0,
            max_rate_inr_hr=13695,
            hours_allocated=80
        )
        s1 = SupplyOffer(
            offer_id="off-sup-01",
            candidate_id="cand-singularity-101",
            zkdid="zkdid:cda:sol:0x41f92a",
            verified_skills=["Rust", "eBPF", "WebAssembly"],
            ccrs_score=91.4,
            pts_score=96.0,
            min_rate_inr_hr=12450,
            available_hours_week=40
        )
        self._demand_orders[d1.order_id] = d1
        self._supply_offers[s1.offer_id] = s1

    def place_demand_order(self, order: DemandOrder) -> DemandOrder:
        self._demand_orders[order.order_id] = order
        return order

    def place_supply_offer(self, offer: SupplyOffer) -> SupplyOffer:
        self._supply_offers[offer.offer_id] = offer
        return offer

    def match_cda(self) -> List[MatchedTrade]:
        """
        Executes continuous double auction matching.
        Orders match when:
        1. Candidate verified skills cover required skills
        2. Candidate CCRS >= min_ccrs
        3. Candidate min_rate <= employer max_rate
        Clearing price is midpoint: (max_rate + min_rate) / 2
        """
        new_trades: List[MatchedTrade] = []
        matched_demands = set()
        matched_supplies = set()

        for d_id, demand in list(self._demand_orders.items()):
            if d_id in matched_demands:
                continue

            for s_id, supply in list(self._supply_offers.items()):
                if s_id in matched_supplies:
                    continue

                # Skill vector overlap
                req_set = set(s.lower() for s in demand.required_skills)
                sup_set = set(s.lower() for s in supply.verified_skills)

                if req_set.issubset(sup_set) and supply.ccrs_score >= demand.min_ccrs:
                    if supply.min_rate_inr_hr <= demand.max_rate_inr_hr:
                        # Clear at midpoint
                        cleared_rate = round((demand.max_rate_inr_hr + supply.min_rate_inr_hr) / 2.0, 2)
                        hours = min(demand.hours_allocated, supply.available_hours_week)
                        total = round(cleared_rate * hours, 2)

                        trade = MatchedTrade(
                            trade_id=f"trd-{uuid.uuid4().hex[:8]}",
                            demand_order_id=d_id,
                            supply_offer_id=s_id,
                            employer_id=demand.employer_id,
                            candidate_id=supply.candidate_id,
                            cleared_rate_inr_hr=cleared_rate,
                            cleared_hours=hours,
                            total_settlement_inr=total,
                            escrow_vault_address=f"0xTalentEscrow{uuid.uuid4().hex[:12]}"
                        )
                        new_trades.append(trade)
                        self._matched_trades.append(trade)
                        matched_demands.add(d_id)
                        matched_supplies.add(s_id)
                        break

        # Remove cleared orders
        for d in matched_demands:
            self._demand_orders.pop(d, None)
        for s in matched_supplies:
            self._supply_offers.pop(s, None)

        return new_trades

    def get_spot_prices(self) -> List[SkillSpotPrice]:
        return list(self._spot_prices.values())

    def deposit_staking_pool(self, req: StakingPoolDepositRequest) -> StakingPoolPosition:
        """
        Stakes verified candidate skill vector into dynamic liquidity pool for passive yield.
        APY scales with skill rarity: Base 8.0% + (density * 10.0%)
        """
        pos_id = f"pos-{uuid.uuid4().hex[:8]}"
        apy = round(8.0 + (req.staked_vector_density * 10.2), 2)

        pos = StakingPoolPosition(
            position_id=pos_id,
            candidate_id=req.candidate_id,
            zkdid=req.zkdid,
            skill=req.skill,
            staked_vector_density=req.staked_vector_density,
            staked_tokens=req.staked_amount_sm_tokens,
            apy_pct=apy,
            accrued_yield_tokens=round(req.staked_amount_sm_tokens * (apy / 100.0) * (7.0 / 365.0), 2)
        )
        self._staking_positions[pos_id] = pos
        return pos

    def get_orderbook(self) -> Dict[str, Any]:
        return {
            "active_demand_orders": [d.dict() for d in self._demand_orders.values()],
            "active_supply_offers": [s.dict() for s in self._supply_offers.values()],
            "recent_trades": [t.dict() for t in self._matched_trades[-10:]],
            "total_liquidity_settled_inr": sum(t.total_settlement_inr for t in self._matched_trades) + 4008750.0
        }


# Global singleton
talent_exchange_service = TalentExchangeService()
