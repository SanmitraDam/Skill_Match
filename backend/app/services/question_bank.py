"""Offline market-current question bank — 33.6 BILLION virtual questions.

Two layers:
  1. VIRTUAL SPACE (primary): 280 concept anchors x 15 question styles
     x 40 market scenarios x 5 experience levels x 10 framings
     x 10 emphases x 10 probes x 40 company contexts
     = 33,600,000,000 unique question/answer pairs, rendered
     deterministically from an integer index — instant, zero storage, zero network.
  2. CURATED DB (secondary): data/question_bank.db with 448,000 pre-rendered
     market-scenario Q&A rows for fast batch/lookup use.

Backs the Voice Room when the (secondary) Gemini API is unavailable,
rate-limited, or the key is missing.
"""
import os
import random
import sqlite3
from typing import Dict, List, Optional

_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "question_bank.db")

QUESTION_STYLES = [
    "Explain how {concept} works in {skill} and why it matters in production.",
    "Walk me through a real situation where {concept} in {skill} directly affected system behavior.",
    "How would you design a solution that gets {concept} in {skill} right from day one?",
    "What are the most common failure modes teams hit with {concept} in {skill}?",
    "Compare the main approaches teams take to {concept} in {skill} and when each wins.",
    "How do you debug a problem rooted in {concept} within a {skill} system?",
    "What trade-offs must be balanced when applying {concept} in {skill}?",
    "If you joined a team misusing {concept} in {skill}, how would you diagnose and fix it?",
    "How would you mentor a teammate who is weak on {concept} in {skill}?",
    "Where does {concept} in {skill} break down at 10x current scale?",
    "How would you test and validate a change touching {concept} in {skill}?",
    "What metrics would tell you that {concept} in {skill} is unhealthy in production?",
    "How does {concept} in {skill} interact with security and compliance requirements?",
    "Describe the cost model implications of {concept} in {skill} at enterprise scale.",
    "Rebuild the {concept} approach in {skill} from scratch — what would you keep and what would you drop?",
]

FRAMINGS = [
    ("standard", "{style} {scenario_clause} — in that setting, the key constraint is: {constraint}."),
    ("followup", "Follow-up: {style} {scenario_clause}. The interviewer probes deeper — what changes when {constraint} is added?"),
    ("stress", "Pressure scenario: production is degraded, the on-call lead asks you directly — {style_lower} {scenario_clause}, and you have one constraint: {constraint}."),
    ("probe", "Deep-dive: {style} {scenario_clause}. Explain your reasoning step by step, including how you would validate the outcome, given that {constraint}."),
    ("opening", "You have just joined as the owner of this area. {style} {scenario_clause}. Begin by stating your assumptions."),
    ("panel", "A cross-functional panel (PM, SRE, security) asks in turn: {style} {scenario_clause}. Answer so all three are satisfied: {constraint}."),
    ("whiteboard", "At the whiteboard: {style} {scenario_clause}. Sketch the flow, then narrate each decision aloud, noting where {constraint} binds."),
    ("code_review", "During review you spot a PR touching this area. {style} {scenario_clause}. What do you approve, question, or block?"),
    ("incident", "Sev-2 incident bridge is live. {style} {scenario_clause}. Give your first three actions and the mitigation you expect, while {constraint}."),
    ("candidate_choice", "Interviewer: 'Take it wherever you want.' {style} {scenario_clause}. Choose the angle that best shows your strengths, subject to {constraint}."),
]

EMPHASES = [
    "with emphasis on end-user-visible latency",
    "with emphasis on cost per transaction",
    "with emphasis on fault tolerance and recovery time",
    "with emphasis on data correctness and consistency",
    "with emphasis on operational simplicity for the on-call team",
    "with emphasis on horizontal scalability",
    "with emphasis on security and least-privilege access",
    "with emphasis on observability and actionable metrics",
    "with emphasis on developer velocity and iteration speed",
    "with emphasis on long-term maintainability",
]

PROBES = [
    "Then justify your monitoring and alerting story for it.",
    "Then explain what you would roll back first if it fails.",
    "Then quantify the blast radius if your assumption is wrong.",
    "Then describe how you would roll it out gradually and safely.",
    "Then state the single metric you would watch most closely.",
    "Then explain how a new hire could safely modify it six months later.",
    "Then compare your approach to the most obvious alternative.",
    "Then describe the load test that would give you confidence.",
    "Then explain where this design would fail first under 10x growth.",
    "Then list the top risk you are accepting and why it is acceptable.",
]

SCENARIOS = [
    ("a high-traffic e-commerce platform during a flash sale", "traffic spikes 20x within minutes and checkout cannot stall"),
    ("a fintech payments service under strict compliance audits", "every transaction must be traceable and consistent"),
    ("a real-time collaboration app with global users", "sub-100ms interactions matter across continents"),
    ("a healthcare records platform with strict privacy rules", "patient data isolation is non-negotiable"),
    ("a streaming media service with millions of concurrent viewers", "distribution costs and start latency dominate"),
    ("an IoT telemetry ingest handling millions of devices", "devices arrive and disappear; networks are unreliable"),
    ("a machine-learning training platform with bursty GPU demand", "utilization and fairness between teams are contested"),
    ("a legacy monolith being incrementally modernized", "old and new must coexist safely during migration"),
    ("a startup product racing to product-market fit", "velocity and cheap iteration matter more than polish"),
    ("a multi-tenant SaaS with diverse enterprise customers", "noisy neighbors and tenant isolation are daily concerns"),
    ("an online gaming backend with global matchmaking", "fairness and lag dominate player experience"),
    ("an airline reservation system with global inventory", "overselling seats is catastrophic and reconciliation is constant"),
    ("a ride-hailing dispatch platform in surge conditions", "matching latency and driver supply predictions decide revenue"),
    ("a digital advertising bidding exchange", "every millisecond of latency costs auction revenue"),
    ("a logistics network optimizing routes in real time", "fuel, time, and SLA penalties compete directly"),
    ("an online banking ledger processing millions of transfers", "double-spending and audit trails are the core risk"),
    ("a telecom billing engine with complex rating rules", "regulatory accuracy and back-dated corrections collide"),
    ("a social network feed ranking service", "engagement, freshness, and fairness trade off in real time"),
    ("an e-learning platform with seasonal enrollment surges", "term-start traffic dwarfs baseline by 50x"),
    ("a food delivery marketplace at dinner peak", "demand, couriers, and kitchen capacity desynchronize constantly"),
    ("a video conferencing infrastructure during global events", "connection storms hit from every region at once"),
    ("a supply chain control tower across continents", "upstream disruptions cascade faster than data arrives"),
    ("a national identity and credentials platform", "availability is a matter of civic function and trust"),
    ("a drug discovery compute cluster with priority queues", "expensive jobs must never starve urgent ones"),
    ("an autonomous vehicle fleet data pipeline", "sensor data volume exceeds most datacenters' daily intake"),
    ("a weather and climate modeling service", "compute budgets and deadline predictability dominate"),
    ("a stock exchange matching engine", "deterministic microsecond latency is a regulatory and fairness requirement"),
    ("a government benefits portal with deadline surges", "equitable access matters under extreme load"),
    ("a hotel and travel booking engine with dynamic pricing", "inventory sync across partners is error-prone"),
    ("a subscription billing platform with proration edge cases", "incorrect charges destroy customer trust instantly"),
    ("a warehouse robotics orchestration system", "deadlocks between robots halt the entire facility"),
    ("an industrial IoT predictive maintenance system", "false positives are as costly as missed failures"),
    ("a satellite imagery processing platform", "downlink windows are scarce and bursts are enormous"),
    ("a national emergency alerting system", "false alarms and missed alarms both cost lives"),
    ("a corporate treasury and FX risk platform", "positions must be revalued continuously under volatility"),
    ("a customer support AI platform across dozens of languages", "quality and safety guardrails vary by locale"),
    ("a 3D rendering farm for film production", "frame deadlines and license costs dominate scheduling"),
    ("a quantum hardware experiment scheduling service", "calibration drift and queue fairness interact"),
    ("an open-source developer platform serving millions of repos", "abuse resistance and fair resource sharing collide"),
    ("a smart-city traffic management grid", "safety-critical decisions run on noisy sensor data"),
]

CONTEXTS = [
    "at a Series-A startup with a team of five",
    "at a Series-B startup scaling its first enterprise deals",
    "at a late-stage startup pre-IPO with heavy compliance review",
    "at a Fortune 100 financial institution",
    "at a global bank with on-premise regulatory constraints",
    "at a hyperscale cloud provider",
    "at a mid-size SaaS company with a lean platform team",
    "at a government agency with strict procurement rules",
    "at a healthcare company under HIPAA oversight",
    "at an EU-based company under GDPR constraints",
    "at a US-based company navigating state privacy laws",
    "at a publicly listed retailer with seasonal peaks",
    "at a logistics giant with 24/7 operations",
    "at a media company with award-night traffic spikes",
    "at an automotive manufacturer with safety-critical software",
    "at an aerospace supplier with DO-178 certification demands",
    "at a gaming studio with live-service titles",
    "at a telecom operator with legacy network equipment",
    "at an energy company with industrial control systems",
    "at an insurance company with actuarial batch workloads",
    "at a pharma company with validated computer systems",
    "at a university research computing center",
    "at a national laboratory with export-controlled data",
    "at an open-source foundation with volunteer maintainers",
    "at a digital-native consultancy shipping client products",
    "at an e-commerce unicorn in an emerging market",
    "at a remittance company serving cross-border corridors",
    "at a cybersecurity vendor with adversarial customers",
    "at a device maker with 10-year support commitments",
    "at a robotics company deploying to thousands of sites",
    "at a streaming startup competing with global giants",
    "at a fintech in a regulatory sandbox",
    "at a marketplace balancing supply and demand sides",
    "at a B2B data broker with strict deletion obligations",
    "at a hospitality chain with per-property systems",
    "at an airline alliance sharing infrastructure across carriers",
    "at a defense contractor with air-gapped environments",
    "at a supercomputing center with multi-tenant queues",
    "at a charity platform with donation-spike events",
    "at an enterprise holding 300 acquisitions' worth of systems",
]

EXPERIENCE_LEVELS = [
    ("junior", 1, "for a junior engineer", "Focus on fundamentals and clear mental models; avoid premature optimization and prefer readable, boring solutions a team can maintain."),
    ("mid", 2, "for a mid-level engineer", "Own the feature end to end: pick pragmatic patterns, add observability early, and document the reasoning for teammates."),
    ("senior", 4, "for a senior engineer", "Balance immediate delivery with systemic health: instrument the change, plan capacity, and design for graceful degradation."),
    ("staff", 6, "for a staff-level engineer", "Frame the decision across teams: define standards, quantify trade-offs with data, and align the rollout with other platform initiatives."),
    ("principal", 9, "for a principal engineer", "Shape strategy: evaluate build-vs-buy, multi-year cost curves, org-wide standards, and the second-order effects of this choice at scale."),
]




class QuestionBankService:
    def __init__(self, db_path: str = _DB_PATH):
        self.db_path = db_path
        self._skill_cache: Optional[Dict[str, int]] = None
        self._anchors: Optional[List[dict]] = None
        self._virtual_total = 0

    # ------------------------------------------------------------------
    # VIRTUAL SPACE (primary): 33.6B deterministic question combinations
    # ------------------------------------------------------------------
    def _load_anchors(self) -> List[dict]:
        if self._anchors is None:
            self._anchors = []
            try:
                import scripts.question_bank_seeds as seeds
                for name, payload in vars(seeds).items():
                    if name.startswith("SKILL_") and isinstance(payload, dict):
                        skill = name[len("SKILL_"):].replace("_", " ").title()
                        for concept, blurb in payload["concepts"]:
                            self._anchors.append({
                                "skill": skill, "concept": concept, "blurb": blurb,
                            })
            except Exception as e:
                print(f"Question bank anchors note: {e}")
            if not self._anchors:
                # Absolute minimal fallback so the space is never zero
                self._anchors = [{"skill": "Software Engineering",
                                  "concept": "system design under load",
                                  "blurb": "Design for graceful degradation, measure everything, and cap blast radius."}]
        return self._anchors

    @property
    def virtual_total(self) -> int:
        """Total unique question/answer pairs addressable in the virtual space."""
        if not self._virtual_total:
            self._virtual_total = (
                len(self._load_anchors())
                * len(QUESTION_STYLES)
                * len(SCENARIOS)
                * len(EXPERIENCE_LEVELS)
                * len(FRAMINGS)
                * len(EMPHASES)
                * len(PROBES)
                * len(CONTEXTS)
            )
        return self._virtual_total

    def render_virtual(self, index: int) -> Dict[str, str]:
        """Deterministically renders the question/answer at a given index
        in [0, virtual_total). Same index always yields the same pair."""
        anchors = self._load_anchors()
        n_styles, n_scen, n_levels = len(QUESTION_STYLES), len(SCENARIOS), len(EXPERIENCE_LEVELS)
        n_frames, n_emph, n_probes, n_ctx = len(FRAMINGS), len(EMPHASES), len(PROBES), len(CONTEXTS)

        idx = index % self.virtual_total
        ctx_i = idx % n_ctx;                 idx //= n_ctx
        probe_i = idx % n_probes;            idx //= n_probes
        emph_i = idx % n_emph;               idx //= n_emph
        frame_i = idx % n_frames;            idx //= n_frames
        level_i = idx % n_levels;            idx //= n_levels
        scen_i = idx % n_scen;               idx //= n_scen
        style_i = idx % n_styles;            idx //= n_styles
        anchor = anchors[idx % len(anchors)]

        skill = anchor["skill"]
        concept = anchor["concept"]
        scenario, constraint = SCENARIOS[scen_i]
        level, diff, level_phrase, level_advice = EXPERIENCE_LEVELS[level_i]
        frame_name, frame_tpl = FRAMINGS[frame_i]
        context = CONTEXTS[ctx_i]

        rendered_style = QUESTION_STYLES[style_i].format(concept=concept, skill=skill)
        q = frame_tpl.format(
            style=rendered_style,
            style_lower=rendered_style[0].lower() + rendered_style[1:],
            scenario_clause=f"within {scenario}",
            constraint=constraint,
        )
        q = f"{context.capitalize()}, {q[0].lower() + q[1:]} {EMPHASES[emph_i]}. {PROBES[probe_i]}"

        a = (
            f"Reference answer ({level_phrase}): {anchor['blurb']} "
            f"Applied to {scenario} {context}, the practical takeaway is that {constraint}. "
            f"{level_advice} "
            f"Evaluation focus: depth on {concept}, {EMPHASES[emph_i][len('with emphasis on '):]}, "
            f"explicit trade-off discussion, and a concrete {skill} example."
        )
        return {
            "question": q,
            "answer": a,
            "concept": concept,
            "experience_level": level,
            "difficulty": diff,
            "skill": skill,
            "source": f"virtual#{index}",
        }

    def sample_virtual(self, skill: Optional[str] = None) -> Dict[str, str]:
        """Random question from the 33.6B space, optionally constrained to a skill."""
        anchors = self._load_anchors()
        if skill:
            target = skill.strip().lower()
            matches = [a for a in anchors if target in a["skill"].lower() or a["skill"].lower() in target]
            if matches:
                anchor = random.choice(matches)
                base = anchors.index(anchor)
                per_anchor = self.virtual_total // len(anchors)
                index = base * per_anchor + random.randrange(per_anchor)
                return self.render_virtual(index)
        return self.render_virtual(random.randrange(self.virtual_total))

    # ------------------------------------------------------------------
    # CURATED DB (secondary)
    # ------------------------------------------------------------------
    @property
    def available(self) -> bool:
        return os.path.exists(self.db_path)


    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path, timeout=5.0)

    def _skill_map(self) -> Dict[str, int]:
        if self._skill_cache is None:
            self._skill_cache = {}
            if self.available:
                with self._connect() as conn:
                    rows = conn.execute("SELECT skill_id, name FROM skills").fetchall()
                for skill_id, name in rows:
                    self._skill_cache[name.lower()] = skill_id
                    # Also index the first word (e.g. "Node" for "Nodejs")
                    first = name.split()[0].lower() if name.split() else ""
                    if first and first not in self._skill_cache:
                        self._skill_cache[first] = skill_id
        return self._skill_cache

    def resolve_skill(self, skill: str) -> Optional[int]:
        """Best-effort fuzzy match of a free-text skill to a bank skill id."""
        if not skill:
            return None
        smap = self._skill_map()
        needle = skill.strip().lower()
        # Direct / substring match
        if needle in smap:
            return smap[needle]
        for key, sid in smap.items():
            if needle in key or key in needle:
                return sid
        return None

    def get_question(
        self,
        skill: str,
        difficulty: Optional[int] = None,
        allow_random_skill: bool = True,
    ) -> Optional[Dict[str, str]]:
        """PRIMARY: sample the 33.6B virtual space (instant, deterministic).
        Falls back to the curated 448k-row DB when the virtual anchors are
        unavailable. Returns {'question', 'answer', 'concept', 'skill',
        'experience_level', ...} or None."""
        try:
            item = self.sample_virtual(skill if skill else None)
            if difficulty is not None:
                item = self.sample_virtual(skill if skill else None)  # difficulty is advisory for virtual picks
            return item
        except Exception as e:
            print(f"Question bank virtual note: {e}")
        # Curated DB fallback
        if not self.available:
            return None
        sid = self.resolve_skill(skill)
        if sid is None and not allow_random_skill:
            return None
        with self._connect() as conn:
            if sid is not None:
                if difficulty is not None:
                    row = conn.execute(
                        "SELECT question, answer, concept, experience_level FROM qa "
                        "WHERE skill_id=? AND difficulty=? ORDER BY RANDOM() LIMIT 1",
                        (sid, difficulty),
                    ).fetchone()
                if (difficulty is not None and row is None) or difficulty is None:
                    row = conn.execute(
                        "SELECT question, answer, concept, experience_level FROM qa "
                        "WHERE skill_id=? ORDER BY RANDOM() LIMIT 1",
                        (sid,),
                    ).fetchone()
            else:
                row = conn.execute(
                    "SELECT question, answer, concept, experience_level FROM qa "
                    "ORDER BY RANDOM() LIMIT 1"
                ).fetchone()
            if row is None:
                return None
            name = conn.execute(
                "SELECT name FROM skills WHERE skill_id=?", (sid,)
            ).fetchone() if sid is not None else None
        return {
            "question": row[0],
            "answer": row[1],
            "concept": row[2],
            "experience_level": row[3],
            "skill": name[0] if name else skill,
            "source": "curated_db",
        }

    def get_curated_question(self, skill: str) -> Optional[Dict[str, str]]:
        """Explicitly sample from the 448k curated DB layer."""
        if not self.available:
            return None
        sid = self.resolve_skill(skill)
        with self._connect() as conn:
            if sid is not None:
                row = conn.execute(
                    "SELECT question, answer, concept, experience_level FROM qa "
                    "WHERE skill_id=? ORDER BY RANDOM() LIMIT 1", (sid,)
                ).fetchone()
                name = conn.execute("SELECT name FROM skills WHERE skill_id=?", (sid,)).fetchone()
            else:
                row = conn.execute(
                    "SELECT question, answer, concept, experience_level FROM qa "
                    "ORDER BY RANDOM() LIMIT 1"
                ).fetchone()
                name = None
        if not row:
            return None
        return {
            "question": row[0], "answer": row[1], "concept": row[2],
            "experience_level": row[3], "skill": name[0] if name else skill,
            "source": "curated_db",
        }

    def stats(self) -> Dict[str, object]:
        info: Dict[str, object] = {
            "available": True,
            "virtual_space_questions": self.virtual_total,
            "curated_db_available": self.available,
            "anchors": len(self._load_anchors()),
        }
        if self.available:
            with self._connect() as conn:
                info["curated_db_questions"] = conn.execute("SELECT COUNT(*) FROM qa").fetchone()[0]
                info["skills"] = conn.execute("SELECT COUNT(*) FROM skills").fetchone()[0]
        return info


question_bank_service = QuestionBankService()
