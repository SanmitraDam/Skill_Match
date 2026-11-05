"""
Autonomous Global Talent Liquidity Exchange API Router — SkillMatch DNA v21.0
Pillar 1: CDA Order Book, Dynamic Spot Pricing & Skill Staking Pools
"""
from fastapi import APIRouter
from typing import Any, Dict, List, Optional
from app.services.talent_exchange_service import (
    talent_exchange_service,
    DemandOrder,
    SupplyOffer,
    MatchedTrade,
    SkillSpotPrice,
    StakingPoolDepositRequest,
    StakingPoolPosition
)

router = APIRouter(prefix="/talent-exchange", tags=["Autonomous Global Talent Exchange"])


@router.post("/order/demand", response_model=DemandOrder)
@router.post("/orders/demand", response_model=DemandOrder)
def place_demand_order(order: DemandOrder):
    """Places an enterprise talent demand order into the CDA matching book."""
    return talent_exchange_service.place_demand_order(order)


@router.post("/order/supply", response_model=SupplyOffer)
@router.post("/orders/supply", response_model=SupplyOffer)
def place_supply_offer(offer: SupplyOffer):
    """Places a candidate skill supply offer into the CDA matching book."""
    return talent_exchange_service.place_supply_offer(offer)


@router.post("/cda/match", response_model=List[MatchedTrade])
@router.post("/match", response_model=List[MatchedTrade])
def trigger_cda_clearing():
    """Triggers Continuous Double Auction matching and clears orders at instant equilibrium."""
    return talent_exchange_service.match_cda()


@router.get("/spot-prices", response_model=List[SkillSpotPrice])
def get_skill_spot_prices():
    """Returns dynamic spot prices across technical capabilities based on global order books."""
    return talent_exchange_service.get_spot_prices()


@router.post("/staking/deposit", response_model=StakingPoolPosition)
@router.post("/stake", response_model=StakingPoolPosition)
def deposit_into_skill_staking_pool(req: StakingPoolDepositRequest):
    """Stakes candidate verified skill vector into dynamic liquidity pools for passive yield."""
    return talent_exchange_service.deposit_staking_pool(req)


@router.get("/orderbook")
@router.get("/orderbook/{skill_id}")
def get_orderbook(skill_id: Optional[str] = None):
    """Returns active demand orders, supply offers, and recent trades."""
    book = talent_exchange_service.get_orderbook()
    if skill_id:
        return {
            "skill_id": skill_id,
            "demand_orders": [d for d in book.get("demand_orders", []) if skill_id.lower() in [s.lower() for s in d.get("required_skills", [])]],
            "supply_offers": [s for s in book.get("supply_offers", []) if skill_id.lower() in [sk.lower() for sk in s.get("verified_skills", [])]],
            "recent_trades": book.get("recent_trades", [])
        }
    return book
