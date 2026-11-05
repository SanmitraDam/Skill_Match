"""Builds the SkillMatch offline question bank (400,000+ Q&A rows).

Expansion math:
  30 market-hot skills x 10 core concepts each = 300 concept anchors.
  Per concept: 8 question styles x 10 market scenarios x 5 experience
  levels x 4 interview framings = 1,600 variants.
  Total = 300 x 1,600 = 480,000 question/answer pairs.

Output: data/question_bank.db (SQLite) with indexes on skill, difficulty,
and concept so the voice room can sample instantly.

Run: python scripts/build_question_bank.py
"""
import os
import sys
import sqlite3
import itertools
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import scripts.question_bank_seeds as seeds

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BACKEND_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "question_bank.db")

QUESTION_STYLES = [
    "Explain how {concept} works in {skill} and why it matters in production.",
    "Walk me through a real situation where {concept} in {skill} directly affected system behavior.",
    "How would you design a solution that gets {concept} in {skill} right from day one?",
    "What are the most common failure modes teams hit with {concept} in {skill}?",
    "Compare the main approaches teams take to {concept} in {skill} and when each wins.",
    "How do you debug a problem rooted in {concept} within a {skill} system?",
    "What trade-offs must be balanced when applying {concept} in {skill}?",
    "If you joined a team misusing {concept} in {skill}, how would you diagnose and fix it?",
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
]

EXPERIENCE_LEVELS = [
    ("junior", 1, "for a junior engineer", "Focus on fundamentals and clear mental models; avoid premature optimization and prefer readable, boring solutions a team can maintain."),
    ("mid", 2, "for a mid-level engineer", "Own the feature end to end: pick pragmatic patterns, add observability early, and document the reasoning for teammates."),
    ("senior", 4, "for a senior engineer", "Balance immediate delivery with systemic health: instrument the change, plan capacity, and design for graceful degradation."),
    ("staff", 6, "for a staff-level engineer", "Frame the decision across teams: define standards, quantify trade-offs with data, and align the rollout with other platform initiatives."),
    ("principal", 9, "for a principal engineer", "Shape strategy: evaluate build-vs-buy, multi-year cost curves, org-wide standards, and the second-order effects of this choice at scale."),
]

FRAMINGS = [
    ("standard", "{style} {scenario_clause} — in that setting, the key constraint is: {constraint}."),
    ("followup", "Follow-up: {style} {scenario_clause}. The interviewer probes deeper — what changes when {constraint} is added?"),
    ("stress", "Pressure scenario: production is degraded, the on-call lead asks you directly — {style_lower} {scenario_clause}, and you have one constraint: {constraint}."),
    ("probe", "Deep-dive: {style} {scenario_clause}. Explain your reasoning step by step, including how you would validate the outcome, given that {constraint}."),
]


def collect_skills():
    return [
        (name[len("SKILL_"):].replace("_", " ").title(), payload)
        for name, payload in vars(seeds).items()
        if name.startswith("SKILL_") and isinstance(payload, dict)
    ]


def build():
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.executescript(
        """
        CREATE TABLE skills (
            skill_id INTEGER PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            category TEXT NOT NULL,
            market_demand REAL NOT NULL
        );
        CREATE TABLE qa (
            qa_id INTEGER PRIMARY KEY,
            skill_id INTEGER NOT NULL REFERENCES skills(skill_id),
            concept TEXT NOT NULL,
            difficulty INTEGER NOT NULL,
            scenario TEXT NOT NULL,
            experience_level TEXT NOT NULL,
            framing TEXT NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL
        );
        CREATE INDEX idx_qa_skill ON qa(skill_id);
        CREATE INDEX idx_qa_skill_diff ON qa(skill_id, difficulty);
        CREATE INDEX idx_qa_concept ON qa(concept);
        """
    )

    skills = collect_skills()
    print(f"Seeded skills: {len(skills)}")
    skill_rows = [
        (sid, name, payload["category"], payload["market_demand"])
        for sid, (name, payload) in enumerate(skills)
    ]
    cur.executemany("INSERT INTO skills VALUES (?,?,?,?)", skill_rows)

    total = 0
    t0 = time.time()
    batch = []
    for sid, (name, payload) in enumerate(skills):
        for concept, blurb in payload["concepts"]:
            for (style_i, style), (scenario, constraint), (level, diff, level_phrase, level_advice), (framing_name, framing_tpl) in itertools.product(
                enumerate(QUESTION_STYLES), SCENARIOS, EXPERIENCE_LEVELS, FRAMINGS
            ):
                rendered_style = style.format(concept=concept, skill=name)
                q = framing_tpl.format(
                    style=rendered_style,
                    style_lower=rendered_style[0].lower() + rendered_style[1:],
                    scenario_clause=f"within {scenario}",
                    constraint=constraint,
                )
                a = (
                    f"Reference answer ({level_phrase}): {blurb} "
                    f"Applied to {scenario}, the practical takeaway is that {constraint}. "
                    f"{level_advice} "
                    f"Evaluation focus: depth on {concept}, explicit trade-off discussion, and a concrete {name} example."
                )
                batch.append((sid, concept, diff, scenario, level, framing_name, q, a))
                if len(batch) >= 50_000:
                    cur.executemany("INSERT INTO qa VALUES (NULL,?,?,?,?,?,?,?,?)", batch)
                    total += len(batch)
                    batch.clear()
                    print(f"  {total:,} rows... ({time.time()-t0:.0f}s)")
    if batch:
        cur.executemany("INSERT INTO qa VALUES (NULL,?,?,?,?,?,?,?,?)", batch)
        total += len(batch)
    conn.commit()
    print(f"DONE: {total:,} Q&A rows in {time.time()-t0:.0f}s -> {DB_PATH}")
    conn.close()


if __name__ == "__main__":
    build()

