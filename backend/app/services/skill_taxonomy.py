"""Taxonomy part 1: config + core aliases (extensible, not canned results)."""
from __future__ import annotations
from dataclasses import dataclass

@dataclass
class MatchingConfig:
    lexical_weight: float = 0.55
    semantic_weight: float = 0.45
    semantic_match_threshold: float = 0.72
    semantic_partial_low: float = 0.52
    fuzzy_partial_threshold: float = 0.60
    required_weight: float = 3.0
    preferred_weight: float = 1.5
    optional_weight: float = 0.75
    min_jd_chars: int = 40
    embedding_model: str = "all-MiniLM-L6-v2"

CONFIG = MatchingConfig()

_ALIAS_GROUPS: dict[str, list[str]] = {
    "python": ["py"],
    "c++": ["cpp", "c plus plus"],
    "c#": ["c sharp", "csharp"],
    "javascript": ["js", "ecmascript"],
    "typescript": ["ts"],
    "react": ["react.js", "reactjs"],
    "next.js": ["nextjs", "next js"],
    "vue": ["vue.js", "vuejs"],
    "node.js": ["nodejs", "node js"],
    "express": ["express.js", "expressjs"],
    "fastapi": ["fast api"],
    "django": ["django framework"],
    "spring boot": ["springboot", "spring"],
    "html": ["html5"],
    "css": ["css3"],
    "tailwind css": ["tailwind", "tailwindcss"],
    "streamlit": ["streamlit app", "streamlit application"],
    "pandas": ["pandas library"],
    "numpy": ["numpy library"],
    "scikit-learn": ["sklearn", "scikit learn"],
    "pytorch": ["torch"],
    "tensorflow": ["tf"],
    "opencv": ["cv2", "open cv"],
    "spacy": ["spa cy"],
    "nltk": ["natural language toolkit"],
    "sql": ["structured query language", "t-sql", "tsql", "plsql"],
    "postgresql": ["postgres", "psql"],
    "mysql": ["my sql"],
    "mongodb": ["mongo", "mongo db"],
    "redis": ["redis cache"],
    "sqlite": ["sqlite3"],
    "database management systems": ["dbms", "rdbms", "database", "databases", "relational database", "relational databases"],
}
_ALIAS_GROUPS.update({
    "data structures and algorithms": ["dsa", "data structures & algorithms", "data structures and algorithms", "data structures", "algorithms", "algo"],
    "object oriented programming": ["oop", "oops", "object-oriented programming", "object oriented concepts", "oop concepts"],
    "computer networks": ["cn", "networking", "tcp/ip", "osi model", "network protocols"],
    "operating systems": ["os", "os concepts", "os fundamentals", "operating system"],
    "machine learning": ["ml", "machine-learning"],
    "deep learning": ["dl", "deep-learning"],
    "artificial intelligence": ["ai", "genai", "generative ai"],
    "natural language processing": ["nlp"],
    "computer vision": ["cv"],
    "data science": ["data-science"],
    "data analysis": ["data analytics", "data analyst"],
    "power bi": ["powerbi", "power-bi"],
    "tableau": ["tableau software"],
    "excel": ["ms excel", "microsoft excel", "spreadsheets", "advanced excel"],
    "rest api": ["rest apis", "restful api", "restful apis", "restful services", "rest"],
    "graphql": ["graph ql"],
    "web development": ["web dev", "web development", "website development", "frontend development", "front-end development", "backend development", "back-end development", "full stack development", "full-stack development", "web applications", "web apps"],
    "apis": ["api", "api development", "api integration", "building apis", "web apis"],
    "debugging": ["debug", "troubleshooting", "code debugging"],
    "testing": ["unit testing", "integration testing", "test cases", "software testing", "pytest", "unittest", "jest", "automated testing", "qa testing"],
    "git": ["git cli", "version control", "git version control"],
    "github": ["git hub", "github actions", "github workflow"],
    "docker": ["docker containers", "containerization"],
    "kubernetes": ["k8s"],
    "aws": ["amazon web services"],
    "azure": ["microsoft azure"],
    "gcp": ["google cloud", "google cloud platform"],
    "linux": ["unix", "linux os"],
    "ci/cd": ["ci cd", "continuous integration", "cicd", "continuous delivery"],
    "problem solving": ["problem-solving", "analytical thinking", "analytical skills"],
    "communication": ["verbal communication", "written communication", "communication skills", "interpersonal skills"],
    "teamwork": ["team work", "team player", "team collaboration", "collaboration"],
    "leadership": ["team leadership", "technical leadership"],
    "critical thinking": ["critical-thinking"],
    "project management": ["project planning"],
    "agile": ["agile methodology", "agile development"],
    "scrum": ["scrum framework", "scrum master"],
})

_ALIAS_TO_CANON: dict[str, str] = {}
for _canon, _aliases in _ALIAS_GROUPS.items():
    _ALIAS_TO_CANON[_canon] = _canon
    for _a in _aliases:
        _ALIAS_TO_CANON.setdefault(_a, _canon)

for _s in ["java", "ruby", "rust", "kotlin", "swift", "php", "go", "golang", "scala", "r", "matlab", "dart", "flutter", "react native", "svelte", "pyspark", "hadoop", "spark", "airflow", "kafka", "jwt", "oauth", "microservices", "serverless", "nosql", "pgvector", "bash", "shell", "jenkins", "terraform", "ansible", "jira", "postman", "figma", "matplotlib", "seaborn", "selenium", "cypress", "system design", "distributed systems", "cloud computing", "mentorship", "github", "gitlab", "flask", "keras", "elasticsearch", "vs code", "vscode"]:
    _ALIAS_TO_CANON.setdefault(_s, _s)

_DISPLAY = {
    "c++": "C++",
    "c#": "C#",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "scikit-learn": "Scikit-Learn",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "power bi": "Power BI",
    "rest api": "REST API",
    "apis": "APIs",
    "ci/cd": "CI/CD",
    "aws": "AWS",
    "gcp": "GCP",
    "sql": "SQL",
    "html": "HTML",
    "css": "CSS",
    "data structures and algorithms": "Data Structures & Algorithms",
    "object oriented programming": "OOP",
    "database management systems": "DBMS",
    "computer networks": "Computer Networks",
    "operating systems": "Operating Systems",
    "web development": "Web Development",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "artificial intelligence": "AI",
    "natural language processing": "NLP",
    "computer vision": "Computer Vision",
    "system design": "System Design",
    "problem solving": "Problem Solving",
    "teamwork": "Teamwork",
    "communication": "Communication",
    "streamlit": "Streamlit",
    "git": "Git",
    "github": "GitHub",
    "vs code": "VS Code",
    "vscode": "VS Code"
}

def display_skill(c: str) -> str:
    if c in _DISPLAY:
        return _DISPLAY[c]
    small = {"and", "of", "&", "for", "with", "to"}
    return " ".join(w if w in small else w[:1].upper() + w[1:] for w in c.split())

_HARD = {
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go", "golang", "rust",
    "kotlin", "swift", "php", "scala", "r", "matlab", "dart", "fastapi", "flask", "django",
    "spring boot", "react", "react native", "angular", "vue", "next.js", "node.js", "express",
    "svelte", "flutter", "html", "css", "tailwind css", "streamlit", "postgresql", "mysql",
    "mongodb", "redis", "elasticsearch", "sqlite", "sql", "nosql", "pgvector",
    "database management systems", "data structures and algorithms", "object oriented programming",
    "computer networks", "operating systems", "pytorch", "tensorflow", "keras", "scikit-learn",
    "pandas", "numpy", "opencv", "nltk", "spacy", "pyspark", "hadoop", "spark",
    "machine learning", "deep learning", "artificial intelligence", "natural language processing",
    "computer vision", "data science", "data analysis", "power bi", "tableau", "excel",
    "matplotlib", "seaborn", "docker", "kubernetes", "microservices", "serverless",
    "rest api", "apis", "graphql", "jwt", "oauth", "web development", "debugging",
    "testing", "system design", "distributed systems", "cloud computing", "selenium", "cypress"
}
_SOFT = {
    "communication", "teamwork", "problem solving", "leadership", "time management",
    "adaptability", "critical thinking", "project management", "agile", "scrum",
    "mentorship", "collaboration"
}

def categorize_skill(c: str) -> str:
    k = (c or "").lower()
    if k in _HARD:
        return "hard_technical"
    if k in _SOFT:
        return "soft_skills"
    return "domain_tools"

_REQUIRED_CUES = (
    "must have", "must-have", "required", "requirement", "requirements", "essential",
    "mandatory", "strong", "expert", "proficient", "proficiency", "hands-on", "hands on",
    "experience with", "experience in", "years", "proven", "key responsibilities"
)
_PREFERRED_CUES = (
    "preferred", "desirable", "nice to have", "nice-to-have", "bonus", "plus",
    "good to have", "familiar", "familiarity", "exposure", "knowledge of", "understanding of"
)

def normalize_skill_name(n: str) -> str:
    import re as _re
    k = _re.sub(r"\s+", " ", (n or "").strip().lower()).rstrip(".,;:!?")
    return _ALIAS_TO_CANON.get(k, k)
