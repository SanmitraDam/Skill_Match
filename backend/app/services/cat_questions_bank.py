"""
cat_questions_bank.py — Comprehensive Technical Item Bank for Computerized Adaptive Testing (CAT)
==================================================================================================
Covers Foundational (1) through Principal (5) across key engineering domains.
Every question features technical accuracy, realistic distractors, and randomized answer distribution.
"""
from typing import List, Dict, Any, Optional

TECHNICAL_QUESTIONS_BANK: List[Dict[str, Any]] = [
    # ── FASTAPI ─────────────────────────────────────────────────────────────
    {
        "id": "fastapi_l1_01",
        "skill": "FastAPI",
        "difficulty": 1,
        "question_type": "mcq",
        "question": "How does FastAPI define an incoming JSON request body schema for validation?",
        "options": [
            "By declaring a parameter with a Pydantic BaseModel class type annotation.",
            "By calling request.json_parse() manually inside each route handler.",
            "By importing Marshmallow schemas and attaching @validate_json decorators.",
            "By defining global dictionary templates in the application config."
        ],
        "correct_option_index": 0,
        "explanation": "FastAPI uses Pydantic models as type hints on path operation functions to automatically parse and validate request bodies."
    },
    {
        "id": "fastapi_l2_01",
        "skill": "FastAPI",
        "difficulty": 2,
        "question_type": "code_challenge",
        "question": "What is the primary benefit of using Depends() in the following FastAPI route?",
        "code_snippet": "from fastapi import Depends, FastAPI\n\napp = FastAPI()\n\nasync def get_db_session():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        db.close()\n\n@app.get('/items')\nasync def read_items(db = Depends(get_db_session)):\n    return db.query(Item).all()",
        "options": [
            "It guarantees automatic cleanup and closing of the database session after the response is sent via generator yield.",
            "It converts synchronous SQLAlchemy calls into non-blocking native asyncio tasks.",
            "It caches all query results in memory across different requests automatically.",
            "It bypasses connection authentication to accelerate database query throughput."
        ],
        "correct_option_index": 0,
        "explanation": "Yield dependencies in FastAPI execute the cleanup code in the 'finally' block after the request/response cycle finishes."
    },
    {
        "id": "fastapi_l3_01",
        "skill": "FastAPI",
        "difficulty": 3,
        "question_type": "mcq",
        "question": "What happens when a synchronous route handler (def instead of async def) is invoked in FastAPI?",
        "options": [
            "FastAPI offloads the handler to an external threadpool worker to prevent blocking the main asyncio event loop.",
            "The event loop is immediately frozen and all concurrent incoming HTTP requests are dropped.",
            "FastAPI automatically transpiles the synchronous code into asynchronous coroutines at runtime.",
            "A runtime TypeError is raised because FastAPI strictly forbids synchronous route handlers."
        ],
        "correct_option_index": 0,
        "explanation": "Standard 'def' route handlers are offloaded to AnyIO/Starlette threadpools so synchronous blocking calls do not stall the asyncio event loop."
    },
    {
        "id": "fastapi_l4_01",
        "skill": "FastAPI",
        "difficulty": 4,
        "question_type": "code_challenge",
        "question": "When should FastAPI BackgroundTasks be used versus a dedicated message broker like Celery or Kafka?",
        "code_snippet": "@app.post('/notify')\nasync def notify_user(email: str, background_tasks: BackgroundTasks):\n    background_tasks.add_task(send_welcome_email, email)\n    return {'status': 'queued'}",
        "options": [
            "BackgroundTasks is best for lightweight in-process tasks (like sending emails) that don't need persistence across server restarts.",
            "BackgroundTasks distributes tasks across multiple worker servers with durable acknowledgment.",
            "BackgroundTasks must be used for heavy CPU-bound machine learning training jobs.",
            "BackgroundTasks provides guaranteed exactly-once processing even if the server crashes."
        ],
        "correct_option_index": 0,
        "explanation": "FastAPI BackgroundTasks run within the same process memory; tasks are lost if the process terminates, unlike distributed brokers with durable queues."
    },
    {
        "id": "fastapi_l5_01",
        "skill": "FastAPI",
        "difficulty": 5,
        "question_type": "mcq",
        "question": "What is the recommended modern mechanism in FastAPI to manage application startup and shutdown lifecycle events?",
        "options": [
            "Using the lifespan context manager parameter on the FastAPI app instance.",
            "Declaring @app.on_event('startup') and @app.on_event('shutdown') handlers.",
            "Hooking into Python's sys.atexit registration module.",
            "Polling health endpoints from an external Docker entrypoint script."
        ],
        "correct_option_index": 0,
        "explanation": "FastAPI and Starlette have officially deprecated @app.on_event in favor of the 'lifespan' asynccontextmanager on the FastAPI constructor."
    },

    # ── PYTHON ──────────────────────────────────────────────────────────────
    {
        "id": "python_l1_01",
        "skill": "Python",
        "difficulty": 1,
        "question_type": "code_challenge",
        "question": "What is the unexpected output of the following function when called multiple times?",
        "code_snippet": "def append_value(val, items=[]):\n    items.append(val)\n    return items\n\nprint(append_value(1))\nprint(append_value(2))",
        "options": [
            "[1] then [1, 2] because default argument objects are evaluated once at function definition time.",
            "[1] then [2] because default arguments are freshly instantiated on each invocation.",
            "A NameError is thrown because items must be explicitly passed.",
            "An empty list [] followed by [2]."
        ],
        "correct_option_index": 0,
        "explanation": "Default argument expressions in Python are evaluated once when the function is defined, making mutable defaults like lists shared across all calls."
    },
    {
        "id": "python_l2_01",
        "skill": "Python",
        "difficulty": 2,
        "question_type": "mcq",
        "question": "Why does a generator expression consume dramatically less memory than a list comprehension for 10 million integers?",
        "options": [
            "Generators yield elements lazily one-at-a-time on demand instead of allocating the entire array in RAM.",
            "Generators compress numbers in memory using zlib compression.",
            "Generators offload array storage into operating system swap disk partitions.",
            "Generators enforce garbage collection after every arithmetic operation."
        ],
        "correct_option_index": 0,
        "explanation": "Generators adhere to the iterator protocol, maintaining only the current state and yielding values lazily on demand."
    },
    {
        "id": "python_l3_01",
        "skill": "Python",
        "difficulty": 3,
        "question_type": "mcq",
        "question": "How does the Python Global Interpreter Lock (GIL) influence multi-threaded execution in standard CPython?",
        "options": [
            "It restricts bytecode execution to one native thread at a time, limiting multi-threaded speedups for CPU-bound tasks.",
            "It prevents all I/O bound operations from executing concurrently across multiple threads.",
            "It automatically converts multi-threaded programs into distributed worker clusters.",
            "It forces all memory allocations to be serialized into a single SQLite database."
        ],
        "correct_option_index": 0,
        "explanation": "The CPython GIL ensures thread-safety for memory management by permitting only one thread to execute Python bytecode at any given instant."
    },
    {
        "id": "python_l4_01",
        "skill": "Python",
        "difficulty": 4,
        "question_type": "code_challenge",
        "question": "What does __init_subclass__ accomplish in modern Python architectures?",
        "code_snippet": "class PluginBase:\n    registry = {}\n    def __init_subclass__(cls, plugin_name, **kwargs):\n        super().__init_subclass__(**kwargs)\n        cls.registry[plugin_name] = cls\n\nclass AudioPlugin(PluginBase, plugin_name='audio_dsp'):\n    pass",
        "options": [
            "It provides a clean, readable alternative to metaclasses for customizing class creation and automated plugin registration.",
            "It automatically instantiates a singleton instance of the subclass upon module import.",
            "It converts all methods of the subclass into asynchronous static methods.",
            "It overrides the subclass __del__ destructor to prevent memory leaks."
        ],
        "correct_option_index": 0,
        "explanation": "__init_subclass__ is called whenever a subclass of the defining class is created, allowing easy validation and registration without full metaclass complexity."
    },
    {
        "id": "python_l5_01",
        "skill": "Python",
        "difficulty": 5,
        "question_type": "code_challenge",
        "question": "In asyncio, what happens if an active coroutine catches asyncio.CancelledError and fails to re-raise it?",
        "code_snippet": "async def worker():\n    try:\n        await asyncio.sleep(10)\n    except asyncio.CancelledError:\n        print('Caught cancellation')\n        # Missing re-raise",
        "options": [
            "The calling task cancellation is swallowed, causing the orchestrator to believe the task completed normally instead of cancelled.",
            "Python raises a fatal SystemExit exception immediately.",
            "The event loop terminates and restarts with a new PID.",
            "The coroutine resumes execution from the top of the function."
        ],
        "correct_option_index": 0,
        "explanation": "If CancelledError is caught and not re-raised, the task suppresses the cancellation signal, breaking structured concurrency invariants."
    },

    # ── POSTGRESQL & SQL ────────────────────────────────────────────────────
    {
        "id": "sql_l1_01",
        "skill": "PostgreSQL",
        "difficulty": 1,
        "question_type": "mcq",
        "question": "What is the primary difference between INNER JOIN and LEFT OUTER JOIN in SQL?",
        "options": [
            "INNER JOIN returns only matching rows from both tables; LEFT JOIN returns all rows from the left table and matched rows from the right.",
            "INNER JOIN operates only on integer primary keys; LEFT JOIN operates on text fields.",
            "LEFT JOIN drops all rows that contain NULL attributes in any column.",
            "INNER JOIN creates a temporary physical table on disk; LEFT JOIN operates strictly in RAM."
        ],
        "correct_option_index": 0,
        "explanation": "INNER JOIN requires predicate matches on both sides; LEFT JOIN preserves all left-side records, filling unmatched right-side columns with NULLs."
    },
    {
        "id": "sql_l2_01",
        "skill": "PostgreSQL",
        "difficulty": 2,
        "question_type": "mcq",
        "question": "Which index type in PostgreSQL is specifically optimized for JSONB containment (@>) and full-text search operators?",
        "options": [
            "GIN (Generalized Inverted Index)",
            "Standard B-Tree Index",
            "Hash Index",
            "BRIN (Block Range Index)"
        ],
        "correct_option_index": 0,
        "explanation": "GIN indexes are designed for composite values (arrays, documents, JSONB) where keys and elements need to be indexed individually."
    },
    {
        "id": "sql_l3_01",
        "skill": "PostgreSQL",
        "difficulty": 3,
        "question_type": "mcq",
        "question": "What concurrency phenomenon is prevented by REPEATABLE READ isolation level that can occur in READ COMMITTED in PostgreSQL?",
        "options": [
            "Non-repeatable reads (where reading the same row twice within a transaction yields different values due to committed updates).",
            "Dirty reads (reading uncommitted data written by concurrent transactions).",
            "Deadlocks between concurrent foreign key inserts.",
            "Table corruption during unexpected hardware power loss."
        ],
        "correct_option_index": 0,
        "explanation": "Under REPEATABLE READ, a transaction sees a snapshot as of the transaction start, preventing non-repeatable reads. (PostgreSQL avoids dirty reads even at READ COMMITTED)."
    },
    {
        "id": "sql_l4_01",
        "skill": "PostgreSQL",
        "difficulty": 4,
        "question_type": "code_challenge",
        "question": "What is the effect of declarative table partitioning (PARTITION BY RANGE) on high-volume time-series tables in PostgreSQL?",
        "code_snippet": "CREATE TABLE telemetry_events (\n    id bigint,\n    event_time timestamptz NOT NULL,\n    payload jsonb\n) PARTITION BY RANGE (event_time);",
        "options": [
            "It enables Partition Pruning, allowing the query planner to bypass scanning irrelevant physical partition tables entirely.",
            "It replicates the table across multiple PostgreSQL cluster read replicas automatically.",
            "It encrypts individual rows with AES-256 before writing to disk.",
            "It prevents any write locks from being acquired during concurrent transactions."
        ],
        "correct_option_index": 0,
        "explanation": "Partition pruning allows PostgreSQL's optimizer to skip scanning partition tables whose range constraints exclude the query's WHERE filter."
    },
    {
        "id": "sql_l5_01",
        "skill": "PostgreSQL",
        "difficulty": 5,
        "question_type": "mcq",
        "question": "Why does PostgreSQL require VACUUM operations, and what problem does autovacuum address under high write loads?",
        "options": [
            "PostgreSQL's Multi-Version Concurrency Control (MVCC) leaves dead row versions on disk during UPDATEs and DELETEs that must be reclaimed.",
            "PostgreSQL runs out of memory unless query logs are periodically erased from the shared buffer pool.",
            "PostgreSQL WAL logs must be written to external tape drives every 10,000 transactions.",
            "PostgreSQL requires periodic schema recompilation to maintain B-tree index parity."
        ],
        "correct_option_index": 0,
        "explanation": "Under MVCC, updates append new tuples and mark old ones as dead. VACUUM reclaims dead tuple storage to prevent table bloat and transaction ID wraparound."
    },

    # ── DOCKER & CONTAINERS ─────────────────────────────────────────────────
    {
        "id": "docker_l1_01",
        "skill": "Docker",
        "difficulty": 1,
        "question_type": "mcq",
        "question": "What is the key difference between the CMD and ENTRYPOINT directives in a Dockerfile?",
        "options": [
            "ENTRYPOINT defines the executable to run; CMD provides default arguments that can be easily overridden from the command line.",
            "CMD executes during image build time; ENTRYPOINT executes when the container starts.",
            "ENTRYPOINT runs as root, while CMD always drops root privileges.",
            "CMD supports multi-threading, while ENTRYPOINT runs as a single-threaded process."
        ],
        "correct_option_index": 0,
        "explanation": "ENTRYPOINT sets the default command and container purpose, while CMD provides arguments that can be overridden by docker run arguments."
    },
    {
        "id": "docker_l2_01",
        "skill": "Docker",
        "difficulty": 2,
        "question_type": "code_challenge",
        "question": "Why is the following multi-stage Dockerfile pattern considered a best practice for production deployments?",
        "code_snippet": "FROM node:20 AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine AS runner\nWORKDIR /app\nCOPY --from=builder /app/.next ./.next\nCOPY --from=builder /app/public ./public\nCMD ['node', 'server.js']",
        "options": [
            "It excludes source code, compilers, and heavy build tools from the final image, drastically reducing size and attack surface.",
            "It compiles the JavaScript code directly into binary x86 machine instructions.",
            "It bypasses Linux kernel cgroups to maximize container CPU allocation.",
            "It automatically configures multi-region CDN edge caching for the Next.js static assets."
        ],
        "correct_option_index": 0,
        "explanation": "Multi-stage builds leave compilers, devDependencies, and build caches behind in intermediate stages, producing minimal, secure production images."
    },
    {
        "id": "docker_l3_01",
        "skill": "Docker",
        "difficulty": 3,
        "question_type": "mcq",
        "question": "Why should COPY requirements.txt /app/ and RUN pip install be placed before COPY . /app in a Python Dockerfile?",
        "options": [
            "To leverage Docker layer caching so dependency installation is skipped when only source code files change.",
            "Because Python fails to install wheels if source files are present in the working directory.",
            "To prevent requirements.txt from being overwritten by git revision tags.",
            "To allow Docker to parallelize the pip installation with the git checkout."
        ],
        "correct_option_index": 0,
        "explanation": "Docker invalidates cache layers from the first modified instruction downward; copying requirements first prevents re-running slow pip installs on every code edit."
    },
    {
        "id": "docker_l4_01",
        "skill": "Docker",
        "difficulty": 4,
        "question_type": "mcq",
        "question": "What security risk does running containerized processes as root (UID 0) pose, even with container isolation?",
        "options": [
            "If an attacker achieves container breakout via a kernel vulnerability, they immediately hold root privileges on the underlying host.",
            "Root containers are prevented from opening network connections to external databases.",
            "Docker enforces a 512MB RAM cap on all processes running as UID 0.",
            "Linux cgroups automatically terminate root containers after 24 hours of uptime."
        ],
        "correct_option_index": 0,
        "explanation": "Container UID 0 maps directly to host root unless user namespaces (userns-remap) are configured, granting root access to the host upon container escape."
    },
    {
        "id": "docker_l5_01",
        "skill": "Docker",
        "difficulty": 5,
        "question_type": "mcq",
        "question": "Why can running a Node or Python app as PID 1 inside a container cause zombie process accumulation and ignored SIGTERM signals?",
        "options": [
            "Linux treats PID 1 specially; default signal handlers for SIGTERM are disabled unless explicitly handled, and PID 1 must reap orphaned children.",
            "Linux cgroups do not permit PID 1 processes to execute system calls.",
            "Docker disables garbage collection for any process assigned PID 1.",
            "Node.js memory heap allocations are halved when running as PID 1."
        ],
        "correct_option_index": 0,
        "explanation": "PID 1 is the init process in Unix: it must reap orphaned child processes and handle signals. Standard runtimes often ignore SIGTERM unless using an init system like tini or dumb-init."
    },

    # ── REDIS & CACHING ─────────────────────────────────────────────────────
    {
        "id": "redis_l1_01",
        "skill": "Redis",
        "difficulty": 1,
        "question_type": "mcq",
        "question": "What is the primary operational advantage of Redis compared to a relational database like PostgreSQL for session storage?",
        "options": [
            "In-memory key-value architecture delivering sub-millisecond read/write latency.",
            "Strict ACID compliance across multi-table foreign key cascades.",
            "Unlimited relational schema flexibility with SQL joins.",
            "Permanent physical persistence with zero memory consumption."
        ],
        "correct_option_index": 0,
        "explanation": "Redis stores all working data in RAM with optimized in-memory data structures, providing microsecond responses ideal for session state."
    },
    {
        "id": "redis_l2_01",
        "skill": "Redis",
        "difficulty": 2,
        "question_type": "mcq",
        "question": "How does the Cache-Aside (Lazy Loading) caching pattern handle a cache miss?",
        "options": [
            "The application queries the database, writes the result to the cache with a TTL, and returns the data to the caller.",
            "The cache automatically intercepts the database connection and synchronously updates all replicas.",
            "The database rejects the query until the cache warmup background job finishes.",
            "The application returns a 404 HTTP status to force the client to retry."
        ],
        "correct_option_index": 0,
        "explanation": "In Cache-Aside, the application first checks the cache; on miss, it reads from the source DB, populates the cache for subsequent requests, and returns data."
    },
    {
        "id": "redis_l3_01",
        "skill": "Redis",
        "difficulty": 3,
        "question_type": "mcq",
        "question": "Why should Lua scripts or Redis Transactions (MULTI/EXEC) be used when implementing a distributed counter with threshold limits?",
        "options": [
            "To guarantee atomic execution on the Redis server without race conditions between the GET and INCR operations.",
            "To enable relational SQL queries over the Redis key namespace.",
            "To replicate the counter to AWS S3 before returning the response.",
            "To bypass network encryption and accelerate TCP transmission."
        ],
        "correct_option_index": 0,
        "explanation": "Redis executes Lua scripts as a single atomic unit, preventing concurrent clients from interleaving commands and causing race conditions."
    },
    {
        "id": "redis_l4_01",
        "skill": "Redis",
        "difficulty": 4,
        "question_type": "mcq",
        "question": "What happens when Redis memory reaches maxmemory under the allkeys-lru eviction policy?",
        "options": [
            "Redis evicts the least recently used keys among all keys to free space for new writes.",
            "Redis rejects all write commands with an OOM error while keeping existing keys untouched.",
            "Redis evicts only keys that have an explicit expiration TTL configured.",
            "Redis writes all in-memory keys into cold tape storage and crashes."
        ],
        "correct_option_index": 0,
        "explanation": "'allkeys-lru' evicts least recently used keys across the entire dataset regardless of TTL to make room for incoming write commands."
    },
    {
        "id": "redis_l5_01",
        "skill": "Redis",
        "difficulty": 5,
        "question_type": "mcq",
        "question": "What is the difference between Redis RDB snapshots and AOF (Append-Only File) persistence modes?",
        "options": [
            "RDB creates point-in-time binary snapshots at intervals; AOF logs every write operation sequentially for minimal data loss.",
            "RDB operates only on text keys, while AOF operates on binary blobs.",
            "AOF stores all data in PostgreSQL; RDB stores data in MySQL.",
            "RDB provides zero data loss guarantees under sudden power failure; AOF loses up to 1 hour of writes."
        ],
        "correct_option_index": 0,
        "explanation": "RDB captures periodic compact snapshots (great for disaster recovery), whereas AOF records an append log of operations (fsync every second) for minimal data loss."
    },

    # ── DISTRIBUTED SYSTEMS & CONCURRENCY ──────────────────────────────────
    {
        "id": "dist_l1_01",
        "skill": "Distributed Systems",
        "difficulty": 1,
        "question_type": "mcq",
        "question": "According to Eric Brewer's CAP Theorem, what must a distributed system sacrifice when a network partition (P) occurs?",
        "options": [
            "It must choose between Consistency (all nodes see same data) or Availability (every request receives a response).",
            "It must sacrifice Security or Performance.",
            "It must sacrifice horizontal scalability.",
            "It must permanently drop all in-flight TCP connections."
        ],
        "correct_option_index": 0,
        "explanation": "Network partitions are unavoidable in distributed physical networks; systems must therefore choose between consistency (CP) or availability (AP) during partitions."
    },
    {
        "id": "dist_l2_01",
        "skill": "Distributed Systems",
        "difficulty": 2,
        "question_type": "mcq",
        "question": "Why are Idempotency Keys essential in distributed payment and order processing architectures?",
        "options": [
            "They allow network retries of payment requests without creating duplicate charges or records.",
            "They encrypt credit card numbers in compliance with PCI-DSS.",
            "They compress JSON payloads to minimize egress bandwidth.",
            "They route HTTP requests to the physically closest geographic datacenter."
        ],
        "correct_option_index": 0,
        "explanation": "Idempotency keys ensure that submitting the same request multiple times (e.g. after a client network timeout) produces the same single side-effect."
    },
    {
        "id": "dist_l3_01",
        "skill": "Distributed Systems",
        "difficulty": 3,
        "question_type": "mcq",
        "question": "How does a Circuit Breaker pattern (Closed, Open, Half-Open) protect a microservices architecture during downstream failures?",
        "options": [
            "It fails fast and blocks calls to an unhealthy downstream service once a failure threshold is crossed, allowing it time to recover.",
            "It automatically increases database connection pool limits to 10,000.",
            "It encrypts all network packets using RSA 4096-bit keys.",
            "It redirects all failing traffic into an unmonitored dead-end queue."
        ],
        "correct_option_index": 0,
        "explanation": "Circuit breakers trip to 'Open' on repeated downstream timeouts/errors, failing fast and preventing cascading resource exhaustion across the caller fleet."
    },
    {
        "id": "dist_l4_01",
        "skill": "Distributed Systems",
        "difficulty": 4,
        "question_type": "mcq",
        "question": "What is the minimum quorum required to elect a new leader and commit log entries in a Raft consensus cluster of 5 nodes?",
        "options": [
            "3 nodes (a strict majority: floor(N/2) + 1)",
            "5 nodes (unanimous agreement)",
            "2 nodes (simple plural agreement)",
            "1 node (the designated master)"
        ],
        "correct_option_index": 0,
        "explanation": "Raft and Paxos require a strict majority quorum of (N/2 + 1) nodes (3 out of 5) to prevent split-brain dual-leader scenarios."
    },
    {
        "id": "dist_l5_01",
        "skill": "Distributed Systems",
        "difficulty": 5,
        "question_type": "mcq",
        "question": "Why is the Saga Pattern preferred over Two-Phase Commit (2PC) in modern decoupled distributed cloud microservices?",
        "options": [
            "2PC is a blocking protocol that holds distributed database locks until coordinator commit, creating high latency and single-point-of-failure risks.",
            "2PC cannot handle transactions involving more than two tables in PostgreSQL.",
            "The Saga pattern guarantees strict ACID serializability without compensating actions.",
            "The Saga pattern requires zero network calls between services."
        ],
        "correct_option_index": 0,
        "explanation": "2PC coordinators hold locks across all participating services until global consensus, causing severe bottlenecks and cascading stalls if any participant or coordinator fails."
    },

    # ── KUBERNETES & CLOUD ──────────────────────────────────────────────────
    {
        "id": "k8s_l1_01",
        "skill": "Kubernetes",
        "difficulty": 1,
        "question_type": "mcq",
        "question": "What is the distinct function of a Kubernetes Readiness Probe compared to a Liveness Probe?",
        "options": [
            "Readiness determines if the Pod should receive traffic via Services; Liveness determines if the container must be restarted.",
            "Readiness starts the container; Liveness builds the Docker image.",
            "Readiness monitors CPU temperature; Liveness monitors disk storage space.",
            "Readiness is configured for stateful databases only; Liveness is for stateless APIs."
        ],
        "correct_option_index": 0,
        "explanation": "A failing readiness probe removes the Pod from Service endpoints without killing it; a failing liveness probe triggers container restart."
    },
    {
        "id": "k8s_l2_01",
        "skill": "Kubernetes",
        "difficulty": 2,
        "question_type": "mcq",
        "question": "When configuring a Horizontal Pod Autoscaler (HPA), what resource metric is most commonly targeted for web services?",
        "options": [
            "Average CPU and Memory utilization percentages against Pod resource requests.",
            "Network card physical interface temperature.",
            "Number of lines written to stdout container logs per hour.",
            "Total disk space used by node operating system kernels."
        ],
        "correct_option_index": 0,
        "explanation": "HPA computes the ratio of current Pod metrics (CPU/Memory) against the declared Pod 'requests' to scale replica counts up or down."
    },
    {
        "id": "k8s_l3_01",
        "skill": "Kubernetes",
        "difficulty": 3,
        "question_type": "mcq",
        "question": "Why do distributed databases like Cassandra or CockroachDB use StatefulSets instead of Deployments in Kubernetes?",
        "options": [
            "StatefulSets provide stable network identities (pod-0, pod-1) and persistent volume attachments that survive Pod rescheduling.",
            "Deployments do not support container volumes of any kind.",
            "StatefulSets disable all CPU throttling across worker nodes.",
            "Deployments terminate all Pods simultaneously whenever an environment variable changes."
        ],
        "correct_option_index": 0,
        "explanation": "StatefulSets maintain persistent unique network identities and 1-to-1 persistent volume claims across restarts, crucial for distributed cluster membership."
    },
    {
        "id": "k8s_l4_01",
        "skill": "Kubernetes",
        "difficulty": 4,
        "question_type": "mcq",
        "question": "What does a PodDisruptionBudget (PDB) ensure during voluntary cluster operations like node upgrades or drains?",
        "options": [
            "It guarantees that a specified minimum number or percentage of replicas remain online simultaneously during maintenance.",
            "It prevents developers from deleting deployments in production namespaces.",
            "It automatically rolls back git commits when build errors occur.",
            "It caps cloud infrastructure billing costs at an exact dollar budget."
        ],
        "correct_option_index": 0,
        "explanation": "PDBs limit the number of concurrently disrupted Pods during administrative node drains, preserving high availability during cluster upgrades."
    },
    {
        "id": "k8s_l5_01",
        "skill": "Kubernetes",
        "difficulty": 5,
        "question_type": "mcq",
        "question": "What is the effect of applying a Kubernetes NetworkPolicy with an empty ingress ({}) selector in a namespace?",
        "options": [
            "It enforces a default-deny rule, isolating all Pods and rejecting all ingress traffic unless explicitly whitelisted.",
            "It exposes all namespace Pods directly to the public internet.",
            "It disables TLS certificate validation for all Service meshes.",
            "It redirects all network packets through the kube-dns CoreDNS resolver."
        ],
        "correct_option_index": 0,
        "explanation": "An empty ingress specification acts as a default-deny policy, isolating pods from all incoming traffic except what other NetworkPolicy rules explicitly permit."
    },

    # ── TYPESCRIPT & REACT ──────────────────────────────────────────────────
    {
        "id": "ts_l1_01",
        "skill": "TypeScript",
        "difficulty": 1,
        "question_type": "mcq",
        "question": "What is the primary difference between any and unknown in TypeScript?",
        "options": [
            "unknown is type-safe; values must be narrowed via type guards before performing operations, whereas any disables all compiler checks.",
            "any can only represent primitive types, while unknown represents object types.",
            "unknown is converted to a string at runtime; any is stripped completely.",
            "any is strictly prohibited in TypeScript 5+."
        ],
        "correct_option_index": 0,
        "explanation": "unknown represents any possible value safely: you cannot access properties or call methods on unknown without first performing type narrowing."
    },
    {
        "id": "ts_l2_01",
        "skill": "React",
        "difficulty": 2,
        "question_type": "code_challenge",
        "question": "What common bug occurs in the following React component?",
        "code_snippet": "function Counter() {\n    const [count, setCount] = useState(0);\n    useEffect(() => {\n        const timer = setInterval(() => {\n            setCount(count + 1);\n        }, 1000);\n        return () => clearInterval(timer);\n    }, []);\n    return <div>{count}</div>;\n}",
        "options": [
            "A stale closure captures the initial count (0); the counter reaches 1 and never increments further.",
            "An infinite re-render loop crashes the browser immediately.",
            "setInterval cannot be invoked inside React useEffect hooks.",
            "The cleanup function throws a runtime exception."
        ],
        "correct_option_index": 0,
        "explanation": "With an empty dependency array [], count is closed over at value 0; calling setCount(0 + 1) continuously sets the count to 1. Solution: setCount(c => c + 1)."
    },
    {
        "id": "ts_l3_01",
        "skill": "React",
        "difficulty": 3,
        "question_type": "mcq",
        "question": "How does React 18's useTransition hook improve user perceived performance during heavy UI updates?",
        "options": [
            "It marks state updates as non-urgent transitions, keeping the main thread responsive to urgent user input like typing or clicking.",
            "It offloads React component rendering into Web Workers.",
            "It memoizes all DOM nodes in IndexedDB storage.",
            "It replaces virtual DOM reconciliation with manual imperative DOM mutations."
        ],
        "correct_option_index": 0,
        "explanation": "useTransition tells React that an update can be interrupted by higher-priority urgent events (like keystrokes), preventing UI lag."
    },
    {
        "id": "ts_l4_01",
        "skill": "TypeScript",
        "difficulty": 4,
        "question_type": "code_challenge",
        "question": "What TypeScript utility type pattern ensures exhaustive type checking in a switch statement over a discriminated union?",
        "code_snippet": "type Action = { type: 'INCREMENT' } | { type: 'DECREMENT' } | { type: 'RESET' };\n\nfunction reducer(state: number, action: Action): number {\n    switch (action.type) {\n        case 'INCREMENT': return state + 1;\n        case 'DECREMENT': return state - 1;\n        case 'RESET': return 0;\n        default:\n            const _exhaustive: never = action;\n            return _exhaustive;\n    }\n}",
        "options": [
            "Assigning the unhandled case to type never triggers a compile-time error if any union member is omitted.",
            "It casts the action to unknown at runtime to prevent JavaScript exceptions.",
            "It forces the reducer to execute synchronously in WebAssembly.",
            "It disables strict null checks for the default branch."
        ],
        "correct_option_index": 0,
        "explanation": "Because 'never' cannot hold any value, assigning an unhandled union case to 'never' causes the TypeScript compiler to throw a compile error if a case is missing."
    },
    {
        "id": "ts_l5_01",
        "skill": "React",
        "difficulty": 5,
        "question_type": "mcq",
        "question": "What is the structural difference between React's Render Phase and Commit Phase in the Fiber architecture?",
        "options": [
            "The Render Phase is asynchronous and can be paused or aborted by React; the Commit Phase is synchronous and writes changes to the actual DOM.",
            "The Render Phase writes to the DOM; the Commit Phase evaluates JSX expressions.",
            "The Commit Phase runs on the server; the Render Phase runs on the client browser.",
            "The Render Phase only executes once when the page loads."
        ],
        "correct_option_index": 0,
        "explanation": "React Fiber can yield during the interruptible Render phase while computing the work-in-progress tree; the Commit phase then synchronously flushes DOM mutations."
    },

    # ── KAFKA & EVENT-DRIVEN ARCHITECTURE ───────────────────────────────────
    {
        "id": "kafka_l1_01",
        "skill": "Kafka",
        "difficulty": 1,
        "question_type": "mcq",
        "question": "How does Apache Kafka achieve horizontal read scaling across multiple consumers processing the same topic?",
        "options": [
            "By partitioning topics, where each partition is assigned to exactly one consumer within a Consumer Group.",
            "By broadcasting every single message to all connected database clients.",
            "By converting messages into HTTP GET polling endpoints.",
            "By caching all messages in the browser service worker."
        ],
        "correct_option_index": 0,
        "explanation": "Within a consumer group, Kafka assigns individual partitions exclusively to single consumer instances, enabling linear horizontal read scaling."
    },
    {
        "id": "kafka_l2_01",
        "skill": "Kafka",
        "difficulty": 2,
        "question_type": "mcq",
        "question": "What guarantees does Kafka provide regarding the order of messages in a topic?",
        "options": [
            "Messages are strictly ordered within a single partition, but not across different partitions.",
            "Messages are guaranteed to be globally ordered across all topics and partitions.",
            "Messages are ordered alphabetically by key across the entire cluster.",
            "Kafka provides zero ordering guarantees under any configuration."
        ],
        "correct_option_index": 0,
        "explanation": "Kafka guarantees strict total order only within a single partition. Messages with the same partition key always land in the same partition in order."
    },
    {
        "id": "kafka_l3_01",
        "skill": "Kafka",
        "difficulty": 3,
        "question_type": "mcq",
        "question": "What producer configuration enables Exactly-Once Semantics (EOS) to prevent duplicate writes during network retries in Kafka?",
        "options": [
            "Setting enable.idempotence=true and acks=all on the Kafka producer.",
            "Setting compression.type=gzip and batch.size=1.",
            "Setting retries=0 and linger.ms=1000.",
            "Setting max.in.flight.requests.per.connection=100 without a transaction coordinator."
        ],
        "correct_option_index": 0,
        "explanation": "Idempotent producers assign Producer IDs (PIDs) and sequence numbers to every batch; brokers discard duplicate sequence numbers during retries."
    },
    {
        "id": "kafka_l4_01",
        "skill": "Kafka",
        "difficulty": 4,
        "question_type": "mcq",
        "question": "What is Consumer Lag in a streaming architecture and why is it a critical operational metric?",
        "options": [
            "The delta between the latest message offset written to a partition and the current offset committed by the consumer group.",
            "The time taken for a producer to establish an SSL handshake with the broker.",
            "The physical distance in miles between Kafka broker racks.",
            "The percentage of messages dropped due to invalid schema serialization."
        ],
        "correct_option_index": 0,
        "explanation": "Consumer lag quantifies backlog: a growing lag indicates consumers are processing slower than producers are publishing, signaling impending SLA breaches."
    },
    {
        "id": "kafka_l5_01",
        "skill": "Kafka",
        "difficulty": 5,
        "question_type": "mcq",
        "question": "How does the Cooperative Sticky Assignor mitigate Consumer Rebalance Storms in large Kafka consumer fleets?",
        "options": [
            "It rebalances incrementally: consumers retain healthy partition assignments and only revoke partitions being migrated.",
            "It drops all in-flight consumer offsets to restart the entire consumer group from offset 0.",
            "It halts all producer traffic across the entire cluster during rebalances.",
            "It converts Kafka partitions into synchronous RPC endpoints."
        ],
        "correct_option_index": 0,
        "explanation": "Unlike the eager assignor (which revokes all partitions and stops the world), the cooperative protocol migrates only reassigned partitions, keeping the rest streaming."
    },

    # ── SYSTEM DESIGN & ALGORITHMS ──────────────────────────────────────────
    {
        "id": "sys_l1_01",
        "skill": "System Design",
        "difficulty": 1,
        "question_type": "mcq",
        "question": "What is the primary difference between horizontal scaling and vertical scaling?",
        "options": [
            "Horizontal scaling adds more instances/nodes to distribute the load; vertical scaling adds more CPU/RAM to an existing single machine.",
            "Horizontal scaling applies only to databases; vertical scaling applies to web servers.",
            "Vertical scaling eliminates single points of failure, while horizontal scaling introduces them.",
            "Horizontal scaling requires rewriting all application code into C++."
        ],
        "correct_option_index": 0,
        "explanation": "Horizontal scaling (scale-out) adds commodity nodes; vertical scaling (scale-up) increases physical hardware specifications on a single server."
    },
    {
        "id": "sys_l2_01",
        "skill": "System Design",
        "difficulty": 2,
        "question_type": "mcq",
        "question": "How does a Token Bucket algorithm regulate bursty traffic in an API rate limiter?",
        "options": [
            "Tokens refill at a steady constant rate up to bucket capacity; each request consumes a token and bursts are permitted up to capacity.",
            "Requests are queued in a FIFO queue and delayed by exactly 1000ms each.",
            "All incoming requests above 10 per minute are immediately logged to disk and dropped.",
            "The bucket resets all counts to zero whenever a 500 error occurs."
        ],
        "correct_option_index": 0,
        "explanation": "Token bucket permits bursts up to bucket capacity while enforcing an average refill rate, making it the industry standard for API rate limiters."
    },
    {
        "id": "sys_l3_01",
        "skill": "System Design",
        "difficulty": 3,
        "question_type": "mcq",
        "question": "Why is a Bloom Filter utilized in front of high-volume storage systems like Cassandra and Bigtable?",
        "options": [
            "It provides fast, probabilistic negative lookups to determine if a key definitely does NOT exist on disk, avoiding expensive disk I/O.",
            "It encrypts all data files written to solid-state drives.",
            "It automatically compresses database rows with snappy compression.",
            "It creates exact cryptographic signatures verifying user identities."
        ],
        "correct_option_index": 0,
        "explanation": "Bloom filters test set membership with zero false negatives: if the filter reports an item is absent, disk reads are safely bypassed."
    },
    {
        "id": "sys_l4_01",
        "skill": "System Design",
        "difficulty": 4,
        "question_type": "mcq",
        "question": "What problem does Consistent Hashing with virtual nodes solve in distributed caching clusters (e.g. Memcached, DynamoDB)?",
        "options": [
            "It minimizes key re-mapping when cluster nodes are added or removed, and ensures uniform load distribution across nodes.",
            "It guarantees strict linearizable consistency across all replicas.",
            "It converts asynchronous network requests into synchronous socket connections.",
            "It reduces memory consumption of stored strings by 80%."
        ],
        "correct_option_index": 0,
        "explanation": "Consistent hashing maps nodes and keys to a hash ring; adding or removing a node only migrates K/N keys rather than re-hashing all keys."
    },
    {
        "id": "sys_l5_01",
        "skill": "System Design",
        "difficulty": 5,
        "question_type": "mcq",
        "question": "In a distributed transaction utilizing the Two-Phase Commit protocol, what catastrophic failure mode can cause indefinite blocking?",
        "options": [
            "If the coordinator crashes after nodes have prepared (voted YES) but before emitting the global COMMIT decision.",
            "If any client submits two requests with the same transaction ID.",
            "If the network latency between two worker nodes drops below 1 millisecond.",
            "If a participant node runs an automatic database backup during voting."
        ],
        "correct_option_index": 0,
        "explanation": "Participants in 2PC hold locks in the prepared state waiting for the coordinator's verdict; if the coordinator dies permanently, participants block indefinitely."
    }
]


def get_unasked_question(
    skill: str,
    difficulty: int,
    asked_question_ids: set
) -> Optional[Dict[str, Any]]:
    """
    Selects the best matching question for the targeted skill and difficulty
    that has NOT been asked in the current session.
    """
    skill_lower = skill.lower()

    # 1. Exact skill & exact difficulty match
    exact_matches = [
        q for q in TECHNICAL_QUESTIONS_BANK
        if q["id"] not in asked_question_ids
        and (skill_lower in q["skill"].lower() or q["skill"].lower() in skill_lower)
        and q["difficulty"] == difficulty
    ]
    if exact_matches:
        return exact_matches[0]

    # 2. Exact skill, adjacent difficulty (diff +- 1)
    adjacent_matches = [
        q for q in TECHNICAL_QUESTIONS_BANK
        if q["id"] not in asked_question_ids
        and (skill_lower in q["skill"].lower() or q["skill"].lower() in skill_lower)
        and abs(q["difficulty"] - difficulty) <= 1
    ]
    if adjacent_matches:
        return adjacent_matches[0]

    # 3. Exact skill, any difficulty
    any_diff_matches = [
        q for q in TECHNICAL_QUESTIONS_BANK
        if q["id"] not in asked_question_ids
        and (skill_lower in q["skill"].lower() or q["skill"].lower() in skill_lower)
    ]
    if any_diff_matches:
        return any_diff_matches[0]

    # 4. Related domain at target difficulty
    domain_matches = [
        q for q in TECHNICAL_QUESTIONS_BANK
        if q["id"] not in asked_question_ids
        and q["difficulty"] == difficulty
    ]
    if domain_matches:
        return domain_matches[0]

    # 5. Any unasked question remaining in bank
    remaining = [q for q in TECHNICAL_QUESTIONS_BANK if q["id"] not in asked_question_ids]
    if remaining:
        return remaining[0]

    return None
