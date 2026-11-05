"""Curated seed data for the SkillMatch question bank.

30 market-hot skills (2026 job market), each with 10 core concepts and a
concise reference blurb. The build script expands these into 400,000+
question/answer rows via templates x difficulty x market scenarios.
Build script collects every module-level dict named SKILL_*.
"""

SKILL_PYTHON = {
    "category": "programming_language",
    "market_demand": 0.98,
    "concepts": [
        ("the GIL and concurrency model", "The GIL lets only one thread run Python bytecode at a time, so CPU-bound work uses multiprocessing while I/O-bound work thrives with threading or asyncio."),
        ("the asyncio event loop", "A single-threaded cooperative scheduler that runs coroutines, ideal for high-concurrency I/O such as APIs, websockets, and proxies."),
        ("decorators and metaclasses", "Callable wrappers and class factories enabling clean cross-cutting concerns like auth, caching, retries, and validation."),
        ("generators and iterators", "Lazy, memory-efficient sequences that stream data item by item instead of materializing full lists in memory."),
        ("memory management and garbage collection", "Reference counting plus a cyclic garbage collector that manages object lifetimes and detects reference leaks."),
        ("type hints and static checking", "Optional annotations checked by mypy or pyright improving IDE support, refactoring safety, and catching bugs before runtime."),
        ("packaging and dependency management", "pyproject.toml, wheels, and locked virtual environments that guarantee reproducible builds from laptop to production."),
        ("testing with pytest", "Fixtures, parametrization, and a rich plugin ecosystem enabling fast readable unit, integration, and property-based tests."),
        ("performance optimization and native extensions", "Cython, NumPy vectorization, and C bindings that bypass interpreter overhead on hot paths."),
        ("dataclasses and Pydantic models", "Declarative data structures with validation, serialization, and immutability for robust configuration and API contracts."),
    ],
}

SKILL_TYPESCRIPT = {
    "category": "programming_language",
    "market_demand": 0.97,
    "concepts": [
        ("structural typing and type narrowing", "Type compatibility is shape-based, and narrowing with guards gives the compiler precise knowledge inside conditional branches."),
        ("generics and conditional types", "Parameterized types plus conditional and mapped types let you build reusable, type-safe abstractions like ORM models and API clients."),
        ("union and discriminated types", "Discriminated unions encode mutually exclusive states exhaustively, letting the compiler force handling of every case."),
        ("async patterns and Promises", "Promise composition, async/await, and cancellation via AbortController shape reliable concurrent frontend and Node code."),
        ("configuration and strictness flags", "tsconfig strict mode, incremental builds, and isolatedModules catch whole bug classes before code ever runs."),
        ("module systems and bundling", "ESM interop with CommonJS plus tree-shaking bundlers controls payload size and load order in production builds."),
        ("runtime validation with Zod and io-ts", "Types vanish at runtime, so schema validation libraries guarantee external data actually matches declared interfaces."),
        ("tooling with ESLint and Prettier", "Consistent lint rules and formatting enforce team conventions and prevent low-value review debates."),
        ("declaration files and library typing", "Well-crafted .d.ts files and generic public APIs make libraries discoverable and safe for consumers."),
        ("performance of compile-time computation", "Deep recursive conditional types can explode compile time, so complexity must be bounded in large codebases."),
    ],
}

SKILL_GO = {
    "category": "programming_language",
    "market_demand": 0.9,
    "concepts": [
        ("goroutines and the scheduler", "Goroutines are cheap multiplexed threads on M:N scheduler, enabling massive concurrency with tiny stacks."),
        ("channels and the memory model", "Communicating sequential processes through typed channels prevent data races when ownership is passed between goroutines."),
        ("the race detector", "The built-in -race flag detects unsynchronized memory access and is mandatory in CI for concurrent correctness."),
        ("context cancellation", "context.Context carries deadlines and cancellation across call graphs so work stops promptly and resources are released."),
        ("interfaces and implicit satisfaction", "Small implicit interfaces like io.Reader and io.Writer enable composition without inheritance boilerplate."),
        ("error handling and wrapping", "Sentinel errors, custom error types, and errors.Is/As wrapping preserve cause chains across layers."),
        ("memory management and escape analysis", "The compiler decides heap versus stack allocation, and escape analysis governs allocation pressure and GC load."),
        ("modules and reproducible builds", "go.mod with checksums and vendoring delivers hermetic, reproducible dependency resolution."),
        ("pprof profiling", "CPU, heap, and mutex profiles from net/http/pprof pinpoint real bottlenecks before optimization."),
        ("cross-compilation and single-binary deploys", "GOOS/GOARCH cross builds produce a static binary that deploys anywhere with zero runtime dependencies."),
    ],
}

SKILL_JAVA = {
    "category": "programming_language",
    "market_demand": 0.92,
    "concepts": [
        ("the JVM memory model", "Heap generations, escape analysis, and the happens-before semantics define visibility and GC behavior for concurrent code."),
        ("garbage collectors and tuning", "G1, ZGC, and Shenandoah trade pause times versus throughput, chosen by SLA rather than habit."),
        ("streams and lambda functional style", "Streams API plus lambdas express declarative data transformation with parallelism options."),
        ("concurrency utilities", "Executors, CompletableFuture, and java.util.concurrent structures replace raw threads for robust concurrent pipelines."),
        ("Spring dependency injection", "IoC containers wire beans declaratively, enabling testable, modular enterprise service layers."),
        ("JIT compilation and code caching", "Hotspot tiered compilation optimizes hot paths at runtime, and profile pollution can silently degrade performance."),
        ("records, sealed classes, and pattern matching", "Modern Java reduces boilerplate and enables exhaustive algebraic data types for domain modeling."),
        ("Maven and Gradle build ecosystems", "Declarative builds with dependency locking and reproducible plugins are the backbone of enterprise CI."),
        ("JVM monitoring and profiling", "JFR, async-profiler, and heap dumps diagnose leaks, lock contention, and GC thrash in production."),
        ("microservices frameworks", "Spring Boot, Quarkus, and Micronaut balance startup time, memory footprint, and ecosystem maturity."),
    ],
}

SKILL_RUST = {
    "category": "programming_language",
    "market_demand": 0.85,
    "concepts": [
        ("ownership and borrowing", "Single ownership plus borrow rules eliminate data races and use-after-free at compile time with zero runtime cost."),
        ("lifetimes", "Lifetime annotations tie reference validity to scopes, letting the compiler prove no dangling pointers exist."),
        ("fearless concurrency", "Send and Sync traits statically guarantee thread-safety, making parallelism safe by construction."),
        ("zero-cost abstractions", "Iterators, generics monomorphization, and traits compile to the same machine code as hand-rolled loops."),
        ("Result and Option error handling", "Errors are values that must be handled explicitly, with the ? operator propagating them ergonomically."),
        ("smart pointers", "Box, Rc, Arc, and RefCell express heap allocation and shared ownership explicitly with clear runtime costs."),
        ("traits and dynamic dispatch", "Trait objects trade a vtable indirection for polymorphism, while generics monomorphize for speed."),
        ("async runtime ecosystem", "Tokio and async/await enable massive I/O concurrency, with pinning semantics that shape API design."),
        ("unsafe code boundaries", "The unsafe keyword isolates raw-pointer operations into auditable, minimal, documented blocks."),
        ("FFI and embedded use", "C interop and no_std compilation make Rust a drop-in safe replacement in systems and embedded contexts."),
    ],
}

SKILL_KUBERNETES = {
    "category": "cloud_infrastructure",
    "market_demand": 0.95,
    "concepts": [
        ("pods and the scheduling pipeline", "The scheduler binds pods to nodes via resource requests, affinity rules, taints, and topology spread constraints."),
        ("deployments and rollout strategies", "Rolling updates, revisions, and rollback windows define safe continuous deployment on clusters."),
        ("services and ingress networking", "ClusterIP, NodePort, LoadBalancer, and Ingress controllers route traffic with TLS and path rules."),
        ("configmaps and secrets", "Configuration is injected as environment or volume data, with secrets base64-encoded and ideally encrypted at rest."),
        ("resource requests and limits", "CPU and memory requests drive bin-packing while limits prevent noisy-neighbor interference and trigger OOMKills."),
        ("HPA and autoscaling", "Horizontal pod autoscaling on utilization or custom metrics balances load; cluster autoscaler adds nodes."),
        ("health probes", "Liveness, readiness, and startup probes gate traffic and restart wedged containers automatically."),
        ("RBAC and security context", "Least-privilege roles, service accounts, and non-root containers shrink the cluster attack surface."),
        ("operators and CRDs", "Custom controllers encode operational runbooks as code, automating stateful app lifecycle management."),
        ("statefulsets and storage", "Stable identities with volume claim templates give databases ordered rollout and persistent storage."),
    ],
}

SKILL_DOCKER = {
    "category": "cloud_infrastructure",
    "market_demand": 0.96,
    "concepts": [
        ("images and layers", "Union filesystem layers cache builds, so instruction order matters for rebuild speed and image size."),
        ("multi-stage builds", "Builder stages compile artifacts that are copied into minimal runtime images, slashing size and attack surface."),
        ("container networking", "Bridge, host, and overlay networks isolate traffic; port publishing and DNS-based service discovery wire apps together."),
        ("volumes and persistence", "Named volumes and bind mounts separate ephemeral container state from durable data."),
        ("docker compose orchestration", "Declarative multi-container definitions with depends_on and healthchecks reproduce full local environments."),
        ("image registries and tagging", "Versioned tags with digests guarantee exactly-once deployment artifacts across environments."),
        ("resource constraints", "CPU and memory limits plus PID caps prevent single containers from starving the host."),
        ("security scanning and rootless mode", "CVE scanners, non-root users, and minimal base images like distroless harden production images."),
        ("ENTRYPOINT versus CMD", "Entrypoint fixes the executable while CMD supplies defaults, shaping how Kubernetes overrides arguments."),
        ("buildkit and cache mounts", "Advanced build caching and parallel stages cut CI build times dramatically."),
    ],
}

SKILL_AWS = {
    "category": "cloud_infrastructure",
    "market_demand": 0.94,
    "concepts": [
        ("EC2 compute sizing", "Instance families, spot versus on-demand pricing, and auto-scaling groups balance cost against capacity headroom."),
        ("S3 storage classes and lifecycle", "Tiering data across standard, infrequent-access, and glacier classes with lifecycle rules minimizes storage spend."),
        ("VPC networking", "Subnets, route tables, NAT gateways, and security groups form the isolated network foundation of every workload."),
        ("IAM least privilege", "Role-based policies with condition keys and no wildcards are the first defense against credential abuse."),
        ("Lambda serverless", "Event-driven functions with cold-start mitigation and right-sized memory settings serve spiky traffic cheaply."),
        ("RDS and Aurora", "Managed databases with read replicas, multi-AZ failover, and automated backups trade cost for resilience."),
        ("CloudWatch observability", "Metrics, logs, alarms, and dashboards provide the feedback loop for SLOs and incident response."),
        ("CloudFront and edge caching", "CDN caching with signed URLs and origin failover cuts latency and absorbs traffic spikes."),
        ("SQS and SNS messaging", "Queues buffer and fan out work, decoupling producers from consumers for elastic scaling."),
        ("cost optimization", "Rightsizing, savings plans, spot instances, and tagging hygiene keep cloud bills predictable."),
    ],
}

SKILL_AZURE = {
    "category": "cloud_infrastructure",
    "market_demand": 0.88,
    "concepts": [
        ("Azure AD and Entra identity", "Managed identities and service principals replace stored credentials for every workload authentication path."),
        ("Azure Kubernetes Service", "AKS control planes with node pools, Azure CNI, and cluster autoscaler run production microservices."),
        ("Azure Functions", "Event-driven compute with consumption or premium plans handles bursts without provisioning servers."),
        ("Azure SQL Database", "Hyperscale tiers, geo-replication, and automatic tuning deliver managed relational resilience."),
        ("Blob Storage tiers", "Hot, cool, and archive access tiers with lifecycle management policies control object storage economics."),
        ("Virtual networks and private endpoints", "Private endpoints remove public exposure, and NSGs segment traffic per subnet."),
        ("Azure Monitor and Application Insights", "Unified telemetry with distributed tracing and Kusto queries drives incident diagnosis."),
        ("Azure DevOps and GitHub Actions", "Pipelines with environments, approvals, and key-vault-backed secrets automate delivery."),
        ("Bicep infrastructure as code", "Declarative templates with modules and what-if previews make cloud changes reviewable."),
        ("role-based access control", "Scoped RBAC at management-group, subscription, or resource level enforces least privilege."),
    ],
}

SKILL_REACT = {
    "category": "frontend",
    "market_demand": 0.93,
    "concepts": [
        ("component composition", "Small composable components with children and render props build complex UIs from simple parts."),
        ("hooks and rules", "useState, useEffect, and custom hooks manage state; hook call order rules keep rendering deterministic."),
        ("reconciliation and keys", "The virtual DOM diff algorithm relies on stable keys to minimize re-renders and DOM churn."),
        ("state management patterns", "Local state, context, Zustand, or Redux each fit different sharing scopes; over-lifting state causes re-render storms."),
        ("performance optimization", "Memoization, code splitting, and virtualization keep interaction latency low on large lists."),
        ("data fetching and caching", "React Query or SWR handle loading states, retries, and cache invalidation better than raw effects."),
        ("concurrent rendering", "Transitions, Suspense boundaries, and streaming server components let urgent UI bypass slow data."),
        ("accessibility", "Semantic HTML, focus management, and ARIA attributes are prerequisites, not afterthoughts."),
        ("testing strategies", "React Testing Library queries by role with user-event for behavior, while Playwright covers end-to-end flows."),
        ("bundling and code splitting", "Route-based dynamic imports and tree shaking trim initial bundle size and improve Core Web Vitals."),
    ],
}

SKILL_NODEJS = {
    "category": "backend",
    "market_demand": 0.9,
    "concepts": [
        ("the event loop and libuv", "Single-threaded event demultiplexing with a worker threadpool means blocking calls starve all requests."),
        ("streams and backpressure", "Readable and writable streams with pipe and backpressure handle large payloads without exhausting memory."),
        ("worker threads and clustering", "CPU-bound work moves to worker threads or cluster workers to keep the event loop responsive."),
        ("npm dependency hygiene", "Lockfiles, audit, and semantic version pinning prevent supply-chain surprises in builds."),
        ("Express and Fastify routing", "Middleware chains and schema-based serialization define API behavior and performance ceilings."),
        ("async error handling", "Unhandled rejections and uncaught exceptions crash Node processes, so domains and process managers matter."),
        ("memory profiling", "Heap snapshots and --inspect expose leaks from closures, timers, and caches."),
        ("graceful shutdown", "SIGTERM handling with connection draining prevents dropped requests during rolling deploys."),
        ("native addons and N-API", "C++ or Rust bindings via N-API accelerate hot paths while keeping ABI stability."),
        ("environment configuration", "Twelve-factor config with secrets managers and env validation keeps deployments portable."),
    ],
}

SKILL_SQL = {
    "category": "database",
    "market_demand": 0.93,
    "concepts": [
        ("joins and set logic", "Inner, outer, and anti-joins express relationships declaratively; the optimizer decides execution order."),
        ("indexes and selectivity", "B-tree, hash, and covering indexes speed reads but slow writes; cardinality determines usefulness."),
        ("query plans and EXPLAIN", "Execution plans reveal scans, seeks, and join strategies, making them the first diagnostic tool."),
        ("normalization and denormalization", "Third normal form prevents anomalies while selective denormalization buys read performance."),
        ("transactions and isolation levels", "ACID guarantees with read-committed or serializable isolation trade consistency against concurrency."),
        ("window functions", "Ranking, running totals, and moving averages compute analytics without self-joins."),
        ("CTEs and recursive queries", "Common table expressions improve readability and traverse hierarchies like org charts."),
        ("partitioning and sharding", "Range or hash partitioning prunes scans; sharding spreads writes across nodes with join costs."),
        ("deadlocks and locking", "Row, page, and table locks plus consistent access ordering prevent livelocks and deadlocks."),
        ("data modeling for analytics", "Star schemas, slow-changing dimensions, and materialized views serve OLAP reporting efficiently."),
    ],
}

SKILL_POSTGRESQL = {
    "category": "database",
    "market_demand": 0.92,
    "concepts": [
        ("MVCC and vacuum", "Multi-version concurrency control leaves dead tuples that VACUUM reclaims, otherwise bloat degrades everything."),
        ("index types", "B-tree, GIN, GiST, BRIN, and hash indexes each fit different access patterns from full-text to time-series."),
        ("connection pooling", "PgBouncer multiplexes thousands of client connections onto a small server pool."),
        ("replication and failover", "Streaming replication with hot standbys plus Patroni automate high availability."),
        ("JSONB and hybrid storage", "JSONB columns with GIN indexes mix schemaless agility with relational integrity."),
        ("partitioning strategies", "Declarative range and hash partitioning prunes large table scans by date or tenant."),
        ("query tuning", "pg_stat_statements, autovacuum tuning, and work_mem sizing fix the slowest queries first."),
        ("logical replication", "Publication-subscription replication enables zero-downtime upgrades and cross-region sync."),
        ("point-in-time recovery", "WAL archiving plus base backups restore any moment, the ultimate backup test."),
        ("row-level security", "Policy-based RLS enforces tenant isolation inside the database engine itself."),
    ],
}

SKILL_MONGODB = {
    "category": "database",
    "market_demand": 0.86,
    "concepts": [
        ("document modeling", "Embedding versus referencing balances read locality against update fan-out and document size limits."),
        ("aggregation pipeline", "Staged documents flow through match, group, and lookup stages for server-side analytics."),
        ("indexes and explain plans", "Compound indexes with ESR ordering (equality, sort, range) drive query performance."),
        ("replica sets", "Primary with automatic failover among secondaries provides high availability via oplog replay."),
        ("sharding", "Range or hashed shard keys distribute data; a bad key creates hot shards that cannot be rebalanced easily."),
        ("transactions", "Multi-document ACID transactions exist but cost throughput, so schema design should minimize their need."),
        ("schema validation", "JSON schema validators enforce structure while keeping document flexibility."),
        ("change streams", "Reactive change streams push data events to downstream systems for ETL and cache invalidation."),
        ("wiredtiger storage engine", "Snapshot isolation with compression trades CPU for storage efficiency and consistent reads."),
        ("atlas and operations", "Backups, performance advisor, and online migrations are daily operational concerns."),
    ],
}

SKILL_REDIS = {
    "category": "database",
    "market_demand": 0.87,
    "concepts": [
        ("data structures", "Strings, hashes, lists, sets, sorted sets, and streams each map to a different access pattern."),
        ("caching patterns", "Cache-aside, write-through, and TTL choices govern staleness and stampede behavior."),
        ("persistence", "RDB snapshots and AOF logs trade recovery granularity against write latency."),
        ("replication and sentinel", "Async replication with Sentinel or Cluster failover provides availability at the cost of possible data loss."),
        ("cluster mode and slotting", "Sixteen thousand hash slots distribute keys; multi-key ops require matching slots or hashtags."),
        ("pub/sub and streams", "Fire-and-forget pubsub versus consumer-group streams differ on delivery guarantees."),
        ("eviction policies", "LRU, LFU, and TTL-based eviction decide what survives when maxmemory is reached."),
        ("pipelining and Lua scripting", "Batched commands and atomic EVAL scripts cut round trips and race windows."),
        ("distributed locks", "SET NX with expiry and Redlock trade safety versus liveness under clock drift."),
        ("hot key mitigation", "Key sharding, local caching, and read replicas relieve single-key bottlenecks."),
    ],
}

SKILL_KAFKA = {
    "category": "data_engineering",
    "market_demand": 0.89,
    "concepts": [
        ("topics and partitions", "Append-only logs split by partitions get parallelism; ordering is guaranteed only within a partition."),
        ("producers and idempotence", "Idempotent producers with acks=all and retries eliminate duplicates on broker failover."),
        ("consumer groups and rebalancing", "Cooperative rebalancing lets consumers scale while minimizing stop-the-world pauses."),
        ("offsets and delivery semantics", "At-least-once with idempotent consumers or exactly-once with transactions defines correctness."),
        ("log compaction and retention", "Compacted topics keep latest state per key while time retention bounds storage."),
        ("schema registry", "Avro or Protobuf schemas with compatibility rules prevent cross-service contract breakage."),
        ("stream processing", "Kafka Streams and Flink build stateful windowed computations directly on the log."),
        ("replication and ISR", "In-sync replicas with min.insync.replicas trade durability against availability during failures."),
        ("backpressure and lag", "Consumer lag is the primary health metric for event pipelines."),
        ("exactly-once architectures", "Transactional offsets plus idempotent sinks deliver end-to-end exactly-once pipelines."),
    ],
}

SKILL_MICROSERVICES = {
    "category": "architecture",
    "market_demand": 0.91,
    "concepts": [
        ("service decomposition", "Domain-driven bounded contexts define service boundaries; wrong splits create chatty distributed monoliths."),
        ("inter-service communication", "Synchronous REST or gRPC versus asynchronous messaging trades coupling against latency."),
        ("service discovery", "Client-side or registry-based discovery lets services locate each other as instances scale and fail."),
        ("API gateways", "A gateway centralizes auth, rate limiting, and routing so backends stay simple."),
        ("distributed transactions and sagas", "Saga orchestration or choreography replaces two-phase commits with compensating actions."),
        ("circuit breakers and retries", "Bulkheads, timeouts, and exponential backoff with jitter prevent cascading failures."),
        ("observability", "Correlated logs, metrics, and distributed traces are mandatory across service hops."),
        ("deployment independence", "Each service ships and scales independently, which is the core payoff of the pattern."),
        ("data ownership", "Database-per-service with event-driven sync avoids hidden coupling through shared schemas."),
        ("versioning contracts", "Consumer-driven contract tests keep independently deployed APIs compatible."),
    ],
}

SKILL_SYSTEM_DESIGN = {
    "category": "architecture",
    "market_demand": 0.95,
    "concepts": [
        ("scalability patterns", "Horizontal scaling, load balancing, and stateless services are the foundation of elastic growth."),
        ("caching layers", "Multi-tier caching with CDNs and invalidation strategies cuts latency and database load."),
        ("database scaling", "Read replicas, sharding, and CQRS separate write and read paths as data grows."),
        ("CAP theorem trade-offs", "Partition tolerance is mandatory, so systems choose consistency or availability during partitions."),
        ("message queues", "Queues absorb spikes and decouple failure domains between producers and consumers."),
        ("consistency models", "Strong, eventual, and causal consistency each fit different user-facing requirements."),
        ("rate limiting and throttling", "Token bucket and sliding window algorithms protect backends from abuse and spikes."),
        ("idempotency", "Idempotency keys make retries safe for payments and order flows."),
        ("estimation and back-of-envelope", "QPS, storage, and bandwidth estimates drive technology selection before design."),
        ("trade-off articulation", "Every design choice has costs; naming them explicitly is what distinguishes staff interviews."),
    ],
}

SKILL_GRPC = {
    "category": "architecture",
    "market_demand": 0.8,
    "concepts": [
        ("protocol buffers", "Compact binary schemas with evolution rules keep services compatible across versions."),
        ("HTTP/2 multiplexing", "Streams over one connection eliminate head-of-line blocking at the transport layer."),
        ("streaming types", "Unary, server, client, and bidirectional streaming fit different interaction patterns."),
        ("deadline propagation", "Context deadlines travel hop to hop so slow downstream calls cancel upstream work."),
        ("interceptors", "Middleware-style interceptors handle auth, logging, and metrics uniformly across RPCs."),
        ("status codes and error models", "Rich canonical status codes with details carry structured errors across services."),
        ("load balancing", "Client-side balancing with connection pooling differs fundamentally from L7 proxy balancing."),
        ("code generation", "Multi-language stub generation keeps polyglot services on one contract."),
        ("reflection and tooling", "Server reflection enables grpcurl debugging and dynamic health checks."),
        ("when not to use gRPC", "Browser and cache-friendly public APIs often favor REST with JSON instead."),
    ],
}

SKILL_CICD = {
    "category": "devops",
    "market_demand": 0.93,
    "concepts": [
        ("pipeline stages", "Build, test, scan, and deploy stages with quality gates define the delivery workflow."),
        ("blue-green and canary deploys", "Progressive exposure with automated rollback metrics limits blast radius."),
        ("artifact management", "Immutable versioned artifacts promoted through environments guarantee build-once deploy-many."),
        ("infrastructure as code", "Terraform or CloudFormation makes environment changes reviewable and reproducible."),
        ("secrets management", "Vault or cloud secret managers eliminate credentials from source code and CI logs."),
        ("test pyramids in CI", "Fast unit suites gate merges while integration and e2e suites run on trunk."),
        ("trunk-based development", "Short-lived branches with feature flags enable continuous deployment at high velocity."),
        ("rollback strategies", "Database-compatible migrations and deploy revert plans make rollbacks boring and safe."),
        ("pipeline security", "Dependency scanning, SAST, and signed artifacts defend the software supply chain."),
        ("DORA metrics", "Deployment frequency, lead time, MTTR, and change-failure rate measure delivery health."),
    ],
}

SKILL_TERRAFORM = {
    "category": "devops",
    "market_demand": 0.88,
    "concepts": [
        ("declarative state", "Terraform plans compute diffs between desired and actual infrastructure before any change."),
        ("state backends and locking", "Remote state with locking prevents concurrent applies from corrupting infrastructure."),
        ("modules and composition", "Reusable modules with typed inputs standardize environments across teams."),
        ("providers and version pinning", "Pinned provider versions keep plans deterministic across machines and time."),
        ("workspaces and environments", "Separate state per environment with shared modules balances reuse and isolation."),
        ("drift detection", "Plan reveals out-of-band changes; import blocks bring resources back under management."),
        ("sensitive values", "Marked secrets stay out of logs but must still be encrypted at rest in state."),
        ("plan review in CI", "Automated plans on pull requests make infrastructure changes reviewable like code."),
        ("data sources versus resources", "Data sources read existing infrastructure while resources own lifecycle."),
        ("provisioners and alternatives", "Remote-exec provisioners are last resorts; cloud-init and Packer are cleaner paths."),
    ],
}

SKILL_MLOPS = {
    "category": "ai_ml",
    "market_demand": 0.9,
    "concepts": [
        ("experiment tracking", "Versioned runs with parameters and metrics make results reproducible and comparable."),
        ("feature stores", "Centralized feature computation guarantees training-serving consistency."),
        ("model registries", "Staged model versions with lineage and approvals gate promotion to production."),
        ("data versioning", "Immutable dataset snapshots link every model to the exact data that trained it."),
        ("drift detection", "Input and prediction distribution monitoring triggers retraining before quality decays."),
        ("CI/CD for models", "Automated training, evaluation, and deployment pipelines treat models as first-class artifacts."),
        ("serving infrastructure", "Batch, online, and streaming inference have different latency and scaling requirements."),
        ("model monitoring", "Prediction latency, resource use, and business KPIs must be watched together."),
        ("reproducibility", "Pinned environments, seeds, and deterministic ops make debugging models possible."),
        ("cost and efficiency", "Quantization, distillation, and autoscaling control inference economics."),
    ],
}

SKILL_LLM_ENGINEERING = {
    "category": "ai_ml",
    "market_demand": 0.99,
    "concepts": [
        ("prompt engineering", "Structured prompts with roles, examples, and constraints steer model behavior deterministically."),
        ("retrieval-augmented generation", "Vector search grounds responses in fresh private data, cutting hallucinations."),
        ("embeddings and vector search", "Dense vectors in ANN indexes like HNSW enable semantic similarity at scale."),
        ("function calling", "Schema-constrained tool invocation lets models act on external systems reliably."),
        ("context window management", "Chunking, summarization, and map-reduce strategies fit long documents into limited context."),
        ("evaluation of LLM output", "Golden datasets, LLM-as-judge, and human review quantify quality beyond vibes."),
        ("guardrails and safety", "Input filtering, output validation, and refusal handling protect production users."),
        ("latency and streaming", "Token streaming, speculative decoding, and caching cut time-to-first-token."),
        ("fine-tuning versus prompting", "LoRA fine-tunes teach style and format; prompting stays cheaper and more flexible."),
        ("cost optimization", "Model routing by task complexity and prompt caching balance quality against spend."),
    ],
}

SKILL_MACHINE_LEARNING = {
    "category": "ai_ml",
    "market_demand": 0.88,
    "concepts": [
        ("bias-variance trade-off", "Underfit models miss signal while overfit models memorize noise; validation finds the balance."),
        ("cross-validation", "K-fold and stratified splits give robust performance estimates on limited data."),
        ("feature engineering", "Encoding, scaling, and interactions often matter more than model choice."),
        ("regularization", "L1, L2, dropout, and early stopping control capacity and improve generalization."),
        ("gradient boosting", "XGBoost and LightGBM dominate tabular problems with careful depth and learning-rate tuning."),
        ("class imbalance", "Resampling, class weights, and threshold tuning matter more than accuracy for rare events."),
        ("evaluation metrics", "Precision, recall, ROC-AUC, and calibration must match the business decision."),
        ("tree versus neural models", "Gradient boosting wins tabular; neural nets win text, image, and audio."),
        ("hyperparameter search", "Bayesian optimization beats grid search on expensive training budgets."),
        ("leakage", "Target leakage and train-test contamination produce models that fail in production."),
    ],
}

SKILL_DATA_ENGINEERING = {
    "category": "data_engineering",
    "market_demand": 0.9,
    "concepts": [
        ("ETL versus ELT", "Loading raw data first and transforming in-warehouse leverages elastic compute."),
        ("batch and streaming pipelines", "Spark and Flink process at scale with exactly-once or effectively-once semantics."),
        ("data lakehouse", "Delta, Iceberg, and Hudi bring ACID and schema evolution to object storage."),
        ("orchestration", "Airflow and Dagster schedule dependencies with retries and backfills."),
        ("data quality", "Great Expectations-style checks catch silent corruption before dashboards lie."),
        ("schema management", "Evolving schemas with compatibility rules keep producers and consumers aligned."),
        ("partitioning and file formats", "Parquet with partition pruning and compaction controls scan costs."),
        ("idempotent pipelines", "Deterministic re-runs make late data and failures safe to replay."),
        ("data modeling", "Dimensional models and wide tables serve analytics and ML feature needs."),
        ("lineage and governance", "Column-level lineage and catalogs make data discoverable and auditable."),
    ],
}

SKILL_CYBERSECURITY = {
    "category": "security",
    "market_demand": 0.92,
    "concepts": [
        ("OWASP top vulnerabilities", "Injection, broken access control, and XSS dominate real-world breaches and code reviews."),
        ("authentication versus authorization", "Verifying identity and gating permissions are distinct concerns with different failure modes."),
        ("OAuth2 and OIDC", "Authorization flows with PKCE and token exchange underpin modern identity federation."),
        ("TLS and certificate management", "Cipher suites, rotation, and mTLS protect data in transit and service identity."),
        ("secrets management", "Short-lived credentials with vaulting beat long-lived keys in environment variables."),
        ("threat modeling", "STRIDE analysis surfaces design flaws before any code is written."),
        ("dependency supply chain", "SBOMs, pinning, and signed packages defend against poisoned dependencies."),
        ("zero trust architecture", "Per-request verification and least privilege replace implicit network trust."),
        ("incident response", "Detection, containment, eradication, and lessons-learned define operational security."),
        ("secure coding practices", "Input validation, output encoding, and parameterized queries prevent entire vulnerability classes."),
    ],
}

SKILL_SECURITY_APPSEC = {
    "category": "security",
    "market_demand": 0.9,
    "concepts": [
        ("SAST and DAST", "Static analysis finds code-level flaws while dynamic testing validates running behavior."),
        ("input validation", "Allow-lists and canonicalization defeat injection across SQL, LDAP, and command contexts."),
        ("output encoding", "Context-aware escaping prevents XSS in HTML, attributes, URLs, and JavaScript."),
        ("CSRF protection", "Same-site cookies, synchronizer tokens, and origin checks block forged requests."),
        ("session security", "Secure, HttpOnly cookies with rotation and short lifetimes limit session hijacking."),
        ("password storage", "Argon2 or bcrypt with per-user salts makes offline cracking expensive."),
        ("rate limiting and lockouts", "Adaptive throttling stops credential stuffing without breaking real users."),
        ("CSP and security headers", "Content Security Policy and HSTS reduce exploit impact even when bugs slip through."),
        ("SSRF defenses", "Egress allow-lists and metadata-service protection block internal network probing."),
        ("secure SDLC", "Threat modeling at design plus pipeline security gates shift security left."),
    ],
}

SKILL_OBSERVABILITY = {
    "category": "devops",
    "market_demand": 0.9,
    "concepts": [
        ("the three pillars", "Metrics, logs, and traces answer different questions and need correlation."),
        ("SLOs and error budgets", "Service-level objectives turn reliability into an explicit engineering trade-off."),
        ("distributed tracing", "Span propagation across services pinpoints the slow or failing hop."),
        ("cardinality management", "Unbounded label values explode time-series databases and costs."),
        ("alert design", "Symptom-based paging with multi-window burn-rate alerts beats CPU-threshold noise."),
        ("OpenTelemetry", "Vendor-neutral instrumentation standardizes collection across the stack."),
        ("structured logging", "JSON logs with trace IDs make aggregation and correlation possible."),
        ("eBPF-based insights", "Kernel-level observability captures network and syscall behavior without app changes."),
        ("incident response", "Blameless postmortems and runbooks turn incidents into durable improvements."),
        ("cost observability", "Telemetry pipelines need sampling and tiering to stay affordable at scale."),
    ],
}

# CHUNK_SLOT_10
