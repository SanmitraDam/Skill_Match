from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, JSON, DateTime, Boolean, LargeBinary
from sqlalchemy.orm import relationship
import datetime
from app.models.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="candidate") # candidate, recruiter, hiring_manager, compliance_officer, admin
    tenant_id = Column(String, default="tenant_default", index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resumes = relationship("Resume", back_populates="owner")

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    tenant_id = Column(String, default="tenant_default", index=True)
    file_path = Column(String)
    extracted_text = Column(Text)
    parsed_skills = Column(JSON)  # List of skills
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="resumes")
    match_results = relationship("SkillMatchResult", back_populates="resume")
    skill_vectors = relationship("CandidateSkillVector", back_populates="resume", cascade="all, delete-orphan")

class JobDescription(Base):
    __tablename__ = "job_descriptions"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, default="tenant_default", index=True)
    text = Column(Text, nullable=False)
    required_skills = Column(JSON)  # List of skills
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    match_results = relationship("SkillMatchResult", back_populates="jd")

class SkillMatchResult(Base):
    __tablename__ = "skill_match_results"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, default="tenant_default", index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    jd_id = Column(Integer, ForeignKey("job_descriptions.id"))
    match_score = Column(Float)
    matched_skills = Column(JSON)
    missing_skills = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resume = relationship("Resume", back_populates="match_results")
    jd = relationship("JobDescription", back_populates="match_results")
    quiz_result = relationship("QuizResult", back_populates="match_result", uselist=False)
    interview_result = relationship("InterviewResult", back_populates="match_result", uselist=False)
    readiness_score = relationship("ReadinessScore", back_populates="match_result", uselist=False)
    attestation = relationship("ComplianceAttestation", back_populates="match_result", uselist=False)
    hiring_reviews = relationship("HiringReview", back_populates="match_result")

class QuizResult(Base):
    __tablename__ = "quiz_results"
    id = Column(Integer, primary_key=True, index=True)
    match_result_id = Column(Integer, ForeignKey("skill_match_results.id"))
    score = Column(Float)
    difficulty_reached = Column(Integer)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    match_result = relationship("SkillMatchResult", back_populates="quiz_result")

class InterviewResult(Base):
    __tablename__ = "interview_results"
    id = Column(Integer, primary_key=True, index=True)
    match_result_id = Column(Integer, ForeignKey("skill_match_results.id"))
    score = Column(Float)
    feedback = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    match_result = relationship("SkillMatchResult", back_populates="interview_result")

class ReadinessScore(Base):
    __tablename__ = "readiness_scores"
    id = Column(Integer, primary_key=True, index=True)
    match_result_id = Column(Integer, ForeignKey("skill_match_results.id"))
    composite_score = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    match_result = relationship("SkillMatchResult", back_populates="readiness_score")
    roadmap = relationship("Roadmap", back_populates="readiness_score", uselist=False)

class Roadmap(Base):
    __tablename__ = "roadmaps"
    id = Column(Integer, primary_key=True, index=True)
    readiness_score_id = Column(Integer, ForeignKey("readiness_scores.id"))
    plan_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    readiness_score = relationship("ReadinessScore", back_populates="roadmap")

class CandidateSkillVector(Base):
    __tablename__ = "candidate_skill_vectors"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, default="tenant_default", index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=True)
    skill_name = Column(String, index=True, nullable=False)
    skill_vector = Column(JSON, nullable=False) # 384-d dense embedding
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resume = relationship("Resume", back_populates="skill_vectors")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, default="tenant_default", index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False, index=True) # e.g. "CANDIDATE_SCORED", "ATTESTATION_GENERATED", "DECISION_RECORDED"
    resource_type = Column(String, nullable=False) # e.g. "SkillMatchResult", "InterviewResult"
    resource_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    actor = relationship("User")

class ComplianceAttestation(Base):
    __tablename__ = "compliance_attestations"
    id = Column(Integer, primary_key=True, index=True)
    match_result_id = Column(Integer, ForeignKey("skill_match_results.id"), unique=True, nullable=False)
    tenant_id = Column(String, default="tenant_default", index=True)
    ed25519_signature = Column(String, nullable=False) # Hex or Base64 encoded Ed25519 signature
    public_key = Column(String, nullable=False) # Hex or Base64 encoded Ed25519 public verification key
    audit_hash = Column(String, nullable=False) # SHA-256 hash of (candidate_id, match_score, breakdown, timestamp)
    four_fifths_ratio = Column(Float, default=1.0) # Evaluated disparate impact ratio (e.g. 0.88 >= 0.80 PASS)
    status = Column(String, default="VERIFIED_COMPLIANT") # VERIFIED_COMPLIANT, FLAG_DISPARATE_IMPACT, AUDIT_REQUIRED
    algorithm_version = Column(String, default="v4.0.0-ENTERPRISE-SCALE")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    match_result = relationship("SkillMatchResult", back_populates="attestation")

class HiringReview(Base):
    __tablename__ = "hiring_reviews"
    id = Column(Integer, primary_key=True, index=True)
    match_result_id = Column(Integer, ForeignKey("skill_match_results.id"), nullable=False)
    tenant_id = Column(String, default="tenant_default", index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    decision = Column(String, nullable=False) # "ADVANCE", "HOLD", "REJECT", "OFFER"
    notes = Column(Text, nullable=True)
    matrix_scores = Column(JSON, nullable=True) # e.g. {"technical": 92, "culture": 85, "leadership": 88}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    match_result = relationship("SkillMatchResult", back_populates="hiring_reviews")
    reviewer = relationship("User")

# v5.0 Autonomous Agentic Ecosystem Models (suggestion-v4.md)
class AgentNegotiationSession(Base):
    __tablename__ = "agent_negotiation_sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    candidate_id = Column(String, index=True, nullable=False)
    recruiter_id = Column(String, index=True, nullable=False)
    tenant_id = Column(String, default="tenant_default", index=True)
    status = Column(String, default="NEGOTIATING", index=True) # NEGOTIATING, CHALLENGE_ISSUED, VERIFIED_CLEARING, OFFER_ACCEPTED, REJECTED
    conversation_history = Column(JSON, default=list) # MCP message objects
    match_terms = Column(JSON, nullable=True) # Negotiated salary, remote, title, ccr_score_threshold
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class KnowledgeGraphNode(Base):
    __tablename__ = "knowledge_graph_nodes"
    id = Column(Integer, primary_key=True, index=True)
    skill_name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False) # hard_technical, domain_tool, soft_skill
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class KnowledgeGraphEdge(Base):
    __tablename__ = "knowledge_graph_edges"
    id = Column(Integer, primary_key=True, index=True)
    source_skill = Column(String, index=True, nullable=False)
    target_skill = Column(String, index=True, nullable=False)
    relationship_type = Column(String, nullable=False) # REQUIRES_PREREQUISITE, ADJACENT_TO, SUB_SKILL_OF
    weight = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ZKProofCredential(Base):
    __tablename__ = "zk_proof_credentials"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String, index=True, nullable=False)
    tenant_id = Column(String, default="tenant_default", index=True)
    did_identifier = Column(String, index=True, nullable=False) # did:skillmatch:tenant_default:cand_hash
    proof_type = Column(String, default="Groth16_zkSNARK")
    proof_payload = Column(JSON, nullable=False) # pi_a, pi_b, pi_c
    public_signals = Column(JSON, nullable=False) # statement e.g. ccrs_threshold=85, ability=4.2
    is_verified = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RLAFTrainingLog(Base):
    __tablename__ = "rlaf_training_logs"
    id = Column(Integer, primary_key=True, index=True)
    match_result_id = Column(Integer, ForeignKey("skill_match_results.id"), nullable=True)
    tenant_id = Column(String, default="tenant_default", index=True)
    interview_callback = Column(Float, default=1.0)
    retention_90_day = Column(Float, default=1.0)
    bias_variance = Column(Float, default=0.02)
    computed_reward = Column(Float, nullable=False)
    dpo_status = Column(String, default="OPTIMIZED") # PENDING, OPTIMIZED, EVALUATED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# ==========================================
# VERSION 6.0: NEURO-SPATIAL-SWARM MODELS
# ==========================================

class TalentLiquidityPool(Base):
    __tablename__ = "talent_liquidity_pools"
    id = Column(Integer, primary_key=True, index=True)
    pool_id = Column(String, unique=True, index=True, nullable=False) # e.g. pool_genai_infra_01
    tenant_id = Column(String, default="tenant_default", index=True)
    title = Column(String, nullable=False)
    target_skills = Column(JSON, nullable=False) # e.g. ["vLLM PagedAttention", "WebRTC SFU", "pgvector"]
    total_bounty_budget_inr = Column(Float, nullable=False, default=20750000)
    remaining_bounty_inr = Column(Float, nullable=False, default=20750000)
    active_bids_count = Column(Integer, default=0)
    status = Column(String, default="ACTIVE") # ACTIVE, EXHAUSTED, PAUSED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SwarmMarketBid(Base):
    __tablename__ = "swarm_market_bids"
    id = Column(Integer, primary_key=True, index=True)
    bid_id = Column(String, unique=True, index=True, nullable=False)
    pool_id = Column(String, ForeignKey("talent_liquidity_pools.pool_id"), nullable=False, index=True)
    candidate_id = Column(String, index=True, nullable=False)
    offered_annual_salary_inr = Column(Float, nullable=False)
    contract_type = Column(String, default="FULL_TIME") # FULL_TIME, FRACTIONAL, CONTRACT
    skill_vector_hash = Column(String, nullable=False)
    match_confidence = Column(Float, default=0.92)
    status = Column(String, default="PENDING") # PENDING, MATCHED, EXPIRED, SETTLED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PQCCredential(Base):
    __tablename__ = "pqc_credentials"
    id = Column(Integer, primary_key=True, index=True)
    credential_id = Column(String, unique=True, index=True, nullable=False)
    candidate_id = Column(String, index=True, nullable=False)
    did_identifier = Column(String, index=True, nullable=False) # did:skillmatch:pqc:...
    role_title = Column(String, nullable=False)
    ccrs_score = Column(Float, nullable=False)
    algorithm = Column(String, default="ML-DSA-65/Dilithium-3") # ML-DSA-65, ML-KEM-768
    public_key_hex = Column(Text, nullable=False)
    signature_hex = Column(Text, nullable=False)
    is_quantum_verified = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class FHESessionAudit(Base):
    __tablename__ = "fhe_session_audits"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    tenant_id = Column(String, default="tenant_default", index=True)
    candidate_id = Column(String, index=True, nullable=False)
    ciphertext_resume_hash = Column(String, nullable=False)
    ciphertext_job_hash = Column(String, nullable=False)
    encrypted_score_hash = Column(String, nullable=False)
    plaintext_data_exposed = Column(Integer, default=0) # Must always be 0
    homomorphic_ops_count = Column(Integer, default=384)
    latency_ms = Column(Float, default=14.2)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# ========================================================
# VERSION 7.0: AUTONOMOUS-TALENT-SINGULARITY MODELS
# ========================================================

class BioNeuralSession(Base):
    __tablename__ = "bioneural_sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    candidate_id = Column(String, index=True, nullable=False)
    tenant_id = Column(String, default="tenant_default", index=True)
    heart_rate_bpm = Column(Float, default=72.0)
    hrv_rmssd_ms = Column(Float, default=52.0) # Root Mean Square of Successive Differences
    pupil_dilation_mm = Column(Float, default=3.2)
    cognitive_overload_index = Column(Float, default=0.18) # 0.0 to 1.0
    reasoning_accuracy = Column(Float, default=0.92)
    cfrs_score = Column(Float, nullable=False) # Cognitive Flow & Resilience Score
    stress_resilience_rating = Column(String, default="OPTIMAL_FLOW") # OPTIMAL_FLOW, MILD_FATIGUE, CRITICAL_OVERLOAD
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DigitalTwinProfile(Base):
    __tablename__ = "digital_twin_profiles"
    id = Column(Integer, primary_key=True, index=True)
    twin_id = Column(String, unique=True, index=True, nullable=False)
    candidate_id = Column(String, index=True, nullable=False)
    memory_sync_status = Column(String, default="SYNCHRONIZED")
    technical_capability_vector = Column(JSON, nullable=False)
    communication_style = Column(String, default="ANALYTICAL_STRUCTURED")
    conflict_resolution_heuristic = Column(String, default="FIRST_PRINCIPLES_CONSENSUS")
    last_sync_at = Column(DateTime, default=datetime.datetime.utcnow)

class DigitalTwinSimulationRun(Base):
    __tablename__ = "digital_twin_simulations"
    id = Column(Integer, primary_key=True, index=True)
    simulation_id = Column(String, unique=True, index=True, nullable=False)
    twin_id = Column(String, ForeignKey("digital_twin_profiles.twin_id"), nullable=False, index=True)
    scenario_name = Column(String, nullable=False)
    team_velocity_impact = Column(Float, default=24.5)
    conflict_resolution_score = Column(Float, default=91.2)
    architecture_decision_rate = Column(Float, default=88.4)
    synergy_index = Column(Float, default=86.8)
    simulation_transcript = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SkillStakingContract(Base):
    __tablename__ = "skill_staking_contracts"
    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(String, unique=True, index=True, nullable=False)
    candidate_id = Column(String, index=True, nullable=False)
    staker_wallet_address = Column(String, nullable=False)
    staked_capital_inr = Column(Float, nullable=False, default=415000)
    isa_percentage = Column(Float, nullable=False, default=4.5)
    cap_multiple = Column(Float, default=1.5)
    status = Column(String, default="STAKED") # STAKED, REPAYING, COMPLETED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MicroBounty(Base):
    __tablename__ = "micro_bounties"
    id = Column(Integer, primary_key=True, index=True)
    bounty_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    bounty_payout_inr = Column(Float, nullable=False, default=124500)
    target_skill = Column(String, nullable=False)
    required_skill_vector = Column(JSON, nullable=False)
    claimed_by_candidate_id = Column(String, nullable=True)
    status = Column(String, default="OPEN") # OPEN, CLAIMED, VERIFIED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MultiJurisdictionAudit(Base):
    __tablename__ = "multijurisdiction_audits"
    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(String, unique=True, index=True, nullable=False)
    tenant_id = Column(String, default="tenant_default", index=True)
    candidate_id = Column(String, index=True, nullable=False)
    eu_ai_act_compliance = Column(Integer, default=1)
    nyc_local_law_144_compliance = Column(Integer, default=1)
    california_ab_331_compliance = Column(Integer, default=1)
    eeoc_compliance = Column(Integer, default=1)
    overall_verdict = Column(String, default="COMPLIANT_CERTIFIED")
    legal_defense_package_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


# ============================================================================
# VERSION 27.0: POST-SIGN-IN PROFESSIONAL SOCIAL READINESS NETWORK MODELS
# ============================================================================

class ProfileView(Base):
    """Records when a recruiter views a candidate's profile."""
    __tablename__ = "profile_views"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    viewer_name = Column(String(100), nullable=False)
    viewer_company = Column(String(100), nullable=False)
    viewer_role = Column(String(100), nullable=False)
    is_recruiter = Column(Boolean, default=True)
    viewed_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("User", foreign_keys=[candidate_id])


class ReadinessPost(Base):
    """Automatically published readiness milestone posts for the Social Feed."""
    __tablename__ = "readiness_posts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_type = Column(String(50), nullable=False)  # SKILL_GAP_CLEARED, QUIZ_MASTERY, MOCK_INTERVIEW_PASSED, PROJECT_BENCHMARK
    title = Column(String(255), nullable=False)
    skill_tags = Column(String(255), nullable=False)  # comma-separated
    proof_hash = Column(String(128), nullable=True)
    ccrs_score = Column(Float, default=0.0)
    likes_count = Column(Integer, default=0)
    peer_verifications_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])


class CandidateProfile(Base):
    """Extended candidate profile with CCRS breakdown and social metadata."""
    __tablename__ = "candidate_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    candidate_name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    ccrs_score = Column(Float, default=0.0)
    verification_status = Column(String(50), default="PENDING")  # PENDING, VERIFIED_CANDIDATE, TOP_5_CCRS, SYSTEM_ARCHITECT
    liveness_verified = Column(Boolean, default=False)
    s_match_score = Column(Float, default=0.0)  # Resume/DNA Match score
    a_quiz_score = Column(Float, default=0.0)  # Adaptive Test score
    i_voice_score = Column(Float, default=0.0)  # Voice AI score
    voice_snippet_url = Column(String(500), nullable=True)
    anc_performance = Column(JSON, nullable=True)  # db_reduction, clarity_score
    social_profiles = Column(JSON, nullable=True)  # github, linkedin, portfolio
    bio = Column(Text, nullable=True)
    headline = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    skills = Column(JSON, nullable=True)
    education = Column(JSON, nullable=True)
    experience = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])


class StoredFile(Base):
    """Database-backed persistent blob storage for serverless environments (CockroachDB / PostgreSQL)."""
    __tablename__ = "stored_files"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(500), unique=True, index=True, nullable=False)
    folder = Column(String(255), default="", index=True)
    content = Column(LargeBinary, nullable=False)
    mime_type = Column(String(100), default="application/octet-stream")
    file_size = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class VerificationCode(Base):
    """Database-backed persistent OTP codes for serverless resilience."""
    __tablename__ = "verification_codes"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    code = Column(String(16), nullable=False)
    purpose = Column(String(32), default="signup", nullable=False)
    expires_at = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)




