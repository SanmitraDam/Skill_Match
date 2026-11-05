"""
Verification Suite for Skill Gap Intelligence Engine (v26.0)
Tests real-time personalization across:
- TEST A: Alex (sample_resume.pdf) vs Python Developer JD
- TEST B: Alex (sample_resume.pdf) vs Frontend Developer JD
- TEST C: Alex (sample_resume.pdf) vs Data Analyst JD
- TEST D: Jordan Miller (DevOps) vs Python Developer JD
Verifies zero hardcoded mock values and strict dependence on active resume + JD inputs.
"""

import os
import sys
import pytest

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.services.skill_match import match_resume_to_jd
from app.services.gap_intelligence import gap_engine, GapIntelligenceReport


# Sample Resumes
ALEX_RESUME = """
Alex Sharma
alex.sharma@example.com | (555) 019-2834 | github.com/alexsharma | linkedin.com/in/alexsharma
Full Stack Developer & Computer Science Student

TECHNICAL SKILLS:
Languages: Python, C++, Java, HTML, CSS, Git
Frameworks & Libraries: Streamlit
Core Competencies: Data Structures & Algorithms, DBMS, OOP, Computer Networks, Problem Solving, Communication, Teamwork
"""

JORDAN_RESUME = """
Jordan Miller
jordan.miller@cloudops.io | github.com/jordanm-ops | linkedin.com/in/jordanm-ops
DevOps & Cloud Infrastructure Architect

TECHNICAL SKILLS:
Languages: Go, Python, Bash, Shell
DevOps & Cloud: Docker, Kubernetes, AWS, Terraform, Ansible, CI/CD, Linux, Helm
Data & Storage: Redis, Kafka, PostgreSQL
Competencies: Microservices, Distributed Systems, Teamwork
"""

# Job Descriptions
JD_PYTHON = """
Senior Python Developer
Requirements:
- 3+ years hands-on experience in Python backend development.
- Strong knowledge of Data Structures & Algorithms and OOP principles.
- Must have experience with SQL and Database management.
- Experience with Streamlit or Web Development frameworks.
- Proficiency in building REST APIs, Debugging, and Testing.
- Excellent Problem Solving, Teamwork, and Communication skills.
"""

JD_FRONTEND = """
Frontend React Engineer
Requirements:
- Strong proficiency in JavaScript, TypeScript, HTML, CSS.
- Hands-on production experience with React and Next.js.
- Styling with Tailwind CSS.
- State management and REST APIs integration.
- Unit testing with Jest and Cypress.
- Collaborative Teamwork and Agile delivery.
"""

JD_DATA_ANALYST = """
Senior Data Analyst
Requirements:
- Advanced SQL querying, Window Functions, and CTEs.
- Proficiency in Python, Pandas, and NumPy for data manipulation.
- Building executive dashboards using Power BI and Tableau.
- Strong understanding of Database systems and Data Analysis.
- Business Communication and insight presentation.
"""


def test_test_a_alex_vs_python_jd():
    print("\n--- [TEST A] Alex Sharma vs Python Developer JD ---")
    match_rep = match_resume_to_jd(ALEX_RESUME, JD_PYTHON)
    intel = gap_engine.generate_intelligence(ALEX_RESUME, JD_PYTHON, match_rep)

    print(f"Match Score: {intel.match_score}% | Readiness: {intel.readiness_level}")
    print(f"Total Gaps: {intel.total_gaps} | Critical Gaps: {intel.critical_gaps_count}")
    gap_skills = [gd.skill for gd in intel.gap_details]
    print(f"Identified Gaps: {gap_skills}")

    # Gaps should specifically be missing Python JD requirements
    assert "SQL" in gap_skills or "APIs" in gap_skills or "Testing" in gap_skills
    # Matched skills should be present
    assert "Python" in intel.demonstrated_skills
    assert "Data Structures & Algorithms" in intel.demonstrated_skills
    assert "OOP" in intel.demonstrated_skills

    # Capstone project should target missing skill (e.g. SQL, APIs, Debugging)
    assert intel.capstone is not None
    assert intel.capstone.target_skill in gap_skills

    # Roadmap should contain sequential steps
    assert len(intel.roadmap) == 5
    print(f"Roadmap Step 1: {intel.roadmap[0].title} | Step 4: {intel.roadmap[3].title}")


def test_test_b_alex_vs_frontend_jd():
    print("\n--- [TEST B] Alex Sharma vs Frontend React JD ---")
    match_rep = match_resume_to_jd(ALEX_RESUME, JD_FRONTEND)
    intel = gap_engine.generate_intelligence(ALEX_RESUME, JD_FRONTEND, match_rep)

    print(f"Match Score: {intel.match_score}% | Readiness: {intel.readiness_level}")
    gap_skills = [gd.skill for gd in intel.gap_details]
    print(f"Identified Gaps: {gap_skills}")

    # Should detect frontend-specific gaps
    assert any(s in gap_skills for s in ["JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS"])

    # Capstone should be frontend-related
    assert intel.capstone is not None
    print(f"Capstone Project: {intel.capstone.title} (Target: {intel.capstone.target_skill})")
    assert intel.capstone.target_skill in ["JavaScript", "TypeScript", "React", "Next.js", "APIs", "Testing", "Tailwind CSS"]

    # Interview questions should be about frontend gaps
    q_keys = list(intel.interview_questions.keys())
    print(f"Interview Question Categories: {q_keys}")
    assert any(k in ["JavaScript", "React", "TypeScript", "APIs", "Next.js"] for k in q_keys)


def test_test_c_alex_vs_data_analyst_jd():
    print("\n--- [TEST C] Alex Sharma vs Data Analyst JD ---")
    match_rep = match_resume_to_jd(ALEX_RESUME, JD_DATA_ANALYST)
    intel = gap_engine.generate_intelligence(ALEX_RESUME, JD_DATA_ANALYST, match_rep)

    print(f"Match Score: {intel.match_score}% | Readiness: {intel.readiness_level}")
    gap_skills = [gd.skill for gd in intel.gap_details]
    print(f"Identified Gaps: {gap_skills}")

    # Should detect Data Analyst specific gaps
    assert any(s in gap_skills for s in ["SQL", "Pandas", "Power BI", "Tableau", "NumPy", "Data Analysis"])

    # Capstone project should address data gaps
    assert intel.capstone is not None
    print(f"Capstone Project: {intel.capstone.title} (Target: {intel.capstone.target_skill})")
    assert intel.capstone.target_skill in ["SQL", "Pandas", "Power BI", "Tableau", "NumPy", "Data Analysis", "Excel"]


def test_test_d_resume_comparison_different_outputs():
    print("\n--- [TEST D] Compare Alex vs Jordan on Python JD ---")
    alex_rep = match_resume_to_jd(ALEX_RESUME, JD_PYTHON)
    alex_intel = gap_engine.generate_intelligence(ALEX_RESUME, JD_PYTHON, alex_rep)

    jordan_rep = match_resume_to_jd(JORDAN_RESUME, JD_PYTHON)
    jordan_intel = gap_engine.generate_intelligence(JORDAN_RESUME, JD_PYTHON, jordan_rep)

    print(f"Alex Score: {alex_intel.match_score}% vs Jordan Score: {jordan_intel.match_score}%")
    print(f"Alex Gaps ({len(alex_intel.gap_details)}): {[g.skill for g in alex_intel.gap_details]}")
    print(f"Jordan Gaps ({len(jordan_intel.gap_details)}): {[g.skill for g in jordan_intel.gap_details]}")

    # Different candidate resumes MUST yield different scores and different demonstrated skills
    assert alex_intel.match_score != jordan_intel.match_score
    assert set(alex_intel.demonstrated_skills) != set(jordan_intel.demonstrated_skills)

    # Alex demonstrated DSA & OOP; Jordan demonstrated Docker & Kubernetes (which are not in this JD)
    assert "Data Structures & Algorithms" in alex_intel.demonstrated_skills
    assert "Data Structures & Algorithms" not in jordan_intel.demonstrated_skills


if __name__ == "__main__":
    pytest.main(["-v", "test_gap_intelligence.py"])
