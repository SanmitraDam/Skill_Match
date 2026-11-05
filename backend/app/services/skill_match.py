"""Hybrid matcher part 1: types + helpers."""
from __future__ import annotations
import re
from dataclasses import dataclass, field
from .skill_taxonomy import MatchingConfig, CONFIG
from .skill_text import extract_skills, clean_text
from .skill_embed import embed_cached, cosine

@dataclass
class SkillMatch:
    skill: str
    category: str
    importance: str
    weight: float
    verdict: str
    score: float
    resume_evidence: str = ""
    jd_evidence: str = ""
    semantic_similarity: float = 0.0

@dataclass
class MatchReport:
    overall: float
    technical: float
    soft: float
    tools: float
    req_cov: float
    lex: float
    sem: float
    matched: list = field(default_factory=list)
    partial: list = field(default_factory=list)
    missing: list = field(default_factory=list)
    resume_skills: list = field(default_factory=list)
    jd_skills: list = field(default_factory=list)
    counts: dict = field(default_factory=dict)
    gaps: list = field(default_factory=list)

    def to_legacy(self, social=None, anon=False) -> dict:
        tax = {"hard_technical": [], "soft_skills": [], "domain_tools": []}
        for m in self.matched:
            tax[m.category].append(m.skill)
        wg = [{"skill": g["skill"], "category": g["category"], "criticality": g["criticality"], "gap_weight": g["gap_weight"]} for g in self.gaps]
        focus = [g["skill"] for g in self.gaps[:3]] or [m.skill for m in self.missing[:3]]
        ms = [m.skill for m in self.matched]
        mi = [m.skill for m in self.missing]
        return {"match_score": round(self.overall, 1), "matched_skills": ms, "missing_critical_skills": mi, "recommended_quiz_focus": focus, "match_id": None, "taxonomy": tax, "weighted_gaps": wg, "social_profiles": social, "pii_anonymized": anon, "detail": self.detail()}

    def detail(self) -> dict:
        ser = lambda m: {"skill": m.skill, "category": m.category, "importance": m.importance, "weight": m.weight, "verdict": m.verdict, "score": round(m.score, 3), "resume_evidence": m.resume_evidence, "jd_evidence": m.jd_evidence, "semantic_similarity": round(m.semantic_similarity, 3)}
        es = lambda s: {"skill": s.display, "canonical": s.canonical, "category": s.category, "importance": s.importance, "weight": s.weight, "evidence": s.evidence}
        return {"overall_score": round(self.overall, 1), "technical_score": round(self.technical, 1), "soft_score": round(self.soft, 1), "tools_score": round(self.tools, 1), "required_coverage": round(self.req_cov, 1), "lexical_score": round(self.lex, 1), "semantic_score": round(self.sem, 1), "matched": [ser(m) for m in self.matched], "partial": [ser(m) for m in self.partial], "missing": [ser(m) for m in self.missing], "resume_skills": [es(s) for s in self.resume_skills], "jd_skills": [es(s) for s in self.jd_skills], "taxonomy_counts": dict(self.counts), "gaps": list(self.gaps)}

def _toks(s: str) -> set:
    return {t for t in re.split(r"[^a-z0-9+#]+", (s or "").lower()) if t}


def _fuzzy(a: str, b: str) -> float:
    ta, tb = _toks(a), _toks(b)
    if not ta or not tb:
        return 0.0
    if ta == tb:
        return 1.0
    return len(ta & tb) / max(len(ta), len(tb))


def match_resume_to_jd(rt_in: str, jt_in: str, config: MatchingConfig = CONFIG) -> MatchReport:
    rt = clean_text(rt_in or "")
    jt = clean_text(jt_in or "")
    rs = extract_skills(rt, is_jd=False, config=config)
    js = extract_skills(jt, is_jd=True, config=config)
    counts = {"hard_technical": 0, "soft_skills": 0, "domain_tools": 0}
    for s in js:
        counts[s.category] = counts.get(s.category, 0) + 1
    if not js:
        return MatchReport(0, 0, 0, 0, 0, 0, 0, resume_skills=rs, jd_skills=[], counts=counts)
    by_c = {s.canonical: s for s in rs}
    jv = [embed_cached(s.display + " " + s.canonical) for s in js]
    rv = [embed_cached(s.display + " " + s.canonical) for s in rs]
    mat = []
    for a in jv:
        row = []
        for b in rv:
            row.append(cosine(a, b) if (a is not None and b is not None) else 0.0)
        mat.append(row)
    per: list[SkillMatch] = []
    lex_h, sem_v = [], []
    for ji, jsk in enumerate(js):
        verdict, conf, sem_best = "missing", 0.0, 0.0
        hit = by_c.get(jsk.canonical)
        if hit is not None:
            verdict, conf = "exact", 1.0
        else:
            bf, brs = 0.0, None
            for r in rs:
                fz = _fuzzy(jsk.canonical, r.canonical)
                if fz > bf:
                    bf, brs = fz, r
            row = mat[ji] if mat else []
            sem_best = max(row) if row else 0.0
            if brs is not None and bf >= config.fuzzy_partial_threshold and bf >= sem_best:
                verdict, conf, hit = "partial", bf, brs
            elif sem_best >= config.semantic_match_threshold and rs:
                idx = row.index(max(row))
                cand = rs[idx]
                shared = bool(_toks(jsk.canonical) & _toks(cand.canonical))
                if shared or sem_best >= config.semantic_match_threshold + 0.08:
                    verdict, conf, hit = "semantic", sem_best, cand
                elif sem_best >= config.semantic_partial_low:
                    verdict, conf, hit = "partial", sem_best * 0.8, cand
            elif sem_best >= config.semantic_partial_low and rs:
                idx = row.index(max(row))
                verdict, conf, hit = "partial", sem_best * 0.8, rs[idx]
        sc = 1.0 if verdict == "exact" else (0.5 if verdict == "partial" else (0.85 if verdict == "semantic" else 0.0))
        lex_h.append(sc)
        sem_v.append(sem_best if verdict != "exact" else 1.0)
        per.append(SkillMatch(jsk.display, jsk.category, jsk.importance, jsk.weight, verdict, conf, hit.evidence if hit else "", jsk.evidence, sem_best))
    matched = [p for p in per if p.verdict in ("exact", "semantic")]
    partial = [p for p in per if p.verdict == "partial"]
    missing = [p for p in per if p.verdict == "missing"]
    lex = sum(lex_h) / len(lex_h) * 100.0
    sem = sum(sem_v) / len(sem_v) * 100.0
    overall = round(config.lexical_weight * lex + config.semantic_weight * sem, 1)
    def cat(c: str) -> float:
        items = [p for p in per if p.category == c]
        if not items:
            return 0.0
        tw = sum(p.weight for p in items) or 1.0
        tot = sum((100.0 if p.verdict in ("exact", "semantic") else (45.0 if p.verdict == "partial" else 0.0)) * p.weight for p in items)
        return round(tot / tw, 1)
    req = [p for p in per if p.importance == "required"] or per
    req_cov = round(sum(1 for p in req if p.verdict in ("exact", "semantic")) / max(1, len(req)) * 100.0, 1)
    gaps = []
    for p in missing + partial:
        sev = p.weight * (1.0 - (p.score or 0.0))
        if p.importance == "required" or sev >= 2.0:
            crit = "High"
        elif p.importance == "preferred" or sev >= 1.0:
            crit = "Medium"
        else:
            crit = "Low"
        gaps.append({"skill": p.skill, "category": p.category, "importance": p.importance, "criticality": crit, "gap_weight": round(sev, 2)})
    gaps.sort(key=lambda g: g["gap_weight"], reverse=True)
    return MatchReport(overall, cat("hard_technical"), cat("soft_skills"), cat("domain_tools"), req_cov, round(lex, 1), round(sem, 1), matched, partial, missing, rs, js, counts, gaps)

