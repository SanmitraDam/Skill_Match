"""ATS / HRIS Bi-Directional Webhook Gateway Router — SkillMatch DNA v19.0"""
from fastapi import APIRouter
from app.services.ats_gateway_service import (
    ATSGatewayService,
    InboundWebhookEvent,
    ATSIntegrationRequest,
)

router = APIRouter(prefix="/ats", tags=["ATS Gateway v19.0"])
_svc = ATSGatewayService()


@router.post("/webhook/inbound")
def process_inbound_webhook(event: InboundWebhookEvent):
    """Receive an inbound ATS stage-change webhook and dispatch assessment invitation if triggered."""
    return _svc.process_inbound_webhook(event)


@router.post("/webhook/outbound")
def send_outbound_score(
    candidate_id: str,
    application_id: str,
    ats_provider: str,
    ccrs: float,
    s_match: float,
    a_quiz: float,
    i_voice: float,
    pts: float,
):
    """Build and return a structured outbound score payload mapped to ATS field names."""
    payload = _svc.build_outbound_payload(
        candidate_id=candidate_id,
        application_id=application_id,
        ats_provider=ats_provider,
        ccrs=ccrs,
        s_match=s_match,
        a_quiz=a_quiz,
        i_voice=i_voice,
        pts=pts,
    )
    mapped = _svc.map_payload_to_ats_fields(payload)
    return {"payload": payload.model_dump(), "ats_field_mapping": mapped}


@router.get("/integrations")
def list_integrations():
    """List all configured ATS integrations."""
    return [cfg.model_dump() for cfg in _svc.list_integrations()]


@router.post("/integrations/configure")
def configure_integration(req: ATSIntegrationRequest):
    """Register a new ATS/HRIS integration with webhook URL, API key, and field mapping."""
    return _svc.configure_integration(req).model_dump()


@router.post("/test-connection")
def test_connection(integration_id: str):
    """Send a test ping to the configured ATS webhook endpoint and measure latency."""
    return _svc.test_connection(integration_id).model_dump()
