"""
AI-HireSense — Career DNA Matrix & Skill Gap Intelligence Portal (v26.0)
Futuristic Dark/Neon Cyber Interface powered by Dynamic Hybrid Dense + Lexical Matching
and Real-Time Skill Gap Intelligence.

Run with: streamlit run streamlit_app.py
"""

import os
import sys
import hashlib
import zipfile
import xml.etree.ElementTree as ET
from typing import Optional, Tuple, Dict, Any, List

import streamlit as st

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.services.skill_taxonomy import (
    MatchingConfig, CONFIG, display_skill, categorize_skill, normalize_skill_name
)
from app.services.skill_text import clean_text, extract_skills, validate_inputs
from app.services.skill_match import match_resume_to_jd, MatchReport
from app.services.gap_intelligence import gap_engine, GapIntelligenceReport
from app.services.parser import parser

# Streamlit Page Config & Futuristic Dark/Neon Cyber Theme
st.set_page_config(
    page_title="SkillMatch DNA — Career DNA & Gap Intelligence",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Futuristic Dark/Neon Interface matching ResumeMatcher.tsx & Cyber Dashboard
FUTURISTIC_CSS = """
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

    :root {
        --bg-dark: #070a14;
        --card-bg: rgba(15, 23, 42, 0.78);
        --card-border: rgba(255, 255, 255, 0.1);
        --tech-cyan: #00f0ff;
        --cyber-violet: #8b5cf6;
        --vivid-emerald: #10b981;
        --cyber-amber: #f59e0b;
        --crimson-red: #f43f5e;
        --text-main: #f8fafc;
        --text-muted: #94a3b8;
    }

    html, body, [data-testid="stAppViewContainer"] {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        background: radial-gradient(circle at top right, #1e1b4b 0%, #0a0e1a 45%, #050811 100%) !important;
        color: var(--text-main) !important;
    }

    [data-testid="stHeader"] {
        background: transparent !important;
    }

    /* Sidebar Styling */
    [data-testid="stSidebar"] {
        background: #080c18 !important;
        border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
    }

    [data-testid="stSidebar"] hr {
        border-color: rgba(255, 255, 255, 0.08) !important;
    }

    /* Glass Card container */
    .dna-glass-card {
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 18px;
        padding: 24px;
        box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(16px);
        margin-bottom: 20px;
        position: relative;
        overflow: hidden;
    }

    .dna-glass-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--tech-cyan), var(--cyber-violet), transparent);
    }

    .card-title {
        font-size: 1.15rem;
        font-weight: 800;
        letter-spacing: -0.3px;
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
    }

    /* Top Dashboard KPI Cards */
    .kpi-card {
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        padding: 18px 20px;
        text-align: center;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        position: relative;
        overflow: hidden;
    }

    .kpi-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #00f0ff, #8b5cf6);
    }

    .kpi-card-val {
        font-size: 2.2rem;
        font-weight: 900;
        line-height: 1.1;
        color: #ffffff;
        letter-spacing: -0.5px;
    }

    .kpi-card-lbl {
        font-size: 0.72rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        color: #94a3b8;
        margin-top: 6px;
    }

    /* Neon Buttons */
    .stButton > button {
        border-radius: 14px !important;
        font-weight: 700 !important;
        font-size: 0.95rem !important;
        letter-spacing: 0.3px !important;
        transition: all 0.25s ease !important;
    }

    .stButton > button[kind="primary"] {
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%) !important;
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        box-shadow: 0 0 25px rgba(139, 92, 246, 0.45) !important;
    }

    .stButton > button[kind="primary"]:hover {
        transform: translateY(-2px) scale(1.01) !important;
        box-shadow: 0 0 35px rgba(139, 92, 246, 0.7) !important;
    }

    .stButton > button[kind="secondary"] {
        background: rgba(0, 240, 255, 0.12) !important;
        color: var(--tech-cyan) !important;
        border: 1px solid rgba(0, 240, 255, 0.45) !important;
    }

    .stButton > button[kind="secondary"]:hover {
        background: rgba(0, 240, 255, 0.22) !important;
        box-shadow: 0 0 20px rgba(0, 240, 255, 0.35) !important;
    }

    /* Badges */
    .badge-matched {
        display: inline-block;
        padding: 5px 12px;
        border-radius: 8px;
        background: rgba(16, 185, 129, 0.18);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.4);
        font-size: 0.78rem;
        font-weight: 700;
        margin: 3px;
        letter-spacing: 0.2px;
    }

    .badge-partial {
        display: inline-block;
        padding: 5px 12px;
        border-radius: 8px;
        background: rgba(245, 158, 11, 0.18);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.4);
        font-size: 0.78rem;
        font-weight: 700;
        margin: 3px;
    }

    .badge-missing {
        display: inline-block;
        padding: 5px 12px;
        border-radius: 8px;
        background: rgba(244, 63, 94, 0.18);
        color: #fb7185;
        border: 1px solid rgba(244, 63, 94, 0.4);
        font-size: 0.78rem;
        font-weight: 700;
        margin: 3px;
    }

    .gap-detail-card {
        padding: 16px 18px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 12px;
        transition: all 0.2s ease;
    }

    .gap-detail-card:hover {
        border-color: rgba(139, 92, 246, 0.4);
        background: rgba(255, 255, 255, 0.05);
    }

    .gap-badge-high {
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        background: rgba(244, 63, 94, 0.2);
        color: #fb7185;
        border: 1px solid rgba(244, 63, 94, 0.4);
    }

    .gap-badge-medium {
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        background: rgba(245, 158, 11, 0.2);
        color: #fcd34d;
        border: 1px solid rgba(245, 158, 11, 0.4);
    }

    .gap-badge-low {
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        background: rgba(148, 163, 184, 0.15);
        color: #cbd5e1;
        border: 1px solid rgba(148, 163, 184, 0.3);
    }

    /* Roadmap Steps */
    .roadmap-node {
        padding: 18px 20px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.7);
        border-left: 4px solid #8b5cf6;
        border: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 14px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    }

    /* Resource Box */
    .resource-link-card {
        padding: 14px 16px;
        border-radius: 12px;
        background: rgba(0, 240, 255, 0.04);
        border: 1px solid rgba(0, 240, 255, 0.2);
        margin-bottom: 10px;
        transition: all 0.2s ease;
    }

    .resource-link-card:hover {
        border-color: #00f0ff;
        background: rgba(0, 240, 255, 0.08);
        transform: translateY(-1px);
    }

    /* Score KPI Display */
    .kpi-score {
        font-size: 3.6rem;
        font-weight: 900;
        line-height: 1;
        background: linear-gradient(135deg, #ffffff 0%, #38bdf8 60%, #818cf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -1.5px;
    }

    .kpi-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: #94a3b8;
        margin-top: 4px;
    }

    .pill-anonymized {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 700;
        background: rgba(0, 240, 255, 0.15);
        color: var(--tech-cyan);
        border: 1px solid rgba(0, 240, 255, 0.4);
    }

    /* Textarea & Inputs */
    textarea {
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        color: #ffffff !important;
        border-radius: 12px !important;
        font-family: inherit !important;
    }

    textarea:focus {
        border-color: var(--tech-cyan) !important;
        box-shadow: 0 0 15px rgba(0, 240, 255, 0.25) !important;
    }
</style>
"""
st.markdown(FUTURISTIC_CSS, unsafe_allow_html=True)


# File Parser Guardrails (PDF, DOCX, TXT)
def extract_text_from_upload(uploaded_file) -> str:
    """Extracts complete readable text from uploaded PDF, DOCX, or TXT."""
    if uploaded_file is None:
        return ""

    filename = uploaded_file.name.lower()

    if filename.endswith(".pdf"):
        try:
            import pymupdf as fitz
            doc = fitz.open(stream=uploaded_file.read(), filetype="pdf")
            pages_text = []
            for page in doc:
                text = page.get_text()
                if text:
                    pages_text.append(text)
            return "\n".join(pages_text)
        except Exception:
            try:
                import pypdf
                uploaded_file.seek(0)
                reader = pypdf.PdfReader(uploaded_file)
                return "\n".join([p.extract_text() or "" for p in reader.pages])
            except Exception as pe:
                raise ValueError(f"Could not extract readable text from PDF: {pe}")

    elif filename.endswith(".docx"):
        try:
            uploaded_file.seek(0)
            with zipfile.ZipFile(uploaded_file, "r") as docx_zip:
                xml_content = docx_zip.read("word/document.xml")
                tree = ET.fromstring(xml_content)
                paragraphs = []
                for elem in tree.iter():
                    if elem.tag.endswith("t") and elem.text:
                        paragraphs.append(elem.text)
                return " ".join(paragraphs)
        except Exception as de:
            raise ValueError(f"Could not extract readable text from DOCX: {de}")

    elif filename.endswith((".txt", ".md")):
        try:
            uploaded_file.seek(0)
            raw_bytes = uploaded_file.read()
            try:
                return raw_bytes.decode("utf-8")
            except UnicodeDecodeError:
                return raw_bytes.decode("latin-1", errors="ignore")
        except Exception as te:
            raise ValueError(f"Could not read text file: {te}")

    else:
        raise ValueError("Unsupported file format. Please upload a PDF, DOCX, or TXT file.")


def compute_content_hash(resume_text: str, jd_text: str, pii_mask: bool) -> str:
    """Produces unique SHA-256 fingerprint for cache invalidation."""
    raw = f"{resume_text.strip()}|{jd_text.strip()}|{pii_mask}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


# Session State Initialization
if "current_page" not in st.session_state:
    st.session_state.current_page = "DNA Matcher"
if "resume_text" not in st.session_state:
    st.session_state.resume_text = ""
if "cleaned_resume" not in st.session_state:
    st.session_state.cleaned_resume = ""
if "resume_file_name" not in st.session_state:
    st.session_state.resume_file_name = None
if "jd_text" not in st.session_state:
    st.session_state.jd_text = ""
if "anonymize_pii" not in st.session_state:
    st.session_state.anonymize_pii = False
if "match_report" not in st.session_state:
    st.session_state.match_report = None
if "gap_intelligence" not in st.session_state:
    st.session_state.gap_intelligence = None
if "social_profiles" not in st.session_state:
    st.session_state.social_profiles = {"github": None, "linkedin": None, "portfolio": None}
if "analysis_hash" not in st.session_state:
    st.session_state.analysis_hash = ""
if "debug_mode" not in st.session_state:
    st.session_state.debug_mode = False


# Core Execution Helper: Run Analysis & Gap Intelligence
def execute_matching_pipeline():
    """Executes deterministic hybrid match + gap intelligence compilation."""
    if not st.session_state.resume_text.strip():
        st.error("Please upload a resume first.")
        return False
    if not st.session_state.jd_text.strip():
        st.error("Please enter a Job Description.")
        return False

    curr_hash = compute_content_hash(
        st.session_state.resume_text,
        st.session_state.jd_text,
        st.session_state.anonymize_pii
    )

    proc_resume = st.session_state.resume_text
    if st.session_state.anonymize_pii:
        proc_resume = parser.scrub_pii(proc_resume)

    # 1. Hybrid Lexical + Vector Matching
    report = match_resume_to_jd(proc_resume, st.session_state.jd_text)
    st.session_state.match_report = report

    # 2. Skill Gap Intelligence Synthesis
    intel = gap_engine.generate_intelligence(proc_resume, st.session_state.jd_text, report)
    st.session_state.gap_intelligence = intel

    st.session_state.analysis_hash = curr_hash
    st.session_state.social_profiles = parser.extract_social_profiles(st.session_state.resume_text)
    return True


# Left Dark Sidebar Navigation (Matching Reference UI & Branding)
with st.sidebar:
    # 1. Branding Header
    st.markdown("""
        <div style='display: flex; align-items: center; gap: 12px; padding: 10px 4px; margin-bottom: 8px;'>
            <div style='width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);'>
                🧬
            </div>
            <div>
                <div style='font-weight: 900; font-size: 1.15rem; color: #ffffff; letter-spacing: -0.5px;'>SkillMatch DNA</div>
                <div style='font-size: 0.68rem; font-family: monospace; color: #00f0ff; letter-spacing: 1.5px; font-weight: 700;'>VERSION 26.0 SUPER-INTEL</div>
            </div>
        </div>
    """, unsafe_allow_html=True)

    st.markdown("<div style='font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin-top: 14px; margin-bottom: 6px;'>CORE ASSESSMENT</div>", unsafe_allow_html=True)

    # Navigation Radio
    nav_options = ["🧬 DNA Matcher", "🧠 Skill Gap Intelligence"]
    current_idx = 0 if st.session_state.current_page == "DNA Matcher" else 1
    selected_nav = st.radio(
        "Navigation",
        options=nav_options,
        index=current_idx,
        label_visibility="collapsed"
    )

    if selected_nav == "🧬 DNA Matcher" and st.session_state.current_page != "DNA Matcher":
        st.session_state.current_page = "DNA Matcher"
        st.rerun()
    elif selected_nav == "🧠 Skill Gap Intelligence" and st.session_state.current_page != "Skill Gap Intelligence":
        st.session_state.current_page = "Skill Gap Intelligence"
        st.rerun()

    st.write("---")

    # 2. Real-Time Pipeline State Indicators
    st.markdown("<div style='font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 10px;'>PIPELINE STATUS</div>", unsafe_allow_html=True)

    res_badge = "✓ Indexed" if st.session_state.resume_text else "⏳ Awaiting"
    res_color = "#34d399" if st.session_state.resume_text else "#94a3b8"
    jd_badge = "✓ Analyzed" if st.session_state.jd_text else "⏳ Empty"
    jd_color = "#34d399" if st.session_state.jd_text else "#94a3b8"
    engine_badge = f"{st.session_state.match_report.overall:.1f}%" if st.session_state.match_report else "⚡ Ready"
    engine_color = "#00f0ff" if st.session_state.match_report else "#94a3b8"

    st.markdown(f"""
        <div style='background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; font-size: 0.78rem;'>
            <div style='display: flex; justify-content: space-between; margin-bottom: 6px;'>
                <span style='color: #94a3b8;'>Resume DNA:</span>
                <span style='color: {res_color}; font-weight: 700;'>{res_badge}</span>
            </div>
            <div style='display: flex; justify-content: space-between; margin-bottom: 6px;'>
                <span style='color: #94a3b8;'>Target JD:</span>
                <span style='color: {jd_color}; font-weight: 700;'>{jd_badge}</span>
            </div>
            <div style='display: flex; justify-content: space-between;'>
                <span style='color: #94a3b8;'>Match Score:</span>
                <span style='color: {engine_color}; font-weight: 700;'>{engine_badge}</span>
            </div>
        </div>
    """, unsafe_allow_html=True)

    # 3. Sidebar Action: Re-Analyze Resume
    if st.button("↻ RE-ANALYZE MY RESUME", use_container_width=True, type="secondary", key="sidebar_reanalyze_btn"):
        if st.session_state.resume_text and st.session_state.jd_text:
            with st.spinner("Re-extracting skills & recalculating career DNA..."):
                execute_matching_pipeline()
                st.rerun()
        else:
            st.warning("Please provide both a resume and a Job Description first.")

    st.write("")
    # Quick Load Demo Profiles for instant testing
    with st.expander("⚡ QUICK LOAD TEST DATA", expanded=False):
        if st.button("Python Developer Demo", use_container_width=True):
            st.session_state.resume_text = """Alex Sharma
Full Stack Developer & CS Graduate.
Skills: Python, C++, Java, Streamlit, HTML, CSS, Git, Data Structures & Algorithms, DBMS, OOP, Computer Networks, Problem Solving, Communication, Teamwork."""
            st.session_state.cleaned_resume = clean_text(st.session_state.resume_text)
            st.session_state.resume_file_name = "Sample_Resume_Alex.pdf"
            st.session_state.jd_text = """Senior Python Developer
Requirements:
- 3+ years experience in Python backend development.
- Strong knowledge of Data Structures & Algorithms and OOP principles.
- Must have experience with SQL and Database management.
- Experience with Streamlit or Web Development.
- REST APIs, Debugging, Testing, Problem Solving, Teamwork, Communication."""
            execute_matching_pipeline()
            st.rerun()

        if st.button("Frontend React Demo", use_container_width=True):
            st.session_state.resume_text = """Alex Sharma
Skills: Python, C++, Java, Streamlit, HTML, CSS, Git, DSA, OOP, Problem Solving, Communication, Teamwork."""
            st.session_state.cleaned_resume = clean_text(st.session_state.resume_text)
            st.session_state.resume_file_name = "Sample_Resume_Alex.pdf"
            st.session_state.jd_text = """Frontend React Engineer
Requirements:
- JavaScript, TypeScript, React, Next.js, HTML, CSS, Tailwind CSS.
- REST APIs integration, Jest, Cypress testing.
- Agile teamwork and communication."""
            execute_matching_pipeline()
            st.rerun()

        if st.button("Data Analyst Demo", use_container_width=True):
            st.session_state.resume_text = """Alex Sharma
Skills: Python, C++, Java, Streamlit, HTML, CSS, Git, DSA, DBMS, OOP, Problem Solving, Communication, Teamwork."""
            st.session_state.cleaned_resume = clean_text(st.session_state.resume_text)
            st.session_state.resume_file_name = "Sample_Resume_Alex.pdf"
            st.session_state.jd_text = """Senior Data Analyst
Requirements:
- Advanced SQL queries, Window Functions, CTEs.
- Python, Pandas, NumPy, Data Analysis.
- Power BI and Tableau dashboards.
- Database systems and business communication."""
            execute_matching_pipeline()
            st.rerun()


# Top Breadcrumb & Hero Bar
breadcrumb_title = "DNA Matcher" if st.session_state.current_page == "DNA Matcher" else "Skill Gap Intelligence"
breadcrumb_color = "#00f0ff" if st.session_state.current_page == "DNA Matcher" else "#8b5cf6"

st.markdown(f"""
    <div style='display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-family: monospace; letter-spacing: 1.5px; text-transform: uppercase; color: #94a3b8; margin-bottom: 6px;'>
        <span style='color: #64748b;'>CORE ASSESSMENT</span>
        <span style='color: #475569;'>›</span>
        <span style='color: {breadcrumb_color}; font-weight: 700;'>{breadcrumb_title}</span>
    </div>
""", unsafe_allow_html=True)

top_col1, top_col2 = st.columns([4, 1])
with top_col1:
    st.markdown("""
        <div style='display: flex; align-items: center; gap: 14px; margin-bottom: 12px;'>
            <div style='width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);'>
                🧬
            </div>
            <div>
                <h2 style='margin: 0; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;'>
                    AI-HireSense <span style='color: #00f0ff;'>Career DNA</span> & <span style='color: #8b5cf6;'>Gap Intelligence</span>
                </h2>
                <div style='font-size: 0.8rem; color: #94a3b8;'>
                    Multi-Format Ingestion • Presidio PII Masking • 384-d Dense Embeddings • Personalized Career Recovery
                </div>
            </div>
        </div>
    """, unsafe_allow_html=True)

with top_col2:
    st.session_state.debug_mode = st.toggle("🛠️ Debug Diagnostics", value=st.session_state.debug_mode)


# PAGE 1: 🧬 DNA MATCHER
if st.session_state.current_page == "DNA Matcher":
    left_col, right_col = st.columns([1, 1.08], gap="large")

    with left_col:
        # GlassCard: Input DNA Matrix
        st.markdown('<div class="dna-glass-card">', unsafe_allow_html=True)
        st.markdown('<div class="card-title"><span>🧬</span> Input DNA Matrix</div>', unsafe_allow_html=True)

        # 1. Bias-Free PII Masking Toggle
        pii_val = st.toggle(
            "Bias-Free PII Masking",
            value=st.session_state.anonymize_pii,
            help="Scrub phone, email, and address before AI vectorization to prevent algorithmic bias"
        )
        st.caption("Scrub phone, email, and address before AI vectorization")
        if pii_val != st.session_state.anonymize_pii:
            st.session_state.anonymize_pii = pii_val
            st.session_state.analysis_hash = ""

        st.write("")

        # 2. Upload Resume
        uploaded_file = st.file_uploader(
            "Upload Resume (PDF, DOCX, TXT)",
            type=["pdf", "docx", "txt", "md"],
            help="Accepts readable PDF, Microsoft Word DOCX, and TXT resumes"
        )

        if uploaded_file is not None:
            if uploaded_file.name != st.session_state.resume_file_name:
                try:
                    extracted = extract_text_from_upload(uploaded_file)
                    if not extracted or len(clean_text(extracted).split()) < 10:
                        st.error("Could not extract readable text from this resume.")
                        st.session_state.resume_text = ""
                        st.session_state.cleaned_resume = ""
                    else:
                        st.session_state.resume_text = extracted
                        st.session_state.cleaned_resume = clean_text(extracted)
                        st.session_state.resume_file_name = uploaded_file.name
                        st.session_state.social_profiles = parser.extract_social_profiles(extracted)
                        st.session_state.analysis_hash = ""
                        st.success(f"✓ {uploaded_file.name} Parsed & Indexed")
                except Exception as ex:
                    st.error(f"Error parsing resume: {str(ex)}")
                    st.session_state.resume_text = ""

        if st.session_state.resume_text:
            st.markdown(f"""
                <div style='display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; margin-top: 8px; font-size: 0.78rem;'>
                    <span style='color: #34d399; font-weight: 700;'>✓ {st.session_state.resume_file_name or "Resume"} Indexed</span>
                    <span style='color: #94a3b8;'>{len(st.session_state.cleaned_resume.split())} words</span>
                </div>
            """, unsafe_allow_html=True)

        st.write("")

        # 3. Target Job Description
        st.markdown('<div style="font-size: 0.88rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">📄 Target Job Description (Guarded Context)</div>', unsafe_allow_html=True)
        jd_input_val = st.text_area(
            "Job Description Input",
            value=st.session_state.jd_text,
            height=140,
            placeholder="Paste the target job description or requirements here...",
            label_visibility="collapsed"
        )

        if jd_input_val != st.session_state.jd_text:
            st.session_state.jd_text = jd_input_val
            st.session_state.analysis_hash = ""

        # 4. Action Button: Analyze JD DNA
        analyze_jd_clicked = st.button("Analyze JD DNA", use_container_width=True, type="secondary")
        if analyze_jd_clicked:
            if not st.session_state.jd_text.strip():
                st.warning("Please enter a Job Description.")
            elif len(st.session_state.jd_text.strip()) < CONFIG.min_jd_chars:
                st.warning("Job Description is too short for reliable analysis.")
            else:
                jd_skills = extract_skills(st.session_state.jd_text, is_jd=True)
                st.info(f"Taxonomy Analyzed: Identified {len(jd_skills)} relevant competencies in target JD.")

        st.write("")

        # 5. Master Match Button
        match_clicked = st.button("⚡ Match Career DNA (Dense + Lexical)", use_container_width=True, type="primary")
        if match_clicked:
            with st.spinner("Executing 384-d Cosine Vectorization & Lightcast Alignment..."):
                ok = execute_matching_pipeline()
                if ok:
                    st.rerun()

        st.markdown('</div>', unsafe_allow_html=True)

    with right_col:
        report: Optional[MatchReport] = st.session_state.match_report

        if not report:
            st.markdown("""
                <div class="dna-glass-card" style='min-height: 480px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;'>
                    <div style='width: 72px; height: 72px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 16px; border: 1px solid rgba(255, 255, 255, 0.1);'>
                        ⚡
                    </div>
                    <h4 style='color: #f8fafc; font-weight: 800; margin-bottom: 6px;'>Awaiting DNA Match...</h4>
                    <p style='font-size: 0.88rem; color: #94a3b8; max-width: 320px;'>
                        Upload resume and enter target JD to calculate hybrid cosine match and skill taxonomy distribution.
                    </p>
                </div>
            """, unsafe_allow_html=True)
        else:
            # Header Score Card
            st.markdown('<div class="dna-glass-card">', unsafe_allow_html=True)
            top_info_col, social_col = st.columns([3, 2])
            with top_info_col:
                st.markdown(f'<div class="kpi-score">{report.overall:.1f}%</div>', unsafe_allow_html=True)
                st.markdown('<div class="kpi-label">Hybrid Match Score</div>', unsafe_allow_html=True)
                if st.session_state.anonymize_pii:
                    st.markdown('<div style="margin-top: 10px;"><span class="pill-anonymized">🛡️ PII Scrubbed</span></div>', unsafe_allow_html=True)

            with social_col:
                soc = st.session_state.social_profiles
                links_html = []
                if soc.get("github"):
                    links_html.append(f'<a href="{soc["github"]}" target="_blank" style="padding: 6px 12px; border-radius: 8px; background: rgba(255,255,255,0.08); color: #ffffff; text-decoration: none; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; border: 1px solid rgba(255,255,255,0.15);">💻 GitHub</a>')
                if soc.get("linkedin"):
                    links_html.append(f'<a href="{soc["linkedin"]}" target="_blank" style="padding: 6px 12px; border-radius: 8px; background: rgba(0, 240, 255, 0.12); color: #00f0ff; text-decoration: none; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; border: 1px solid rgba(0, 240, 255, 0.3);">💼 LinkedIn</a>')
                if links_html:
                    st.markdown(f'<div style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">{"".join(links_html)}</div>', unsafe_allow_html=True)

            st.write("")
            st.progress(min(1.0, max(0.0, report.overall / 100.0)))

            sub1, sub2, sub3, sub4 = st.columns(4)
            sub1.metric("Tech Skills", f"{report.technical:.1f}%")
            sub2.metric("Soft Skills", f"{report.soft:.1f}%")
            sub3.metric("Domain Tools", f"{report.tools:.1f}%")
            sub4.metric("Required Cov", f"{report.req_cov:.1f}%")
            st.markdown('</div>', unsafe_allow_html=True)

            # Matched Skills & Critical Gaps
            grid_m1, grid_m2 = st.columns(2)
            with grid_m1:
                st.markdown('<div class="dna-glass-card" style="min-height: 220px;">', unsafe_allow_html=True)
                st.markdown(f'<div class="card-title"><span>✅</span> Matched Skills ({len(report.matched) + len(report.partial)})</div>', unsafe_allow_html=True)
                badges_html = []
                for m in report.matched:
                    badges_html.append(f'<span class="badge-matched">{m.skill}</span>')
                for p in report.partial:
                    badges_html.append(f'<span class="badge-partial">~ {p.skill}</span>')
                st.markdown(f'<div style="max-height: 160px; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 4px;">{"".join(badges_html)}</div>', unsafe_allow_html=True)
                st.markdown('</div>', unsafe_allow_html=True)

            with grid_m2:
                st.markdown('<div class="dna-glass-card" style="min-height: 220px;">', unsafe_allow_html=True)
                st.markdown(f'<div class="card-title"><span>⚠️</span> Critical Gaps ({len(report.gaps)})</div>', unsafe_allow_html=True)
                gaps_html = []
                for g in report.gaps[:5]:
                    crit = g.get("criticality", "Medium")
                    b_cls = "gap-badge-high" if crit == "High" else "gap-badge-medium"
                    gaps_html.append(f'<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:rgba(255,255,255,0.04); border-radius:8px; margin-bottom:6px;"><span style="font-weight:700;">{g["skill"]}</span><span class="{b_cls}">{crit} Gap</span></div>')
                st.markdown(f'<div style="max-height: 160px; overflow-y: auto;">{"".join(gaps_html)}</div>', unsafe_allow_html=True)
                st.markdown('</div>', unsafe_allow_html=True)

            # Glowing CTA Button to Next Stage: Skill Gap Intelligence
            if st.button("🚀 Explore Full Skill Gap Intelligence & Personalized Roadmap →", use_container_width=True, type="primary"):
                st.session_state.current_page = "Skill Gap Intelligence"
                st.rerun()


# PAGE 2: 🧠 SKILL GAP INTELLIGENCE
elif st.session_state.current_page == "Skill Gap Intelligence":
    intel: Optional[GapIntelligenceReport] = st.session_state.gap_intelligence

    # Guard: if no matching report is active, prompt cleanly
    if not intel or not st.session_state.match_report:
        st.markdown("""
            <div class="dna-glass-card" style='text-align: center; padding: 48px 24px;'>
                <div style='width: 72px; height: 72px; border-radius: 50%; background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.4); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 16px auto;'>
                    🧠
                </div>
                <h3 style='color: #ffffff; font-weight: 800; margin-bottom: 8px;'>Skill Gap Intelligence Engine Awaiting Active DNA Match</h3>
                <p style='color: #94a3b8; max-width: 540px; margin: 0 auto 24px auto; font-size: 0.92rem;'>
                    To generate your personalized improvement plan, recovery roadmap, and gap interview questions, please upload your resume and enter a target Job Description in the DNA Matcher.
                </p>
            </div>
        """, unsafe_allow_html=True)

        c1, c2 = st.columns(2)
        with c1:
            if st.button("← Go to DNA Matcher to Upload Resume", use_container_width=True, type="secondary"):
                st.session_state.current_page = "DNA Matcher"
                st.rerun()
        with c2:
            if st.button("⚡ Load Demo Candidate (Alex) & Python JD", use_container_width=True, type="primary"):
                st.session_state.resume_text = """Alex Sharma
Full Stack Developer & CS Graduate.
Skills: Python, C++, Java, Streamlit, HTML, CSS, Git, Data Structures & Algorithms, DBMS, OOP, Computer Networks, Problem Solving, Communication, Teamwork."""
                st.session_state.cleaned_resume = clean_text(st.session_state.resume_text)
                st.session_state.resume_file_name = "Sample_Resume_Alex.pdf"
                st.session_state.jd_text = """Senior Python Developer
Requirements:
- 3+ years experience in Python backend development.
- Strong knowledge of Data Structures & Algorithms and OOP principles.
- Must have experience with SQL and Database management.
- Experience with Streamlit or Web Development.
- REST APIs, Debugging, Testing, Problem Solving, Teamwork, Communication."""
                execute_matching_pipeline()
                st.rerun()
    else:
        # 1. Section Header & Target Role
        h_col1, h_col2 = st.columns([3, 1])
        with h_col1:
            st.markdown(f"""
                <div style='margin-bottom: 16px;'>
                    <span style='font-size: 0.78rem; font-family: monospace; color: #8b5cf6; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;'>AI RECOVERY AGENT</span>
                    <h2 style='margin: 4px 0 6px 0; font-weight: 900; color: #ffffff;'>
                        Gap Intelligence: <span style='color: #00f0ff;'>{intel.role_inferred}</span>
                    </h2>
                    <div style='font-size: 0.85rem; color: #94a3b8;'>
                        Personalized recovery roadmap, capstone project, and interview preparation derived directly from your current skill gaps.
                    </div>
                </div>
            """, unsafe_allow_html=True)

        with h_col2:
            if st.button("↻ RE-ANALYZE MY RESUME", use_container_width=True, type="primary", key="main_reanalyze_btn"):
                with st.spinner("Re-analyzing active resume against current JD..."):
                    execute_matching_pipeline()
                    st.rerun()

        # 2. Section 3: TOP DASHBOARD (4 KPI Cards)
        k1, k2, k3, k4 = st.columns(4)
        with k1:
            st.markdown(f"""
                <div class="kpi-card">
                    <div class="kpi-card-val" style="color: #00f0ff;">{intel.match_score:.1f}%</div>
                    <div class="kpi-card-lbl">CURRENT MATCH</div>
                </div>
            """, unsafe_allow_html=True)

        with k2:
            st.markdown(f"""
                <div class="kpi-card">
                    <div class="kpi-card-val">{intel.total_gaps}</div>
                    <div class="kpi-card-lbl">SKILL GAPS</div>
                </div>
            """, unsafe_allow_html=True)

        with k3:
            st.markdown(f"""
                <div class="kpi-card">
                    <div class="kpi-card-val" style="color: #f43f5e;">{intel.critical_gaps_count}</div>
                    <div class="kpi-card-lbl">CRITICAL GAPS</div>
                </div>
            """, unsafe_allow_html=True)

        with k4:
            st.markdown(f"""
                <div class="kpi-card">
                    <div class="kpi-card-val" style="font-size: 1.35rem; color: {intel.readiness_badge_color}; margin-top: 6px;">
                        {intel.readiness_level}
                    </div>
                    <div class="kpi-card-lbl">READINESS ASSESSMENT</div>
                </div>
            """, unsafe_allow_html=True)

        st.write("")

        # 3. Section 4: CRITICAL SKILL GAPS INTELLIGENCE
        st.markdown('<div class="dna-glass-card">', unsafe_allow_html=True)
        st.markdown(f'<div class="card-title"><span>⚠️</span> Critical Skill Gaps ({len(intel.gap_details)})</div>', unsafe_allow_html=True)
        st.markdown("<p style='font-size: 0.85rem; color: #94a3b8; margin-bottom: 16px;'>Skills explicitly prioritized by the target Job Description where your resume currently exhibits insufficient evidence.</p>", unsafe_allow_html=True)

        if not intel.gap_details:
            st.markdown('<div style="color: #34d399; font-weight: 700; padding: 14px;">🎉 Zero critical skill gaps identified! Your resume exhibits complete coverage for this position.</div>', unsafe_allow_html=True)
        else:
            g_cols = st.columns(2)
            for i, gd in enumerate(intel.gap_details[:6]):
                col_target = g_cols[i % 2]
                with col_target:
                    crit_badge = "gap-badge-high" if gd.criticality == "High" else "gap-badge-medium"
                    st.markdown(f"""
                        <div class="gap-detail-card">
                            <div style='display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;'>
                                <span style='font-size: 1.05rem; font-weight: 800; color: #ffffff;'>{gd.skill}</span>
                                <div style='display: flex; gap: 6px; align-items: center;'>
                                    <span style='font-size: 0.68rem; font-weight: 700; color: #94a3b8; background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 6px;'>{gd.category}</span>
                                    <span class="{crit_badge}">{gd.severity}</span>
                                </div>
                            </div>
                            <div style='font-size: 0.75rem; color: #8b5cf6; font-weight: 700; margin-bottom: 6px;'>
                                JD Priority: {gd.jd_importance}
                            </div>
                            <div style='font-size: 0.82rem; color: #cbd5e1; line-height: 1.4;'>
                                {gd.reason}
                            </div>
                        </div>
                    """, unsafe_allow_html=True)

        st.markdown('</div>', unsafe_allow_html=True)

        # 4. Section 5: AI-POWERED IMPROVEMENT PLAN
        st.markdown('<div class="dna-glass-card">', unsafe_allow_html=True)
        st.markdown('<div class="card-title"><span>🧠</span> AI-Powered Improvement Plan</div>', unsafe_allow_html=True)
        st.markdown("<p style='font-size: 0.85rem; color: #94a3b8; margin-bottom: 18px;'>Structured curriculum tailored to eliminate your specific skill gaps with minimal time investment.</p>", unsafe_allow_html=True)

        for plan in intel.improvement_plan[:4]:
            p_color = "#f43f5e" if plan["priority"] == "HIGH PRIORITY" else "#f59e0b"
            with st.expander(f"📌 {plan['skill'].upper()} — {plan['priority']}", expanded=True):
                p_c1, p_c2 = st.columns([1, 1])
                with p_c1:
                    st.markdown(f"**🎯 WHY IT MATTERS:**  \n<span style='color:#cbd5e1; font-size:0.88rem;'>{plan['why']}</span>", unsafe_allow_html=True)
                    st.write("")
                    st.markdown(f"**📚 WHAT TO LEARN:**  \n<span style='color:#38bdf8; font-size:0.88rem;'>{plan['learn']}</span>", unsafe_allow_html=True)
                    st.write("")
                    st.markdown(f"**⚡ WHAT TO PRACTICE:**  \n<span style='color:#cbd5e1; font-size:0.88rem;'>{plan['practice']}</span>", unsafe_allow_html=True)

                with p_c2:
                    st.markdown(f"**🛠️ SUGGESTED PROJECT:**  \n<span style='color:#a78bfa; font-weight:700; font-size:0.9rem;'>{plan['project']}</span>", unsafe_allow_html=True)
                    st.write("")
                    st.markdown(f"**📝 RESUME EVIDENCE TO ADD:**  \n<span style='color:#34d399; font-size:0.88rem;'>{plan['evidence']}</span>", unsafe_allow_html=True)
                    st.write("")
                    topics_html = "".join([f"<span class='badge-partial' style='font-size:0.7rem;'>{t}</span>" for t in plan['interview_topics'][:3]])
                    st.markdown(f"**🎙️ INTERVIEW TOPICS:**  \n<div>{topics_html}</div>", unsafe_allow_html=True)

        st.markdown('</div>', unsafe_allow_html=True)

        # 5. Section 6: YOUR SKILL RECOVERY ROADMAP
        st.markdown('<div class="dna-glass-card">', unsafe_allow_html=True)
        st.markdown('<div class="card-title"><span>🗺️</span> Your Skill Recovery Roadmap</div>', unsafe_allow_html=True)
        st.markdown("<p style='font-size: 0.85rem; color: #94a3b8; margin-bottom: 20px;'>Step-by-step chronological recovery plan derived directly from missing competencies.</p>", unsafe_allow_html=True)

        for step in intel.roadmap:
            st.markdown(f"""
                <div class="roadmap-node">
                    <div style='display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;'>
                        <div style='display: flex; align-items: center; gap: 12px;'>
                            <span style='font-family: monospace; font-size: 1.25rem; font-weight: 900; color: #00f0ff;'>{step.step_num}</span>
                            <span style='font-size: 0.72rem; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #8b5cf6; background: rgba(139,92,246,0.15); padding: 3px 8px; border-radius: 6px;'>{step.phase}</span>
                            <span style='font-weight: 800; font-size: 1rem; color: #ffffff;'>{step.title}</span>
                        </div>
                    </div>
                    <div style='font-size: 0.85rem; color: #94a3b8; margin-bottom: 8px;'>
                        {step.description}
                    </div>
                    <div style='font-size: 0.82rem; color: #34d399; font-weight: 700; display: flex; align-items: center; gap: 6px;'>
                        <span>➔ Action Item:</span> <span style='color: #e2e8f0; font-weight: 400;'>{step.action_item}</span>
                    </div>
                </div>
            """, unsafe_allow_html=True)

        st.markdown('</div>', unsafe_allow_html=True)

        # 6. Two-Column Split: Build To Close The Gap | Recommended Resources
        b_col1, b_col2 = st.columns([1.1, 1], gap="large")

        with b_col1:
            # Section 8: Practical Project Generator
            st.markdown('<div class="dna-glass-card" style="min-height: 420px;">', unsafe_allow_html=True)
            st.markdown('<div class="card-title"><span>🛠️</span> Build To Close The Gap</div>', unsafe_allow_html=True)

            if intel.capstone:
                cap = intel.capstone
                st.markdown(f"""
                    <div style='padding: 16px; border-radius: 12px; background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.25); margin-bottom: 16px;'>
                        <div style='font-size: 0.72rem; font-weight: 800; color: #a78bfa; letter-spacing: 1px; text-transform: uppercase;'>PORTFOLIO BLUEPRINT</div>
                        <div style='font-size: 1.2rem; font-weight: 900; color: #ffffff; margin-top: 4px;'>{cap.title}</div>
                        <div style='font-size: 0.82rem; color: #94a3b8; margin-top: 6px;'>{cap.why_this_project}</div>
                    </div>
                """, unsafe_allow_html=True)

                st.markdown(f"**Target Competency:** <span class='gap-badge-high'>{cap.target_skill}</span>", unsafe_allow_html=True)
                st.write("")
                chips = "".join([f"<span class='badge-matched'>{s}</span>" for s in cap.skills_covered])
                st.markdown(f"**Skills Integrated:**  \n<div>{chips}</div>", unsafe_allow_html=True)
                st.write("")
                st.markdown(f"**Difficulty Level:** `{cap.difficulty}` | **Portfolio Value:** <span style='color:#34d399; font-weight:700;'>High Hiring Impact</span>", unsafe_allow_html=True)
                st.write("")
                st.markdown(f"**Expected Outcome:**  \n<span style='font-size:0.85rem; color:#cbd5e1;'>{cap.expected_outcome}</span>", unsafe_allow_html=True)
            else:
                st.info("No gaps detected! Your portfolio demonstrates complete coverage for this position.")

            st.markdown('</div>', unsafe_allow_html=True)

        with b_col2:
            # Section 7: Verified Learning Resources
            st.markdown('<div class="dna-glass-card" style="min-height: 420px;">', unsafe_allow_html=True)
            st.markdown('<div class="card-title"><span>📚</span> Recommended Resources</div>', unsafe_allow_html=True)
            st.markdown("<p style='font-size: 0.82rem; color: #94a3b8; margin-bottom: 14px;'>Verified official documentation and sandboxes directly addressing detected missing skills.</p>", unsafe_allow_html=True)

            if not intel.resources:
                st.caption("No missing skill resources needed for this matching profile.")
            else:
                for r in intel.resources:
                    st.markdown(f"""
                        <div class="resource-link-card">
                            <div style='display: flex; justify-content: space-between; align-items: center;'>
                                <span style='font-size: 0.72rem; font-weight: 800; color: #00f0ff; text-transform: uppercase;'>{r['skill']} • {r['type']}</span>
                                <a href='{r['url']}' target='_blank' style='font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-decoration: none;'>Open Docs ↗</a>
                            </div>
                            <div style='font-weight: 800; color: #ffffff; font-size: 0.92rem; margin-top: 4px;'>{r['title']}</div>
                            <div style='font-size: 0.78rem; color: #94a3b8; margin-top: 4px;'>{r['why_recommended']}</div>
                        </div>
                    """, unsafe_allow_html=True)

            st.markdown('</div>', unsafe_allow_html=True)

        # 7. Section 9: GAP-BASED INTERVIEW PREPARATION
        st.markdown('<div class="dna-glass-card">', unsafe_allow_html=True)
        i_top_col1, i_top_col2 = st.columns([3, 1])
        with i_top_col1:
            st.markdown(f'<div class="card-title"><span>🎙️</span> Gap-Based Interview Preparation ({intel.total_interview_questions} Questions)</div>', unsafe_allow_html=True)
            st.markdown("<p style='font-size: 0.85rem; color: #94a3b8;'>Technical interview questions dynamically generated from your detected skill gaps to simulate real hiring interviews.</p>", unsafe_allow_html=True)
        with i_top_col2:
            start_interview_clicked = st.button("🚀 Start Gap Interview", use_container_width=True, type="primary")
            if start_interview_clicked:
                st.success(f"✓ Launching Gap-Focused Mock Interview with {intel.total_interview_questions} technical questions...")

        if not intel.interview_questions:
            st.info("Zero technical skill gaps detected. You are ready for domain system design interviews!")
        else:
            for skill_k, q_list in intel.interview_questions.items():
                st.markdown(f"#### 💡 {skill_k}")
                for idx, q_item in enumerate(q_list, 1):
                    st.markdown(f"""
                        <div style='padding: 12px 16px; border-radius: 10px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 8px;'>
                            <div style='font-weight: 700; color: #ffffff; font-size: 0.88rem;'>
                                Q{idx}: {q_item['q']}
                            </div>
                            <div style='font-size: 0.78rem; color: #34d399; margin-top: 4px;'>
                                <strong>Key Focus:</strong> {q_item['focus']}
                            </div>
                        </div>
                    """, unsafe_allow_html=True)

        st.markdown('</div>', unsafe_allow_html=True)

        # 8. Section 10: RESUME IMPROVEMENT SIGNALS
        st.markdown('<div class="dna-glass-card">', unsafe_allow_html=True)
        st.markdown('<div class="card-title"><span>📝</span> Resume Improvement Signals</div>', unsafe_allow_html=True)
        st.markdown("<p style='font-size: 0.85rem; color: #94a3b8; margin-bottom: 16px;'>Comparison of demonstrated vs missing evidence to optimize your application for both ATS filters and human engineering managers.</p>", unsafe_allow_html=True)

        r_c1, r_c2, r_c3 = st.columns(3)
        with r_c1:
            st.markdown(f"**✓ Demonstrated Skills ({len(intel.demonstrated_skills)})**")
            d_chips = "".join([f"<span class='badge-matched'>{s}</span>" for s in intel.demonstrated_skills])
            st.markdown(f"<div style='max-height: 180px; overflow-y: auto; display: flex; flex-wrap: wrap;'>{d_chips or 'None'}</div>", unsafe_allow_html=True)

        with r_c2:
            st.markdown(f"**⚠ Needs Stronger Evidence ({len(intel.needs_evidence_skills)})**")
            p_chips = "".join([f"<span class='badge-partial'>~ {s}</span>" for s in intel.needs_evidence_skills])
            st.markdown(f"<div style='max-height: 180px; overflow-y: auto; display: flex; flex-wrap: wrap;'>{p_chips or 'None'}</div>", unsafe_allow_html=True)

        with r_c3:
            st.markdown(f"**✕ Critical Missing Skills ({len(intel.missing_skills)})**")
            m_chips = "".join([f"<span class='badge-missing'>{s}</span>" for s in intel.missing_skills])
            st.markdown(f"<div style='max-height: 180px; overflow-y: auto; display: flex; flex-wrap: wrap;'>{m_chips or 'None'}</div>", unsafe_allow_html=True)

        st.write("")
        st.markdown("""
            <div style='padding: 14px 18px; border-radius: 12px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.25); font-size: 0.84rem; line-height: 1.5;'>
                <strong style='color: #00f0ff;'>🛡️ Veracity-First Principle:</strong>
                Never fabricate or claim unverified skills on your resume. Instead, build the recommended capstone project, write automated tests, deploy the service on GitHub, and document quantifiable performance metrics before adding verified skills to your profile.
            </div>
        """, unsafe_allow_html=True)

        st.markdown('</div>', unsafe_allow_html=True)


# Developer / Debug Diagnostics Mode
if st.session_state.debug_mode:
    st.write("---")
    with st.expander("🛠️ DEVELOPER & DEBUG DIAGNOSTICS", expanded=True):
        d_col1, d_col2 = st.columns(2)
        with d_col1:
            st.markdown("#### 📄 Extracted Resume Text")
            st.text_area("Extracted Resume Content", value=st.session_state.resume_text, height=160, key="debug_resume_txt")
        with d_col2:
            st.markdown("#### 🎯 Target JD Text")
            st.text_area("Cleaned JD Content", value=st.session_state.jd_text, height=160, key="debug_jd_txt")

        if st.session_state.match_report:
            rep = st.session_state.match_report
            st.markdown("#### 🔍 Match Diagnostics & Vector Breakdown")
            dbg_data = []
            for m in rep.matched + rep.partial + rep.missing:
                dbg_data.append({
                    "Skill": m.skill,
                    "Category": m.category,
                    "Importance": m.importance,
                    "Verdict": m.verdict,
                    "Score": round(m.score, 3),
                    "Semantic Cosine": round(m.semantic_similarity, 3)
                })
            st.dataframe(dbg_data, use_container_width=True)
