export interface WeightedGap {
  skill: string;
  category: string;
  criticality: string;
  gap_weight: number;
}

export interface SkillTaxonomy {
  hard_technical: string[];
  soft_skills: string[];
  domain_tools: string[];
}

export interface SkillGapReport {
  match_score: number;
  matched_skills: string[];
  missing_critical_skills: string[];
  recommended_quiz_focus: string[];
  match_id?: number;
  taxonomy?: SkillTaxonomy;
  weighted_gaps?: WeightedGap[];
  social_profiles?: {
    github?: string | null;
    linkedin?: string | null;
    portfolio?: string | null;
  };
  pii_anonymized?: boolean;
}

export interface MCQQuestion {
  question: string;
  options: string[];
  correct_option_index: number;
  difficulty: number;
  skill_targeted: string;
  code_snippet?: string | null;
  question_type?: 'mcq' | 'code_challenge';
  theta_ability?: number | null;
  item_difficulty_b?: number | null;
  item_discrimination_a?: number | null;
}

export interface QuizResponse {
  question_id: number;
  selected_option_index: number;
}

export interface QuizFinishResponse {
  score: number;
  difficulty_reached: number;
  theta_final?: number;
  summary: string;
}

export interface SpeechMetrics {
  cadence_wpm: number;
  filler_words_count: number;
  filler_words_detected: string[];
  pacing_rating: string;
  total_words: number;
  articulation_rate?: number;
  hesitation_index?: number;
  pause_count?: number;
  snr_db?: number;
  sqi_clarity?: number;
}

export interface InterviewQuestion {
  question_text: string;
  audio_url: string;
  skill_targeted: string;
}

export interface RubricDimension {
  score: number;
  weight: number;
  status: string;
}

export interface ConceptCoverage {
  mastered: string[];
  recommended: string[];
}

export interface LatencyTelemetry {
  vad_latency_ms: number;
  asr_latency_ms: number;
  llm_ttft_ms: number;
  glass_to_glass_ms: number;
}

export interface InterviewEvaluation {
  technical_accuracy_score: number;
  communication_clarity_score: number;
  architectural_depth_score?: number;
  tradeoff_analysis_score?: number;
  failure_modes_score?: number;
  key_strengths: string[];
  key_improvement_areas: string[];
  overall_feedback: string;
  speech_metrics?: SpeechMetrics;
  concept_coverage?: ConceptCoverage;
  rubric_breakdown?: Record<string, RubricDimension>;
  latency_telemetry?: LatencyTelemetry;
  research_recommendations?: string[];
}

export interface WeeklyGoal {
  week: number;
  focus_skill: string;
  learning_objectives: string[];
  suggested_resources: string[];
}

export interface RoadmapPlan {
  candidate_name: string;
  readiness_score: number;
  weekly_plan: WeeklyGoal[];
  final_advice: string;
}

export interface BackendHealth {
  status: string;
  service: string;
  version: string;
}

export interface CandidateRanking {
  rank: number;
  match_id: number;
  candidate_name: string;
  candidate_email: string;
  ccrs: number;
  certification_status: string;
  match_score: number;
  quiz_score?: number | null;
  quiz_peak_difficulty?: number | null;
  interview_score?: number | null;
  matched_skills_count: number;
  matched_skills: string[];
  missing_skills: string[];
  social_profiles?: {
    github?: string | null;
    linkedin?: string | null;
    portfolio?: string | null;
  };
}

export type FSMState =
  | 'IDLE'
  | 'LISTENING_VAD'
  | 'PROCESSING_VAD'
  | 'STREAMING_LLM'
  | 'PLAYING_AUDIO'
  | 'INTERRUPTED';

export interface FSMCheckpoint {
  session_id: string;
  current_state: FSMState;
  current_turn: number;
  interrupt_count: number;
  last_active: number;
  checkpoint_latency_ms: number;
}

export interface TelemetryMetrics {
  client_fps: number;
  network_rtt_ms: number;
  packet_loss_percent: number;
  client_jitter_ms: number;
  glass_to_glass_ms: number;
  ttft_ms: number;
  kv_cache_utilization_percent: number;
  tokens_per_second: number;
  database_vector_engine: string;
  vector_search_latency_ms: number;
  status: string;
}

export interface LatencyBudgetStage {
  stage: string;
  budget_ms: string;
}

export interface RealtimeTelemetryResponse {
  telemetry: TelemetryMetrics;
  vector_benchmarks: {
    index_type: string;
    metric: string;
    sequential_scan_latency_ms: number;
    hnsw_scan_latency_ms: number;
    latency_reduction_percent: number;
    throughput_qps: number;
  };
  latency_budget: {
    target_total_latency_range_ms: string;
    stages: LatencyBudgetStage[];
    barge_in_crossfade_window_ms: number;
  };
  system_status: string;
}

export type EnterpriseRole =
  | 'candidate'
  | 'recruiter'
  | 'hiring_manager'
  | 'compliance_officer'
  | 'admin';

export interface DemographicGroupMetric {
  group_name: string;
  total_applicants: number;
  selected_candidates: number;
  selection_rate: number;
  adverse_impact_ratio: number;
  passes_four_fifths_rule: boolean;
}

export interface DisparateImpactReport {
  tenant_id: string;
  benchmark_group: string;
  benchmark_selection_rate: number;
  evaluated_groups: DemographicGroupMetric[];
  overall_compliance: boolean;
  status: string;
  minimum_ratio: number;
  regulatory_framework?: string;
  timestamp: number;
}

export interface ScoreAttestationResult {
  attestation_id?: number | null;
  match_result_id: number;
  tenant_id: string;
  audit_hash: string;
  ed25519_signature_b64: string;
  public_key_b64: string;
  four_fifths_ratio: number;
  status: string;
  verified: boolean;
  created_at: string;
}

export interface ExplanationFactor {
  dimension: string;
  weight: number;
  score: number;
  contribution_points: number;
  explanation: string;
}

export interface RightToExplanationResponse {
  candidate_id: string;
  match_result_id: number;
  composite_score: number;
  percentile_rank: number;
  factors: ExplanationFactor[];
  pii_scrubbed_certified: boolean;
  human_in_the_loop_officer_available: boolean;
  regulatory_disclaimer: string;
  attestation_signature?: string | null;
}

export interface SFURegion {
  region_code: string;
  region_name: string;
  edge_pop: string;
  base_latency_ms: number;
  gpu_cluster_endpoint: string;
  active_sessions: number;
  status: string;
}

export interface SpeechQualityIndexResponse {
  session_id: string;
  snr_db: number;
  clean_snr_gain_db: number;
  speech_quality_index: number;
  quality_status: string;
  agc_target_lufs: number;
  peak_limiter_gain_reduction_db: number;
  deepfilternet_wasm_overhead_percent: number;
  recommendation: string;
  ready_for_interview: boolean;
}

export interface HiringReviewItem {
  id: number;
  match_result_id: number;
  decision: string;
  notes?: string;
  matrix_scores?: Record<string, number>;
  created_at?: string;
}

export interface QuantizedVectorBenchmark {
  index_architecture: string;
  scalar_quantization: string;
  dimensions: number;
  memory_footprint: {
    fp32_bytes_per_vector: number;
    fp16_halfvec_bytes_per_vector: number;
    ram_savings_percent: number;
    scale_10m_fp32_ram_gb: number;
    scale_10m_halfvec_ram_gb: number;
  };
  performance_metrics: {
    sequential_scan_latency_ms: number;
    standard_hnsw_latency_ms: number;
    quantized_hnsw_latency_ms: number;
    latency_speedup_factor: number;
    latency_reduction_vs_seq_percent: number;
    recall_at_10_accuracy: number;
    accuracy_loss_percent: number;
    throughput_qps: number;
  };
  multi_tenancy: {
    isolation_mechanism: string;
    tenant_policy: string;
    status: string;
  };
  status?: string;
}

// v5.0 Autonomous Agentic Ecosystem Types (suggestion-v4.md)
export interface MCPMessage {
  message_id: string;
  sender: 'candidate_agent' | 'recruiter_agent' | 'clearinghouse';
  message_type: 'PROPOSAL' | 'COUNTER_PROPOSAL' | 'SKILL_CHALLENGE_REQUEST' | 'CHALLENGE_PROOF_SUBMISSION' | 'CLEARANCE_AGREEMENT' | 'REJECTION';
  payload: Record<string, any>;
  anonymized_token: string;
  timestamp: number;
}

export interface NegotiationSessionState {
  session_id: string;
  status: 'NEGOTIATING' | 'CHALLENGE_ISSUED' | 'VERIFIED_CLEARING' | 'OFFER_ACCEPTED' | 'REJECTED';
  rounds_completed: number;
  candidate_token: string;
  recruiter_id: string;
  agreed_terms?: Record<string, any> | null;
  mcp_messages: MCPMessage[];
  privacy_mode?: string;
}

export interface SelfHealingCurriculum {
  curriculum_id: string;
  target_skill: string;
  candidate_id: string;
  generated_modules: Array<{
    module_index: number;
    title: string;
    duration_minutes: number;
    format: string;
  }>;
  interactive_code_challenge: {
    challenge_id: string;
    title: string;
    language: string;
    starter_code: string;
    verification_test: string;
    estimated_time_mins: number;
  };
  ai_tutor_persona: string;
  baseline_ccrs: number;
  projected_ccrs_after_completion: number;
  created_at: number;
}

export interface HybridMatchResult {
  candidate_id: string;
  job_id: string;
  cosine_similarity_score: number;
  graph_hierarchy_score: number;
  hybrid_relevance_score: number;
  alpha_weight: number;
  beta_weight: number;
  matched_skills: string[];
  missing_prerequisites: Array<{
    target_skill: string;
    missing_foundational_skill: string;
    severity: string;
  }>;
  adjacent_career_paths: Array<{
    source_skill: string;
    career_bridge: string;
  }>;
  status: string;
}

export interface LaborMarketTrend {
  skill: string;
  hiring_demand_index: number;
  demand_surge_percent: number;
  criticality_weight: number;
  sample_job_openings: number;
  trending_category: string;
}

export interface ZKProofPayload {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  curve: string;
}

export interface ZKProofResult {
  proof_id: string;
  statement_proven: string;
  did_identifier: string;
  proof: ZKProofPayload;
  public_signals: string[];
  is_valid: boolean;
  verification_latency_ms: number;
  verified_at: string;
}

export interface W3CVerifiableCredential {
  context: string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: Record<string, any>;
  proof: Record<string, any>;
}

export interface RLAFMetricsResponse {
  total_hiring_outcomes_logged: number;
  cumulative_batch_reward: number;
  dpo_trigger_threshold: number;
  quarantined_test_items_count: number;
  quarantined_items: any[];
  reward_weights: Record<string, number>;
  status: string;
}

// ==========================================
// VERSION 6.0: NEURO-SPATIAL-SWARM TYPES
// ==========================================

export interface SwarmLiquidityPool {
  pool_id: string;
  title: string;
  target_skills: string[];
  total_bounty_budget_inr: number;
  remaining_bounty_inr: number;
  active_bids_count: number;
  status: string;
}

export interface SwarmBid {
  bid_id: string;
  pool_id: string;
  candidate_id: string;
  offered_annual_salary_inr: number;
  contract_type: string;
  skill_vector_hash: string;
  match_confidence: number;
  status: string;
  created_at: number;
}

export interface SwarmEquilibriumResult {
  target_skill: string;
  delta_annual_salary_inr: number;
  hourly_contract_rate_lift_inr: number;
  market_demand_velocity: string;
  competing_candidate_supply_ratio: number;
  contributing_pools_count: number;
  bounty_breakdown: Array<{
    job_id: string;
    criticality_weight: number;
    pool_weight: number;
    incremental_bounty_inr: number;
  }>;
  equilibrium_formula: string;
}

export interface CandidateSwarmIntelligence {
  role_title: string;
  active_candidate_swarm_nodes: number;
  salary_percentiles_inr: {
    p25: number;
    p50_median: number;
    p75: number;
    p90: number;
  };
  average_interview_difficulty: number;
  most_requested_assessment_topics: string[];
  remote_work_acceptance_rate: number;
  timestamp: number;
}

export interface Z3ProofResult {
  solver: string;
  is_satisfiable: boolean;
  status: string;
  proof_verdict: string;
  total_modules_evaluated: number;
  formal_proof_steps: string[];
  violations_count: number;
  logical_violations: Array<{
    module_index: number;
    module_title: string;
    violated_skill: string;
    missing_antecedent_prerequisite: string;
    formal_clause: string;
    severity: string;
  }>;
  timestamp: number;
}

export interface PQCKeypairResult {
  algorithm: string;
  security_level: string;
  public_key_hex: string;
  private_key_hex: string;
  kem_public_key_hex: string;
  key_size_bytes: number;
  created_at: number;
}

export interface PQCCredentialResult {
  credential_id: string;
  candidate_id: string;
  did_identifier: string;
  role_title: string;
  ccrs_score: number;
  algorithm: string;
  public_key_hex: string;
  signature_hex: string;
  statement_hash: string;
  signing_latency_ms: number;
  is_quantum_verified: boolean;
  w3c_proof_type: string;
  created_at: number;
}

export interface FHEMatchResult {
  session_id: string;
  tenant_id: string;
  candidate_id: string;
  ciphertext_resume_hash: string;
  ciphertext_job_hash: string;
  encrypted_score_hash: string;
  plaintext_data_exposed: number;
  homomorphic_multiplications: number;
  relinearization_operations: number;
  remaining_noise_budget_bits: number;
  fhe_cosine_similarity_score: number;
  computation_latency_ms: number;
  privacy_guarantee: string;
}

export interface NeuromorphicLatencyBudget {
  session_id: string;
  hardware_engine: string;
  glass_to_glass_latency_ms: number;
  target_sla_ms: number;
  sla_satisfied: boolean;
  latency_breakdown_ms: {
    local_client_npu_vad: number;
    local_client_npu_draft_model: number;
    webrtc_edge_network_relay: number;
    cloud_vllm_target_verification: number;
    client_audio_jitter_buffer: number;
  };
  speculative_decoding: {
    draft_tokens_proposed: number;
    draft_tokens_accepted: number;
    acceptance_rate: number;
    draft_model: string;
    target_model: string;
  };
  cloud_gpu_cost_reduction: string;
  timestamp: number;
}

// ==========================================
// v7.0 AUTONOMOUS TALENT SINGULARITY TYPES
// ==========================================

export interface BioNeuralMetrics {
  heart_rate_bpm: number;
  hrv_rmssd_ms: number;
  hrv_normalized: number;
  pupil_dilation_mm: number;
  acoustic_jitter_percent: number;
  cognitive_overload_index: number;
  reasoning_accuracy: number;
}

export interface BioNeuralSessionData {
  session_id: string;
  candidate_id: string;
  tenant_id: string;
  cfrs_score: number;
  stress_resilience_rating: string;
  cognitive_state: string;
  clinical_status: string;
  rppg_confidence: number;
  telemetry_hash: string;
  heart_rate_bpm: number;
  hrv_rmssd_ms: number;
  hrv_normalized: number;
  pupil_dilation_mm: number;
  acoustic_jitter_percent: number;
  cognitive_overload_index: number;
  reasoning_accuracy: number;
  metrics: BioNeuralMetrics;
  formula_breakdown: {
    alpha_reasoning_contribution: number;
    beta_hrv_contribution: number;
    gamma_overload_deduction: number;
  };
  facs_micro_expressions: {
    action_unit_04_brow_furrow: string;
    action_unit_12_lip_corner_pull: string;
    composure_index: number;
  };
  created_at: number;
}

export interface BioNeuralProfile {
  candidate_id: string;
  average_cfrs: number;
  avg_cfrs: number;
  total_sessions: number;
  flow_state_consistency_pct: number;
  average_hrv_rmssd_ms: number;
  stress_resilience_tier: string;
  historical_sessions_analyzed: number;
  status: string;
}

export interface DigitalTwinProfileData {
  twin_id: string;
  candidate_id: string;
  architecture_affinity: string;
  memory_sync_status: string;
  communication_style: string;
  conflict_resolution_heuristic: string;
  technical_capability_vector: {
    verified_skills: string[];
    latent_ability_theta: number;
    system_design_heuristic: string;
    concurrency_mastery_index: number;
    code_velocity_percentile: number;
  };
  last_sync_at: number;
}

export interface BoardroomTranscriptTurn {
  speaker: string;
  agent_name: string;
  role: string;
  agent_role: string;
  message: string;
  dialogue: string;
  timestamp_offset_sec: number;
}

export interface DigitalTwinSimulationResult {
  simulation_id: string;
  twin_id: string;
  candidate_id: string;
  scenario_name: string;
  synergy_index: number;
  velocity_projection_90d: number;
  team_velocity_impact_percent: number;
  conflict_resolution_score: number;
  architecture_decision_rate: number;
  boardroom_transcript: BoardroomTranscriptTurn[];
  predictive_90_day_model: {
    estimated_days_to_first_production_pr: number;
    onboarding_velocity_rating: string;
    cross_functional_influence_score: number;
    burnout_risk_forecast: string;
    projected_code_review_acceptance_rate: string;
  };
  synthetic_team_verdict: string;
  created_at: number;
}

export interface ISATerms {
  salary_threshold_inr: number;
  isa_percent: number;
  duration_months: number;
  repayment_cap_multiple: number;
  projected_annual_investor_irr: string;
}

export interface SkillStakingPoolInfo {
  pool_id: string;
  candidate_id: string;
  candidate_name: string;
  current_ccrs: number;
  target_ccrs: number;
  roadmap_title: string;
  total_staked_inr: number;
  funding_goal_inr: number;
  target_funding_inr: number;
  isa_terms: ISATerms;
  status: string;
}

export interface SkillStakingContractData {
  contract_id: string;
  candidate_id: string;
  staker_wallet_address: string;
  staker_wallet: string;
  staked_capital_inr: number;
  staked_amount_inr: number;
  isa_percentage: number;
  cap_multiple: number;
  maximum_repayment_inr: number;
  projected_roi_percent: number;
  status: string;
  smart_contract_address: string;
  contract_hash: string;
  created_at: number;
}

export interface MicroBountyItem {
  bounty_id: string;
  title: string;
  bounty_payout_inr: number;
  target_skill: string;
  required_skill_vector: string[];
  difficulty?: string;
  status: string;
  sponsor?: string;
  claimed_by?: string | null;
}

export interface MicroBountyClaimResult {
  bounty_id: string;
  candidate_id: string;
  title: string;
  payout_inr: number;
  payout_amount_inr: number;
  status: string;
  verification_status: string;
  credential_hash: string;
  earned_micro_credential: {
    credential_id: string;
    badge_title: string;
    issuer: string;
    verification_hash: string;
    ccrs_bonus_points: number;
  };
  payout_status: string;
}

export interface LoRAFusedAdapter {
  adapter_id: string;
  domain: string;
  rank: number;
  fusion_weight: number;
}

export interface LoRAFusedSpecification {
  base_model: string;
  fusion_latency_ms: number;
  target_sla_ms: number;
  sla_satisfied: boolean;
  adapters_fused: string[];
  adapters_fused_count: number;
  lora_rank_r: number;
  lora_alpha: number;
  target_modules: string[];
  fused_adapters: LoRAFusedAdapter[];
  vllm_dynamic_adapter_status: string;
  evaluator_specialization: string;
}

export interface MultiJurisdictionAuditResult {
  audit_id: string;
  candidate_id: string;
  tenant_id: string;
  overall_compliance_verdict: string;
  overall_compliance_status: string;
  legal_defense_package_hash: string;
  jurisdiction_results: {
    EU_AI_ACT_TITLE_III: {
      jurisdiction: string;
      compliant: boolean;
      status: string;
      high_risk_annex_iii_compliant: boolean;
      article_86_explanation_ready: boolean;
      human_in_the_loop_officer: string;
      pii_scrubbed_certified: boolean;
      audit_standard: string;
    };
    NYC_LOCAL_LAW_144: {
      jurisdiction: string;
      compliant: boolean;
      status: string;
      adverse_impact_ratio: number;
      threshold: number;
      four_fifths_minimum_ratio: number;
      independent_auditor_verification: string;
      published_notice_status: string;
    };
    CALIFORNIA_AB_331: {
      jurisdiction: string;
      compliant: boolean;
      status: string;
      governance_framework: string;
      algorithmic_impact_assessment: string;
      candidate_opt_out_retained: boolean;
    };
    US_EEOC_UNIFORM_GUIDELINES: {
      jurisdiction: string;
      compliant: boolean;
      status: string;
      selection_rate_ratio: number;
      job_relatedness_validation: string;
      business_necessity_grounding: string;
    };
  };
  legal_defense_audit_package: {
    package_id: string;
    tamper_evident_hash: string;
    cryptographic_signature_standard: string;
    court_admissible_format: string;
    retention_period: string;
  };
  created_at: number;
}

// ==========================================
// v8.0 PLANETARY TALENT GRID TYPES
// ==========================================

export interface BCITelemetryResult {
  session_id: string; candidate_id: string; tenant_id: string;
  eeg_bands: { theta_power: number; alpha_power: number; beta_power: number; gamma_power?: number | null; sampling_rate_hz: number };
  engagement_index: number; engagement_formula: string;
  cognitive_state: 'FLOW' | 'OPTIMAL' | 'BASELINE' | 'FATIGUED' | 'OVERLOADED';
  fatigue_risk: 'LOW' | 'MODERATE' | 'HIGH'; session_duration_min: number;
  peak_engagement_session: number; fatigue_flags_session: number; raw_data_stored: false; timestamp: number;
}

export interface BCATUpdate {
  session_id: string; previous_difficulty_dk: number; updated_difficulty_dk: number;
  difficulty_action: 'INCREASE' | 'HOLD' | 'DECREASE' | 'DECREASE_RECOVERY';
  action_reason: string; cognitive_state: string; engagement_index: number;
  irt_theta_estimate: number; recovery_break_recommended: boolean; timestamp: number;
}

export interface NeuralFocusCertificate {
  certificate_id: string; candidate_id: string; session_id: string; tenant_id: string; certificate_type: string;
  attestation: { avg_engagement_index: number; peak_engagement_index: number; session_duration_min: number; fatigue_flags: number; cognitive_authenticity_confirmed: boolean; raw_eeg_stored: false; biometric_privacy_compliant: boolean };
  cryptographic_proof: { algorithm: string; authenticity_token: string; verification_url: string; tamper_evident: boolean };
  issued_at: number; valid_for_days: number;
}

export interface BCISessionProfile {
  candidate_id: string; tenant_id: string; total_sessions: number;
  avg_engagement_index: number; peak_engagement_index: number; avg_session_duration_min: number;
  total_fatigue_flags: number; cognitive_profile_tier: 'ELITE_FLOW' | 'HIGH_ENGAGEMENT' | 'MODERATE_ENGAGEMENT' | 'LOW_ENGAGEMENT' | 'UNINITIALIZED';
  bcat_difficulty_ceiling: number; status: string;
}

export interface PlanetaryEdgeNode { node_id: string; region: string; city: string; provider: string; base_latency_ms: number; capacity: number; status: string; active_sessions?: number; load_factor?: number; effective_latency_ms?: number; sla_10ms_satisfied?: boolean; }

export interface GridRoutingResult { routing_id: string; tenant_id: string; project_title: string; required_skills: string[]; team_size_requested: number; budget_inr: number; urgency: string; primary_edge_node: { node_id: string; region: string; city: string; provider: string; routing_latency_ms: number; skill_coverage_score: number; load_factor: number }; failover_edge_node: { node_id: string; region: string; city: string }; sub_10ms_sla_satisfied: boolean; estimated_candidate_matches: number; vllm_inference_localized: boolean; webgl_spatial_localized: boolean; routing_timestamp: number; }

export interface CrossBorderSettlement { settlement_id: string; candidate_id: string; milestone_id?: string | null; tenant_id: string; payment_breakdown: { gross_amount_inr: number; country_from: string; country_to: string; withholding_rate_pct: number; tax_withheld_inr: number; net_before_network_fee_inr: number; network_fee_inr: number; final_disbursement_inr: number }; stablecoin: { coin: string; network: string; estimated_settlement_sec: number; tx_hash: string; wallet_address: string }; compliance: { smart_contract_executed: boolean; labor_law_jurisdiction: string; tax_treaty_applied: boolean; kyc_aml_cleared: boolean }; status: string; settled_at: number; }

export interface GridTopology { topology_snapshot_at: number; total_edge_nodes: number; active_nodes: number; total_global_capacity: number; total_active_sessions: number; global_utilization_pct: number; sub_10ms_coverage_pct: number; edge_nodes: PlanetaryEdgeNode[]; }

export interface DATTeamResult { team_id: string; tenant_id: string; project_goals: string[]; required_skills: string[]; team_size: number; constitution_type: string; budget_inr: number; team_members: Array<{ member_ref: string; assigned_role: string; ccrs_score: number; twin_boardroom_synergy: number; communication_style: string; skills_contributing: string[]; availability: string }>; synergy_metrics: { synergy_index: number; avg_ccrs: number; avg_twin_boardroom_score: number; communication_style_diversity: number; velocity_projection_90d: number }; assembly_verdict: 'OPTIMAL' | 'ADEQUATE' | 'SUBOPTIMAL'; assembly_confidence: number; created_at: number; }

export interface DATConstitution { constitution_id: string; team_id: string; tenant_id: string; constitution_type: string; governance_template: Record<string, any>; escrow_total_inr: number; dispute_resolution: string; milestones: Array<{ milestone_id: string; title: string; deliverable: string; due_date: string; escrow_allocation_inr: number; peer_review_threshold: number; release_trigger: string; status: string }>; smart_contract: { address: string; abi_version: string; network: string; deployment_gas_estimate: string; immutable: boolean; auto_dispute_resolution: boolean }; status: string; deployed_at: number; }

export interface MilestoneEvaluation { evaluation_id: string; team_id: string; milestone_id: string; tenant_id: string; delivery_proof_received: boolean; peer_review_scores: number[]; avg_peer_review_score: number; required_threshold: number; threshold_met: boolean; milestone_status: 'VERIFIED' | 'UNDER_REVIEW'; escrow_disbursement: { triggered: boolean; amount_inr: number; tx_hash?: string | null; network: string }; dispute_resolution_status: string; evaluated_at: number; }

export interface EvolvedRubric { rubric_id: string; tenant_id: string; role_title: string; evolved_skill_weights: Record<string, number>; deprecated_skills: string[]; emerging_priority_skills: string[]; rubric_version: string; data_points_analyzed: number; auto_publish_to_jd: boolean; evolution_confidence: number; evolved_at: number; }

export interface STARKProofResult { proof_id: string; candidate_id: string; target_role: string; tenant_id: string; proof_system: string; circuit_backend: string; proof_components: Array<{ component: string; circuit_id: string; constraints: number; individual_proof_kb: number }>; aggregation: { total_component_proofs: number; total_constraints: number; compression_factor: number; aggregated_proof_size_kb: number; spec_limit_kb: number; within_spec: boolean }; public_signals: { meets_ccrs_threshold: boolean; min_ccrs_threshold: number; target_role: string; commitment_hash: string; nullifier: string }; private_inputs_hidden: boolean; raw_scores_exposed: boolean; pii_exposed: boolean; proving_time_ms: number; proof_hex: string; status: string; generated_at: number; }

export interface STARKVerification { proof_id: string; is_valid: boolean; meets_threshold: boolean; verification_latency_ms: number; sla_2ms_satisfied: boolean; proof_size_kb: number; verification_method: string; quantum_resistant: boolean; raw_data_accessed: boolean; verified_at: number; }

export interface C2PAWatermark { watermark_id: string; session_id: string; candidate_id?: string | null; media_type: string; content_type: string; c2pa_manifest: { spec_version: string; claim_generator: string; signing_algorithm: string; hardware_attestation: string; hardware_token_hash: string; manifest_hash: string; tamper_evident: boolean; chain_of_custody_preserved: boolean }; deepfake_resistance: { capture_layer_signed: boolean; browser_native_attestation: boolean; replay_attack_nonce: string; injection_attack_prevented: boolean }; signed_at: number; valid_for_session: boolean; }

export interface UniversalCareerLedger { ledger_id: string; candidate_id: string; tenant_id: string; total_verified_events: number; ledger_events: Array<{ event_type: string; proof_ref?: string; score_proven?: string; timestamp: number }>; ledger_root_hash: string; proof_system: string; pii_exposed: false; raw_data_exposed: false; quantum_resistant: boolean; instant_verification_latency_ms: number; universal_portability: boolean; generated_at: number; }

/* ── PRD v2.1 Specifications (FR-04, FR-06, FR-07) ── */
export interface CompleteInterviewResponse {
  interview_id: string;
  total_questions: number;
  filtered_audio_url: string;
  raw_audio_url: string;
  anc_performance: {
    average_db_reduction: string;
    background_noise_type_filtered: string[];
    voice_clarity_score: number;
  };
  overall_voice_score: number;
}

export interface ATSEvaluation {
  ats_score: number;
  score_grade: string;
  matched_keywords: string[];
  missing_keywords: string[];
  formatting_alerts: string[];
  recommendations: string[];
  metrics_detected_count?: number;
  action_verbs_detected?: string[];
  dimension_scores: {
    keyword_matching: number;
    section_compliance: number;
    action_verbs_metrics: number;
    readability_parsability: number;
  };
}

export interface TailoredCVResponse {
  cv_markdown: string;
  target_role: string;
  candidate_name: string;
  ats_evaluation: ATSEvaluation;
  structured_cv: {
    header: {
      name: string;
      role: string;
      email: string;
      phone: string;
      location: string;
      links: string[];
    };
    summary: string;
    skills: {
      core: string[];
      tools: string[];
    };
    experience: Array<{
      title: string;
      company: string;
      duration: string;
      bullets: string[];
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
      details?: string;
    }>;
  };
}

// ==========================================
// v27.0 POST-SIGN-IN PROFESSIONAL SOCIAL READINESS NETWORK
// (suggestion-v26.md Section 1 — Verified Feed, Identity Hub, Reach Accuracy)
// ==========================================

/** Badge union emitted by readiness._badge_for_status (backend `verification_badge`). */
export type VerificationBadge = 'Verified Candidate' | 'Top 5% CCRS' | 'System Architect';

/** Milestone categories automatically published by the readiness engine. */
export type ReadinessPostType =
  | 'SKILL_GAP_CLEARED'
  | 'QUIZ_MASTERY'
  | 'MOCK_INTERVIEW_PASSED'
  | 'PROJECT_BENCHMARK';

/** Single verified milestone card in the readiness feed. */
export interface ReadinessFeedPost {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateRole: string;
  candidateAvatarUrl: string;
  avatarGradient: string;
  verificationBadge: VerificationBadge;
  ccrsScore: number;
  postType: ReadinessPostType;
  title: string;
  skillTags: string[];
  proofHash?: string | null;
  likesCount: number;
  peerVerificationsCount: number;
  createdAt: string;
  timeAgo: string;
  source: string;
  /** Present on enterprise seed rows only (published rows omit the narrative fields). */
  details?: string;
  benchmarkMetric?: string;
  codeSnippet?: string | null;
}

export interface ReadinessFeedResponse {
  posts: ReadinessFeedPost[];
  total: number;
  source: string;
  generated_at: number;
  candidate_id?: string;
}

/** Payload for POST /readiness/social/posts. */
export interface ReadinessPostCreate {
  user_id?: string;
  post_type?: ReadinessPostType;
  title: string;
  skill_tags?: string[];
  proof_hash?: string;
  ccrs_score?: number;
}

/** Recruiter / enterprise inspection record (ProfileViewRecord contract). */
export interface ProfileViewRecord {
  id: string;
  viewerName: string;
  viewerCompany: string;
  viewerRole: string;
  isRecruiter: boolean;
  avatarGradient: string;
  matchedSkills: string[];
  vectorAlignmentPct: number;
  viewedAt: string;
  timeAgo: string;
  source: string;
  candidate_id?: string;
  profile_views_count?: number;
}

export interface ProfileViewsResponse {
  candidate_id: string;
  views: ProfileViewRecord[];
  total: number;
  generated_at: number;
}

/** Payload for POST /readiness/profiles/{candidate_id}/view. */
export interface ProfileViewCreate {
  viewer_name: string;
  viewer_company?: string;
  viewer_role?: string;
  is_recruiter?: boolean;
}

/** 3-pillar CCRS vector (weights: 50% / 30% / 20%). */
export interface CCRSBreakdown {
  s_match: number;
  a_quiz: number;
  i_voice: number;
}

/** Active Noise Cancellation telemetry produced by the voice STAR round. */
export interface ANCPerformance {
  db_reduction: number;
  clarity_score: number;
  engine: string;
}

export interface SocialProofProfiles {
  github?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
}

export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface SkillItem {
  id?: string;
  name: string;
  level: SkillProficiency;
  category?: string;
  years?: number;
}

export interface EducationItem {
  id?: string;
  degree: string;
  institution: string;
  field_of_study?: string;
  start_year?: string;
  end_year?: string;
  grade?: string;
  description?: string;
}

export interface ExperienceItem {
  id?: string;
  role: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
  description?: string;
}

/** Full Candidate Identity Hub payload (GET /readiness/profiles/{candidate_id}). */
export interface CandidateProfile {
  user_id: string;
  candidate_name: string;
  candidate_role: string;
  headline: string;
  bio: string;
  location: string;
  avatar_url: string;
  avatar_gradient: string;
  verification_status: string;
  verification_badge: VerificationBadge;
  liveness_verified: boolean;
  liveness_engine: string;
  ccrs_score: number;
  ccrs_breakdown: CCRSBreakdown;
  ccrs_formula: string;
  skills?: SkillItem[];
  education?: EducationItem[];
  experience?: ExperienceItem[];
  voice_snippet_url: string;
  voice_snippet_seconds: number;
  anc_performance: ANCPerformance;
  social_profiles: SocialProofProfiles;
  profile_views_count: number;
  public_proof_url: string;
  updated_at: string;
}

/** Payload for PUT /readiness/profiles/{candidate_id} (snake_case backend fields). */
export interface CandidateProfileUpdate {
  candidate_name?: string;
  avatar_url?: string;
  headline?: string;
  bio?: string;
  location?: string;
  skills?: SkillItem[];
  education?: EducationItem[];
  experience?: ExperienceItem[];
  voice_snippet_url?: string;
  social_profiles?: SocialProofProfiles;
  anc_performance?: ANCPerformance;
  ccrs_score?: number;
  s_match_score?: number;
  a_quiz_score?: number;
  i_voice_score?: number;
  liveness_verified?: boolean;
}

/** One week of the deterministic 6-week impression series. */
export interface WeeklyImpressionPoint {
  label: string;
  impressions: number;
  recruiter_views: number;
}

export interface AlignmentWeight {
  component: string;
  label: string;
  value: number;
  weight: number;
}

/** Cumulative Reach Accuracy Index payload (GET /readiness/profiles/{id}/analytics). */
export interface ProfileAnalytics {
  candidate_id: string;
  total_profile_impressions: number;
  unique_recruiter_companies: number;
  reach_accuracy_score: number;
  recruiter_view_share_pct: number;
  alignment_breakdown: AlignmentWeight[];
  weekly_impressions: WeeklyImpressionPoint[];
  top_search_vectors: string[];
  peak_visibility_window: string;
  recruiter_viewers: ProfileViewRecord[];
  formula: string;
  generated_at: number;
}

/** Lightweight badge/liveness probe (GET /readiness/profiles/{id}/verification). */
export interface ProfileVerification {
  candidate_id: string;
  verification_status: string;
  verification_badge: VerificationBadge;
  liveness_verified: boolean;
  checked_at: number;
}

