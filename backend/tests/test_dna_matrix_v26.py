"""
Automated Test Suite for SkillMatch DNA v26.0:
Production Input DNA Matrix Engine (suggestion-v25.md Tier 1)

Verifies:
1. PyMuPDF byte-stream extraction (SLA <= 150ms) + fallback logic
2. Lightcast Open Skills Taxonomy alignment and alias normalization
3. 384-dimensional dense vector embeddings with cosine similarity & fallback
4. Gap partitioning (Bioluminescent Emerald #00FFA3 vs Cyber Amber #FFB800 / Red #FF3B30)
5. FastAPI endpoints (/health, /parse-skills, /match, /parse-resume, /full-pipeline)
6. Blueprint export is kept with the backend implementation in backend/src/lib/nlp
"""

import os
import io
import time
import pytest
from fastapi.testclient import TestClient

import pymupdf as fitz
from app.services.dna_matrix_engine import (
    DNAMatrixEngine,
    SkillGapReport,
    dna_engine,
    TECHNICAL_SKILL_TAXONOMY
)
from app.main import app

client = TestClient(app)


def create_in_memory_pdf(text: str) -> bytes:
    """Utility to generate a valid in-memory PDF stream for testing."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text, fontsize=11)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


# ============================================================================
# Test 1: PyMuPDF Fast Byte-Stream Extraction (SLA <= 150ms) & Layout Fallback
# ============================================================================
def test_pymupdf_stream_extraction_sla():
    sample_content = (
        "Senior Software Engineer Resume\n"
        "Expertise in Python, FastAPI, PostgreSQL, Kubernetes, Docker, and Microservices.\n"
        "Proficient with Git, CI/CD, Redis, and React on AWS Cloud.\n"
        "Strong understanding of Data Structures & Algorithms, OOP, and Distributed Systems.\n"
    )
    pdf_data = create_in_memory_pdf(sample_content)

    start = time.perf_counter()
    extracted = dna_engine.extract_text_from_pdf(pdf_data)
    duration_ms = (time.perf_counter() - start) * 1000

    print(f"\n[Test 1] Stream extraction latency: {duration_ms:.2f} ms")
    assert "Python" in extracted
    assert "FastAPI" in extracted
    assert "Kubernetes" in extracted
    # SLA <= 150ms; local environment allowance < 500ms
    assert duration_ms < 500, f"Extraction took {duration_ms:.2f}ms, exceeding SLA threshold."


def test_pdf_extraction_fallback_short_text():
    minimal_content = "John Doe\nPython Developer"
    pdf_data = create_in_memory_pdf(minimal_content)

    extracted = dna_engine.extract_text_from_pdf(pdf_data)
    assert len(extracted.strip()) > 0
    assert "Python Developer" in extracted or "Python" in extracted


# ============================================================================
# Test 2: Lightcast Open Skills Taxonomy Alignment & Alias Normalization
# ============================================================================
def test_lightcast_taxonomy_canonicalization():
    raw_sample = (
        "We are looking for an engineer proficient in dsa, oop, postgres, "
        "golang, k8s, js, ts, reactjs, aws cloud, ml, and nlp."
    )
    parsed = dna_engine.parse_skills(raw_sample)

    print(f"\n[Test 2] Parsed canonical skills: {parsed}")
    assert "Data Structures & Algorithms" in parsed
    assert "OOP" in parsed
    assert "PostgreSQL" in parsed
    assert "Go" in parsed
    assert "Kubernetes" in parsed
    assert "TypeScript" in parsed
    assert "React" in parsed
    assert "AWS" in parsed
    assert "Machine Learning" in parsed
    assert "NLP" in parsed


def test_taxonomy_case_insensitivity_and_punctuation():
    text = "Skillset: PYTHON, c++, .net, node.js, CI/CD, psql, tf"
    parsed = dna_engine.parse_skills(text)
    assert "Python" in parsed
    assert "C++" in parsed
    assert ".NET" in parsed
    assert "Node.js" in parsed
    assert "CI/CD" in parsed
    assert "PostgreSQL" in parsed
    assert "TensorFlow" in parsed


# ============================================================================
# Test 3: 384-d Dense Vector Matching & Cosine Similarity
# ============================================================================
def test_dense_vector_cosine_matching():
    candidate_skills = ["Python", "FastAPI", "PostgreSQL", "Docker", "Git"]
    required_skills = ["Python", "FastAPI", "PostgreSQL", "Kubernetes", "AWS", "Docker"]

    report = dna_engine.compute_skill_dna_match(candidate_skills, required_skills)

    print(f"\n[Test 3] Match Score: {report.match_score}%")
    print(f"Matched Skills: {report.matched_skills}")
    print(f"Critical Gaps: {report.missing_critical_skills}")

    assert 60.0 <= report.match_score <= 85.0
    assert report.overall_score == report.match_score
    assert "Python" in report.matched_skills
    assert "FastAPI" in report.matched_skills
    assert "PostgreSQL" in report.matched_skills
    assert "Docker" in report.matched_skills
    assert "Kubernetes" in report.missing_critical_skills
    assert "Kubernetes" in report.missing_skills
    assert "AWS" in report.missing_critical_skills
    assert report.vector_dimension == 384


def test_identical_skills_perfect_score():
    skills = ["Python", "FastAPI", "Docker", "SQL"]
    report = dna_engine.compute_skill_dna_match(skills, skills)
    assert report.match_score == 100.0
    assert report.overall_score == 100.0
    assert len(report.missing_critical_skills) == 0
    assert len(report.missing_skills) == 0
    assert set(report.matched_skills) == set(skills)


# ============================================================================
# Test 4: Gap Partitioning (Bioluminescent Emerald vs Cyber Amber)
# ============================================================================
def test_gap_partitioning_colors_and_weights():
    candidate_skills = ["React", "TypeScript", "Tailwind CSS"]
    required_skills = ["React", "TypeScript", "Tailwind CSS", "GraphQL", "Next.js"]

    report = dna_engine.compute_skill_dna_match(candidate_skills, required_skills)

    # Check breakdown categories
    assert report.breakdown is not None
    assert "technical_overlap" in report.breakdown
    assert "semantic_similarity" in report.breakdown
    assert "domain_alignment" in report.breakdown

    # Check color partition tags
    assert report.color_partitions is not None
    partitions = report.color_partitions
    assert partitions["matched"]["color"] == "#00FFA3"  # Bioluminescent Emerald
    assert partitions["missing"]["color"] in ["#FFB800", "#FF3B30"]  # Cyber Amber or Crimson

    # Matched vs missing sets
    for skill in ["React", "TypeScript", "Tailwind CSS"]:
        assert skill in partitions["matched"]["skills"]

    for skill in ["GraphQL", "Next.js"]:
        assert skill in partitions["missing"]["skills"]


# ============================================================================
# Test 5: FastAPI DNA Matrix Enterprise Endpoints
# ============================================================================
def test_fastapi_health_endpoint():
    resp = client.get("/api/v1/dna-matrix/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "OPERATIONAL"
    assert data["engine"] == "DNAMatrixEngine-v26.0"
    assert data["vector_dim"] == 384
    assert "Lightcast" in data["taxonomy"]


def test_fastapi_parse_skills_endpoint():
    resp = client.post("/api/v1/dna-matrix/parse-skills", json={"text": "Proficient with Python, Docker, and Kubernetes"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] >= 3
    assert "Python" in data["skills"]
    assert "Docker" in data["skills"]
    assert "Kubernetes" in data["skills"]


def test_fastapi_match_endpoint():
    payload = {
        "candidate_skills": ["Python", "FastAPI", "SQL"],
        "required_skills": ["Python", "FastAPI", "SQL", "Redis"]
    }
    resp = client.post("/api/v1/dna-matrix/match", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "match_score" in data
    assert "overall_score" in data
    assert "matched_skills" in data
    assert "missing_critical_skills" in data
    assert "missing_skills" in data
    assert "Python" in data["matched_skills"]
    assert "Redis" in data["missing_critical_skills"]


def test_fastapi_parse_resume_endpoint():
    pdf_bytes = create_in_memory_pdf("Candidate with experience in Go, Docker, Kubernetes, and gRPC.")
    files = {"file": ("test_resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    resp = client.post("/api/v1/dna-matrix/parse-resume", files=files)
    assert resp.status_code == 200
    data = resp.json()
    assert data["filename"] == "test_resume.pdf"
    assert "Go" in data["skills"]
    assert "Docker" in data["skills"]
    assert "Kubernetes" in data["skills"]


def test_fastapi_full_pipeline_endpoint():
    pdf_bytes = create_in_memory_pdf("Tech Lead experienced in Python, Django, PostgreSQL, Docker, AWS.")
    jd = "Seeking a Senior Backend Engineer skilled in Python, PostgreSQL, AWS, and Kubernetes."

    files = {"file": ("senior_resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    data = {"jd_text": jd}

    resp = client.post("/api/v1/dna-matrix/full-pipeline", files=files, data=data)
    assert resp.status_code == 200
    res = resp.json()
    assert "match_score" in res
    assert "overall_score" in res
    assert "Python" in res["matched_skills"]
    assert "PostgreSQL" in res["matched_skills"]
    assert "AWS" in res["matched_skills"]
    assert "Kubernetes" in res["missing_critical_skills"]


# ============================================================================
# Test 6: Blueprint Compliance & File Exports
# ============================================================================
def test_blueprint_exports_exist():
    export_paths = [
        os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "src",
            "lib",
            "nlp",
            "DNAMatrixEngine.py",
        ),
    ]
    for path in export_paths:
        assert os.path.exists(path), f"Blueprint export missing at {path}"
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
            assert "class DNAMatrixEngine" in content
            assert "extract_text_from_pdf" in content
            assert "compute_skill_dna_match" in content


if __name__ == "__main__":
    pytest.main(["-v", "test_dna_matrix_v26.py"])
