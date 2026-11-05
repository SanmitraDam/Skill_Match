"""
End-to-End Verification Test for PRD v2 Modules
Tests:
- FR-04: Post-Interview Audio Recording Studio (/interview/complete & /interview/recordings/{filename})
- FR-05: Smart Surrender Detection & Auto-Advance Pattern matching
- FR-06 & FR-07: JD-Tailored CV Builder & ATS Checker (/cv/generate-tailored & /cv/ats-check)
"""
import os
import sys
from fastapi.testclient import TestClient
from app.main import app
from app.services.ats_checker import ats_checker_service
from app.api.interview import SURRENDER_PATTERN

client = TestClient(app)

def test_ats_checker():
    print("Testing ATS Checker Service...")
    sample_cv = """
    # Alex Chen
    Senior Software Engineer | alex@skillmatch.io | +1 (555) 019-2834
    
    ## Professional Summary
    Experienced Senior Software Engineer specializing in Python, FastAPI, distributed systems, and microservices.
    
    ## Technical Skills
    * Languages: Python, Go, TypeScript, SQL
    * Tools & Frameworks: FastAPI, Docker, Kubernetes, PostgreSQL, Redis
    
    ## Professional Experience
    ### Senior Backend Engineer — Apex Cloud Labs
    - Architected scalable microservices using FastAPI and Python, handling 2.5M+ requests daily with 99.99% uptime.
    - Optimized PostgreSQL query execution plans, reducing p99 latency by 45% (from 180ms to 99ms).
    - Engineered containerized CI/CD deployment pipelines in Docker and Kubernetes.
    
    ## Education
    ### B.S. in Computer Science — Tech Institute
    """
    sample_jd = """
    We are seeking a Senior Backend Engineer proficient in Python, FastAPI, Docker, PostgreSQL, and microservices.
    Experience with Redis caching and Kubernetes is required.
    """
    eval_res = ats_checker_service.calculate_ats_score(sample_cv, sample_jd)
    print(f"ATS Score: {eval_res['ats_score']}% ({eval_res['score_grade']})")
    assert eval_res['ats_score'] >= 75, f"Expected ATS score >= 75, got {eval_res['ats_score']}"
    assert len(eval_res['matched_keywords']) >= 4, "Expected >= 4 matched keywords"
    print("[OK] ATS Checker Service Passed")

def test_cv_api():
    print("Testing /cv endpoints...")
    # 1. /cv/generate-tailored
    res = client.post("/api/v1/cv/generate-tailored", json={
        "profile_data": {
            "name": "Jordan Smith",
            "role": "Staff Platform Engineer",
            "skills": ["Python", "Docker", "PostgreSQL", "Kafka"]
        },
        "custom_details": "Spearheaded active noise cancellation DSP pipeline reducing background clatter by 18.4 dB.",
        "job_description": "Staff Platform Engineer with Python, FastAPI, Kubernetes, Docker, and Kafka.",
        "target_role": "Staff Platform Engineer"
    })
    assert res.status_code == 200, f"Generate CV failed: {res.status_code} {res.text}"
    data = res.json()
    assert "cv_markdown" in data, "cv_markdown missing from response"
    assert "ats_evaluation" in data, "ats_evaluation missing from response"
    assert data["ats_evaluation"]["ats_score"] >= 70, f"Score too low: {data['ats_evaluation']['ats_score']}"
    print(f"[OK] /cv/generate-tailored passed (ATS Score: {data['ats_evaluation']['ats_score']}%)")

    # 2. /cv/ats-check
    check_res = client.post("/api/v1/cv/ats-check", json={
        "cv_text": data["cv_markdown"],
        "job_description": "Staff Platform Engineer with Python, FastAPI, Kubernetes, Docker, and Kafka."
    })
    assert check_res.status_code == 200, f"ATS check failed: {check_res.status_code}"
    check_data = check_res.json()
    assert "ats_score" in check_data
    assert "matched_keywords" in check_data
    print(f"[OK] /cv/ats-check passed (ATS Score: {check_data['ats_score']}%)")

def test_interview_complete_and_recordings():
    print("Testing /interview/complete and audio recordings...")
    # 1. Complete interview
    int_id = "test_anc_verify_99"
    res = client.post("/api/v1/interview/complete", json={"interview_id": int_id})
    assert res.status_code == 200, f"Complete interview failed: {res.status_code} {res.text}"
    data = res.json()
    assert "filtered_audio_url" in data
    assert "raw_audio_url" in data
    assert "anc_performance" in data
    assert data["anc_performance"]["average_db_reduction"] == "18.4 dB"
    print(f"[OK] /interview/complete passed: Filtered URL={data['filtered_audio_url']}, Raw URL={data['raw_audio_url']}")

    # 2. Verify audio recording serving
    filtered_filename = os.path.basename(data["filtered_audio_url"])
    audio_res = client.get(f"/api/v1/interview/recordings/{filtered_filename}")
    assert audio_res.status_code == 200, f"Audio fetch failed: {audio_res.status_code}"
    assert "audio/wav" in audio_res.headers.get("content-type", "")
    assert len(audio_res.content) > 1000, "WAV audio file is empty or corrupted"
    print(f"[OK] Audio recording served successfully ({len(audio_res.content)} bytes WAV)")

def test_surrender_detection():
    print("Testing Surrender Pattern Matching...")
    phrases = [
        "I don't know the exact answer",
        "idk honestly",
        "pass on this question",
        "skip please",
        "no idea how this works",
        "I'm not sure about the syntax",
        "next question please"
    ]
    for p in phrases:
        match = SURRENDER_PATTERN.search(p)
        assert match is not None, f"Failed to detect surrender intent in '{p}'"
    print(f"[OK] All {len(phrases)} surrender test phrases detected accurately")

if __name__ == "__main__":
    test_ats_checker()
    test_cv_api()
    test_interview_complete_and_recordings()
    test_surrender_detection()
    print("\nALL PRD v2 BACKEND & AUDIO INTEGRATION TESTS PASSED SUCCESSFULLY!")
