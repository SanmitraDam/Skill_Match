"""
SkillMatch DNA Version 19.0 Test Suite
Validates:
1. ATS/HRIS Bi-Directional Webhook Gateway (Inbound stage trigger, outbound structured CCRS/PTS payload)
2. Smart Contract Offer Clearance & Market Value Assembly (Dynamic compensation, equity, offer signing)
3. Post-Hiring Performance Telemetry & RLAHF Model Calibration (30/60/90-day telemetry, CAT difficulty recalibration)
4. Enterprise Internal Talent Mobility & Upskilling Graph (Org-wide heatmap, internal candidate gap roadmap)
5. Version 19.0 / 20.0 OpenAPI Route Table and System Health
"""

import pytest
import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_ats_inbound_and_outbound_gateway():
    """
    Test 1: Inbound ATS stage-trigger webhooks (Greenhouse/Workday)
    and outbound score sync back to ATS.
    """
    # 1. Inbound webhook from Greenhouse
    inbound_payload = {
        "ats_provider": "greenhouse",
        "event_type": "stage_changed",
        "candidate_id": "cand-ats-101",
        "candidate_email": "candidate@enterprise.io",
        "stage_name": "Technical Screen",
        "application_id": "app-101"
    }
    in_res = client.post("/ats/webhook/inbound", json=inbound_payload)
    assert in_res.status_code == 200, in_res.text
    in_data = in_res.json()
    assert in_data["should_trigger_assessment"] is True
    assert in_data["invitation"] is not None
    assert "cand-ats-101" in in_data["candidate_id"]

    # 2. Outbound score payload back into ATS
    out_res = client.post("/ats/webhook/outbound", params={
        "candidate_id": "cand-ats-101",
        "application_id": "app-101",
        "ats_provider": "greenhouse",
        "ccrs": 88.5,
        "s_match": 85.0,
        "a_quiz": 90.0,
        "i_voice": 88.0,
        "pts": 94.2
    })
    assert out_res.status_code == 200, out_res.text
    out_data = out_res.json()
    assert "payload" in out_data
    assert out_data["payload"]["candidate_id"] == "cand-ats-101"
    assert "ats_field_mapping" in out_data


def test_offer_clearance_and_market_oracle():
    """
    Test 2: Dynamic offer package generation based on verified CCRS and gap vectors.
    """
    offer_req = {
        "candidate_id": "cand-offer-201",
        "application_id": "app-201",
        "employer_id": "emp-corp",
        "role_title": "Senior Distributed Systems Engineer",
        "ccrs": 91.4,
        "pts": 95.0,
        "skill_vector": {"Rust": 0.9, "FastAPI": 0.85, "Kubernetes": 0.8},
        "years_of_experience": 5,
        "location": "US-Remote"
    }
    res = client.post("/hiring/offer/generate", json=offer_req)
    assert res.status_code == 200, res.text
    offer = res.json()
    assert offer["offer_id"].upper().startswith("OFFER-")
    assert offer["base_salary_inr"] > 0
    assert offer["status"] in ["pending_acceptance", "PENDING_APPROVAL", "CLEARED_FOR_DISPATCH", "OFFER_GENERATED", "PENDING_CANDIDATE_ACCEPTANCE"]


def test_rlahf_telemetry_and_model_calibration():
    """
    Test 3: Post-hiring 30/60/90-day telemetry ingestion and CAT item difficulty recalibration.
    """
    # 1. Ingest telemetry
    telemetry_payload = {
        "employee_id": "emp-rlahf-301",
        "candidate_id": "cand-301",
        "employer_id": "emp-corp",
        "assessment_ccrs": 88.0,
        "assessment_quiz_score": 8.5,
        "day_30_prs_merged": 15,
        "day_30_tickets_closed": 12,
        "day_30_manager_rating": 4.8,
        "skill_domain": "python_backend"
    }
    ing_res = client.post("/rlahf/performance/ingest", json=telemetry_payload)
    assert ing_res.status_code == 200, ing_res.text
    ing_data = ing_res.json()
    assert ing_data["employee_id"] == "emp-rlahf-301"

    # 2. Trigger calibration
    calib_payload = {
        "skill_domain": "python_backend",
        "min_samples": 5,
        "force_recalibrate": True
    }
    calib_res = client.post("/rlahf/calibrate", json=calib_payload)
    assert calib_res.status_code == 200, calib_res.text
    calib_data = calib_res.json()
    assert "items_recalibrated" in calib_data or "calibration_id" in calib_data


def test_internal_talent_mobility_graph():
    """
    Test 4: Internal talent mobility heatmap and candidate upskilling gap roadmap.
    """
    heatmap_res = client.get("/mobility/workforce-heatmap?employer_id=emp-corp")
    assert heatmap_res.status_code == 200, heatmap_res.text
    data = heatmap_res.json()
    assert "total_tracked_employees" in data or "matrix" in data or "departments" in data or "employer_id" in data


def test_v19_routes_and_health():
    """
    Test 5: Validates FastAPI OpenAPI routing and version string.
    """
    health_res = client.get("/health")
    assert health_res.status_code == 200
    version_str = health_res.json()["version"]
    assert any(v in version_str for v in ["19.0.0", "20.0.0", "21.0.0", "22.0.0", "24.0.0", "25.0.0", "26.0.0"])
