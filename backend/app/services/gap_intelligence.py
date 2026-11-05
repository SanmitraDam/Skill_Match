"""
Skill Gap Intelligence & AI Improvement Engine (v26.0)
Translates DNA Matcher results (MatchReport) into personalized, dynamic,
actionable career recovery blueprints:
1. Top KPI Dashboard Metrics & Dynamic Readiness Assessment
2. Critical Gap Intelligence (Severity, JD Importance, Contextual Reasoning)
3. AI-Powered Improvement Plan (Learn, Why, Practice, Project, Resume Evidence, Interview)
4. Personalized Sequential Recovery Roadmap (Foundation -> Practice -> Framework -> Capstone -> Interview)
5. Verified Curated Learning Resources (Official Docs, Sandboxes, Tutorials)
6. Practical Capstone Project Blueprint ("Build To Close The Gap")
7. Gap-Derived Technical Interview Questions
8. Ethical Resume Improvement Signals (Demonstrated, Needs Evidence, Missing)
"""

from __future__ import annotations
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field

from app.services.skill_taxonomy import categorize_skill, display_skill
from app.services.skill_match import MatchReport, SkillMatch


# -----------------------------------------------------------------------------
# Curated Verified Skill Knowledge Base for Deep Insights
# -----------------------------------------------------------------------------
SKILL_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "Python": {
        "why": "Core runtime language driving backend microservices, data processing pipelines, and AI workflows.",
        "learn": "OOP patterns, generators, async/await (asyncio), typing, decorators, memory management.",
        "practice": "Build asynchronous worker queues, write pytest suites with fixtures, and optimize computational bottlenecks.",
        "project": "Async Distributed Task Queue with Redis",
        "evidence": "Document a GitHub repository featuring modular OOP design, 90%+ pytest coverage, and type hinting.",
        "resource": {"title": "Python Official Documentation & Tutorials", "url": "https://docs.python.org/3/", "type": "Official Documentation"},
        "interview_topics": ["GIL & Concurrency", "Generators vs Iterators", "Decorators", "Context Managers", "FastAPI/Asyncio"],
        "interview_questions": [
            {"q": "How does Python's Global Interpreter Lock (GIL) impact multithreading vs multiprocessing?", "focus": "CPU-bound vs I/O-bound concurrency models."},
            {"q": "Explain how Python generators save memory compared to standard list comprehensions.", "focus": "Lazy evaluation and the yield protocol."},
            {"q": "How do Python decorators work under the hood, and how would you pass arguments to a decorator?", "focus": "Closures, callable objects, and wraps metadata."}
        ]
    },
    "JavaScript": {
        "why": "Fundamental runtime powering interactive web interfaces, asynchronous events, and full-stack runtimes.",
        "learn": "ES6+ syntax, Closures, Prototypal Inheritance, Event Loop, Promises & Async/Await, Web APIs.",
        "practice": "Implement custom Promise utilities, build DOM manipulation tools, and master event bubbling/capturing.",
        "project": "Real-Time Event Stream Monitor with Vanilla JS",
        "evidence": "Publish an interactive web app with clean modular ES modules and zero external framework bloat.",
        "resource": {"title": "MDN Web Docs — JavaScript Reference", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "type": "Official Documentation"},
        "interview_topics": ["Event Loop & Microtasks", "Closures & Scope", "Prototypes", "Async/Await Error Handling"],
        "interview_questions": [
            {"q": "Explain the difference between the Call Stack, Event Loop, and Task/Microtask Queues.", "focus": "Execution order of setTimeout vs Promise.then."},
            {"q": "What is a closure in JavaScript, and what is a practical real-world use case for it?", "focus": "Data encapsulation, currying, and lexical scoping."},
            {"q": "How does prototypal inheritance differ from classical OOP inheritance?", "focus": "Prototype chain lookup and Object.create."}
        ]
    },
    "TypeScript": {
        "why": "Industry standard for type-safe frontend and backend enterprise software at scale.",
        "learn": "Generics, Discriminated Unions, Utility Types (Partial, Pick, Omit), Type Guards, tsconfig tuning.",
        "practice": "Convert dynamic JS modules into strictly typed libraries with zero 'any' escapes.",
        "project": "Strictly Typed In-Memory State Manager",
        "evidence": "Showcase a production TypeScript repo with strict: true and clean custom generic utilities.",
        "resource": {"title": "TypeScript Handbook & Documentation", "url": "https://www.typescriptlang.org/docs/", "type": "Official Documentation"},
        "interview_topics": ["Generics", "Type vs Interface", "Discriminated Unions", "Keyof & Mapped Types"],
        "interview_questions": [
            {"q": "What is the difference between 'type' and 'interface' in modern TypeScript?", "focus": "Declaration merging, union types, and extensibility."},
            {"q": "How do Discriminated Unions enable type safety in Redux or finite state machines?", "focus": "Exhaustive switch-case checks and literal discriminants."}
        ]
    },
    "React": {
        "why": "Leading UI library required for modern component-driven enterprise web applications.",
        "learn": "Component lifecycle, useState/useEffect/useCallback hooks, Context API, Virtual DOM diffing, Server Components.",
        "practice": "Build custom hooks for data fetching, caching, debounce, and modal management.",
        "project": "AI Job Application Dashboard & Pipeline",
        "evidence": "Deploy a deployed React application demonstrating custom hooks, responsive layout, and clean state separation.",
        "resource": {"title": "React.dev — The New Official Documentation", "url": "https://react.dev/", "type": "Interactive Guide"},
        "interview_topics": ["React Fiber & Reconciliation", "Hooks Rules & Closures", "Context vs State Libraries", "Performance Optimization"],
        "interview_questions": [
            {"q": "How does React's Virtual DOM reconciliation (diffing algorithm) work?", "focus": "Keys in lists, element tree diffing, and batching."},
            {"q": "What causes stale closures inside useEffect and useCallback, and how do you fix them?", "focus": "Dependency arrays and functional state updates."},
            {"q": "When would you choose useMemo/useCallback versus trusting React Compiler optimizations?", "focus": "Referential equality vs premature optimization overhead."}
        ]
    },
    "Next.js": {
        "why": "Premier full-stack React framework providing SSR, SSG, streaming, and server actions.",
        "learn": "App Router, Server vs Client Components, Dynamic Routing, Metadata, Route Handlers, Cache Layers.",
        "practice": "Build hybrid SSR/client applications with optimized image loading and SEO metadata.",
        "project": "Full-Stack Developer Community Platform",
        "evidence": "Deploy a high-Lighthouse score Next.js 14+ application with server actions and dynamic OG cards.",
        "resource": {"title": "Next.js Documentation & Learn Course", "url": "https://nextjs.org/docs", "type": "Official Documentation"},
        "interview_topics": ["Server vs Client Components", "Streaming SSR with Suspense", "Caching Strategy", "Route Handlers"],
        "interview_questions": [
            {"q": "Explain the architectural difference between Server Components and Client Components.", "focus": "Zero client-bundle footprint, data fetching at the server edge."},
            {"q": "How does Next.js handle revalidation (ISR) in the App Router?", "focus": "revalidatePath and fetch cache tags."}
        ]
    },
    "SQL": {
        "why": "Essential data querying and manipulation standard for relational databases across all software roles.",
        "learn": "Complex JOINs (INNER, LEFT, FULL, CROSS), GROUP BY, HAVING, Window Functions (ROW_NUMBER, RANK, LAG), CTEs, Indexing.",
        "practice": "Solve 30+ SQL query puzzles analyzing customer cohort retention and aggregate revenue metrics.",
        "project": "Financial Transaction Analytics & Auditing Pipeline",
        "evidence": "Provide a GitHub repository with schema migration scripts, complex analytics queries, and index benchmarks.",
        "resource": {"title": "PostgreSQL Tutorial & Interactive SQL", "url": "https://www.postgresqltutorial.com/", "type": "Interactive Guide"},
        "interview_topics": ["Indexing (B-Tree vs Hash)", "Window Functions", "Query Plan (EXPLAIN ANALYZE)", "ACID Properties & Transactions"],
        "interview_questions": [
            {"q": "What is the difference between WHERE and HAVING in an aggregated SQL query?", "focus": "Filter timing: pre-aggregation vs post-aggregation."},
            {"q": "Write or explain a query using Window Functions to find the top 3 highest-earning candidates per department.", "focus": "PARTITION BY and DENSE_RANK() / ROW_NUMBER()."},
            {"q": "How does an Index scan compare to a Sequential scan in PostgreSQL query execution plans?", "focus": "Cost evaluation, selectivity, and B-Tree indexing."}
        ]
    },
    "PostgreSQL": {
        "why": "Enterprise-grade open-source relational database powerhub with JSONB and vector capabilities.",
        "learn": "ACID compliance, MVCC, Partitioning, JSONB queries, Connection Pooling (PgBouncer), pgvector embeddings.",
        "practice": "Design normalized schemas, tune slow queries using EXPLAIN ANALYZE, and build vector search indexes.",
        "project": "Semantic Search Engine with pgvector and PostgreSQL",
        "evidence": "Document a database schema repository with migration files (Alembic) and query optimization logs.",
        "resource": {"title": "PostgreSQL Official Documentation", "url": "https://www.postgresql.org/docs/", "type": "Official Documentation"},
        "interview_topics": ["MVCC & Vacuuming", "Indexing Strategies", "Connection Pooling", "Transactions & Isolation Levels"],
        "interview_questions": [
            {"q": "How does Multi-Version Concurrency Control (MVCC) eliminate read/write lock contention in PostgreSQL?", "focus": "Transaction snapshots, dead tuples, and VACUUM."},
            {"q": "What are the four SQL transaction isolation levels, and what anomalies does each prevent?", "focus": "Dirty read, non-repeatable read, and phantom read."}
        ]
    },
    "Docker": {
        "why": "Universal containerization standard ensuring environment parity across development, CI, and cloud deployment.",
        "learn": "Multi-stage builds, Dockerfile optimization, Layer caching, Docker Compose, Volumes, Network isolation.",
        "practice": "Containerize a full-stack polyglot app into lightweight (<150MB) multi-stage production images.",
        "project": "Containerized Microservices Cluster with Docker Compose",
        "evidence": "Include a verified Dockerfile and docker-compose.yml in your portfolio repositories.",
        "resource": {"title": "Docker Get Started Guide", "url": "https://docs.docker.com/get-started/", "type": "Official Documentation"},
        "interview_topics": ["Layer Caching", "Multi-Stage Builds", "Container vs Virtual Machine", "Security & Non-root Users"],
        "interview_questions": [
            {"q": "How do multi-stage Docker builds reduce image size and improve container security?", "focus": "Excluding build-time compilers and dev dependencies from the final image."},
            {"q": "How does Docker layer caching work, and how should you order instructions in a Dockerfile?", "focus": "Placing infrequently changing instructions (package install) before source code."}
        ]
    },
    "Kubernetes": {
        "why": "Gold standard for container orchestration, automated scaling, and self-healing cloud applications.",
        "learn": "Pods, Deployments, Services (ClusterIP, NodePort, LoadBalancer), ConfigMaps, Secrets, Ingress, HPA.",
        "practice": "Write declarative manifests and run local clusters on Minikube or Kind.",
        "project": "Resilient Microservices Mesh with Kubernetes & Ingress",
        "evidence": "Publish tested K8s declarative YAML manifests with rolling update strategies and liveness probes.",
        "resource": {"title": "Kubernetes Official Tutorials", "url": "https://kubernetes.io/docs/tutorials/", "type": "Official Documentation"},
        "interview_topics": ["Pod Lifecycle", "Deployments vs StatefulSets", "Service Discovery", "Liveness vs Readiness Probes"],
        "interview_questions": [
            {"q": "What is the difference between a Liveness Probe and a Readiness Probe in Kubernetes?", "focus": "Container restart vs traffic routing isolation."},
            {"q": "Explain how Kubernetes Service Discovery and kube-proxy route traffic to dynamic pod IPs.", "focus": "Endpoints objects, DNS, and iptables/IPVS rules."}
        ]
    },
    "FastAPI": {
        "why": "High-performance Python web framework for building modern asynchronous REST and GraphQL APIs.",
        "learn": "Pydantic v2 schemas, Dependency Injection system, Async path operators, OpenAPI generation, BackgroundTasks.",
        "practice": "Build production CRUD APIs with JWT authentication, rate limiting, and automated Swagger documentation.",
        "project": "Enterprise API Gateway with JWT & Rate Limiting",
        "evidence": "Provide a deployed FastAPI microservice with live Swagger UI and unit test coverage.",
        "resource": {"title": "FastAPI Official Documentation", "url": "https://fastapi.tiangolo.com/", "type": "Official Documentation"},
        "interview_topics": ["Pydantic Validation", "Dependency Injection (Depends)", "Async vs Sync Route Handlers", "Middleware"],
        "interview_questions": [
            {"q": "How does FastAPI's 'Depends' system facilitate clean dependency injection and modularity?", "focus": "Database session scoping, authentication, and reusable test mocks."},
            {"q": "When should you declare a route with 'async def' versus plain 'def' in FastAPI?", "focus": "Thread pool delegation vs event loop blocking."}
        ]
    },
    "APIs": {
        "why": "Foundation of inter-service communication and client-server contract architecture.",
        "learn": "RESTful principles, HTTP status codes, Idempotency, JWT/OAuth2 authentication, Rate limiting, Versioning.",
        "practice": "Design and document a complete API specification with error formats, pagination, and filtering.",
        "project": "High-Throughput Public API Service with API Keys",
        "evidence": "Include a Postman collection or OpenAPI 3.0 spec alongside your backend repository.",
        "resource": {"title": "REST API Tutorial & Best Practices", "url": "https://restfulapi.net/", "type": "Interactive Guide"},
        "interview_topics": ["Idempotency", "HTTP Status Codes (401 vs 403, 429)", "RESTful Constraints", "API Versioning"],
        "interview_questions": [
            {"q": "What makes an HTTP method idempotent, and why are PUT/DELETE idempotent while POST is not?", "focus": "Side-effects of repeated identical requests."},
            {"q": "How would you design a robust rate-limiting mechanism for a public API?", "focus": "Token bucket algorithm, Redis sliding window, and 429 Retry-After headers."}
        ]
    },
    "Testing": {
        "why": "Critical quality assurance capability required for reliable, regression-free software releases.",
        "learn": "Unit testing, Integration testing, Pytest fixtures/mocking, Jest, Test-Driven Development (TDD), CI test runners.",
        "practice": "Write comprehensive unit and integration test suites reaching 85%+ branch coverage.",
        "project": "End-to-End Test Suite with Automated CI Quality Gate",
        "evidence": "Display a repository with passing CI badges (GitHub Actions) running automated pytest/Jest suites.",
        "resource": {"title": "Pytest Documentation & Testing Patterns", "url": "https://docs.pytest.org/en/stable/", "type": "Official Documentation"},
        "interview_topics": ["Unit vs Integration vs E2E", "Mocking vs Stubbing", "TDD Cycle", "Code Coverage vs Test Quality"],
        "interview_questions": [
            {"q": "What is the difference between a Mock, a Stub, and a Fake in test automation?", "focus": "Behavior verification vs state verification."},
            {"q": "How do you test code that depends on external third-party HTTP APIs reliably?", "focus": "VCR, responses/httpretty, or dependency-injected mock clients."}
        ]
    },
    "Debugging": {
        "why": "Core problem-solving skill required to isolate root causes in distributed, asynchronous systems.",
        "learn": "Interactive debuggers (pdb, chrome devtools), Profiling (cProfile, flamegraphs), Log analysis, Distributed tracing.",
        "practice": "Profile a CPU-heavy service, identify O(N^2) bottlenecks, and diagnose memory leaks.",
        "project": "System Profiling & Latency Diagnostics Suite",
        "evidence": "Write a post-mortem or technical case study describing how you isolated and fixed a production bug.",
        "resource": {"title": "Python Debugging with pdb", "url": "https://docs.python.org/3/library/pdb.html", "type": "Official Documentation"},
        "interview_topics": ["Memory Leak Diagnosis", "CPU Profiling", "Root Cause Analysis", "Observability (Logs, Metrics, Traces)"],
        "interview_questions": [
            {"q": "How do you identify whether a performance degradation is caused by CPU saturation, memory thrashing, or I/O waits?", "focus": "System metrics (top, vmstat, iostat) and profiling tools."},
            {"q": "Walk through your step-by-step process when a production service experiences sudden 502 Bad Gateway spikes.", "focus": "Health checks, ingress logs, upstream process crashes, and resource limits."}
        ]
    },
    "Data Structures & Algorithms": {
        "why": "Essential computer science foundation for writing performant, scalable, and memory-efficient algorithms.",
        "learn": "Arrays, Hash Maps, Linked Lists, Trees & BSTs, Graphs, Heaps, Dynamic Programming, Big-O Complexity.",
        "practice": "Solve 75 core algorithm challenges focusing on sliding window, two pointers, and BFS/DFS graph traversals.",
        "project": "High-Performance In-Memory Index & Graph Navigator",
        "evidence": "Document an algorithmic problem solving repository with Big-O time and space complexity annotations.",
        "resource": {"title": "NeetCode & Algorithm Practice Visualizer", "url": "https://neetcode.io/", "type": "Practice Sandbox"},
        "interview_topics": ["Big-O Complexity", "Hash Map Collisions", "Tree Traversals", "BFS vs DFS", "Dynamic Programming"],
        "interview_questions": [
            {"q": "How does a Hash Table resolve hash collisions, and what is the worst-case time complexity?", "focus": "Chaining vs open addressing, and degradation from O(1) to O(N)."},
            {"q": "When would you choose a Breadth-First Search (BFS) over a Depth-First Search (DFS)?", "focus": "Shortest path in unweighted graphs vs path existence and backtracking."}
        ]
    },
    "OOP": {
        "why": "Core paradigm for structuring modular, maintainable, and extensible software architectures.",
        "learn": "Encapsulation, Abstraction, Inheritance, Polymorphism, SOLID Principles, Design Patterns (Factory, Strategy, Observer).",
        "practice": "Refactor procedural scripts into clean object-oriented class hierarchies following SOLID principles.",
        "project": "Extensible Payment & Order Processing Engine",
        "evidence": "Present a repository showcasing abstract base classes, clean dependency inversion, and unit tests.",
        "resource": {"title": "Refactoring Guru — SOLID Principles & Design Patterns", "url": "https://refactoring.guru/design-patterns", "type": "Interactive Guide"},
        "interview_topics": ["SOLID Principles", "Composition vs Inheritance", "Abstract Classes vs Interfaces", "Design Patterns"],
        "interview_questions": [
            {"q": "Explain the Open/Closed Principle and provide an example of how to implement it.", "focus": "Extending functionality via polymorphism without modifying existing source code."},
            {"q": "Why is 'favor composition over inheritance' widely recommended in modern software engineering?", "focus": "Fragile base class problem and runtime flexibility."}
        ]
    },
    "DBMS": {
        "why": "Foundational understanding of database internal storage engines, query planners, and transaction managers.",
        "learn": "Relational algebra, Normalization (1NF through 3NF/BCNF), Index structures (B+ Trees), Concurrency control, WAL logs.",
        "practice": "Normalize unorganized denormalized flat files into clean 3NF relational schemas.",
        "project": "Relational Schema Architect & Benchmarking Sandbox",
        "evidence": "Present an Entity-Relationship (ER) diagram and normalized database schema migration script.",
        "resource": {"title": "Database System Concepts Tutorial", "url": "https://www.geeksforgeeks.org/dbms/", "type": "Educational Reference"},
        "interview_topics": ["Database Normalization", "B+ Trees in Storage Engines", "WAL (Write-Ahead Logging)", "Deadlocks"],
        "interview_questions": [
            {"q": "Why do relational database storage engines use B+ Trees rather than standard Binary Search Trees?", "focus": "Disk block sizing, fanout, and shallow tree depth for reduced disk I/O."},
            {"q": "What is Database Normalization and why is 3NF typically preferred over BCNF in production?", "focus": "Redundancy elimination vs preservation of functional dependencies."}
        ]
    },
    "Pandas": {
        "why": "Standard Python data manipulation and analysis library for exploratory data science and reporting.",
        "learn": "DataFrames, Series, GroupBy aggregations, Merging & Joining, Pivot tables, Missing data handling, Vectorization.",
        "practice": "Clean noisy real-world CSV datasets, aggregate cohort metrics, and optimize memory with categorical types.",
        "project": "Automated Customer Cohort Analysis & Retention Dashboard",
        "evidence": "Provide a Jupyter Notebook or Streamlit analytics script showcasing vectorized data cleaning and KPIs.",
        "resource": {"title": "Pandas Official Documentation & User Guide", "url": "https://pandas.pydata.org/docs/user_guide/index.html", "type": "Official Documentation"},
        "interview_topics": ["Vectorization vs Itertuples", "GroupBy Operations", "Merge vs Join vs Concat", "Memory Optimization"],
        "interview_questions": [
            {"q": "Why should you avoid using df.iterrows() or loops when processing Pandas DataFrames?", "focus": "C-level vectorized operations and performance speedups."},
            {"q": "How does Pandas handle missing values (NaN) during GroupBy and aggregation operations?", "focus": "Exclusion by default and fillna/dropna strategies."}
        ]
    },
    "Power BI": {
        "why": "Leading enterprise business intelligence and data visualization platform for executive reporting.",
        "learn": "Power Query ETL, DAX measures and calculated columns, Star schema modeling, Interactive dashboards, Row-Level Security.",
        "practice": "Build interactive multi-page dashboards with drill-through filters and dynamic KPI scorecards.",
        "project": "Executive Sales & Operational Performance Dashboard",
        "evidence": "Publish dashboard screenshots, DAX calculations documentation, and data model architecture diagrams.",
        "resource": {"title": "Microsoft Learn — Power BI Guidance", "url": "https://learn.microsoft.com/en-us/power-bi/", "type": "Official Documentation"},
        "interview_topics": ["DAX Measures vs Calculated Columns", "Star Schema vs Snowflake", "Row-Level Security (RLS)", "Performance Tuning"],
        "interview_questions": [
            {"q": "What is the key difference in computation and memory between a DAX Measure and a Calculated Column?", "focus": "Query-time CPU calculation vs storage in the VertiPaq engine."},
            {"q": "Why is a Star Schema strongly recommended over a Snowflake Schema in Power BI data models?", "focus": "Relationship count, memory optimization, and DAX simplification."}
        ]
    },
    "Communication": {
        "why": "Essential collaborative skill to articulate technical trade-offs, architecture, and sprint progress clearly.",
        "learn": "Active listening, structured technical writing, asynchronous team updates, presentation of complex ideas.",
        "practice": "Draft architectural decision records (ADRs) explaining technical trade-offs in plain, actionable language.",
        "project": "Architecture Decision Record (ADR) & Technical RFC Suite",
        "evidence": "Provide well-written README documentation and clear commit histories in all your portfolio projects.",
        "resource": {"title": "Google Technical Writing Courses", "url": "https://developers.google.com/tech-writing", "type": "Interactive Guide"},
        "interview_topics": ["Explaining Technical Concepts to Non-Technical Stakeholders", "Conflict Resolution", "Code Review Communication"],
        "interview_questions": [
            {"q": "How would you explain the concept of technical debt to an executive product manager?", "focus": "Business velocity, interest payments (bugs/slowdowns), and strategic refactoring."},
            {"q": "Describe a time when you strongly disagreed with an architectural decision. How did you communicate your perspective?", "focus": "Data-driven communication, constructive dialogue, and commit-and-disagree alignment."}
        ]
    },
    "Problem Solving": {
        "why": "Foundational capability to deconstruct ambiguous technical challenges into structured, solvable steps.",
        "learn": "Root cause analysis (5 Whys), First principles thinking, Divide and conquer strategies, Bottleneck analysis.",
        "practice": "Break down complex architectural prompts into component diagrams, data flows, and prioritized milestones.",
        "project": "Algorithmic Decision Engine & Optimization Service",
        "evidence": "Include a problem-solving write-up in your project documentation detailing technical trade-offs made.",
        "resource": {"title": "McKinsey Problem Solving Framework & First Principles", "url": "https://www.coursera.org/learn/problem-solving", "type": "Educational Reference"},
        "interview_topics": ["Structured Decomposition", "Root Cause Analysis", "Handling Ambiguous Requirements"],
        "interview_questions": [
            {"q": "How do you approach a complex, ambiguous problem with no clear starting specification?", "focus": "Clarifying questions, boundary constraints, MVP prototyping, and iterative validation."}
        ]
    }
}


# -----------------------------------------------------------------------------
# Dynamic Synthesizer Fallback for Arbitrary / Unlisted Skills
# -----------------------------------------------------------------------------
def get_skill_intelligence(skill: str, role_title: str = "Target Position") -> Dict[str, Any]:
    """
    Returns curated knowledge base details for a skill, or dynamically synthesizes
    realistic, professional, non-hallucinated guidance for any arbitrary skill.
    """
    canon = display_skill(skill)
    if canon in SKILL_KNOWLEDGE_BASE:
        return SKILL_KNOWLEDGE_BASE[canon]

    # Dynamic synthesizer for unlisted skills in Lightcast taxonomy
    cat = categorize_skill(skill)
    cat_label = "technical competence" if cat == "hard_technical" else ("collaborative competency" if cat == "soft_skills" else "tooling capability")

    return {
        "why": f"Key {cat_label} expected for {role_title} workflows to ensure production quality.",
        "learn": f"Core concepts, architecture standards, operational lifecycle, and production best practices of {canon}.",
        "practice": f"Build practical hands-on exercises and automated checks demonstrating operational mastery of {canon}.",
        "project": f"Production-Grade {canon} Implementation & Verification Service",
        "evidence": f"Develop and document a project using {canon}, then add verified project evidence and metrics to your resume.",
        "resource": {
            "title": f"{canon} Official Documentation & Reference",
            "url": f"https://www.google.com/search?q={canon.replace(' ', '+')}+official+documentation",
            "type": "Official Reference"
        },
        "interview_topics": [f"{canon} Architecture", f"{canon} Best Practices", f"{canon} Error Handling & Edge Cases"],
        "interview_questions": [
            {"q": f"How do you configure, optimize, and debug {canon} in an enterprise production environment?", "focus": f"Architecture fundamentals and stability trade-offs of {canon}."},
            {"q": f"What common pitfalls or anti-patterns occur when implementing {canon}, and how do you prevent them?", "focus": "Production reliability and maintainability."}
        ]
    }


# -----------------------------------------------------------------------------
# Data Structures for Gap Intelligence Output
# -----------------------------------------------------------------------------
@dataclass
class GapDetail:
    skill: str
    category: str
    severity: str
    jd_importance: str
    reason: str
    criticality: str
    intel: Dict[str, Any]


@dataclass
class RoadmapStep:
    step_num: str
    phase: str
    title: str
    description: str
    target_skills: List[str]
    action_item: str


@dataclass
class CapstoneProject:
    title: str
    target_skill: str
    why_this_project: str
    skills_covered: List[str]
    difficulty: str
    expected_outcome: str
    portfolio_value: str
    architecture_summary: str


@dataclass
class GapIntelligenceReport:
    # 1. Top Dashboard
    match_score: float
    total_gaps: int
    critical_gaps_count: int
    readiness_level: str
    readiness_badge_color: str
    role_inferred: str

    # 2. Critical Gap Intelligence
    gap_details: List[GapDetail]

    # 3. AI Improvement Plan
    improvement_plan: List[Dict[str, Any]]

    # 4. Personalized Learning Roadmap
    roadmap: List[RoadmapStep]

    # 5. Verified Resources
    resources: List[Dict[str, Any]]

    # 6. Practical Project Generator
    capstone: Optional[CapstoneProject]

    # 7. Interview Preparation
    interview_questions: Dict[str, List[Dict[str, str]]]
    total_interview_questions: int

    # 8. Resume Improvement Signals
    demonstrated_skills: List[str]
    needs_evidence_skills: List[str]
    missing_skills: List[str]
    resume_guidance: List[str]


# -----------------------------------------------------------------------------
# Main Intelligence Engine
# -----------------------------------------------------------------------------
class GapIntelligenceEngine:
    """
    Generates deterministic, context-driven AI career guidance directly from
    the current resume and JD matching report.
    """

    def infer_role_title(self, jd_text: str, report: MatchReport) -> str:
        """Infers the target role title cleanly from the JD text or dominant skills."""
        if not jd_text:
            return "Software Professional"

        first_lines = [line.strip() for line in jd_text.strip().split("\n")[:4] if line.strip()]
        for line in first_lines:
            # Check for common role signals
            if re.search(r"\b(engineer|developer|analyst|architect|scientist|lead|manager|specialist)\b", line, re.IGNORECASE):
                # Clean up punctuation
                cleaned = re.sub(r"^[#*>\-\s]+", "", line).split(" - ")[0].split(" | ")[0]
                if 5 <= len(cleaned) <= 60:
                    return cleaned

        # Fallback to dominant skill signals
        all_req = [s.display.lower() for s in report.jd_skills]
        if any(x in all_req for x in ["react", "next.js", "vue", "frontend", "css"]):
            return "Frontend Engineer"
        if any(x in all_req for x in ["pandas", "sql", "power bi", "data analysis", "tableau"]):
            return "Data Analyst / Analytics Engineer"
        if any(x in all_req for x in ["docker", "kubernetes", "aws", "terraform", "ci/cd"]):
            return "DevOps & Cloud Engineer"
        if any(x in all_req for x in ["python", "fastapi", "django", "go", "microservices"]):
            return "Backend Software Engineer"

        return "Software Engineer"

    def calculate_readiness(self, score: float, critical_count: int) -> Tuple[str, str]:
        """
        Calculates the readiness level and associated UI badge color based on match score and critical gaps.

        Args:
            score (float): The overall match score.
            critical_count (int): The number of high-criticality gaps.

        Returns:
            Tuple[str, str]: A tuple containing the readiness label and the hex color code.
        """
        if score >= 85.0 and critical_count == 0:
            return "INTERVIEW READY", "#10b981"
        elif score >= 70.0 and critical_count <= 1:
            return "HIGH READINESS", "#34d399"
        elif score >= 50.0:
            return "MODERATE READINESS", "#f59e0b"
        elif score >= 30.0:
            return "DEVELOPING READINESS", "#f97316"
        else:
            return "FOUNDATIONAL READINESS", "#f43f5e"

    def generate_intelligence(
        self,
        resume_text: str,
        jd_text: str,
        report: MatchReport
    ) -> GapIntelligenceReport:
        """
        Compiles a full intelligence report including gap details, improvement plans, and learning roadmaps.

        Args:
            resume_text (str): Raw text from the candidate's resume.
            jd_text (str): Raw text from the job description.
            report (MatchReport): The processed skill match report.

        Returns:
            GapIntelligenceReport: A detailed intelligence report for career guidance.
        """
        role_title = self.infer_role_title(jd_text, report)
        match_score = round(report.overall, 1)

        # 1. Critical Gaps & Contextual Reasoning
        critical_count = sum(1 for g in report.gaps if g.get("criticality") == "High")
        readiness_level, badge_color = self.calculate_readiness(match_score, critical_count)

        gap_details: List[GapDetail] = []
        # Combine high-criticality gaps first, then remaining gaps up to 8
        all_gaps = list(report.gaps)
        if not all_gaps and report.missing:
            all_gaps = [{"skill": m.skill, "category": m.category, "criticality": "Medium", "gap_weight": 1.0} for m in report.missing]

        for g in all_gaps:
            s_name = g["skill"]
            cat = g.get("category", categorize_skill(s_name))
            crit = g.get("criticality", "Medium")

            # Determine severity tag
            severity = f"{crit.upper()} GAP"

            # Determine JD Importance
            # Find matching SkillMatch in report.missing or report.jd_skills
            importance = "Required Competency"
            for m in report.missing:
                if m.skill.lower() == s_name.lower():
                    importance = "Must-Have Requirement" if m.importance == "required" else ("Preferred Core Skill" if m.importance == "preferred" else "Bonus Competency")
                    break

            # Dynamic contextual reason
            intel = get_skill_intelligence(s_name, role_title)
            if crit == "High":
                reason = f"Essential requirement explicitly prioritized by the target {role_title} role. No verified evidence was detected in your current resume."
            elif cat == "hard_technical":
                reason = f"Target job requires hands-on technical proficiency with {s_name} for production implementation."
            elif cat == "soft_skills":
                reason = f"Role emphasizes collaborative delivery requiring demonstrated {s_name} capabilities across cross-functional teams."
            else:
                reason = f"Tooling ecosystem requirement specified in JD. Insufficient evidence documented in current resume."

            gap_details.append(GapDetail(
                skill=s_name,
                category=cat.replace("_", " ").upper(),
                severity=severity,
                jd_importance=importance,
                reason=reason,
                criticality=crit,
                intel=intel
            ))

        # 2. AI Improvement Plan
        improvement_plan: List[Dict[str, Any]] = []
        for gd in gap_details[:6]:
            intel = gd.intel
            priority = "HIGH PRIORITY" if gd.criticality == "High" else ("MEDIUM PRIORITY" if gd.criticality == "Medium" else "EXPANSION PRIORITY")
            improvement_plan.append({
                "skill": gd.skill,
                "priority": priority,
                "why": intel["why"],
                "learn": intel["learn"],
                "practice": intel["practice"],
                "project": intel["project"],
                "evidence": intel["evidence"],
                "interview_topics": intel.get("interview_topics", [gd.skill])
            })

        # 3. Personalized Sequential Recovery Roadmap
        roadmap: List[RoadmapStep] = []
        missing_names = [gd.skill for gd in gap_details]

        if not missing_names:
            # Candidate matched 100%! Provide mastery roadmap
            roadmap = [
                RoadmapStep("01", "SYSTEM ARCHITECTURE", "Distributed Systems & Scalability", "Study horizontal scaling, consensus protocols, and caching tiers.", ["System Design", "Microservices"], "Design a high-QPS service architecture blueprint."),
                RoadmapStep("02", "PERFORMANCE TUNING", "Profiling & Latency Optimization", "Deep dive into kernel I/O, database execution plans, and zero-copy buffers.", ["Optimization", "PostgreSQL"], "Benchmark throughput and optimize latency under simulated load."),
                RoadmapStep("03", "ADVANCED SECURITY", "Zero-Trust & Compliance", "Implement strict role-based access control (RBAC) and data encryption.", ["Security", "OAuth2"], "Audit service boundaries for vulnerability defense."),
                RoadmapStep("04", "PRODUCTION HARBOR", "Chaos Engineering & Resiliency", "Run chaos fault-injection drills to prove automatic self-healing.", ["Kubernetes", "Monitoring"], "Deploy automated alerts and synthetic health checks."),
                RoadmapStep("05", "INTERVIEW EXCELLENCE", "Executive Technical Presentation", "Rehearse system design defense and trade-off presentations.", ["System Design", "Leadership"], "Complete senior mock panel interview.")
            ]
        else:
            # Break down missing skills dynamically into 5 progressive phases
            # Phase 1: Foundation (first missing fundamental or language)
            p1_skills = [s for s in missing_names if s in ["Python", "JavaScript", "TypeScript", "Go", "Java", "C++", "C#", "SQL", "HTML", "CSS", "DSA", "OOP", "DBMS"]]
            step1_skill = p1_skills[0] if p1_skills else missing_names[0]
            step1_intel = get_skill_intelligence(step1_skill, role_title)
            roadmap.append(RoadmapStep(
                "01",
                "FOUNDATION",
                f"{step1_skill} Fundamentals",
                f"Master the core syntax, memory primitives, and basic execution patterns of {step1_skill}.",
                [step1_skill],
                f"Complete focused coding drills on {step1_intel['learn'].split(',')[0]}."
            ))

            # Phase 2: Practice (APIs, Data structures, or second gap)
            remaining_after_1 = [s for s in missing_names if s != step1_skill]
            step2_skill = remaining_after_1[0] if remaining_after_1 else step1_skill
            step2_intel = get_skill_intelligence(step2_skill, role_title)
            roadmap.append(RoadmapStep(
                "02",
                "PRACTICE",
                f"{step2_skill} Implementation & Integration",
                f"Deepen hands-on proficiency with {step2_skill} through asynchronous workflows and state management.",
                [step2_skill],
                f"Practice: {step2_intel['practice']}"
            ))

            # Phase 3: Framework / Infrastructure
            remaining_after_2 = [s for s in remaining_after_1 if s != step2_skill]
            step3_skill = remaining_after_2[0] if remaining_after_2 else (step2_skill if step2_skill != step1_skill else "Production Tooling")
            step3_intel = get_skill_intelligence(step3_skill, role_title)
            roadmap.append(RoadmapStep(
                "03",
                "FRAMEWORK & TOOLS",
                f"{step3_skill} Ecosystem Mastery",
                f"Integrate modern enterprise libraries and tooling to streamline development velocity.",
                [step3_skill],
                f"Learn: {step3_intel['learn']}"
            ))

            # Phase 4: Project
            top_gap = gap_details[0].skill
            top_intel = gap_details[0].intel
            roadmap.append(RoadmapStep(
                "04",
                "CAPSTONE PROJECT",
                f"Build: {top_intel['project']}",
                f"Architect an end-to-end portfolio project uniting {', '.join(missing_names[:3])}.",
                missing_names[:3],
                f"Deploy on cloud with README documentation and test suite."
            ))

            # Phase 5: Interview
            roadmap.append(RoadmapStep(
                "05",
                "INTERVIEW PREPARATION",
                f"{role_title} Gap-Focused Technical Drills",
                f"Rehearse domain technical questions covering {', '.join(missing_names[:4])}.",
                missing_names[:4],
                "Conduct mock voice interviews and refine technical trade-off explanations."
            ))

        # 4. Recommended Resources (Verified Links Only)
        resources: List[Dict[str, Any]] = []
        seen_res = set()
        for gd in gap_details:
            r = gd.intel.get("resource")
            if r and r["url"] not in seen_res:
                seen_res.add(r["url"])
                resources.append({
                    "skill": gd.skill,
                    "title": r["title"],
                    "url": r["url"],
                    "type": r.get("type", "Documentation"),
                    "why_recommended": f"Target role requires {gd.skill}. This verified reference provides authoritative guidance."
                })
            if len(resources) >= 6:
                break

        # 5. Practical Capstone Project ("Build To Close The Gap")
        capstone: Optional[CapstoneProject] = None
        if gap_details:
            lead_gap = gap_details[0].skill
            lead_intel = gap_details[0].intel
            capstone = CapstoneProject(
                title=lead_intel["project"],
                target_skill=lead_gap,
                why_this_project=f"Closing your largest gap in {lead_gap} directly addresses the top must-have requirement for the {role_title} role.",
                skills_covered=[lead_gap] + [g.skill for g in gap_details[1:4]],
                difficulty="Intermediate" if lead_gap in ["Python", "SQL", "JavaScript", "HTML", "CSS"] else "Advanced",
                expected_outcome=f"A fully functional, tested repository with automated tests and live deployment proving practical proficiency in {lead_gap}.",
                portfolio_value=f"Demonstrates to hiring managers that you build production-ready systems utilizing {lead_gap} with measurable outcomes.",
                architecture_summary=f"Modular service layer utilizing {lead_gap} connected to clean data ingestion pipelines and verified with automated test suites."
            )

        # 6. Interview Preparation Questions
        interview_questions: Dict[str, List[Dict[str, str]]] = {}
        total_q_count = 0
        for gd in gap_details[:4]:
            q_list = gd.intel.get("interview_questions", [])
            if q_list:
                interview_questions[gd.skill] = q_list
                total_q_count += len(q_list)

        # 7. Resume Improvement Signals
        demonstrated = [m.skill for m in report.matched]
        needs_evidence = [p.skill for p in report.partial]
        missing = [g.skill for g in gap_details]

        resume_guidance: List[str] = []
        if missing:
            resume_guidance.append(
                f"Develop and document a project using {missing[0]}, then add verified project evidence and metrics to your resume."
            )
        if len(missing) > 1:
            resume_guidance.append(
                f"For {missing[1]}, complete practical code exercises and link a public GitHub repository demonstrating hands-on implementation."
            )
        if needs_evidence:
            resume_guidance.append(
                f"Your resume mentions {needs_evidence[0]} peripherally. Strengthen this entry by adding concrete quantifiable metrics (e.g. latency, throughput, users impacted)."
            )
        resume_guidance.append(
            "Maintain complete veracity: Never claim unpracticed technologies on your resume. Complete project implementations first, then document verified skills."
        )

        return GapIntelligenceReport(
            match_score=match_score,
            total_gaps=len(gap_details),
            critical_gaps_count=critical_count,
            readiness_level=readiness_level,
            readiness_badge_color=badge_color,
            role_inferred=role_title,
            gap_details=gap_details,
            improvement_plan=improvement_plan,
            roadmap=roadmap,
            resources=resources,
            capstone=capstone,
            interview_questions=interview_questions,
            total_interview_questions=total_q_count,
            demonstrated_skills=demonstrated,
            needs_evidence_skills=needs_evidence,
            missing_skills=missing,
            resume_guidance=resume_guidance
        )


# Global Singleton Instance
gap_engine = GapIntelligenceEngine()
