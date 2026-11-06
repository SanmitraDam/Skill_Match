"""
pdf_export_service.py — Executive Resume & CV PDF Generation Service
===================================================================
Synthesizes professional, ATS-formatted PDF resumes from structured CV models.
Uses ReportLab with high-fidelity typography, section dividing lines, and bullet lists,
with a resilient PyMuPDF fallback.
"""
from __future__ import annotations
import io
import re
from typing import Dict, Any, Optional

def generate_pdf_from_cv(structured_cv: Dict[str, Any], cv_markdown: str = "") -> bytes:
    """Generates an executive-formatted PDF resume and returns raw PDF bytes."""
    try:
        return _build_reportlab_pdf(structured_cv, cv_markdown)
    except Exception as e:
        print(f"[PDF_EXPORT WARNING] ReportLab generation error: {e}. Falling back to PyMuPDF.")
        return _build_pymupdf_pdf(structured_cv, cv_markdown)

def _build_reportlab_pdf(structured_cv: Dict[str, Any], cv_markdown: str) -> bytes:
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    name_style = ParagraphStyle(
        'CVName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        alignment=1
    )

    title_style = ParagraphStyle(
        'CVTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#059669'),
        alignment=1
    )

    contact_style = ParagraphStyle(
        'CVContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#475569'),
        alignment=1
    )

    section_head_style = ParagraphStyle(
        'CVSectionHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=3,
        spaceBefore=7
    )

    body_style = ParagraphStyle(
        'CVBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#1e293b')
    )

    bullet_style = ParagraphStyle(
        'CVBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=2.5
    )

    story = []
    header = structured_cv.get('header', {}) if structured_cv else {}

    # 1. Header (Name, Title, Location, Contact)
    name = header.get('name') or 'Candidate Name'
    role = header.get('role') or 'Senior Software Engineer'
    location = header.get('location') or 'Open to Remote'
    email = header.get('email') or ''
    phone = header.get('phone') or ''
    links_list = header.get('links', [])
    links = ' • '.join([str(l) for l in links_list if l])

    story.append(Paragraph(name, name_style))
    story.append(Spacer(1, 2))
    role_loc = f"{role} • {location}" if location else role
    story.append(Paragraph(role_loc, title_style))
    story.append(Spacer(1, 2))

    contact_items = [p for p in [email, phone, links] if p]
    if contact_items:
        story.append(Paragraph(' • '.join(contact_items), contact_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width='100%', thickness=1.5, color=colors.HexColor('#059669'), spaceAfter=6))

    # 2. Professional Summary
    summary = structured_cv.get('summary', '') if structured_cv else ''
    if summary:
        story.append(Paragraph('PROFESSIONAL SUMMARY', section_head_style))
        story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceAfter=4))
        story.append(Paragraph(summary, body_style))
        story.append(Spacer(1, 5))

    # 3. Technical Competencies
    skills = structured_cv.get('skills', {}) if structured_cv else {}
    core_skills = skills.get('core', [])
    tools = skills.get('tools', [])
    if core_skills or tools:
        story.append(Paragraph('TECHNICAL COMPETENCIES', section_head_style))
        story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceAfter=4))
        if core_skills:
            core_str = ', '.join([str(s) for s in core_skills])
            story.append(Paragraph(f"<b>Core Skills:</b> {core_str}", body_style))
        if tools:
            tools_str = ', '.join([str(t) for t in tools])
            story.append(Paragraph(f"<b>Tools & Infrastructure:</b> {tools_str}", body_style))
        story.append(Spacer(1, 5))

    # 4. Professional Experience
    experience = structured_cv.get('experience', []) if structured_cv else []
    if experience:
        story.append(Paragraph('PROFESSIONAL EXPERIENCE', section_head_style))
        story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceAfter=4))
        for exp in experience:
            title = exp.get('title', '')
            company = exp.get('company', '')
            duration = exp.get('duration', '')
            title_line = f"<b>{title}</b> — <i>{company}</i> <font color='#64748b' size='8'>({duration})</font>"
            story.append(Paragraph(title_line, body_style))
            story.append(Spacer(1, 2))
            for b in exp.get('bullets', []):
                story.append(Paragraph(f"• {b}", bullet_style))
            story.append(Spacer(1, 4))

    # 5. Education & Credentials
    education = structured_cv.get('education', []) if structured_cv else []
    if education:
        story.append(Paragraph('EDUCATION & CREDENTIALS', section_head_style))
        story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceAfter=4))
        for edu in education:
            deg = edu.get('degree', '')
            inst = edu.get('institution', '')
            year = edu.get('year', '')
            details = edu.get('details', '')
            edu_line = f"<b>{deg}</b> — {inst} <font color='#64748b' size='8'>({year})</font>"
            story.append(Paragraph(edu_line, body_style))
            if details:
                story.append(Paragraph(details, bullet_style))
            story.append(Spacer(1, 2))

    doc.build(story)
    return buf.getvalue()

def _build_pymupdf_pdf(structured_cv: Dict[str, Any], cv_markdown: str) -> bytes:
    import pymupdf
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842) # A4

    header = structured_cv.get('header', {}) if structured_cv else {}
    name = header.get('name') or 'Candidate Name'
    role = header.get('role') or 'Software Engineer'
    email = header.get('email') or 'candidate@skillmatch.io'

    text = f"{name}\n{role}\nContact: {email}\n\n"
    summary = structured_cv.get('summary', '')
    if summary:
        text += f"SUMMARY\n{summary}\n\n"

    skills = structured_cv.get('skills', {})
    if skills:
        core = ', '.join(skills.get('core', []))
        text += f"TECHNICAL SKILLS\n{core}\n\n"

    for exp in structured_cv.get('experience', []):
        text += f"{exp.get('title')} - {exp.get('company')} ({exp.get('duration')})\n"
        for b in exp.get('bullets', []):
            text += f"  * {b}\n"
        text += "\n"

    rect = pymupdf.Rect(40, 40, 555, 800)
    page.insert_textbox(rect, text, fontsize=10, fontname='helv')
    return doc.tobytes()

