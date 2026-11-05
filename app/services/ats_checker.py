"""
ATS Checker & JD-Tailored CV Synthesis Service — SkillMatch DNA v2.1
Implements Module 4 (FR-06 & FR-07) from prd-v2.md
"""
from __future__ import annotations
import re
from typing import Dict, List, Any, Optional
from app.services.skill_taxonomy import _ALIAS_GROUPS

ACTION_VERBS = [
    "architected", "engineered", "spearheaded", "developed", "implemented",
    "scaled", "optimized", "orchestrated", "deployed", "refactored",
    "accelerated", "designed", "streamlined", "automated", "built"
]

COMMON_ATS_HEADERS = [
    "summary", "professional summary", "objective",
    "experience", "professional experience", "work experience", "employment history",
    "education", "academic background",
    "skills", "technical skills", "core competencies",
    "projects", "key projects", "selected projects",
    "certifications", "licenses"
]

class ATSCheckerService:
    def __init__(self):
        # Build set of all known skills and canonical names
        self.skills_pool: set[str] = set(_ALIAS_GROUPS.keys())
        for aliases in _ALIAS_GROUPS.values():
            for alias in aliases:
                self.skills_pool.add(alias.lower())

    def extract_keywords_from_text(self, text: str) -> List[str]:
        """Extracts technical skills, methodologies, and tools present in the text."""
        if not text:
            return []
        text_lower = text.lower()
        found: set[str] = set()

        # Check known canonical skills and aliases
        for canonical, aliases in _ALIAS_GROUPS.items():
            pattern = r'\b' + re.escape(canonical) + r'\b'
            if re.search(pattern, text_lower):
                found.add(canonical)
                continue
            for alias in aliases:
                a_pattern = r'\b' + re.escape(alias) + r'\b'
                if re.search(a_pattern, text_lower):
                    found.add(canonical)
                    break

        # Check for domain keywords like microservices, ci/cd, rest api, etc.
        domain_patterns = [
            "microservices", "ci/cd", "rest api", "graphql", "grpc",
            "active noise cancellation", "anc", "webrtc", "fft", "dsp",
            "docker", "kubernetes", "aws", "gcp", "azure", "kafka",
            "distributed systems", "concurrency", "load balancing",
            "unit testing", "test driven development", "tdd", "agile", "scrum",
            "rag", "vector search", "llm", "item response theory", "cat"
        ]
        for dp in domain_patterns:
            if re.search(r'\b' + re.escape(dp) + r'\b', text_lower):
                found.add(dp)

        return sorted(list(found))

    def calculate_ats_score(self, cv_text: str, jd_text: str) -> Dict[str, Any]:
        """
        Evaluates a CV against target JD requirements:
        1. Keyword Density & Relevance (40%)
        2. ATS Standard Section Structure (20%)
        3. Action Verbs & Quantifiable Metrics (20%)
        4. Readability, Formatting & Contact Parsability (20%)
        Returns total ATS score (0-100%) with recommendations and alerts.
        """
        if not cv_text or not cv_text.strip():
            return {
                "ats_score": 0,
                "score_grade": "Needs Attention",
                "matched_keywords": [],
                "missing_keywords": self.extract_keywords_from_text(jd_text),
                "formatting_alerts": ["CV content is empty or unparseable."],
                "recommendations": ["Paste or upload a complete resume text."],
                "dimension_scores": {
                    "keyword_matching": 0,
                    "section_compliance": 0,
                    "action_verbs_metrics": 0,
                    "readability_parsability": 0
                }
            }

        cv_lower = cv_text.lower()
        jd_keywords = self.extract_keywords_from_text(jd_text)
        if not jd_keywords:
            # Fallback default keywords if JD text is minimal
            jd_keywords = ["python", "fastapi", "sql", "git", "docker", "rest api", "microservices"]

        # 1. Keyword Matching (0 to 40)
        matched = []
        missing = []
        for kw in jd_keywords:
            pattern = r'\b' + re.escape(kw.lower()) + r'\b'
            if re.search(pattern, cv_lower):
                matched.append(kw)
            else:
                missing.append(kw)

        keyword_ratio = len(matched) / max(1, len(jd_keywords))
        keyword_score = round(keyword_ratio * 40.0, 1)

        # 2. Section Structure Compliance (0 to 20)
        headers_found = []
        for header in COMMON_ATS_HEADERS:
            if re.search(r'(?m)^[\s#*-]*' + re.escape(header) + r'[\s:]*$', cv_lower) or (header in cv_lower):
                headers_found.append(header)

        # Essential sections: experience, education, skills
        has_exp = any(h in headers_found for h in ["experience", "professional experience", "work experience"])
        has_edu = any(h in headers_found for h in ["education", "academic background"])
        has_skills = any(h in headers_found for h in ["skills", "technical skills", "core competencies"])
        has_summary = any(h in headers_found for h in ["summary", "professional summary", "objective"])

        section_pts = 0
        if has_exp: section_pts += 7
        if has_edu: section_pts += 5
        if has_skills: section_pts += 5
        if has_summary: section_pts += 3
        section_score = min(20.0, float(section_pts))

        # 3. Action Verbs & Quantifiable Metrics (0 to 20)
        found_verbs = [v for v in ACTION_VERBS if re.search(r'\b' + re.escape(v) + r'\b', cv_lower)]
        verb_ratio = min(1.0, len(found_verbs) / 5.0)

        # Metrics patterns: %, $, ms, k, x, numbers
        metric_matches = re.findall(r'(\d+[\.,]?\d*\s*(?:%|\+|ms|s|x|k|m|users|requests|req/s|\$))', cv_text, re.IGNORECASE)
        metric_ratio = min(1.0, len(metric_matches) / 4.0)

        action_score = round((verb_ratio * 10.0) + (metric_ratio * 10.0), 1)

        # 4. Readability & Parsability (0 to 20)
        readability_score = 20.0
        alerts = []

        # Check for contact info
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', cv_text)
        if not email_match:
            alerts.append("Contact Email not detected in header.")
            readability_score -= 4.0

        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', cv_text)
        if not phone_match:
            alerts.append("Contact Phone number not detected.")
            readability_score -= 2.0

        if not has_exp:
            alerts.append("Missing standard 'Professional Experience' section header.")
        if not has_skills:
            alerts.append("Missing standard 'Technical Skills' section header.")
        if len(metric_matches) < 2:
            alerts.append("Few quantifiable metrics found. Add numbers, percentages (%), or latency improvements (ms).")
        if len(found_verbs) < 3:
            alerts.append("Incorporate more strong action verbs (e.g. Architected, Engineered, Optimized).")

        readability_score = max(5.0, min(20.0, readability_score))

        # Total ATS Score
        total_ats = round(keyword_score + section_score + action_score + readability_score)
        total_ats = max(10, min(100, total_ats))

        # Determine grade
        if total_ats >= 90:
            grade = "Excellent (ATS Ready)"
        elif total_ats >= 75:
            grade = "Strong Alignment"
        elif total_ats >= 55:
            grade = "Moderate Match"
        else:
            grade = "Needs Optimization"

        # Actionable recommendations
        recommendations = []
        if missing:
            top_missing = missing[:5]
            recommendations.append(f"Incorporate target job description keywords: {', '.join(top_missing)}.")
        if len(metric_matches) < 4:
            recommendations.append("Quantify your achievements using the STAR method: Situation, Task, Action, and Result with metrics.")
        if not has_summary:
            recommendations.append("Add a 2-3 sentence Professional Summary at the top highlighting your core domain expertise.")
        if len(found_verbs) < 4:
            recommendations.append("Begin every experience bullet point with a high-impact technical action verb.")

        return {
            "ats_score": total_ats,
            "score_grade": grade,
            "matched_keywords": matched,
            "missing_keywords": missing,
            "formatting_alerts": alerts,
            "recommendations": recommendations,
            "metrics_detected_count": len(metric_matches),
            "action_verbs_detected": found_verbs,
            "dimension_scores": {
                "keyword_matching": keyword_score,
                "section_compliance": section_score,
                "action_verbs_metrics": action_score,
                "readability_parsability": readability_score
            }
        }

    def generate_tailored_cv(
        self,
        profile_data: Dict[str, Any],
        custom_details: str,
        jd_text: str,
        target_role: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Synthesizes a tailored CV specifically aligned with the target job description:
        - Weaves target JD keywords into summary and experience bullets
        - Incorporates candidate profile experiences + custom details achievements
        - Formats into clean Markdown and structured sections
        - Evaluates immediate ATS score
        """
        jd_keywords = self.extract_keywords_from_text(jd_text)
        role = target_role or profile_data.get("role") or profile_data.get("title") or "Senior Software Engineer"

        name = profile_data.get("name") or "Candidate Name"
        email = profile_data.get("email") or "candidate@skillmatch.io"
        phone = profile_data.get("phone") or "+1 (555) 019-2834"
        location = profile_data.get("location") or "San Francisco, CA (Open to Remote)"
        github = profile_data.get("github") or "github.com/developer"
        linkedin = profile_data.get("linkedin") or "linkedin.com/in/candidate"

        # Categorize matched and key target skills
        profile_skills = profile_data.get("skills", ["Python", "FastAPI", "PostgreSQL", "Docker", "Git"])
        if isinstance(profile_skills, str):
            profile_skills = [s.strip() for s in profile_skills.split(",") if s.strip()]

        # Combine with top JD keywords
        combined_skills = list(dict.fromkeys(profile_skills + jd_keywords[:8]))

        # Format skills string
        core_skills_str = ", ".join(combined_skills[:12])
        tools_str = ", ".join([k for k in jd_keywords[12:20]] or ["Docker", "Kubernetes", "Git", "Linux", "Pytest", "CI/CD"])

        # Professional Summary synthesis
        summary = (
            f"Results-driven {role} with verified hands-on expertise in {', '.join(jd_keywords[:3]) or 'scalable architectures'}. "
            f"Proven track record of architecting high-throughput distributed services, optimizing algorithmic performance, and "
            f"delivering robust cloud-native systems. Passionate about engineering excellence, test-driven reliability, and "
            f"cross-functional collaboration."
        )

        # Experience items synthesis
        existing_exp = profile_data.get("experience", [])
        experience_entries = []

        if existing_exp and isinstance(existing_exp, list):
            for exp in existing_exp:
                if isinstance(exp, dict):
                    title = exp.get("title", f"{role}")
                    company = exp.get("company", "Tech Innovations Inc.")
                    duration = exp.get("duration", "2023 - Present")
                    bullets = exp.get("bullets", [])
                    if not bullets:
                        bullets = [
                            f"Architected and deployed resilient {jd_keywords[0] if jd_keywords else 'backend'} microservices handling 2.5M+ requests daily with 99.99% SLA.",
                            f"Optimized database query indexing and caching strategies, reducing p99 API latency by 42% (from 185ms to 107ms).",
                            f"Collaborated with cross-functional product and infrastructure teams to automate CI/CD pipeline deployment times by 35%."
                        ]
                    experience_entries.append({
                        "title": title,
                        "company": company,
                        "duration": duration,
                        "bullets": bullets
                    })
        else:
            # High-impact default experience with JD alignment
            kw1 = jd_keywords[0] if len(jd_keywords) > 0 else "Python & FastAPI"
            kw2 = jd_keywords[1] if len(jd_keywords) > 1 else "distributed systems"
            kw3 = jd_keywords[2] if len(jd_keywords) > 2 else "PostgreSQL"

            experience_entries = [
                {
                    "title": f"Lead {role}",
                    "company": "Apex Cloud Systems",
                    "duration": "2022 - Present",
                    "bullets": [
                        f"Architected modular microservices using {kw1}, boosting system throughput by 65% while reducing server utilization costs.",
                        f"Engineered real-time data ingestion pipelines leveraging {kw2} and Redis cache-aside architectures with sub-50ms query responses.",
                        f"Spearheaded comprehensive test coverage across core services, achieving 94% code coverage using automated unit and integration suites."
                    ]
                },
                {
                    "title": f"Software Engineer",
                    "company": "Nexus Distributed Labs",
                    "duration": "2020 - 2022",
                    "bullets": [
                        f"Developed and optimized RESTful APIs and database schemas in {kw3}, servicing 500k+ active monthly enterprise clients.",
                        f"Integrated automated monitoring, distributed tracing, and rate-limiting middleware to eliminate API throttling bottlenecks.",
                        f"Refactored legacy modules into containerized Docker services, accelerating local onboarding setup time from 4 hours to 15 minutes."
                    ]
                }
            ]

        # Inject custom details achievements into top experience or dedicated section
        custom_bullets = []
        if custom_details and custom_details.strip():
            # Break down custom details into clean bullet points
            raw_lines = [line.strip() for line in custom_details.strip().split("\n") if line.strip()]
            for line in raw_lines:
                clean_line = re.sub(r'^[\s*-•\d\.]+', '', line).strip()
                if clean_line:
                    # Check if line starts with an action verb, otherwise prepend a strong action verb
                    first_word = clean_line.split()[0].lower()
                    if first_word not in ACTION_VERBS:
                        clean_line = f"Spearheaded key initiative: {clean_line}"
                    custom_bullets.append(clean_line)

            if custom_bullets and experience_entries:
                experience_entries[0]["bullets"].extend(custom_bullets[:3])

        # Education
        education_entries = profile_data.get("education", [
            {
                "degree": "B.S. in Computer Science & Engineering",
                "institution": "University School of Engineering",
                "year": "2020",
                "details": "Coursework: Distributed Systems, Algorithms, Cloud Architecture, Databases (GPA: 3.8/4.0)"
            }
        ])

        # Assemble clean Markdown format
        md_lines = [
            f"# {name}",
            f"**{role}** | {location} | {email} | {phone}",
            f"[GitHub]({github}) • [LinkedIn]({linkedin})\n",
            "## Professional Summary",
            f"{summary}\n",
            "## Core Technical Skills",
            f"* **Languages & Frameworks:** {core_skills_str}",
            f"* **Tools, Cloud & DevOps:** {tools_str}",
            f"* **Architectural Patterns:** Microservices, Event-Driven, REST/gRPC, Caching, CI/CD\n",
            "## Professional Experience"
        ]

        for exp in experience_entries:
            md_lines.append(f"### {exp['title']} — {exp['company']}")
            md_lines.append(f"*{exp['duration']}*")
            for b in exp["bullets"]:
                md_lines.append(f"- {b}")
            md_lines.append("")

        md_lines.append("## Education")
        for edu in education_entries:
            if isinstance(edu, dict):
                md_lines.append(f"### {edu.get('degree')} — {edu.get('institution')}")
                md_lines.append(f"*{edu.get('year')}* | {edu.get('details', '')}")

        cv_markdown = "\n".join(md_lines)

        # Run instant ATS check on generated CV
        ats_eval = self.calculate_ats_score(cv_markdown, jd_text)

        return {
            "cv_markdown": cv_markdown,
            "target_role": role,
            "candidate_name": name,
            "ats_evaluation": ats_eval,
            "structured_cv": {
                "header": {
                    "name": name,
                    "role": role,
                    "email": email,
                    "phone": phone,
                    "location": location,
                    "links": [github, linkedin]
                },
                "summary": summary,
                "skills": {
                    "core": combined_skills[:12],
                    "tools": tools_str.split(", ")
                },
                "experience": experience_entries,
                "education": education_entries
            }
        }

ats_checker_service = ATSCheckerService()
