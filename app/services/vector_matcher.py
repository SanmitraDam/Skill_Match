try:
    from sentence_transformers import SentenceTransformer
except (ImportError, OSError):
    SentenceTransformer = None

try:
    from sklearn.metrics.pairwise import cosine_similarity
except (ImportError, OSError):
    cosine_similarity = None

import numpy as np
from typing import List, Tuple, Dict, Any, Optional
from app.schemas.skills import SkillGapReport
from app.services.vector_store import vector_store
from app.services.parser import parser


class VectorMatcher:
    def __init__(self):
        self._model = None

    @property
    def model(self):
        if self._model is None:
            if SentenceTransformer is not None:
                try:
                    self._model = SentenceTransformer('all-MiniLM-L6-v2')
                except Exception:
                    self._model = False
            else:
                self._model = False
        return self._model if self._model is not False else None

    def get_embedding(self, text: str):
        if self.model:
            return self.model.encode([text])[0]
        return None

    def calculate_match_score(self, resume_skills: List[str], jd_skills: List[str]) -> Tuple[float, List[str], List[str], float]:
        """
        Calculates dynamic hybrid match score combining:
        - 55% Exact/Normalized lexical match
        - 45% Dense 384-d semantic embedding cosine similarity
        Returns: (hybrid_score, matched_skills, missing_skills, raw_cosine)
        """
        if not resume_skills or not jd_skills:
            return 0.0, [], jd_skills, 0.0

        from app.services.skill_taxonomy import normalize_skill_name

        # Canonical mapping for both sets
        resume_canon_map = {normalize_skill_name(s): s for s in resume_skills}
        jd_canon_map = {normalize_skill_name(s): s for s in jd_skills}

        matched = []
        missing = []

        # Exact and normalized matching
        for j_canon, j_orig in jd_canon_map.items():
            if j_canon in resume_canon_map:
                matched.append(j_orig)
            else:
                missing.append(j_orig)

        # 1. Lexical overlap score (0-100)
        overlap = len(matched)
        total = len(jd_canon_map)
        lexical_score = (overlap / total) * 100.0 if total > 0 else 0.0

        # 2. Dense semantic embedding score (0-100)
        cosine_sim = 0.0
        if self.model and cosine_similarity:
            try:
                resume_str = " ".join(resume_skills)
                jd_str = " ".join(jd_skills)
                resume_vec = self.get_embedding(resume_str).reshape(1, -1)
                jd_vec = self.get_embedding(jd_str).reshape(1, -1)
                sim = cosine_similarity(resume_vec, jd_vec)[0][0]
                cosine_sim = float(max(0.0, sim))
            except Exception:
                cosine_sim = lexical_score / 100.0
        else:
            cosine_sim = lexical_score / 100.0

        dense_score = cosine_sim * 100.0

        # 3. Hybrid blend: 55% lexical + 45% dense
        hybrid_score = round(0.55 * lexical_score + 0.45 * dense_score, 1)
        return float(hybrid_score), sorted(matched), sorted(missing), cosine_sim

    def calculate_hybrid_overlap(self, resume_skills: List[str], jd_skills: List[str]) -> Tuple[float, List[str], List[str], List[Dict[str, Any]]]:
        score, matched, missing, cosine_sim = self.calculate_match_score(resume_skills, jd_skills)
        weighted_gaps = self.compute_weighted_gaps(missing, cosine_sim)
        return score, matched, missing, weighted_gaps

    def compute_weighted_gaps(self, missing_skills: List[str], cosine_sim: float) -> List[Dict[str, Any]]:
        """
        Calculates weighted gap severity:
        Gap Weight = w_criticality * (1.0 - cosine_sim)
        """
        from app.services.skill_taxonomy import categorize_skill
        weighted_gaps = []
        for skill in missing_skills:
            s_lower = skill.lower()
            cat = categorize_skill(s_lower)
            if cat == "hard_technical":
                cat_label = "Hard Technical"
                w_crit = 1.5
                crit_label = "High"
            elif cat == "soft_skills":
                cat_label = "Soft Communication"
                w_crit = 0.8
                crit_label = "Standard"
            else:
                cat_label = "Domain Tool"
                w_crit = 1.1
                crit_label = "Medium"

            gap_severity = round(w_crit * max(0.2, (1.0 - cosine_sim)), 2)
            weighted_gaps.append({
                "skill": skill,
                "category": cat_label,
                "criticality": crit_label,
                "gap_weight": gap_severity
            })

        # Sort by gap weight descending
        weighted_gaps.sort(key=lambda x: x["gap_weight"], reverse=True)
        return weighted_gaps

    def generate_gap_report(
        self,
        resume_skills: List[str],
        jd_skills: List[str],
        social_profiles: Optional[Dict[str, Optional[str]]] = None,
        pii_anonymized: bool = False
    ) -> SkillGapReport:
        score, matched, missing, cosine_sim = self.calculate_match_score(resume_skills, jd_skills)

        # Taxonomy breakdown for matched skills
        taxonomy = parser.categorize_skills(matched)

        # Weighted severity ranking for gaps
        weighted_gaps = self.compute_weighted_gaps(missing, cosine_sim)

        # Prioritize top 3 most critical missing skills for CAT Quiz
        prioritized_focus = [g["skill"] for g in weighted_gaps[:3]] if weighted_gaps else missing[:3]

        return SkillGapReport(
            match_score=score,
            matched_skills=matched,
            missing_critical_skills=missing,
            recommended_quiz_focus=prioritized_focus,
            taxonomy=taxonomy,
            weighted_gaps=weighted_gaps,
            social_profiles=social_profiles,
            pii_anonymized=pii_anonymized
        )

vector_matcher = VectorMatcher()
