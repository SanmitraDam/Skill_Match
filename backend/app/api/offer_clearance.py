"""Smart Contract Offer Clearance & Salary Benchmarking Router — SkillMatch DNA v19.0"""
from fastapi import APIRouter
from app.services.offer_clearance_service import (
    OfferClearanceService,
    MarketValueRequest,
    GenerateOfferRequest,
    AcceptOfferRequest,
)

router = APIRouter(prefix="/hiring", tags=["Offer Clearance v19.0"])
_svc = OfferClearanceService()


@router.post("/clearance/market-value")
def estimate_market_value(req: MarketValueRequest):
    """Compute skill-weighted salary oracle using Lightcast, Radford, and Levels.fyi data."""
    return _svc.estimate_market_value(req).model_dump()


@router.post("/offer/generate")
def generate_offer(req: GenerateOfferRequest):
    """
    Assemble a transparent digital offer package including salary, equity, signing bonus,
    pre-onboarding goals, DocuSign envelope ID, and on-chain commitment hash.
    """
    return _svc.generate_offer(req).model_dump()


@router.post("/offer/accept")
def accept_offer(req: AcceptOfferRequest):
    """
    Accept a candidate offer: generates on-chain tx hash via HiringClearance.sol
    and triggers automated IT provisioning pipeline (Okta, GitHub, Slack, hardware).
    """
    return _svc.accept_offer(req).model_dump()


@router.get("/offer/{offer_id}")
def get_offer(offer_id: str):
    """Retrieve offer status and metadata by offer ID."""
    return _svc.get_offer(offer_id)
