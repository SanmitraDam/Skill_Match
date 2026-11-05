"""Text cleaning + dynamic skill extraction (only from text actually given)."""
from __future__ import annotations
import re
from dataclasses import dataclass, field
from .skill_taxonomy import (
    _ALIAS_TO_CANON, _REQUIRED_CUES, _PREFERRED_CUES,
    display_skill, categorize_skill, MatchingConfig, CONFIG,
)

def clean_text(text: str) -> str:
    if not text:
        return ""
    t = text.replace("\r\n", "\n").replace("\r", "\n")
    t = re.sub(r"[ \t\x0b\x0c]+", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    seen, out = set(), []
    for line in t.split("\n"):
        s = line.strip()
        if s and s.lower() in seen:
            continue
        seen.add(s.lower())
        out.append(line.strip())
    return re.sub(r"[ \t]{2,}", " ", "\n".join(out)).strip()

@dataclass
class ExtractedSkill:
    canonical: str
    display: str
    category: str
    importance: str = "optional"
    weight: float = 0.75
    evidence: str = ""
    match_kind: str = ""

def _compile() -> list:
    pats = []
    for alias, canon in sorted(_ALIAS_TO_CANON.items(), key=lambda kv: -len(kv[0])):
        toks = [re.escape(t) for t in re.split(r"[\s.\-_/]+", alias) if t]
        if not toks:
            continue
        try:
            rx = re.compile(r"(?<![A-Za-z0-9+#])" + r"[\s.\-_/]*".join(toks) + r"(?![A-Za-z0-9+#])", re.IGNORECASE)
        except re.error:
            continue
        pats.append((canon, rx))
    return pats

_PATTERNS = _compile()

def _importance(lower: str, s: int, e: int) -> str:
    win = lower[max(0, s - 90): e + 90]
    if any(c in win for c in _REQUIRED_CUES):
        return "required"
    if any(c in win for c in _PREFERRED_CUES):
        return "preferred"
    return "optional"

_WMAP = {"required": 3.0, "preferred": 1.5, "optional": 0.75}

def extract_skills(text: str, is_jd: bool = False, config: MatchingConfig = CONFIG) -> list[ExtractedSkill]:
    cleaned = clean_text(text)
    if not cleaned:
        return []
    lower = cleaned.lower()
    found: dict[str, ExtractedSkill] = {}
    for canon, rx in _PATTERNS:
        m = rx.search(lower)
        if not m or canon in found:
            continue
        imp = _importance(lower, m.start(), m.end()) if is_jd else "optional"
        wmap = {"required": config.required_weight, "preferred": config.preferred_weight, "optional": config.optional_weight}
        ev = cleaned[max(0, m.start() - 60): min(len(cleaned), m.end() + 60)].strip()
        found[canon] = ExtractedSkill(canon, display_skill(canon), categorize_skill(canon), imp, wmap[imp], ev)
    return sorted(found.values(), key=lambda s: s.display.lower())

def validate_inputs(resume_text: str, jd_text: str, config: MatchingConfig = CONFIG) -> str | None:
    if not (resume_text or "").strip():
        return "Please upload a resume first."
    if not (jd_text or "").strip():
        return "Please enter a Job Description."
    if len(jd_text.strip()) < config.min_jd_chars:
        return "Job Description is too short for reliable analysis."
    if len(clean_text(resume_text).split()) < 10:
        return "Could not extract readable text from this resume."
    return None
