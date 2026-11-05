"""
Verification Suite for AI-HireSense Dynamic Skill Matching Engine
Validates:
1. Test A: Python Developer JD vs Sample Resume
2. Test B: Frontend Developer JD vs Sample Resume
3. Test C: Data Analyst JD vs Sample Resume
4. Test D: Two Different Resumes vs Same JD
5. Dynamic changes in match score, matched skills, taxonomy, and critical gaps.
"""

import os
import sys
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import pymupdf as fitz
from app.services.skill_match import match_resume_to_jd
from app.services.skill_text import extract_skills

def run_tests():
    print("=" * 70)
    print("   AI-HIRESENSE DYNAMIC RESUME-TO-JD SKILL MATCHING VERIFICATION")
    print("=" * 70)

    # 1. Load Candidate 1 (Alex Sharma - sample_resume.pdf)
    sample_pdf_path = r"c:\Users\ASUS\Downloads\sample_resume.pdf"
    if not os.path.exists(sample_pdf_path):
        sample_pdf_path = "sample_resume.pdf"
    
    with fitz.open(sample_pdf_path) as doc:
        resume_alex = "\n".join([page.get_text() for page in doc])

    # Candidate 2: Senior Cloud/DevOps Engineer
    resume_cloud = """
    Jordan Miller
    Senior DevOps & Cloud Infrastructure Architect
    jordan.miller@cloudops.net | github.com/jordan-cloud
    EXPERIENCE & SKILLS
    - 7+ years designing enterprise platforms on AWS, GCP, and Azure.
    - Expert in Kubernetes, Docker, Terraform, Ansible, Linux, and CI/CD pipelines.
    - Deep experience in Go, Python, Bash scripting, Microservices, and Prometheus.
    - Agile leadership, Scrum Master certified, Cross-functional collaboration.
    """

    # Define 3 completely distinct Job Descriptions
    jd_python = """
    Job Role: Senior Python Developer
    Required Technical Skills:
    Must have strong proficiency in Python, Data Structures & Algorithms, and OOP.
    Hands-on experience with SQL, Database Management Systems (DBMS), and Streamlit.
    Experience with Web Development, APIs, Debugging, and Testing.
    Soft Skills: Strong Problem Solving, Teamwork, and Communication skills.
    """

    jd_frontend = """
    Job Role: Frontend React Engineer
    Requirements:
    Must have deep expertise in React, Next.js, TypeScript, JavaScript, HTML, and CSS.
    Proficient in Tailwind CSS, Webpack, Redux, and responsive Web Development.
    Experience with Figma design handoff, Cypress end-to-end testing, and REST APIs.
    Must have strong Communication and Agile Teamwork experience.
    """

    jd_data_analyst = """
    Job Role: Senior Data Analyst & BI Specialist
    Core Requirements:
    Proficiency in SQL, Advanced Excel, Tableau, and Power BI for enterprise reporting.
    Hands-on experience in Data Analysis, Data Science, Statistics, and Database queries.
    Strong Python programming for data manipulation using Pandas and NumPy.
    Strong communication skills to present insights to executive stakeholders.
    """

    # -------------------------------------------------------------------------
    # TEST A: Python Developer JD
    # -------------------------------------------------------------------------
    print("\n[TEST A] Candidate (Alex) vs Python Developer JD...")
    rep_a = match_resume_to_jd(resume_alex, jd_python)
    matched_a = [m.skill for m in rep_a.matched]
    missing_a = [m.skill for m in rep_a.missing]
    print(f"  -> Score: {rep_a.overall:.1f}%")
    print(f"  -> Matched ({len(matched_a)}): {matched_a}")
    print(f"  -> Missing ({len(missing_a)}): {missing_a}")
    print(f"  -> Taxonomy: Hard Tech: {rep_a.counts.get('hard_technical', 0)}, Soft: {rep_a.counts.get('soft_skills', 0)}, Tools: {rep_a.counts.get('domain_tools', 0)}")
    print(f"  -> Gaps: {[(g['skill'], g['criticality']) for g in rep_a.gaps]}")
    
    assert "Python" in matched_a, "Python should be matched"
    assert "Streamlit" in matched_a, "Streamlit should be matched"
    assert "OOP" in matched_a, "OOP should be matched"
    assert "Data Structures & Algorithms" in matched_a, "DSA should be matched"
    assert "SQL" in missing_a, "SQL should be missing"
    assert rep_a.overall > 50.0, f"Python match score should be > 50%, got {rep_a.overall}"

    # -------------------------------------------------------------------------
    # TEST B: Frontend Developer JD
    # -------------------------------------------------------------------------
    print("\n[TEST B] Candidate (Alex) vs Frontend Developer JD...")
    rep_b = match_resume_to_jd(resume_alex, jd_frontend)
    matched_b = [m.skill for m in rep_b.matched]
    missing_b = [m.skill for m in rep_b.missing]
    print(f"  -> Score: {rep_b.overall:.1f}%")
    print(f"  -> Matched ({len(matched_b)}): {matched_b}")
    print(f"  -> Missing ({len(missing_b)}): {missing_b}")
    print(f"  -> Taxonomy: Hard Tech: {rep_b.counts.get('hard_technical', 0)}, Soft: {rep_b.counts.get('soft_skills', 0)}, Tools: {rep_b.counts.get('domain_tools', 0)}")
    
    assert "HTML" in matched_b, "HTML should be matched"
    assert "CSS" in matched_b, "CSS should be matched"
    assert "React" in missing_b or "TypeScript" in missing_b, "React or TypeScript should be missing"
    # Frontend JD must produce different skill set and different score than Python JD
    assert matched_a != matched_b, "Extracted matched skills must differ across different JDs!"
    assert rep_a.overall != rep_b.overall, "Scores must differ across different JDs!"

    # -------------------------------------------------------------------------
    # TEST C: Data Analyst JD
    # -------------------------------------------------------------------------
    print("\n[TEST C] Candidate (Alex) vs Data Analyst JD...")
    rep_c = match_resume_to_jd(resume_alex, jd_data_analyst)
    matched_c = [m.skill for m in rep_c.matched]
    missing_c = [m.skill for m in rep_c.missing]
    print(f"  -> Score: {rep_c.overall:.1f}%")
    print(f"  -> Matched ({len(matched_c)}): {matched_c}")
    print(f"  -> Missing ({len(missing_c)}): {missing_c}")
    print(f"  -> Taxonomy: Hard Tech: {rep_c.counts.get('hard_technical', 0)}, Soft: {rep_c.counts.get('soft_skills', 0)}, Tools: {rep_c.counts.get('domain_tools', 0)}")

    assert "Power BI" in missing_c or "Tableau" in missing_c, "Power BI/Tableau should be missing"
    assert matched_c != matched_a, "Data Analyst matched skills must differ from Python Developer!"
    assert rep_c.overall != rep_a.overall, "Scores must differ between Data Analyst and Python Dev!"

    # -------------------------------------------------------------------------
    # TEST D: Two Different Resumes vs Same JD (Python Developer)
    # -------------------------------------------------------------------------
    print("\n[TEST D] Resume Comparison: Alex (Student) vs Jordan (DevOps) on Python JD...")
    rep_jordan = match_resume_to_jd(resume_cloud, jd_python)
    print(f"  -> Alex Score: {rep_a.overall:.1f}% | Matched: {len(rep_a.matched)} skills")
    print(f"  -> Jordan Score: {rep_jordan.overall:.1f}% | Matched: {len(rep_jordan.matched)} skills")
    assert rep_a.overall != rep_jordan.overall, "Scores must dynamically differ between different resumes!"

    print("\n" + "=" * 70)
    print("   ALL DYNAMIC MATCHING & RESUME-TO-JD TESTS PASSED SUCCESSFULLY! ")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
