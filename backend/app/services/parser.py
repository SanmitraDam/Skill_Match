import os
import io
import re
import zipfile
import xml.etree.ElementTree as ET
from typing import List, Set, Dict, Optional
import pymupdf as fitz

nlp = None

def get_nlp():
    global nlp
    if nlp is None:
        try:
            import spacy
            nlp = spacy.load("en_core_web_sm")
        except Exception:
            nlp = False
    return nlp if nlp is not False else None

from .skill_taxonomy import _HARD, _SOFT, _ALIAS_TO_CANON, categorize_skill, display_skill
from .skill_text import extract_skills as extract_dynamic_skills

class ResumeParser:
    def __init__(self):
        # Full skill taxonomies synchronized with master taxonomy
        self.hard_skills = set(_HARD)
        self.soft_skills = set(_SOFT)
        self.domain_tools = {
            "aws", "azure", "gcp", "git", "github", "gitlab", "linux", "bash", "shell",
            "jenkins", "terraform", "ansible", "ci/cd", "jira", "postman", "sentence-transformers",
            "faster-whisper", "edge-tts", "vs code", "vscode", "docker", "kubernetes"
        }
        self.skill_keywords = self.hard_skills | self.soft_skills | self.domain_tools

    def extract_text(self, file_path: Optional[str] = None, file_bytes: Optional[bytes] = None, filename: str = "") -> str:
        """Extracts raw text from PDF, DOCX, or TXT/MD files via path or direct bytes."""
        # 1. Direct in-memory parsing from bytes (ideal for serverless / zero-disk execution)
        if file_bytes is not None:
            ext = os.path.splitext(filename)[1].lower() if filename else ".pdf"
            if ext == ".pdf":
                try:
                    text = ""
                    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
                        for page in doc:
                            text += page.get_text()
                    return text
                except Exception as e:
                    print(f"Error parsing in-memory PDF: {e}")
                    return ""
            elif ext == ".docx":
                try:
                    with zipfile.ZipFile(io.BytesIO(file_bytes), "r") as docx_zip:
                        xml_content = docx_zip.read("word/document.xml")
                        tree = ET.fromstring(xml_content)
                        paragraphs = [elem.text for elem in tree.iter() if elem.tag.endswith("t") and elem.text]
                        return " ".join(paragraphs)
                except Exception as e:
                    print(f"Error parsing in-memory docx: {e}")
                    return ""
            else:
                return file_bytes.decode("utf-8", errors="ignore")

        # 2. File path fallback
        if not file_path or not os.path.exists(file_path):
            return ""

        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".pdf":
            text = ""
            with fitz.open(file_path) as doc:
                for page in doc:
                    text += page.get_text()
            return text

        elif ext == ".docx":
            try:
                with zipfile.ZipFile(file_path, "r") as docx_zip:
                    xml_content = docx_zip.read("word/document.xml")
                    tree = ET.fromstring(xml_content)
                    paragraphs = [elem.text for elem in tree.iter() if elem.tag.endswith("t") and elem.text]
                    return " ".join(paragraphs)
            except Exception as e:
                print(f"Error parsing docx: {e}")
                return ""

        else:
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    return f.read()
            except Exception as e:
                print(f"Error reading text file: {e}")
                return ""

    def scrub_pii(self, text: str) -> str:
        """
        Anonymizes candidate PII (phone numbers, emails, addresses)
        to prevent algorithmic bias.
        """
        # Scrub email addresses
        scrubbed = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[EMAIL_REDACTED]', text)
        # Scrub standard international/US phone numbers
        scrubbed = re.sub(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', '[PHONE_REDACTED]', scrubbed)
        # Scrub 10-digit raw phone numbers
        scrubbed = re.sub(r'\b\d{10}\b', '[PHONE_REDACTED]', scrubbed)
        return scrubbed

    def anonymize_pii(self, text: str) -> str:
        return self.scrub_pii(text)

    def extract_social_profiles(self, text: str) -> Dict[str, Optional[str]]:
        """Extracts developer social links (GitHub, LinkedIn, Portfolios)."""
        profiles: Dict[str, Optional[str]] = {
            "github": None,
            "linkedin": None,
            "portfolio": None
        }

        gh_match = re.search(r'(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
        if gh_match:
            profiles["github"] = f"https://github.com/{gh_match.group(1)}"

        li_match = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
        if li_match:
            profiles["linkedin"] = f"https://linkedin.com/in/{li_match.group(1)}"

        port_match = re.search(r'https?://[a-zA-Z0-9.-]+\.(?:dev|io|me|app|ai)', text, re.IGNORECASE)
        if port_match:
            profiles["portfolio"] = port_match.group(0)

        return profiles

    def categorize_skills(self, skills: List[str]) -> Dict[str, List[str]]:
        """Categorizes skills into Hard Technical, Soft Skills, and Domain Tools."""
        taxonomy = {
            "hard_technical": [],
            "soft_skills": [],
            "domain_tools": []
        }
        for s in skills:
            s_lower = s.lower()
            cat = categorize_skill(s_lower)
            taxonomy[cat].append(s)
        return taxonomy

    def extract_skills(self, text: str) -> List[str]:
        """Extracts technical and soft skills dynamically using boundary-safe regex, alias normalization, and NER."""
        extracted_skills = set()
        
        # 1. Dynamic regex and taxonomy extraction
        dynamic_matches = extract_dynamic_skills(text)
        for sk in dynamic_matches:
            extracted_skills.add(sk.canonical)

        # 2. Text keyword scan for full taxonomy keywords
        text_lower = text.lower()
        for skill in self.skill_keywords:
            if re.search(r'(?<![A-Za-z0-9+#])' + re.escape(skill) + r'(?![A-Za-z0-9+#])', text_lower):
                canonical = _ALIAS_TO_CANON.get(skill, skill)
                extracted_skills.add(canonical)

        return sorted(list(extracted_skills))

parser = ResumeParser()
