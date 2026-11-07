import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_flashcard_generate_deck():
    payload = {
        "target_job_title": "Senior AI Systems Engineer",
        "missing_skills": ["vLLM", "Redis", "Dynamic Programming"],
        "matched_skills": ["Python", "Docker"]
    }
    resp = client.post("/flashcards/generate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_cards"] >= 3
    assert len(data["cards"]) >= 3

def test_flashcard_review_sm2():
    payload = {
        "card_id": "card_test_001",
        "quality_rating": 4,
        "hesitation_seconds": 3.2,
        "current_interval": 1,
        "current_ef": 2.5,
        "repetition_count": 0
    }
    resp = client.post("/flashcards/review", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["sm2_algorithm_status"] == "SUPERMEMO_2_UPDATED"
    assert data["new_interval_days"] >= 1

def test_flashcard_cram_deck():
    resp = client.get("/flashcards/cram?max_cards=10")
    assert resp.status_code == 200
    data = resp.json()
    assert "cards" in data

def test_upload_pdf_flashcards_dsa():
    fake_pdf = b"%PDF-1.4\n1 0 obj\n<< /Title (DSA Blueprint) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
    files = {
        "file": ("DSA_Blueprint_BTech_Second_Year_CSE_AIML.pdf", io.BytesIO(fake_pdf), "application/pdf")
    }
    resp = client.post("/flashcards/upload-pdf", files=files)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert data["sections_count"] >= 4
    assert data["total_cards"] >= 16
    assert len(data["sections"]) >= 4
    # Verify each section has multiple cards
    for sec in data["sections"]:
        assert len(sec["cards"]) >= 3

def test_pdf_section_generate_endpoint():
    payload = {
        "document_title": "Distributed_Systems_Architecture.pdf",
        "raw_text": "# Chapter 1: Consensus Protocols\nPaxos and Raft mechanisms.\n# Chapter 2: Sharding & Replication\nConsistent hashing and gossip protocols.",
        "target_role": "Distributed Systems Engineer"
    }
    resp = client.post("/flashcards/pdf-section-generate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert data["sections_count"] >= 2
    assert data["total_cards"] >= 4
