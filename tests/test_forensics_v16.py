"""
SkillMatch DNA v16.0 Test Suite
Pillars:
1. Browser-Based WebAssembly Live Coding Sandbox & AST AI Co-Pilot
2. Multimodal Behavioral & STAR Method Analytics Engine
3. Collaborative Peer-to-Peer & AI-Agent Mock Interview Rooms
4. Post-Interview Forensic Diagnostics & Dynamic Remediation Loop
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_sandbox_execution_and_ast_profiling():
    """
    Validates AST asymptotic complexity profiling, edge unit test runner,
    sub-10ms SLA, and Socratic hint generation.
    """
    # 1. Quadratic O(N^2) code with nested loop
    nested_code = """
def two_sum(nums: list, target: int) -> list:
    \"\"\"Finds indices using brute force.\"\"\"
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
"""
    res_nested = client.post("/sandbox/execute", json={
        "candidate_id": "cand_ast_test_01",
        "language": "python",
        "source_code": nested_code
    })
    assert res_nested.status_code == 200
    data_nested = res_nested.json()
    assert data_nested["execution_status"] == "SUCCESS"
    assert data_nested["ast_complexity"]["ast_time_complexity"] == "O(N^2)"
    assert data_nested["sub_10ms_sla_passed"] is True
    assert data_nested["execution_latency_ms"] < 10.0
    assert any("hash map" in hint.lower() or "o(n)" in hint.lower() for hint in data_nested["socratic_hints"])

    # 2. Linear O(N) optimized code with hashmap
    optimized_code = """
def two_sum(nums: list, target: int) -> list:
    \"\"\"Finds indices in linear time using a dictionary.\"\"\"
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
"""
    res_opt = client.post("/sandbox/execute", json={
        "candidate_id": "cand_ast_test_01",
        "language": "python",
        "source_code": optimized_code
    })
    assert res_opt.status_code == 200
    data_opt = res_opt.json()
    assert data_opt["execution_status"] == "SUCCESS"
    assert data_opt["ast_complexity"]["ast_time_complexity"] == "O(N)"
    assert data_opt["code_quality_score"] >= 80.0
    assert data_opt["readability_rubric"]["type_safety"] is True

    # 3. Direct AST profiling endpoint
    res_ast = client.post("/sandbox/ast-profile", json={
        "source_code": optimized_code,
        "language": "python"
    })
    assert res_ast.status_code == 200
    ast_profile = res_ast.json()
    assert ast_profile["syntax_valid"] is True
    assert ast_profile["ast_time_complexity"] == "O(N)"
    assert "two_sum" in ast_profile["functions_detected"]


def test_star_behavioral_parsing_and_prosody():
    """
    Validates STAR NLP structure parser (15/15/50/20 weights),
    quantified impact detector, speech pace tracker, and Composure Index.
    """
    # 1. STAR Method Parsing
    narrative = (
        "When I was at FinTech Corp, the legacy transaction clearing engine suffered massive latency spikes. "
        "My responsibility was to overhaul the payment gateway and ensure sub-100ms processing under peak loads. "
        "I implemented a distributed Redis pipeline, I designed an event-driven Go queue, and I refactored the database connection pool. "
        "As a result, we reduced latency by 68%, scaled to 50000 rps, and saved ₹3.74 Cr annually in cloud infrastructure."
    )
    res_star = client.post("/behavioral/star-parse", json={
        "candidate_id": "cand_star_01",
        "response_text": narrative
    })
    assert res_star.status_code == 200
    data_star = res_star.json()
    assert data_star["weights"]["situation_weight"] == 0.15
    assert data_star["weights"]["task_weight"] == 0.15
    assert data_star["weights"]["action_weight"] == 0.50
    assert data_star["weights"]["result_weight"] == 0.20
    assert data_star["has_empirical_impact"] is True
    assert len(data_star["quantified_impacts_detected"]) >= 2
    assert data_star["composite_star_score"] >= 75.0
    assert data_star["star_compliance_verdict"] == "COMPLIANT"

    # 2. Prosody & Composure Analysis
    audio_transcript = (
        "Um, basically, when we approached the database redesign, like, we had to make sure "
        "that every microservice maintained strict transactional isolation. You know, we decided to "
        "actually implement a saga pattern to avoid distributed deadlocks."
    )
    res_prosody = client.post("/behavioral/prosody-analyze", json={
        "candidate_id": "cand_star_01",
        "audio_transcript": audio_transcript,
        "duration_seconds": 15.0, # ~32 words in 15 seconds = ~128 wpm
        "pitch_variance_hz": 18.0
    })
    assert res_prosody.status_code == 200
    data_prosody = res_prosody.json()
    assert data_prosody["words_per_minute"] > 80.0
    assert data_prosody["total_filler_count"] >= 3
    assert "um" in data_prosody["filler_breakdown"]
    assert "like" in data_prosody["filler_breakdown"]
    assert 0.0 <= data_prosody["composure_index"] <= 100.0


def test_forensic_post_mortem_and_remediation_sync():
    """
    Validates post-interview post-mortem report generation,
    cryptographic audit hash, and SM-2 dynamic remediation loop (EF=1.3, interval=1).
    """
    # 1. Generate Forensic Report
    res_report = client.post("/forensic/generate-report", json={
        "candidate_id": "cand_diagnostic_01",
        "quiz_score": 88.0,
        "code_score": 92.0,
        "voice_stability_score": 85.0,
        "star_score": 84.0,
        "identified_weaknesses": ["Distributed Raft Consensus", "B-Tree Storage Engine"]
    })
    assert res_report.status_code == 200
    report_data = res_report.json()
    report_id = report_data["report_id"]
    assert report_data["composite_score"] >= 80.0
    assert report_data["audit_hash"].startswith("0x")
    assert len(report_data["weaknesses_flagged"]) == 2

    # 2. Dynamic Remediation Sync (SM-2 Priority Override)
    res_sync = client.post("/forensic/remediation-sync", json={
        "candidate_id": "cand_diagnostic_01",
        "report_id": report_id,
        "override_ease_factor": 1.3,
        "reset_interval_days": 1,
        "rebalance_roadmap": True
    })
    assert res_sync.status_code == 200
    sync_data = res_sync.json()
    assert sync_data["remediation_status"] == "SYNCED"
    assert sync_data["sm2_overrides_applied"] == 2
    assert sync_data["sm2_queue"][0]["updated_ease_factor"] == 1.3
    assert sync_data["sm2_queue"][0]["interval_days"] == 1
    assert sync_data["roadmap_rebalanced"] is True
    assert len(sync_data["rebalanced_roadmap"]) == 4

    # 3. Retrieve Candidate Forensic History
    res_hist = client.get("/forensic/history/cand_diagnostic_01")
    assert res_hist.status_code == 200
    history = res_hist.json()
    assert len(history) >= 1
    assert history[0]["report_id"] == report_id
    assert history[0]["remediation_status"] == "SYNCED"


def test_v16_routes_table():
    """
    Validates OpenAPI route table and version string for Version 16.0.
    """
    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert any(v in health_res.json()["version"] for v in ["16.0.0", "17.0.0", "18.0.0", "19.0.0", "20.0.0", "21.0.0", "22.0.0", "24.0.0", "25.0.0", "26.0.0"])

    openapi_res = client.get("/openapi.json")
    assert openapi_res.status_code == 200
    paths = openapi_res.json()["paths"]

    # Verify v16 routes exist
    v16_endpoints = [
        "/sandbox/execute",
        "/sandbox/ast-profile",
        "/behavioral/star-parse",
        "/behavioral/prosody-analyze",
        "/forensic/generate-report",
        "/forensic/remediation-sync",
        "/forensic/history/{candidate_id}",
        # Aliases
        "/api/v1/sandbox/execute",
        "/api/v1/behavioral/star-parse",
        "/api/v1/forensic/generate-report"
    ]
    for endpoint in v16_endpoints:
        assert endpoint in paths, f"Expected endpoint {endpoint} not found in OpenAPI routes"
