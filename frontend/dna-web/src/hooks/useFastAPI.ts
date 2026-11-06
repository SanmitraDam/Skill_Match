import { useMutation, useQuery } from '@tanstack/react-query';
import {
  SkillGapReport,
  BackendHealth,
  MCQQuestion,
  QuizResponse,
  QuizFinishResponse,
  InterviewQuestion,
  InterviewEvaluation,
  RoadmapPlan,
  CandidateRanking,
  CompleteInterviewResponse,
  TailoredCVResponse,
  ATSEvaluation,
  ReadinessFeedPost,
  ReadinessFeedResponse,
  ReadinessPostCreate,
  ProfileViewRecord,
  ProfileViewsResponse,
  ProfileViewCreate,
  CandidateProfile,
  CandidateProfileUpdate,
  ProfileAnalytics,
  ProfileVerification
} from '@/types/api';
import { API_BASE } from '@/lib/api-config';

export function useBackendHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/health`);
      if (!res.ok) throw new Error('Backend offline');
      return res.json() as Promise<BackendHealth>;
    },
    refetchInterval: 10000,
  });
}

export function useParseResume() {
  return useMutation({
    mutationFn: async (payload: File | { file: File; anonymizePii?: boolean }) => {
      const file = payload instanceof File ? payload : payload.file;
      const anonymize = payload instanceof File ? false : (payload.anonymizePii || false);

      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/skills/parse-resume?anonymize_pii=${anonymize}`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Parse failed' }));
        throw new Error(err.detail || 'Parse failed');
      }
      return res.json();
    },
  });
}

export function useParseJD() {
  return useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`${API_BASE}/skills/parse-jd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('JD analysis failed');
      return res.json();
    },
  });
}

export function useMatchSkills() {
  return useMutation({
    mutationFn: async ({ resumeId, jdId }: { resumeId: number; jdId: number }) => {
      const res = await fetch(`${API_BASE}/skills/match?resume_id=${resumeId}&jd_id=${jdId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Matching failed');
      return res.json() as Promise<SkillGapReport>;
    },
  });
}

export function useStartQuiz() {
  return useMutation({
    mutationFn: async (matchResultId: number) => {
      const res = await fetch(`${API_BASE}/quiz/start/${matchResultId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Quiz start failed');
      return res.json();
    },
  });
}

export function useNextQuestion() {
  return useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await fetch(`${API_BASE}/quiz/next-question/${sessionId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Question fetch failed');
      return res.json() as Promise<MCQQuestion>;
    },
  });
}

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: async ({ sessionId, response }: { sessionId: number; response: QuizResponse }) => {
      const res = await fetch(`${API_BASE}/quiz/submit-answer/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      });
      if (!res.ok) throw new Error('Answer submission failed');
      return res.json();
    },
  });
}

export function useFinishQuiz() {
  return useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await fetch(`${API_BASE}/quiz/finish/${sessionId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Quiz finish failed');
      return res.json() as Promise<QuizFinishResponse>;
    },
  });
}

export function useStartInterview() {
  return useMutation({
    mutationFn: async (matchResultId: number) => {
      const res = await fetch(`${API_BASE}/interview/start/${matchResultId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Interview start failed');
      return res.json();
    },
  });
}

export function useNextInterviewQuestion() {
  return useMutation({
    mutationFn: async (interviewId: string) => {
      const res = await fetch(`${API_BASE}/interview/next-question/${interviewId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Question fetch failed');
      return res.json() as Promise<InterviewQuestion>;
    },
  });
}

export function useSubmitInterviewAnswer() {
  return useMutation({
    mutationFn: async ({
      interviewId,
      audioFile,
      transcriptText
    }: {
      interviewId: string;
      audioFile?: Blob | File | null;
      transcriptText?: string;
    }) => {
      const formData = new FormData();
      if (audioFile) {
        formData.append('file', audioFile instanceof File ? audioFile : new File([audioFile], "answer.wav", { type: "audio/wav" }));
      }
      if (transcriptText) {
        formData.append('transcript_text', transcriptText);
      }
      const res = await fetch(`${API_BASE}/interview/submit-answer/${interviewId}`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Answer submission failed');
      return res.json() as Promise<{ transcript: string; evaluation: InterviewEvaluation }>;
    },
  });
}


export function useFinishInterview() {
  return useMutation({
    mutationFn: async (interviewId: string) => {
      const res = await fetch(`${API_BASE}/interview/finish/${interviewId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Interview finish failed');
      return res.json();
    },
  });
}

export function useCompleteInterview() {
  return useMutation({
    mutationFn: async (interviewId: string) => {
      const res = await fetch(`${API_BASE}/interview/complete/${interviewId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Interview complete failed');
      return res.json() as Promise<CompleteInterviewResponse>;
    },
  });
}

export function useGenerateTailoredCV() {
  return useMutation({
    mutationFn: async (payload: {
      profile_data?: Record<string, any>;
      custom_details?: string;
      job_description: string;
      target_role?: string;
    }) => {
      // Robust multi-path dispatch: try /api/v1/cv/generate-tailored first, then fallback to /cv/generate-tailored
      let res = await fetch(`${API_BASE}/api/v1/cv/generate-tailored`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/cv/generate-tailored`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'CV generation failed' }));
        throw new Error(err.detail || 'CV generation failed');
      }
      return res.json() as Promise<TailoredCVResponse>;
    },
  });
}

export function useATSCheck() {
  return useMutation({
    mutationFn: async (payload: {
      cv_text: string;
      job_description: string;
    }) => {
      let res = await fetch(`${API_BASE}/api/v1/cv/ats-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/cv/ats-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'ATS check failed' }));
        throw new Error(err.detail || 'ATS check failed');
      }
      return res.json() as Promise<ATSEvaluation>;
    },
  });
}

export function useExportCVPDF() {
  return useMutation({
    mutationFn: async (payload: {
      structured_cv: Record<string, any>;
      cv_markdown?: string;
      candidate_name?: string;
      target_role?: string;
    }) => {
      let res = await fetch(`${API_BASE}/api/v1/cv/export-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/cv/export-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        throw new Error('Failed to download CV PDF');
      }
      return res.blob();
    },
  });
}

export function useParseResumeFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      let res = await fetch(`${API_BASE}/api/v1/cv/parse-resume-file`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/cv/parse-resume-file`, {
          method: 'POST',
          body: formData,
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to parse resume file' }));
        throw new Error(err.detail || 'Failed to parse resume file');
      }
      return res.json() as Promise<Record<string, any>>;
    },
  });
}

export function useParseResumeText() {
  return useMutation({
    mutationFn: async (resumeText: string) => {
      let res = await fetch(`${API_BASE}/api/v1/cv/parse-resume-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText }),
      });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/cv/parse-resume-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resume_text: resumeText }),
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to parse resume text' }));
        throw new Error(err.detail || 'Failed to parse resume text');
      }
      return res.json() as Promise<Record<string, any>>;
    },
  });
}

export function useGenerateRoadmap() {
  return useMutation({
    mutationFn: async (readinessId: number) => {
      const res = await fetch(`${API_BASE}/readiness/generate-roadmap/${readinessId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Roadmap generation failed');
      return res.json() as Promise<RoadmapPlan>;
    },
  });
}

export function useCalculateReadiness() {
  return useMutation({
    mutationFn: async (matchResultId: number) => {
      const res = await fetch(`${API_BASE}/readiness/calculate/${matchResultId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Readiness calculation failed');
      return res.json();
    },
  });
}

export function useGetCandidateRankings() {
  return useQuery({
    queryKey: ['candidate-rankings'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/recruiter/candidates`);
      if (!res.ok) throw new Error('Failed to fetch candidate rankings');
      return res.json() as Promise<{ total_candidates: number; rankings: CandidateRanking[] }>;
    },
  });
}

export function useOpenBadge(readinessId: number | null) {
  return useQuery({
    queryKey: ['badge', readinessId],
    queryFn: async () => {
      if (!readinessId) return null;
      const res = await fetch(`${API_BASE}/readiness/badge/${readinessId}`);
      if (!res.ok) throw new Error('Failed to fetch badge');
      return res.json();
    },
    enabled: !!readinessId,
  });
}

export function useTelemetryMetrics() {
  return useQuery({
    queryKey: ['telemetry-metrics'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/telemetry/metrics`);
      if (!res.ok) throw new Error('Failed to fetch telemetry metrics');
      return res.json();
    },
    refetchInterval: 5000,
  });
}

export function useInterruptInterview() {
  return useMutation({
    mutationFn: async (interviewId: string) => {
      const res = await fetch(`${API_BASE}/interview/interrupt/${interviewId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Barge-in interrupt failed');
      return res.json();
    },
  });
}

export function useInterviewFSM(interviewId: string | null) {
  return useQuery({
    queryKey: ['interview-fsm', interviewId],
    queryFn: async () => {
      if (!interviewId) return null;
      const res = await fetch(`${API_BASE}/interview/fsm/${interviewId}`);
      if (!res.ok) throw new Error('Failed to fetch FSM state');
      return res.json();
    },
    enabled: !!interviewId,
    refetchInterval: 1000,
  });
}

// Enterprise Compliance & Governance Hooks (suggestion-v3.md)
export function useDisparateImpactAudit() {
  return useMutation({
    mutationFn: async (payload?: { tenant_id?: string; demographic_groups?: Record<string, { total: number; selected: number }> }) => {
      const res = await fetch(`${API_BASE}/compliance/disparate-impact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {}),
      });
      if (!res.ok) throw new Error('Disparate impact audit failed');
      return res.json();
    },
  });
}

export function useGenerateAttestation() {
  return useMutation({
    mutationFn: async ({ matchId, tenantId }: { matchId: number; tenantId?: string }) => {
      const res = await fetch(`${API_BASE}/compliance/attest/${matchId}?tenant_id=${tenantId || 'tenant_default'}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to generate Ed25519 attestation');
      return res.json();
    },
  });
}

export function useVerifyAttestation() {
  return useMutation({
    mutationFn: async (payload: { audit_hash: string; signature_b64: string; public_key_b64?: string }) => {
      const res = await fetch(`${API_BASE}/compliance/verify-attestation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Attestation verification failed');
      return res.json();
    },
  });
}

export function useRightToExplanation(matchId: number | null) {
  return useQuery({
    queryKey: ['right-to-explanation', matchId],
    queryFn: async () => {
      if (!matchId) return null;
      const res = await fetch(`${API_BASE}/compliance/explain/${matchId}`);
      if (!res.ok) throw new Error('Failed to fetch Right-to-Explanation breakdown');
      return res.json();
    },
    enabled: !!matchId,
  });
}

export function useAuditLogs(tenantId: string = 'tenant_default') {
  return useQuery({
    queryKey: ['audit-logs', tenantId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/compliance/audit-logs?tenant_id=${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch compliance audit logs');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

export function useHiringReviews(tenantId: string = 'tenant_default') {
  return useQuery({
    queryKey: ['hiring-reviews', tenantId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/compliance/reviews/${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch hiring reviews');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

export function useSubmitHiringReview() {
  return useMutation({
    mutationFn: async (payload: {
      match_result_id: number;
      tenant_id?: string;
      decision: string;
      notes?: string;
      matrix_scores?: Record<string, number>;
    }) => {
      const res = await fetch(`${API_BASE}/compliance/hiring-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to record hiring review');
      return res.json();
    },
  });
}

// SFU & WebAudio DSP Hooks
export function useSFUNegotiate() {
  return useMutation({
    mutationFn: async (payload: { candidate_id: string; client_region_preference?: string }) => {
      const res = await fetch(`${API_BASE}/sfu/session/negotiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('SFU session negotiation failed');
      return res.json();
    },
  });
}

export function useSFUDspEvaluate() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      raw_rms_energy?: number;
      background_noise_rms?: number;
      peak_dbfs?: number;
      wasm_filter_active?: boolean;
    }) => {
      const res = await fetch(`${API_BASE}/sfu/dsp/evaluate-sqi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Audio DSP evaluation failed');
      return res.json();
    },
  });
}

export function useQuantizedBenchmark() {
  return useQuery({
    queryKey: ['quantized-benchmark'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/telemetry/quantized-benchmark`);
      if (!res.ok) throw new Error('Failed to fetch quantized vector benchmark');
      return res.json();
    },
  });
}

// v5.0 Autonomous Agentic Ecosystem Hooks (suggestion-v4.md)
export function useStartAgentNegotiation() {
  return useMutation({
    mutationFn: async (payload: {
      tenant_id?: string;
      candidate_preferences: any;
      recruiter_criteria: any;
    }) => {
      const res = await fetch(`${API_BASE}/agents/negotiate/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to start agent negotiation');
      return res.json();
    },
  });
}

export function useAdvanceAgentNegotiation() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      challenge_solution_summary?: string;
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/agents/negotiate/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to advance agent negotiation');
      return res.json();
    },
  });
}

export function useSynthesizeGapCurriculum() {
  return useMutation({
    mutationFn: async (payload: { candidate_id: string; emerging_skill: string; current_ccrs?: number }) => {
      const res = await fetch(`${API_BASE}/agents/self-healing/synthesize-gap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to synthesize self-healing curriculum');
      return res.json();
    },
  });
}

export function useCompleteSyntheticChallenge() {
  return useMutation({
    mutationFn: async (payload: { candidate_id: string; skill: string; baseline_ccrs?: number; score?: number }) => {
      const res = await fetch(`${API_BASE}/agents/self-healing/complete-challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to re-benchmark challenge');
      return res.json();
    },
  });
}

export function useGraphRAGMatch() {
  return useMutation({
    mutationFn: async (payload: { candidate_skills: string[]; job_required_skills: string[] }) => {
      const res = await fetch(`${API_BASE}/graphrag/hybrid-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('GraphRAG hybrid match failed');
      return res.json();
    },
  });
}

export function useLaborMarketTrends() {
  return useQuery({
    queryKey: ['labor-market-trends'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/graphrag/market-trends`);
      if (!res.ok) throw new Error('Failed to fetch labor market trends');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

export function useIngestMarketStream() {
  return useMutation({
    mutationFn: async (postings_count: number = 2000) => {
      const res = await fetch(`${API_BASE}/graphrag/ingest-job-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postings_count }),
      });
      if (!res.ok) throw new Error('Stream ingestion failed');
      return res.json();
    },
  });
}

export function useGenerateZKProof() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      target_role: string;
      min_ccrs_threshold?: number;
      min_ability_rating?: number;
      actual_ccrs?: number;
      actual_ability?: number;
    }) => {
      const res = await fetch(`${API_BASE}/zkp/generate-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('zk-SNARK proof generation failed');
      return res.json();
    },
  });
}

export function useVerifyZKProof() {
  return useMutation({
    mutationFn: async (payload: { proof: any; public_signals: string[] }) => {
      const res = await fetch(`${API_BASE}/zkp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('zk-SNARK proof verification failed');
      return res.json();
    },
  });
}

export function useIssueVerifiableCredential() {
  return useMutation({
    mutationFn: async (payload: { candidate_id: string; role_title: string; ccrs?: number }) => {
      const res = await fetch(`${API_BASE}/zkp/issue-credential`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Verifiable credential issuance failed');
      return res.json();
    },
  });
}

export function useRLAFMetrics() {
  return useQuery({
    queryKey: ['rlaf-metrics'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/rlaf/metrics`);
      if (!res.ok) throw new Error('Failed to fetch RLAF metrics');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

// ==========================================
// VERSION 6.0: NEURO-SPATIAL-SWARM HOOKS
// ==========================================

export function useTalentLiquidityPools(tenant_id: string = "tenant_default") {
  return useQuery({
    queryKey: ['talent-liquidity-pools', tenant_id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/swarm/pools?tenant_id=${tenant_id}`);
      if (!res.ok) throw new Error('Failed to fetch talent liquidity pools');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

export function useCreateLiquidityPool() {
  return useMutation({
    mutationFn: async (payload: { tenant_id?: string; title: string; target_skills: string[]; total_budget_inr?: number }) => {
      const res = await fetch(`${API_BASE}/swarm/pools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create talent liquidity pool');
      return res.json();
    },
  });
}

export function useSubmitSwarmBid() {
  return useMutation({
    mutationFn: async (payload: { pool_id: string; candidate_id: string; candidate_skills: string[]; min_salary_inr?: number; contract_type?: string }) => {
      const res = await fetch(`${API_BASE}/swarm/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to submit swarm market bid');
      return res.json();
    },
  });
}

export function useSwarmEquilibrium(skill: string) {
  return useQuery({
    queryKey: ['swarm-equilibrium', skill],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/swarm/equilibrium-bounty?skill=${encodeURIComponent(skill)}`);
      if (!res.ok) throw new Error('Failed to compute swarm equilibrium');
      return res.json();
    },
    enabled: !!skill,
  });
}

export function useCandidateSwarmIntelligence(role: string) {
  return useQuery({
    queryKey: ['candidate-swarm-intelligence', role],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/swarm/candidate-intelligence?role=${encodeURIComponent(role)}`);
      if (!res.ok) throw new Error('Failed to fetch candidate swarm intelligence');
      return res.json();
    },
    enabled: !!role,
  });
}

export function useZ3VerifyPrerequisites() {
  return useMutation({
    mutationFn: async (payload: { modules: any[]; custom_prerequisites?: Record<string, string[]> }) => {
      const res = await fetch(`${API_BASE}/logic/verify-prerequisites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Z3 prerequisite verification failed');
      return res.json();
    },
  });
}

export function useZ3CheckCircularity() {
  return useMutation({
    mutationFn: async (payload: { edges: string[][] }) => {
      const res = await fetch(`${API_BASE}/logic/check-circularity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Z3 circularity check failed');
      return res.json();
    },
  });
}

export function usePQCGenerateKeys() {
  return useMutation({
    mutationFn: async (seed?: string) => {
      const res = await fetch(`${API_BASE}/pqc/generate-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed }),
      });
      if (!res.ok) throw new Error('PQC key generation failed');
      return res.json();
    },
  });
}

export function usePQCSignCredential() {
  return useMutation({
    mutationFn: async (payload: { candidate_id: string; role_title: string; ccrs_score: number; tenant_id?: string }) => {
      const res = await fetch(`${API_BASE}/pqc/sign-credential`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('PQC credential signing failed');
      return res.json();
    },
  });
}

export function usePQCVerifySignature() {
  return useMutation({
    mutationFn: async (payload: { canonical_statement: string; public_key_hex: string; signature_hex: string }) => {
      const res = await fetch(`${API_BASE}/pqc/verify-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('PQC signature verification failed');
      return res.json();
    },
  });
}

export function useFHEEncryptVector() {
  return useMutation({
    mutationFn: async (payload: { vector: number[]; key_id?: string }) => {
      const res = await fetch(`${API_BASE}/pqc/fhe-encrypt-vector`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('FHE vector encryption failed');
      return res.json();
    },
  });
}

export function useFHEMatch() {
  return useMutation({
    mutationFn: async (payload: { candidate_id: string; resume_ciphertext: any; job_ciphertext: any; candidate_skills?: string[]; job_skills?: string[]; tenant_id?: string }) => {
      const res = await fetch(`${API_BASE}/pqc/fhe-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('FHE homomorphic match failed');
      return res.json();
    },
  });
}

export function useNeuromorphicEdgeTurn() {
  return useMutation({
    mutationFn: async (payload: { session_id: string; client_hardware?: string; draft_tokens_generated?: number; candidate_utterance_text?: string }) => {
      const res = await fetch(`${API_BASE}/neuromorphic/edge-turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Neuromorphic edge turn failed');
      return res.json();
    },
  });
}

export function useNeuromorphicTelemetry() {
  return useQuery({
    queryKey: ['neuromorphic-telemetry'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/neuromorphic/telemetry`);
      if (!res.ok) throw new Error('Failed to fetch neuromorphic telemetry');
      return res.json();
    },
    refetchInterval: 12000,
  });
}

// ==========================================
// VERSION 7.0: AUTONOMOUS TALENT SINGULARITY HOOKS
// ==========================================

export function useProcessBioNeuralTelemetry() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      reasoning_accuracy?: number;
      heart_rate_bpm?: number;
      hrv_rmssd_ms?: number;
      pupil_dilation_mm?: number;
      acoustic_jitter_percent?: number;
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/bioneural/process-telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to process bio-neural telemetry');
      return res.json();
    },
  });
}

export function useBioNeuralProfile(candidate_id: string = "cand_bio_771") {
  return useQuery({
    queryKey: ['bioneural-profile', candidate_id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/bioneural/profile?candidate_id=${encodeURIComponent(candidate_id)}`);
      if (!res.ok) throw new Error('Failed to fetch bio-neural profile');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

export function useSyncDigitalTwin() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      technical_skills?: string[];
      communication_style?: string;
      recent_cat_theta?: number;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/digital-twin/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Digital twin synchronization failed');
      return res.json();
    },
  });
}

export function useRunBoardroomSimulation() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      scenario_name?: string;
      candidate_skills?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/digital-twin/simulate-boardroom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Boardroom simulation failed');
      return res.json();
    },
  });
}

export function useStakingOpportunities() {
  return useQuery({
    queryKey: ['staking-opportunities'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/staking/opportunities`);
      if (!res.ok) throw new Error('Failed to fetch staking opportunities');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

export function useStakeCandidate() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      staker_wallet: string;
      staked_amount_inr: number;
      isa_percentage?: number;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/staking/stake-candidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Candidate roadmap staking pledge failed');
      return res.json();
    },
  });
}

export function useMicroBounties(target_skill?: string) {
  return useQuery({
    queryKey: ['micro-bounties', target_skill],
    queryFn: async () => {
      const url = target_skill
        ? `${API_BASE}/api/v1/staking/bounties?target_skill=${encodeURIComponent(target_skill)}`
        : `${API_BASE}/api/v1/staking/bounties`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch micro-bounties');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

export function useClaimMicroBounty() {
  return useMutation({
    mutationFn: async (payload: {
      bounty_id: string;
      candidate_id: string;
      candidate_skills?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/staking/claim-bounty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Micro-bounty claim failed');
      return res.json();
    },
  });
}

export function useFuseLoRAAdapters() {
  return useMutation({
    mutationFn: async (payload: {
      base_model?: string;
      role_skills: string[];
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/lora/fuse-adapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Dynamic micro-LoRA adapter fusion failed');
      return res.json();
    },
  });
}

export function useMultiJurisdictionAudit() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      tenant_id?: string;
      selection_rates?: Record<string, number>;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/compliance/multi-jurisdiction-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Multi-jurisdictional compliance audit failed');
      return res.json();
    },
  });
}

// ============================================================
// SkillMatch DNA v8.0 — BCI Neural Cognitive Engine Hooks
// ============================================================

export function useIngestEEGTelemetry() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      theta_power: number;
      alpha_power: number;
      beta_power: number;
      gamma_power?: number;
      session_id?: string;
      sampling_rate_hz?: number;
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/bci/ingest-telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to ingest EEG telemetry');
      return res.json();
    },
  });
}

export function useUpdateBCAT() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      engagement_index: number;
      current_theta: number;
      current_difficulty?: number;
    }) => {
      const res = await fetch(`${API_BASE}/bci/update-bcat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update BCAT difficulty');
      return res.json();
    },
  });
}

export function useGenerateNeuralCertificate() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      session_id: string;
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/bci/generate-certificate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to generate neural focus certificate');
      return res.json();
    },
  });
}

export function useBCISessionProfile(candidate_id: string = 'cand_bci_001', tenant_id: string = 'tenant_default') {
  return useQuery({
    queryKey: ['bci-profile', candidate_id, tenant_id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/bci/session-profile?candidate_id=${encodeURIComponent(candidate_id)}&tenant_id=${encodeURIComponent(tenant_id)}`);
      if (!res.ok) throw new Error('Failed to fetch BCI profile');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

// ============================================================
// SkillMatch DNA v8.0 — Planetary Grid Routing Hooks
// ============================================================

export function useRouteTalentDemand() {
  return useMutation({
    mutationFn: async (payload: {
      project_requirements: {
        title: string;
        required_skills: string[];
        team_size: number;
        budget_inr?: number;
      };
      candidate_region_hint?: string;
      urgency?: string;
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/grid/route-demand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Planetary grid demand routing failed');
      return res.json();
    },
  });
}

export function useSimulateEdgeAllocation() {
  return useMutation({
    mutationFn: async (payload: {
      region: string;
      skill_requirements: string[];
      team_size: number;
    }) => {
      const res = await fetch(`${API_BASE}/grid/simulate-allocation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Edge allocation simulation failed');
      return res.json();
    },
  });
}

export function useCrossBorderSettle() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      country_from: string;
      country_to: string;
      gross_amount_inr: number;
      stablecoin?: string;
      milestone_id?: string;
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/grid/cross-border-settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Cross-border settlement failed');
      return res.json();
    },
  });
}

export function useGridTopology() {
  return useQuery({
    queryKey: ['grid-topology'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/grid/topology`);
      if (!res.ok) throw new Error('Failed to fetch grid topology');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

// ============================================================
// SkillMatch DNA v8.0 — DAT Enterprise Constitutions Hooks
// ============================================================

export function useAssembleDATTeam() {
  return useMutation({
    mutationFn: async (payload: {
      project_goals: string[];
      required_skills: string[];
      team_size?: number;
      constitution_type?: string;
      budget_inr?: number;
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/dat/assemble-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Autonomous team assembly failed');
      return res.json();
    },
  });
}

export function useDeployConstitution() {
  return useMutation({
    mutationFn: async (payload: {
      team_id: string;
      milestones: Array<{
        title: string;
        deliverable: string;
        due_date: string;
      }>;
      escrow_amount_inr: number;
      constitution_type?: string;
      dispute_resolution?: string;
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/dat/deploy-constitution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Constitution deployment failed');
      return res.json();
    },
  });
}

export function useEvaluateMilestone() {
  return useMutation({
    mutationFn: async (payload: {
      team_id: string;
      milestone_id: string;
      delivery_proof: Record<string, any>;
      peer_review_scores?: number[];
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/dat/evaluate-milestone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Milestone evaluation failed');
      return res.json();
    },
  });
}

export function useEvolveRubric() {
  return useMutation({
    mutationFn: async (payload: {
      tenant_id?: string;
      role_title: string;
      delivery_velocity_data: Array<{
        skills_used: string[];
        velocity_lift: number;
      }>;
    }) => {
      const res = await fetch(`${API_BASE}/dat/evolve-rubric`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Rubric evolution failed');
      return res.json();
    },
  });
}

// ============================================================
// SkillMatch DNA v8.0 — zk-STARK Holographic Proofs Hooks
// ============================================================

export function useGenerateSTARKProof() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      proof_components: string[];
      min_ccrs_threshold?: number;
      actual_ccrs?: number;
      target_role?: string;
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/zk-stark/generate-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Recursive zk-STARK proof generation failed');
      return res.json();
    },
  });
}

export function useVerifySTARKProof() {
  return useMutation({
    mutationFn: async (payload: {
      proof_id: string;
      proof_hex?: string;
      public_signals?: Record<string, any>;
    }) => {
      const res = await fetch(`${API_BASE}/zk-stark/verify-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('STARK proof verification failed');
      return res.json();
    },
  });
}

export function useC2PAWatermark() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      media_type?: string;
      candidate_id?: string;
      hardware_attestation_token?: string;
    }) => {
      const res = await fetch(`${API_BASE}/zk-stark/watermark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('C2PA watermark application failed');
      return res.json();
    },
  });
}

export function useUniversalCareerLedger(candidate_id: string = 'cand_stark_992', tenant_id: string = 'tenant_default') {
  return useQuery({
    queryKey: ['career-ledger', candidate_id, tenant_id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/zk-stark/career-ledger?candidate_id=${encodeURIComponent(candidate_id)}&tenant_id=${encodeURIComponent(tenant_id)}`);
      if (!res.ok) throw new Error('Failed to fetch career ledger');
      return res.json();
    },
    refetchInterval: 12000,
  });
}

/* =========================================================================
   SKILLMATCH DNA v9.0: UNIVERSAL SKILLOS HOOKS
   - Subvocal sEMG thought-speed articulation & enclave attestation
   - 1,024-qubit VQE & Photonic OPU vector search
   - Human-AI Squad task delegation & leadership matrix
   - zkDID issuance, reputation accrual & INR micro-royalties
   ========================================================================= */

// --- 1. Subvocal Telemetry Tier ---
export function useIngestSEMG() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      semg_channels: number[];
      sampling_rate_hz?: number;
      session_id?: string;
      context_hint?: string;
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/subvocal/ingest-semg`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to ingest sEMG stream');
      return res.json();
    },
  });
}

export function useRequestScaffolding() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      cognitive_friction_index: number;
      current_task?: string;
    }) => {
      const res = await fetch(`${API_BASE}/subvocal/scaffolding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to request scaffolding');
      return res.json();
    },
  });
}

export function useIssueEnclaveAttestation() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      session_id: string;
      enclave_type?: string;
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/subvocal/enclave-attestation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to issue hardware-enclave attestation');
      return res.json();
    },
  });
}

export function useSubvocalTelemetryState(session_id: string = 'sess_subvocal_123') {
  return useQuery({
    queryKey: ['subvocal-telemetry-state', session_id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/subvocal/telemetry-state?session_id=${encodeURIComponent(session_id)}`);
      if (!res.ok) throw new Error('Failed to fetch subvocal telemetry state');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

// --- 2. Quantum Vector Tier ---
export function useVQEProject() {
  return useMutation({
    mutationFn: async (payload: {
      classical_vector: number[];
      num_qubits?: number;
      ansatz_depth?: number;
    }) => {
      const res = await fetch(`${API_BASE}/quantum/vqe-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('VQE projection failed');
      return res.json();
    },
  });
}

export function useQKESimilarity() {
  return useMutation({
    mutationFn: async (payload: {
      vector_a: number[];
      vector_b: number[];
      target_role?: string;
    }) => {
      const res = await fetch(`${API_BASE}/quantum/qke-similarity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('QKE similarity calculation failed');
      return res.json();
    },
  });
}

export function usePhotonicSearch() {
  return useMutation({
    mutationFn: async (payload: {
      query_vector: number[];
      candidate_pool_size?: number;
    }) => {
      const res = await fetch(`${API_BASE}/quantum/photonic-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Photonic vector search failed');
      return res.json();
    },
  });
}

export function useQubitTopology() {
  return useQuery({
    queryKey: ['qubit-topology'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/quantum/qubit-topology`);
      if (!res.ok) throw new Error('Failed to fetch qubit topology');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

// --- 3. Co-Worker Agent Squad Tier ---
export function useDelegateTask() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      task_description: string;
      target_agent?: string;
      prompt_context?: string;
      session_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/squad/delegate-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Task delegation failed');
      return res.json();
    },
  });
}

export function useEvaluateCollaboration() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      session_id?: string;
      iterations_count?: number;
    }) => {
      const res = await fetch(`${API_BASE}/squad/evaluate-collaboration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Collaboration evaluation failed');
      return res.json();
    },
  });
}

export function useEvaluateTokenEconomy() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      total_prompt_tokens?: number;
      total_completion_tokens?: number;
      milestones_achieved?: number;
    }) => {
      const res = await fetch(`${API_BASE}/squad/token-economy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Token economy evaluation failed');
      return res.json();
    },
  });
}

export function useSquadLiveStatus() {
  return useQuery({
    queryKey: ['squad-live-status'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/squad/live-status`);
      if (!res.ok) throw new Error('Failed to fetch squad status');
      return res.json();
    },
    refetchInterval: 6000,
  });
}

// --- 4. zkDID & Skill Micro-Royalty Tier ---
export function useIssueZKDID() {
  return useMutation({
    mutationFn: async (payload?: {
      candidate_seed?: string;
      credential_claims?: string[];
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/zk-did/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {}),
      });
      if (!res.ok) throw new Error('zkDID issuance failed');
      return res.json();
    },
  });
}

export function useAccrueReputation() {
  return useMutation({
    mutationFn: async (payload: {
      zk_did: string;
      credential_type: string;
      score: number;
      proof_hash?: string;
    }) => {
      const res = await fetch(`${API_BASE}/zk-did/accrue-reputation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Reputation accrual failed');
      return res.json();
    },
  });
}

export function useRegisterSkillNode() {
  return useMutation({
    mutationFn: async (payload: {
      zk_did: string;
      skill_title: string;
      asset_cid: string;
      royalty_per_use_inr?: number;
      asset_type?: string;
    }) => {
      const res = await fetch(`${API_BASE}/royalty/register-skill-node`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Skill node registration failed');
      return res.json();
    },
  });
}

export function useDisburseMicroRoyalty() {
  return useMutation({
    mutationFn: async (payload: {
      skill_node_id: string;
      consumer_id?: string;
      usage_count?: number;
      token_symbol?: string;
    }) => {
      const res = await fetch(`${API_BASE}/royalty/disburse-micro-royalty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Micro-royalty disbursement failed');
      return res.json();
    },
  });
}

export function useRoyaltyLedger(zk_did: string = 'did:zk:skillos:7f8a9b1c2d3e') {
  return useQuery({
    queryKey: ['royalty-ledger', zk_did],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/royalty/ledger?zk_did=${encodeURIComponent(zk_did)}`);
      if (!res.ok) throw new Error('Failed to fetch royalty ledger');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

/* =========================================================================
   SKILLMATCH DNA v10.0: OMNIPRESENT TALENT SUPER-ECOSYSTEM HOOKS
   - Direct Cortical Knowledge Consolidation & Thought-to-Code (>500 WPM)
   - QAOA Multiverse Optimization & Quantum Superposition Collapse
   - Autonomous AI Enterprises & Self-Healing Judicial Arbitration (<500ms)
   - SkillAMM Constant-Product Liquidity Pools & Cross-Chain zk-STARK Mesh
   ========================================================================= */

// --- 1. Direct Cortical Knowledge Consolidation Tier ---
export function useConsolidateMemory() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      session_id?: string;
      theta_freq_hz?: number;
      gamma_freq_hz?: number;
      current_phase_coherence?: number;
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/cortical/consolidate-memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Memory consolidation induction failed');
      return res.json();
    },
  });
}

export function useRemediateGap() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      concept_impasse: string;
      candidate_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/cortical/remediate-gap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Neural gap remediation failed');
      return res.json();
    },
  });
}

export function useThoughtToCode() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      intent_prompt: string;
      target_language?: string;
      session_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/cortical/thought-to-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Thought-to-code compilation failed');
      return res.json();
    },
  });
}

export function useCorticalTelemetryState(session_id: string = 'sess_cortical_901') {
  return useQuery({
    queryKey: ['cortical-telemetry-state', session_id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/cortical/telemetry-state?session_id=${encodeURIComponent(session_id)}`);
      if (!res.ok) throw new Error('Failed to fetch cortical telemetry state');
      return res.json();
    },
    refetchInterval: 5000,
  });
}

// --- 2. QAOA Multiverse Optimization Tier ---
export function useOptimizeTeamQAOA() {
  return useMutation({
    mutationFn: async (payload: {
      role_requirements: string[];
      candidate_pool?: any[];
      ansatz_depth_p?: number;
      gamma_params?: number[];
      beta_params?: number[];
      diversity_weight?: number;
      cost_weight?: number;
    }) => {
      const res = await fetch(`${API_BASE}/qaoa/optimize-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('QAOA team optimization failed');
      return res.json();
    },
  });
}

export function useCollapseSuperposition() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      superposition_trajectories?: any[];
      contract_binding_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/qaoa/superposition-collapse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Quantum superposition collapse failed');
      return res.json();
    },
  });
}

export function useMultiverseTopology() {
  return useQuery({
    queryKey: ['multiverse-topology'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/qaoa/multiverse-topology`);
      if (!res.ok) throw new Error('Failed to fetch multiverse topology');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

// --- 3. Autonomous AI Enterprises & Judicial Court Tier ---
export function useCreateAutonomousEntity() {
  return useMutation({
    mutationFn: async (payload: {
      entity_name: string;
      mission_charter: string;
      initial_treasury_inr?: number;
      total_equity_shares?: number;
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/enterprise/create-autonomous-entity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Autonomous entity charter failed');
      return res.json();
    },
  });
}

export function useHireCandidateEnterprise() {
  return useMutation({
    mutationFn: async (payload: {
      entity_id: string;
      candidate_zk_did: string;
      role_title?: string;
      rate_per_block_inr?: number;
      equity_allocation?: number;
    }) => {
      const res = await fetch(`${API_BASE}/enterprise/hire-candidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Candidate hire failed');
      return res.json();
    },
  });
}

export function useStreamPayroll() {
  return useMutation({
    mutationFn: async (payload: {
      hire_id: string;
      blocks_elapsed?: number;
    }) => {
      const res = await fetch(`${API_BASE}/enterprise/stream-payroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Payroll streaming failed');
      return res.json();
    },
  });
}

export function useArbitrateDispute() {
  return useMutation({
    mutationFn: async (payload: {
      hire_id: string;
      dispute_reason: string;
      git_commit_sha?: string;
      test_coverage_pct?: number;
      dispute_amount_inr?: number;
    }) => {
      const res = await fetch(`${API_BASE}/enterprise/arbitrate-dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Dispute arbitration failed');
      return res.json();
    },
  });
}

export function useEnterpriseDirectory() {
  return useQuery({
    queryKey: ['enterprise-directory'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/enterprise/directory`);
      if (!res.ok) throw new Error('Failed to fetch enterprise directory');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

// --- 4. SkillAMM & Cross-Chain Bridge Tier ---
export function useCreateAMMPool() {
  return useMutation({
    mutationFn: async (payload: {
      skill_name: string;
      candidate_zk_did: string;
      initial_skill_reserve?: number;
      initial_inr_reserve?: number;
      skill_token_symbol?: string;
    }) => {
      const res = await fetch(`${API_BASE}/amm/create-pool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('AMM pool creation failed');
      return res.json();
    },
  });
}

export function useSwapSkillAMM() {
  return useMutation({
    mutationFn: async (payload: {
      pool_id: string;
      buyer_zk_did: string;
      inr_in: number;
    }) => {
      const res = await fetch(`${API_BASE}/amm/swap-skill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Skill swap failed');
      return res.json();
    },
  });
}

export function useAddLiquidityAMM() {
  return useMutation({
    mutationFn: async (payload: {
      pool_id: string;
      provider_zk_did: string;
      skill_amount: number;
      inr_amount: number;
    }) => {
      const res = await fetch(`${API_BASE}/amm/add-liquidity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Adding liquidity failed');
      return res.json();
    },
  });
}

export function useClaimYieldAMM() {
  return useMutation({
    mutationFn: async (payload: {
      pool_id: string;
      candidate_zk_did: string;
    }) => {
      const res = await fetch(`${API_BASE}/amm/claim-yield`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Claiming yield failed');
      return res.json();
    },
  });
}

export function useAMMPools() {
  return useQuery({
    queryKey: ['amm-pools'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/amm/pools`);
      if (!res.ok) throw new Error('Failed to fetch AMM pools');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

export function useBridgeProofCrossChain() {
  return useMutation({
    mutationFn: async (payload: {
      proof_id: string;
      source_chain?: string;
      target_chain?: string;
      credential_hash?: string;
      candidate_zk_did?: string;
    }) => {
      const res = await fetch(`${API_BASE}/cross-chain/bridge-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Cross-chain proof bridge failed');
      return res.json();
    },
  });
}

/* =========================================================================
   SKILLMATCH DNA v11.0: POST-SINGULARITY TALENT NEXUS HOOKS
   - Synaptic Engram Telemetry & Synthetic Co-Processor Bus (<1ms)
   - Topological Quantum Neural Embeddings & Multiverse Annealing
   - Self-Evolving Autonomous Enterprise Guilds & Skill Collateralization Credit
   - Zero-Knowledge MPC Encrypted Matching & Anti-Fragile Compliance
   ========================================================================= */

// --- 1. Synaptic Engram Telemetry Tier ---
export function useIngestSynapticEngram() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      nirs_delta_hbo2?: number;
      nirs_delta_hbr?: number;
      hd_eeg_gamma_power?: number;
      hd_eeg_theta_power?: number;
      session_id?: string;
      tenant_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/synaptic/ingest-engram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to ingest synaptic engram stream');
      return res.json();
    },
  });
}

export function useCoprocessorSync() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      offload_task?: string;
      active_memory_variables?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/synaptic/coprocessor-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to sync synthetic co-processor bus');
      return res.json();
    },
  });
}

export function useSynapticScaffolding() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      cognitive_reserve?: number;
      current_challenge?: string;
    }) => {
      const res = await fetch(`${API_BASE}/synaptic/scaffolding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to generate synaptic scaffolding');
      return res.json();
    },
  });
}

export function useSynapticTelemetryState(session_id: string = 'sess_synaptic_001') {
  return useQuery({
    queryKey: ['synaptic-telemetry-state', session_id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/synaptic/telemetry-state?session_id=${encodeURIComponent(session_id)}`);
      if (!res.ok) throw new Error('Failed to fetch synaptic telemetry state');
      return res.json();
    },
    refetchInterval: 5000,
  });
}

// --- 2. Topological Quantum Tier ---
export function useProjectBraidEmbedding() {
  return useMutation({
    mutationFn: async (payload: {
      classical_vector: number[];
      num_majorana_modes?: number;
      braid_sequence_length?: number;
    }) => {
      const res = await fetch(`${API_BASE}/topological/braid-embedding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Topological braid projection failed');
      return res.json();
    },
  });
}

export function useComputeBraidMatch() {
  return useMutation({
    mutationFn: async (payload: {
      vector_resume: number[];
      vector_job: number[];
      skill_domains?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/topological/braid-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Topological braid match computation failed');
      return res.json();
    },
  });
}

export function useAnnealMultiverseMarket() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_count?: number;
      enterprise_role_count?: number;
      target_equilibrium_metric?: string;
    }) => {
      const res = await fetch(`${API_BASE}/topological/anneal-market`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Multiverse market annealing failed');
      return res.json();
    },
  });
}

export function useTopologicalHardwareTopology() {
  return useQuery({
    queryKey: ['topological-hardware-topology'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/topological/hardware-topology`);
      if (!res.ok) throw new Error('Failed to fetch topological hardware topology');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

// --- 3. Autonomous Enterprise Guilds & Skill Credit Tier ---
export function useCharterGuild() {
  return useMutation({
    mutationFn: async (payload: {
      guild_name: string;
      repository_url: string;
      initial_vault_inr?: number;
      total_governance_shares?: number;
      sprint_objective?: string;
    }) => {
      const res = await fetch(`${API_BASE}/guild/charter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Autonomous guild charter failed');
      return res.json();
    },
  });
}

export function useRecruitGuildTalent() {
  return useMutation({
    mutationFn: async (payload: {
      guild_id: string;
      candidate_zk_did: string;
      role_title?: string;
      rate_per_block_inr?: number;
      equity_shares?: number;
    }) => {
      const res = await fetch(`${API_BASE}/guild/recruit-talent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Guild recruitment failed');
      return res.json();
    },
  });
}

export function useCollateralizeSkill() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_zk_did: string;
      skill_name?: string;
      proficiency_score?: number;
      ccrs_rating_pct?: number;
    }) => {
      const res = await fetch(`${API_BASE}/guild/collateralize-skill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Skill vector collateralization failed');
      return res.json();
    },
  });
}

export function useDrawGuildCredit() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_zk_did: string;
      amount_inr: number;
    }) => {
      const res = await fetch(`${API_BASE}/guild/draw-credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Credit draw failed');
      return res.json();
    },
  });
}

export function useGuildDirectory() {
  return useQuery({
    queryKey: ['guild-directory'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/guild/directory`);
      if (!res.ok) throw new Error('Failed to fetch guild directory');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

// --- 4. Zero-Knowledge MPC & Anti-Fragile Compliance Tier ---
export function useEvaluateEncryptedMatch() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_encrypted_shares: string[];
      job_encrypted_shares: string[];
      candidate_zk_did?: string;
      num_mpc_nodes?: number;
    }) => {
      const res = await fetch(`${API_BASE}/zk-mpc/encrypted-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('zk-MPC encrypted match evaluation failed');
      return res.json();
    },
  });
}

export function useVerifyComplianceZKMPC() {
  return useMutation({
    mutationFn: async (payload: {
      rubric_id?: string;
      synthetic_sample_size?: number;
    }) => {
      const res = await fetch(`${API_BASE}/zk-mpc/verify-compliance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Anti-fragile compliance verification failed');
      return res.json();
    },
  });
}

export function useAuditDossierZKMPC() {
  return useQuery({
    queryKey: ['zk-mpc-audit-dossier'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/zk-mpc/audit-dossier`);
      if (!res.ok) throw new Error('Failed to fetch zk-MPC audit dossier');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

// ==========================================
// SkillMatch DNA v12.0 Hooks: Universal Super-Intelligence & Photonic Matrix
// ==========================================

export function useRenderPhotonicLightField() {
  return useMutation({
    mutationFn: async (payload: {
      architecture_id: string;
      ray_density_per_voxel?: number;
      parallax_angle_range_deg?: number;
      target_luminance_nits?: number;
      depth_planes?: number;
    }) => {
      const res = await fetch(`${API_BASE}/photonic/render-lightfield`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Photonic light-field rendering failed');
      return res.json();
    },
  });
}

export function useSynthesizeSubCorticalIntuition() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      pre_verbal_activation_index: number;
      cognitive_concept_intent?: string;
      problem_solving_context?: string;
    }) => {
      const res = await fetch(`${API_BASE}/photonic/synthesize-intuition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Sub-cortical intuition synthesis failed');
      return res.json();
    },
  });
}

export function useComputeBCASScore() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      team_agents?: string[];
      phase_synchrony_index?: number;
      stress_resilience_metric?: number;
      emotional_composure_delta?: number;
    }) => {
      const res = await fetch(`${API_BASE}/photonic/bcas-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('BCAS neuro-coherence computation failed');
      return res.json();
    },
  });
}

export function usePhotonicTelemetryState(sessionId: string = 'default_session') {
  return useQuery({
    queryKey: ['photonic-telemetry', sessionId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/photonic/telemetry-state?session_id=${sessionId}`);
      if (!res.ok) throw new Error('Failed to fetch photonic telemetry');
      return res.json();
    },
    refetchInterval: 5000,
  });
}

export function useEmbedPoincareManifold() {
  return useMutation({
    mutationFn: async (payload: {
      classical_vector: number[];
      hierarchy_depth?: number;
      domain?: string;
    }) => {
      const res = await fetch(`${API_BASE}/hyperbolic/embed-poincare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Poincaré manifold embedding failed');
      return res.json();
    },
  });
}

export function useHDQNNHyperbolicMatch() {
  return useMutation({
    mutationFn: async (payload: {
      vector_resume: number[];
      vector_job: number[];
      skill_taxonomies?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/hyperbolic/hd-qnn-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Photonic HD-QNN hyperbolic match failed');
      return res.json();
    },
  });
}

export function useMultiverseMatchingMesh() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_pool_size?: number;
      enterprise_role_count?: number;
      max_market_friction_tolerance?: number;
    }) => {
      const res = await fetch(`${API_BASE}/hyperbolic/multiverse-mesh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Multiverse matching mesh evaluation failed');
      return res.json();
    },
  });
}

export function usePhotonicChipMetrics() {
  return useQuery({
    queryKey: ['photonic-chip-metrics'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/hyperbolic/chip-metrics`);
      if (!res.ok) throw new Error('Failed to fetch photonic chip metrics');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

export function useCreateTalentDAO() {
  return useMutation({
    mutationFn: async (payload: {
      dao_id: string;
      name: string;
      domain?: string;
      initial_treasury_inr?: number;
      planetary_skill_index?: number;
    }) => {
      const res = await fetch(`${API_BASE}/utdao/create-dao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('UTDAO creation failed');
      return res.json();
    },
  });
}

export function useMintSyntheticSkill() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      zk_did_commitment: string;
      ccrs_score: number;
      requested_liquidity_inr: number;
      duration_months?: number;
    }) => {
      const res = await fetch(`${API_BASE}/utdao/mint-synthetic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Mint synthetic asset failed' }));
        throw new Error(err.detail || 'Mint synthetic asset failed');
      }
      return res.json();
    },
  });
}

export function useClaimAUBIYield() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      zk_did_commitment: string;
      engram_contribution_score?: number;
    }) => {
      const res = await fetch(`${API_BASE}/utdao/claim-aubi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Claim aUBI micro-yield failed');
      return res.json();
    },
  });
}

export function useSubmitRDGrant() {
  return useMutation({
    mutationFn: async (payload: {
      dao_id: string;
      title: string;
      research_objective: string;
      grant_amount_inr: number;
      recipient_wallet: string;
    }) => {
      const res = await fetch(`${API_BASE}/utdao/grant-r-and-d`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('R&D grant proposal submission failed');
      return res.json();
    },
  });
}

export function useUTDAODirectory() {
  return useQuery({
    queryKey: ['utdao-directory'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/utdao/directory`);
      if (!res.ok) throw new Error('Failed to fetch UTDAO directory');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

export function useProvePlonky3Rollup() {
  return useMutation({
    mutationFn: async (payload: {
      batch_id: string;
      assessment_records_count?: number;
      recursive_depth?: number;
      target_blockchain?: string;
    }) => {
      const res = await fetch(`${API_BASE}/cross-quantum/prove-rollup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Plonky3 recursive rollup proof generation failed');
      return res.json();
    },
  });
}

export function useEvaluateABSCAudit() {
  return useMutation({
    mutationFn: async (payload: {
      employer_model_id: string;
      protected_cohort_selection_rate: number;
      baseline_cohort_selection_rate: number;
      demographic_cohort_name?: string;
    }) => {
      const res = await fetch(`${API_BASE}/cross-quantum/absc-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('ABSC bias audit failed');
      return res.json();
    },
  });
}

export function useSettleMultichainRollup() {
  return useMutation({
    mutationFn: async (payload: {
      batch_root: string;
      chains?: string[];
      plonky3_proof_hash: string;
    }) => {
      const res = await fetch(`${API_BASE}/cross-quantum/settle-multichain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Multi-chain rollup settlement failed');
      return res.json();
    },
  });
}

export function useCrossQuantumRollups() {
  return useQuery({
    queryKey: ['cross-quantum-rollups'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/cross-quantum/rollups`);
      if (!res.ok) throw new Error('Failed to fetch cross-quantum rollups');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

// ==========================================
// SkillMatch DNA v13.0 Hooks: Omni-Dimensional Super-Intelligence & Synthetic Species
// ==========================================

export function useExecuteEngramTransfer() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      skill_curriculum_domain?: string;
      hd_eeg_gamma_power?: number;
      hd_eeg_theta_power?: number;
      nirs_hemodynamic_oxygenation?: number;
      neuro_pacing_sync_hz?: number;
    }) => {
      const res = await fetch(`${API_BASE}/subcortical/engram-transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Sub-cortical engram transfer failed');
      return res.json();
    },
  });
}

export function useStreamCoProcessorBus() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      active_design_challenge?: string;
      working_memory_slots?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/subcortical/coprocessor-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Co-processor bus stream sync failed');
      return res.json();
    },
  });
}

export function useCompileThoughtToSystem() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      subvocal_intent_signal: string;
      target_compilation_target?: string;
      equivalent_wpm_input_speed?: number;
    }) => {
      const res = await fetch(`${API_BASE}/subcortical/thought-to-system`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Thought-to-system compilation failed');
      return res.json();
    },
  });
}

export function useSubCorticalTelemetryState(sessionId: string = 'default_session') {
  return useQuery({
    queryKey: ['subcortical-telemetry', sessionId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/subcortical/telemetry-state?session_id=${sessionId}`);
      if (!res.ok) throw new Error('Failed to fetch sub-cortical telemetry');
      return res.json();
    },
    refetchInterval: 5000,
  });
}

export function useOptimizeSquadTQQAOA() {
  return useMutation({
    mutationFn: async (payload: {
      species_pool?: string[];
      project_constraints_count?: number;
      p_layers?: number;
      diversity_threshold?: number;
      cost_efficiency_weight?: number;
    }) => {
      const res = await fetch(`${API_BASE}/tq-qaoa/optimize-squad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('TQ-QAOA squad optimization failed');
      return res.json();
    },
  });
}

export function useCollapseSuperpositionState() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      superposition_roles?: string[];
      triggering_contract_tx?: string;
    }) => {
      const res = await fetch(`${API_BASE}/tq-qaoa/superposition-collapse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Quantum superposition state collapse failed');
      return res.json();
    },
  });
}

export function useEntangleSkillDomains() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      skill_domains?: string[];
      entanglement_depth?: number;
    }) => {
      const res = await fetch(`${API_BASE}/tq-qaoa/entangle-skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Skill domain entanglement failed');
      return res.json();
    },
  });
}

export function useTQQAOATopology() {
  return useQuery({
    queryKey: ['tq-qaoa-topology'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/tq-qaoa/topology`);
      if (!res.ok) throw new Error('Failed to fetch TQ-QAOA topology');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

export function useCharterMAGGuild() {
  return useMutation({
    mutationFn: async (payload: {
      guild_id: string;
      name: string;
      initial_treasury_inr?: number;
      primary_objective?: string;
    }) => {
      const res = await fetch(`${API_BASE}/mag/charter-guild`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Charter Multi-Species Guild failed');
      return res.json();
    },
  });
}

export function useHireSpeciesWorker() {
  return useMutation({
    mutationFn: async (payload: {
      guild_id: string;
      species: string;
      payout_address: string;
      zk_did_commitment: string;
      stream_rate_per_block_inr?: number;
      milestone_scope?: string;
    }) => {
      const res = await fetch(`${API_BASE}/mag/hire-species`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Hire species worker failed');
      return res.json();
    },
  });
}

export function useStreamBlockPayroll() {
  return useMutation({
    mutationFn: async (payload: {
      worker_id: string;
      guild_id: string;
      blocks_elapsed?: number;
    }) => {
      const res = await fetch(`${API_BASE}/mag/stream-block-payroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Block stream payroll claim failed');
      return res.json();
    },
  });
}

export function useSwapSkillLiquidityV2() {
  return useMutation({
    mutationFn: async (payload: {
      pool_id: string;
      in_token?: string;
      amount_in: number;
      min_skill_proficiency_dk?: number;
    }) => {
      const res = await fetch(`${API_BASE}/mag/swap-skill-liquidity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'SkillSwap v2.0 failed' }));
        throw new Error(err.detail || 'SkillSwap v2.0 failed');
      }
      return res.json();
    },
  });
}

export function useMAGDirectory() {
  return useQuery({
    queryKey: ['mag-directory'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/mag/directory`);
      if (!res.ok) throw new Error('Failed to fetch MAG directory');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

export function useResolveDisputeAutomated() {
  return useMutation({
    mutationFn: async (payload: {
      milestone_id: string;
      claimant_address: string;
      respondent_address: string;
      disputed_amount_inr?: number;
      git_commit_hash?: string;
      test_coverage_percent: number;
      wasm_benchmark_score: number;
    }) => {
      const res = await fetch(`${API_BASE}/arbitration/resolve-dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Supreme AI judicial dispute resolution failed');
      return res.json();
    },
  });
}

export function useGenerateCompactPlonky3Proof() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      zk_did_commitment: string;
      history_years?: number;
      assessment_records_aggregated?: number;
    }) => {
      const res = await fetch(`${API_BASE}/arbitration/plonky3-compact-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Generate ultra-compact Plonky3 proof failed');
      return res.json();
    },
  });
}

export function useBridgeUniversalIdentity() {
  return useMutation({
    mutationFn: async (payload: {
      compact_proof_hash: string;
      source_chain?: string;
      destination_chains?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/arbitration/bridge-universal-identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Bridge universal identity failed');
      return res.json();
    },
  });
}

export function useArbitrationDocket() {
  return useQuery({
    queryKey: ['arbitration-docket'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/arbitration/docket`);
      if (!res.ok) throw new Error('Failed to fetch arbitration docket');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

/* =========================================================================
   VERSION 14.0 — COSMIC NEURAL NOOSPHERE PLATFORM HOOKS
   ========================================================================= */

// Pillar 1: Cosmic Telepathy & Sub-Cortical Memory Transduction
export function useTransduceIntuition() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      pre_verbal_intent_domain?: string;
      opto_acoustic_nirs_channels?: number;
      hemodynamic_oxygenation_delta?: number;
      subvocal_frequency_hz?: number;
      target_compilation_wpm?: number;
    }) => {
      const res = await fetch(`${API_BASE}/cosmic-telepathy/transduce-intuition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Transduce intuition failed');
      return res.json();
    },
  });
}

export function useNeuroPacingConsolidation() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      roadmap_curriculum_id?: string;
      baseline_curriculum_weeks?: number;
      theta_oscillation_hz?: number;
      gamma_oscillation_hz?: number;
      neuro_pacing_duty_cycle?: number;
    }) => {
      const res = await fetch(`${API_BASE}/cosmic-telepathy/neuro-pacing-consolidation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Neuro pacing consolidation failed');
      return res.json();
    },
  });
}

export function useEnclaveWatermark() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      enclave_type?: string;
      raw_subcortical_signal_digest: string;
      focus_duration_seconds?: number;
    }) => {
      const res = await fetch(`${API_BASE}/cosmic-telepathy/enclave-watermark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Enclave watermark failed');
      return res.json();
    },
  });
}

export function useVerifyC2PA() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      frame_capture_hash: string;
      audio_sample_hash: string;
      hardware_signer_pubkey: string;
      device_model?: string;
    }) => {
      const res = await fetch(`${API_BASE}/cosmic-telepathy/c2pa-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('C2PA verification failed');
      return res.json();
    },
  });
}

export function useCosmicTelemetryState(sessionId: string) {
  return useQuery({
    queryKey: ['cosmic-telemetry-state', sessionId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/cosmic-telepathy/telemetry-state?session_id=${encodeURIComponent(sessionId)}`);
      if (!res.ok) throw new Error('Failed to fetch cosmic telemetry state');
      return res.json();
    },
    enabled: !!sessionId,
    refetchInterval: 5000,
  });
}

// Pillar 2: HD-PQNN Poincaré Quantum Neural Mesh
export function usePoincareProject() {
  return useMutation({
    mutationFn: async (payload: {
      vector_id: string;
      skill_hierarchy_labels?: string[];
      target_dimension?: number;
      manifold_curvature?: number;
    }) => {
      const res = await fetch(`${API_BASE}/hd-pqnn/poincare-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Poincaré projection failed');
      return res.json();
    },
  });
}

export function useHyperbolicMatch() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      job_id: string;
      candidate_poincare_norm?: number;
      job_poincare_norm?: number;
      euclidean_diff_norm?: number;
    }) => {
      const res = await fetch(`${API_BASE}/hd-pqnn/hyperbolic-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Hyperbolic match failed');
      return res.json();
    },
  });
}

export function usePhotonicOpticalMultiply() {
  return useMutation({
    mutationFn: async (payload: {
      matrix_dim_n?: number;
      optical_rings_count?: number;
      waveguide_frequency_thz?: number;
      target_throughput_ops_sec?: number;
    }) => {
      const res = await fetch(`${API_BASE}/hd-pqnn/photonic-optical-multiply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Photonic optical multiply failed');
      return res.json();
    },
  });
}

export function useHDPQNNTopology() {
  return useQuery({
    queryKey: ['hd-pqnn-topology'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/hd-pqnn/topology`);
      if (!res.ok) throw new Error('Failed to fetch HD-PQNN topology');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

// Pillar 3: UTDAO v2.0 & aUBI Skill Vaults
export function useCharterGuildV2() {
  return useMutation({
    mutationFn: async (payload: {
      guild_id: string;
      guild_name: string;
      founder_zkdid: string;
      target_repository_uri?: string;
      initial_treasury_inr?: number;
      market_demand_index?: number;
    }) => {
      const res = await fetch(`${API_BASE}/utdao-v2/charter-guild`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Charter UTDAO v2.0 guild failed');
      return res.json();
    },
  });
}

export function useCollateralizeSkillV2() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      candidate_zkdid: string;
      skill_domain?: string;
      proficiency_dk: number;
      staked_collateral_inr?: number;
      solution_module_uri?: string;
    }) => {
      const res = await fetch(`${API_BASE}/utdao-v2/collateralize-skill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Skill collateralization failed' }));
        throw new Error(err.detail || 'Skill collateralization failed');
      }
      return res.json();
    },
  });
}

export function useClaimAUBI() {
  return useMutation({
    mutationFn: async (payload: {
      vault_id: string;
      candidate_zkdid: string;
      blocks_elapsed?: number;
      solution_query_count?: number;
    }) => {
      const res = await fetch(`${API_BASE}/utdao-v2/claim-aubi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Claim aUBI failed');
      return res.json();
    },
  });
}

export function useStreamEquityV2() {
  return useMutation({
    mutationFn: async (payload: {
      guild_id: string;
      recipient_zkdid: string;
      shares_basis_points?: number;
      verified_prs_count?: number;
      system_uptime_percentage?: number;
    }) => {
      const res = await fetch(`${API_BASE}/utdao-v2/stream-equity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Stream equity failed');
      return res.json();
    },
  });
}

export function useUTDAOv2Directory() {
  return useQuery({
    queryKey: ['utdao-v2-directory'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/utdao-v2/directory`);
      if (!res.ok) throw new Error('Failed to fetch UTDAO v2.0 directory');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

// Pillar 4: Plonky3 Multi-Chain Rollups
export function useBundleRecursivePlonky3() {
  return useMutation({
    mutationFn: async (payload: {
      batch_identifier?: string;
      raw_proof_records_count?: number;
      cohort_types?: string[];
      fri_folding_factor?: number;
      security_bits?: number;
    }) => {
      const res = await fetch(`${API_BASE}/plonky3-rollup/bundle-recursive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Bundle recursive Plonky3 proof failed');
      return res.json();
    },
  });
}

export function useVerifyMultichainPlonky3() {
  return useMutation({
    mutationFn: async (payload: {
      batch_root: string;
      target_chain?: string;
      plonky3_proof_hex: string;
      candidate_count?: number;
    }) => {
      const res = await fetch(`${API_BASE}/plonky3-rollup/verify-multichain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Verify multichain Plonky3 proof failed');
      return res.json();
    },
  });
}

export function useVerifyC2PAAttestation() {
  return useMutation({
    mutationFn: async (payload: {
      attestation_id: string;
      camera_hardware_enclave?: string;
      frame_sha256: string;
      timestamp_epoch_ms: number;
      cryptographic_signature_hex: string;
    }) => {
      const res = await fetch(`${API_BASE}/plonky3-rollup/c2pa-attestation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('C2PA attestation verification failed');
      return res.json();
    },
  });
}

export function usePlonky3Batches() {
  return useQuery({
    queryKey: ['plonky3-batches'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/plonky3-rollup/batches`);
      if (!res.ok) throw new Error('Failed to fetch Plonky3 batches');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

/* =========================================================================
   VERSION 15.0 — MULTI-STAGE INTERVIEW READINESS & FLASHCARD ENGINE HOOKS
   ========================================================================= */

export function useGenerateFlashcards() {
  return useMutation({
    mutationFn: async (payload: {
      target_job_title?: string;
      missing_skills?: string[];
      matched_skills?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/flashcards/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Generate flashcards failed');
      return res.json();
    },
  });
}

export function useReviewFlashcard() {
  return useMutation({
    mutationFn: async (payload: {
      card_id: string;
      quality_rating: number;
      hesitation_seconds: number;
      current_interval?: number;
      current_ef?: number;
      repetition_count?: number;
    }) => {
      const res = await fetch(`${API_BASE}/flashcards/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Review flashcard failed');
      return res.json();
    },
  });
}

export function useCramFlashcards(deckId?: string, maxCards: number = 15) {
  return useQuery({
    queryKey: ['flashcards-cram', deckId, maxCards],
    queryFn: async () => {
      const url = `${API_BASE}/flashcards/cram?max_cards=${maxCards}${deckId ? `&deck_id=${encodeURIComponent(deckId)}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch cram flashcard deck');
      return res.json();
    },
    enabled: true,
  });
}

export function usePipelineStatus(candidateId: string = 'cand_sovereign_001') {
  return useQuery({
    queryKey: ['readiness-pipeline-status', candidateId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/flashcards/pipeline-status?candidate_id=${encodeURIComponent(candidateId)}`);
      if (!res.ok) throw new Error('Failed to fetch pipeline status');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

export function useAdvancePipelineStage() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      candidate_name?: string;
      target_stage: number;
      match_score?: number;
      flashcard_completion_ratio?: number;
      quiz_ability_score?: number;
      voice_interview_score?: number;
      ccrs_final_score?: number;
    }) => {
      const res = await fetch(`${API_BASE}/flashcards/advance-stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to advance pipeline stage' }));
        throw new Error(err.detail || 'Failed to advance pipeline stage');
      }
      return res.json();
    },
  });
}

// =========================================================================
// SkillMatch DNA v16.0 — Live Sandbox, STAR Analytics & Forensic Hooks
// =========================================================================

export function useExecuteSandbox() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      language?: string;
      source_code: string;
      challenge_id?: string;
      test_inputs?: any[];
    }) => {
      const res = await fetch(`${API_BASE}/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Sandbox execution failed' }));
        throw new Error(err.detail || 'Sandbox execution failed');
      }
      return res.json();
    },
  });
}

export function useProfileAST() {
  return useMutation({
    mutationFn: async (payload: { source_code: string; language?: string }) => {
      const res = await fetch(`${API_BASE}/sandbox/ast-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('AST profiling failed');
      return res.json();
    },
  });
}

export function useParseSTAR() {
  return useMutation({
    mutationFn: async (payload: { candidate_id: string; response_text: string; question_context?: string }) => {
      const res = await fetch(`${API_BASE}/behavioral/star-parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('STAR parsing failed');
      return res.json();
    },
  });
}

export function useAnalyzeProsody() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      audio_transcript: string;
      duration_seconds?: number;
      pitch_variance_hz?: number;
    }) => {
      const res = await fetch(`${API_BASE}/behavioral/prosody-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Prosody analysis failed');
      return res.json();
    },
  });
}

export function useCreateMockRoom() {
  return useMutation({
    mutationFn: async (payload: {
      room_name?: string;
      session_type: 'P2P_PEER_MOCK' | 'AI_PANEL_DUAL_CANDIDATE' | 'PAIR_PROGRAMMING_AI';
      host_candidate_id: string;
      participants?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/collaborative/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create mock room');
      return res.json();
    },
  });
}

export function useGetMockRoomState(roomId: string) {
  return useQuery({
    queryKey: ['mock-room-state', roomId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/collaborative/room-state/${encodeURIComponent(roomId)}`);
      if (!res.ok) throw new Error('Failed to fetch room state');
      return res.json();
    },
    enabled: !!roomId,
    refetchInterval: 5000,
  });
}

export function useUpdateCanvas() {
  return useMutation({
    mutationFn: async (payload: {
      room_id: string;
      nodes: Array<{ id: string; label: string; category: string; capacity_rps: number; latency_ms: number }>;
      edges: Array<{ source_id: string; target_id: string; bandwidth_mbps?: number }>;
    }) => {
      const res = await fetch(`${API_BASE}/collaborative/update-canvas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update architecture canvas');
      return res.json();
    },
  });
}

export function useGenerateForensicReport() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      interview_id?: string;
      quiz_score: number;
      code_score: number;
      voice_stability_score: number;
      star_score: number;
      identified_weaknesses?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/forensic/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to generate forensic report');
      return res.json();
    },
  });
}

export function useSyncRemediation() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      report_id: string;
      target_topics?: string[];
      override_ease_factor?: number;
      reset_interval_days?: number;
      rebalance_roadmap?: boolean;
    }) => {
      const res = await fetch(`${API_BASE}/forensic/remediation-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to sync closed-loop remediation');
      return res.json();
    },
  });
}

export function useGetForensicHistory(candidateId: string = 'cand_sovereign_001') {
  return useQuery({
    queryKey: ['forensic-history', candidateId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/forensic/history/${encodeURIComponent(candidateId)}`);
      if (!res.ok) throw new Error('Failed to fetch forensic history');
      return res.json();
    },
    enabled: !!candidateId,
  });
}

// =========================================================================
// SkillMatch DNA v17.0 — AI Proctoring, Anti-Cheat & Biometric Fraud Hooks
// =========================================================================

export function useEvaluateVisionFrame() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      faces_detected?: number;
      gaze_vector?: { x: number; y: number; z: number };
      screen_bounds_stray?: boolean;
      head_pose_euler?: { yaw: number; pitch: number; roll: number };
      head_pose_duration_seconds?: number;
      liveness_score?: number;
      is_virtual_camera?: boolean;
    }) => {
      const res = await fetch(`${API_BASE}/proctor/vision/evaluate-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Vision frame evaluation failed');
      return res.json();
    },
  });
}

export function useDiarizeAudio() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      window_duration_ms?: number;
      cosine_distance_to_baseline?: number;
      detected_speakers_count?: number;
      is_whisper_detected?: boolean;
      ultrasonic_beacon_detected?: boolean;
    }) => {
      const res = await fetch(`${API_BASE}/proctor/audio/diarize-window`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Audio diarization failed');
      return res.json();
    },
  });
}

export function useEvaluateBrowserTelemetry() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      event_type?: string;
      is_document_hidden?: boolean;
      tab_switch_count?: number;
      copy_paste_attempted?: boolean;
      devtools_open?: boolean;
      unauthorized_peripherals?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/proctor/browser/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Browser telemetry evaluation failed');
      return res.json();
    },
  });
}

export function useEvaluateKeystrokes() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      mean_flight_time_ms?: number;
      mean_dwell_time_ms?: number;
      typing_speed_wpm?: number;
      entropy_score?: number;
      burst_character_count?: number;
    }) => {
      const res = await fetch(`${API_BASE}/proctor/browser/keystroke-entropy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Keystroke dynamics evaluation failed');
      return res.json();
    },
  });
}

export function useCalculatePTS() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      gaze_trust_score: number;
      face_trust_score: number;
      audio_trust_score: number;
      browser_trust_score: number;
      typing_trust_score: number;
      incident_logs?: any[];
    }) => {
      const res = await fetch(`${API_BASE}/proctor/pts/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('PTS calculation failed');
      return res.json();
    },
  });
}

export function useGenerateProctoringAuditLog() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      role_target?: string;
      pts_score?: number;
      incidents?: any[];
    }) => {
      const res = await fetch(`${API_BASE}/proctor/pts/generate-audit-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to generate proctoring audit log');
      return res.json();
    },
  });
}

export function useGetProctoringSession(sessionId: string) {
  return useQuery({
    queryKey: ['proctoring-session', sessionId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/proctor/pts/session/${encodeURIComponent(sessionId)}`);
      if (!res.ok) throw new Error('Failed to fetch proctoring session');
      return res.json();
    },
    enabled: !!sessionId,
    refetchInterval: 6000,
  });
}

// ==========================================
// Version 18.0 Enterprise Proctoring Governance Hooks (suggestion-v17.md)
// ==========================================

export function useVerifyZKProctorProof() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      circuit_type?: string;
      proof: any;
      public_statement: any;
    }) => {
      const res = await fetch(`${API_BASE}/proctor/zk/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('zk-SNARK proof verification failed');
      return res.json();
    },
  });
}

export function useGenerateZKProctorProof() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      pts_score: number;
      critical_infractions: number;
      speaker_match_pct: number;
    }) => {
      const res = await fetch(`${API_BASE}/proctor/zk/generate-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to generate zk-SNARK proof');
      return res.json();
    },
  });
}

export function usePurgeEphemeralStream() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      purge_audio_buffers?: boolean;
      purge_video_frames?: boolean;
      purge_biometric_embeddings?: boolean;
    }) => {
      const res = await fetch(`${API_BASE}/proctor/zk/purge-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to purge ephemeral streams');
      return res.json();
    },
  });
}

export function usePerformDeviceAttestation() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id?: string;
      tpm_version?: string;
      has_secure_enclave?: boolean;
      has_screen_capture_lock?: boolean;
    }) => {
      const res = await fetch(`${API_BASE}/security/attest/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Hardware attestation verification failed');
      return res.json();
    },
  });
}

export function useCheckHypervisor() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      webgl_vendor: string;
      webgl_renderer: string;
      screen_count?: number;
    }) => {
      const res = await fetch(`${API_BASE}/security/attest/hypervisor-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Hypervisor inspection failed');
      return res.json();
    },
  });
}

export function useAuditTimerJitter() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      timer_deltas_microsec: number[];
    }) => {
      const res = await fetch(`${API_BASE}/security/attest/timer-jitter-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Timer micro-jitter audit failed');
      return res.json();
    },
  });
}

export function useSubmitDisputeAppeal() {
  return useMutation({
    mutationFn: async (payload: {
      incident_id?: string;
      session_id: string;
      candidate_id: string;
      infraction_type: string;
      original_pts_penalty: number;
      candidate_statement: string;
      request_human_review?: boolean;
    }) => {
      const res = await fetch(`${API_BASE}/proctor/disputes/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to submit dispute appeal');
      return res.json();
    },
  });
}

export function useGetPrivacyMaskedClip(appealId: string) {
  return useQuery({
    queryKey: ['privacy-masked-clip', appealId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/proctor/disputes/${encodeURIComponent(appealId)}/privacy-clip`);
      if (!res.ok) throw new Error('Failed to fetch privacy-masked clip');
      return res.json();
    },
    enabled: !!appealId,
  });
}

export function useAIReevaluateAppeal() {
  return useMutation({
    mutationFn: async (payload: {
      appeal_id: string;
      posture_drift_delta?: number;
      head_pose_yaw_degrees?: number;
      keystroke_entropy_continuity?: number;
      ambient_acoustic_db?: number;
    }) => {
      const res = await fetch(`${API_BASE}/proctor/disputes/${encodeURIComponent(payload.appeal_id)}/re-evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('AI re-evaluation failed');
      return res.json();
    },
  });
}

export function useCohortAnalytics(cohortId?: string) {
  return useQuery({
    queryKey: ['cohort-analytics', cohortId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/governance/cohort/analytics`);
      if (!res.ok) throw new Error('Failed to fetch cohort analytics');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

export function useCalculateFinalCCRS() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id?: string;
      session_id?: string;
      raw_ccrs_score: number;
      proctoring_trust_score: number;
      gamma_multiplier?: number;
    }) => {
      const candidateId = payload.candidate_id || 'cand-001';
      const res = await fetch(`${API_BASE}/governance/candidate/${encodeURIComponent(candidateId)}/calibrated-ccrs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to calculate calibrated CCRS');
      return res.json();
    },
  });
}

export function useGenerateComplianceCertificate() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      session_id: string;
      candidate_name?: string;
      enterprise_org?: string;
      role_target?: string;
      pts_score: number;
      calibrated_ccrs: number;
      zk_proof_hash?: string;
    }) => {
      const res = await fetch(`${API_BASE}/governance/candidate/${encodeURIComponent(payload.candidate_id)}/compliance-certificate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to generate compliance certificate');
      return res.json();
    },
  });
}

// =========================================================================
// v19.0 Enterprise ATS, Smart Offer Clearance, RLAHF & Internal Mobility
// =========================================================================

export function useATSIntegrations() {
  return useQuery({
    queryKey: ['ats-integrations'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/ats/integrations`);
      if (!res.ok) throw new Error('Failed to fetch ATS integrations');
      return res.json();
    },
  });
}

export function useTriggerInboundWebhook() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/ats/webhook/inbound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to trigger inbound ATS webhook');
      return res.json();
    },
  });
}

export function useGenerateOfferPackage() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/hiring/offer/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to generate offer package');
      return res.json();
    },
  });
}

export function useIngestRLAHFTelemetry() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/rlahf/performance/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to ingest RLAHF performance telemetry');
      return res.json();
    },
  });
}

export function useInternalTalentMobilityHeatmap() {
  return useQuery({
    queryKey: ['talent-mobility-heatmap'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/mobility/workforce-heatmap`);
      if (!res.ok) throw new Error('Failed to fetch workforce mobility heatmap');
      return res.json();
    },
  });
}

// =========================================================================
// v20.0 Planetary Skill Federation, AI Executive Co-Pilot & Project Swarms
// =========================================================================

export function useConsortiumNodes() {
  return useQuery({
    queryKey: ['consortium-nodes'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/federation/mesh/nodes`);
      if (!res.ok) throw new Error('Failed to fetch consortium mesh nodes');
      return res.json();
    },
  });
}

export function useIssueFederatedPassport() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/federation/passport/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to issue federated passport');
      return res.json();
    },
  });
}

export function useVerifyCandidateFederation() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/federation/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to verify candidate portability');
      return res.json();
    },
  });
}

export function useRevokeEnterpriseConsent() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/federation/consent/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to revoke enterprise consent');
      return res.json();
    },
  });
}

export function useExecutiveCopilotQuery() {
  return useMutation({
    mutationFn: async (payload: { query: string; department_filter?: string }) => {
      const res = await fetch(`${API_BASE}/executive/copilot/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to query executive co-pilot');
      return res.json();
    },
  });
}

export function useSimulateWorkforceScenario() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/executive/scenario/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to simulate workforce scenario');
      return res.json();
    },
  });
}

export function useScarcityBottlenecks() {
  return useQuery({
    queryKey: ['scarcity-bottlenecks'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/executive/scarcity/alerts`);
      if (!res.ok) throw new Error('Failed to fetch scarcity alerts');
      return res.json();
    },
  });
}

export function useAssembleProjectSwarm() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/swarm/project/assemble`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to assemble project swarm');
      return res.json();
    },
  });
}

export function useSMVIMarketTrends() {
  return useQuery({
    queryKey: ['smvi-market-trends'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/resiliency/smvi/market-trends`);
      if (!res.ok) throw new Error('Failed to fetch SMVI trends');
      return res.json();
    },
  });
}

export function useCalculateCareerResiliency() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/resiliency/candidate/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to calculate career resiliency');
      return res.json();
    },
  });
}

// ==========================================
// V21: AUTONOMOUS GLOBAL TALENT EXCHANGE HOOKS
// ==========================================

export function useTalentSpotPrices() {
  return useQuery({
    queryKey: ['talent-spot-prices'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/talent-exchange/spot-prices`);
      if (!res.ok) throw new Error('Failed to fetch talent spot prices');
      return res.json();
    },
    refetchInterval: 15000,
  });
}

export function useCDAMatch() {
  return useMutation({
    mutationFn: async (payload: { skill_id: string }) => {
      const res = await fetch(`${API_BASE}/api/v1/talent-exchange/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to execute CDA match');
      return res.json();
    },
  });
}

export function useStakeSkillTokens() {
  return useMutation({
    mutationFn: async (payload: { talent_address: string; skill_id: string; amount: number }) => {
      const res = await fetch(`${API_BASE}/api/v1/talent-exchange/stake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to stake skill tokens');
      return res.json();
    },
  });
}

export function usePhotonicQKE() {
  return useMutation({
    mutationFn: async (payload: { query_vector: number[]; candidate_vector: number[]; precision_mode?: string }) => {
      const res = await fetch(`${API_BASE}/api/v1/quantum-fabric/photonic-qke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to compute Photonic QKE');
      return res.json();
    },
  });
}

export function useTransduceIntent() {
  return useMutation({
    mutationFn: async (payload: { raw_telemetry: number[][]; sampling_rate_hz?: number }) => {
      const res = await fetch(`${API_BASE}/api/v1/quantum-fabric/transduce-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to transduce neural intent');
      return res.json();
    },
  });
}

export function useConsortiumVentures() {
  return useQuery({
    queryKey: ['consortium-ventures'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/consortium/ventures`);
      if (!res.ok) throw new Error('Failed to fetch consortium ventures');
      return res.json();
    },
  });
}

export function useConsortiumArbitrateDispute() {
  return useMutation({
    mutationFn: async (payload: { dispute_id: string; venture_id: string; claim_details: string; evidence_hashes: string[] }) => {
      const res = await fetch(`${API_BASE}/api/v1/consortium/arbitrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to arbitrate consortium dispute');
      return res.json();
    },
  });
}

export function useVerifyBiasFreeHiring() {
  return useMutation({
    mutationFn: async (payload: { candidate_features: Record<string, any>; hiring_decision: string; zk_proof_hex: string }) => {
      const res = await fetch(`${API_BASE}/api/v1/meritocracy/bias-free-hiring/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to verify bias-free hiring');
      return res.json();
    },
  });
}

export function useRedTeamAudit() {
  return useMutation({
    mutationFn: async (payload: { model_id: string; test_adversarial_queries: string[] }) => {
      const res = await fetch(`${API_BASE}/api/v1/meritocracy/red-team/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to run red-team regulatory audit');
      return res.json();
    },
  });
}

// =========================================================================
// V22: INTERPLANETARY TALENT MESH & BIO-DIGITAL SKILL GENOME HOOKS
// =========================================================================

export function useMeshNodesStatus() {
  return useQuery({
    queryKey: ['mesh-nodes-status'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/mesh/nodes/status`);
      if (!res.ok) throw new Error('Failed to fetch mesh nodes status');
      return res.json();
    },
    refetchInterval: 15000,
  });
}

export function useSyncDeltaCRDT() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/mesh/crdt/sync-delta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to sync Delta-CRDT');
      return res.json();
    },
  });
}

export function useCandidateGenome(candidateId: string) {
  return useQuery({
    queryKey: ['candidate-genome', candidateId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/genome/hierarchy/${candidateId}`);
      if (!res.ok) throw new Error('Failed to fetch candidate genome');
      return res.json();
    },
    enabled: !!candidateId,
  });
}

export function useCalculateAdaptationVelocity() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/genome/adaptation-velocity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to calculate adaptation velocity');
      return res.json();
    },
  });
}

export function useSynthesizeLearningDNA() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/genome/synthesize-learning-dna`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to synthesize learning DNA');
      return res.json();
    },
  });
}

export function useSkillTreasuryYieldPools() {
  return useQuery({
    queryKey: ['skill-treasury-yield-pools'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/treasury/yield-pools`);
      if (!res.ok) throw new Error('Failed to fetch skill treasury yield pools');
      return res.json();
    },
  });
}

export function useIssueZeroInterestCredit() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/treasury/credit-line/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to issue zero-interest credit line');
      return res.json();
    },
  });
}

export function useVerifyZeroKnowledgeBiasFree() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/zk-identity/verify-bias-free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to verify zero-knowledge anti-bias identity');
      return res.json();
    },
  });
}

// =========================================================================
// SkillMatch DNA Version 24.0: Trans-Neural Symbio-Grid Hooks
// =========================================================================

// --- 1. Trans-Neural Synaptic Resonance ---
export function useCalculateSynapticCoherence() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/synaptic-resonance/coherence-index/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to calculate synaptic coherence index');
      return res.json();
    },
  });
}

export function useTransduceSpatialMemory() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/synaptic-resonance/spatial-memory/transduce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to transduce spatial memory tree');
      return res.json();
    },
  });
}

export function useEvaluateCognitiveShield() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/synaptic-resonance/cognitive-shield/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to evaluate cognitive load shield');
      return res.json();
    },
  });
}

export function useSynapticLiveSessions() {
  return useQuery({
    queryKey: ['synaptic-live-sessions'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/synaptic-resonance/live-sessions`);
      if (!res.ok) throw new Error('Failed to fetch synaptic live sessions');
      return res.json();
    },
    refetchInterval: 6000,
  });
}

// --- 2. Hyperbolic Multiverse Quantum Annealing ---
export function useHyperbolicPoincareProject() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/hyperbolic-quantum/poincare-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to project vector to Poincare manifold');
      return res.json();
    },
  });
}

export function useMajoranaBraidAnneal() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/hyperbolic-quantum/majorana-braid-anneal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to execute Majorana braid annealing');
      return res.json();
    },
  });
}

export function useSolveTeamEquilibrium() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/hyperbolic-quantum/team-equilibrium/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to solve team equilibrium');
      return res.json();
    },
  });
}

export function useCollapseCareerSuperposition() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/hyperbolic-quantum/superposition/collapse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to collapse superposition state');
      return res.json();
    },
  });
}

// --- 3. Self-Sovereign Multi-Species Enterprise Guilds ---
export function useCharterMultiSpeciesGuild() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/multi-species-guild/charter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to charter multi-species guild');
      return res.json();
    },
  });
}

export function useStreamCIDividends() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/multi-species-guild/ci-milestone/stream-dividends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to stream CI dividends');
      return res.json();
    },
  });
}

export function useDepositSkillCollateralVault() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/multi-species-guild/skill-collateral/vault`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to deposit skill collateral');
      return res.json();
    },
  });
}

export function useMultiSpeciesGuildDirectory() {
  return useQuery({
    queryKey: ['multi-species-guild-directory'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/multi-species-guild/directory`);
      if (!res.ok) throw new Error('Failed to fetch guild directory');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

// --- 4. Recursive Plonky3 zk-STARK Rollups ---
export function useBundleZKRollup() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/zk-meritocracy-rollup/bundle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to bundle recursive zk-rollup');
      return res.json();
    },
  });
}

export function useVerifyBiasFreeRollup() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/zk-meritocracy-rollup/verify-bias-free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to verify bias-free rollup');
      return res.json();
    },
  });
}

export function useRegulatoryRedTeamAudit() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/api/v1/zk-meritocracy-rollup/compliance/red-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to run regulatory red team audit');
      return res.json();
    },
  });
}

/* =========================================================================
   SKILLMATCH DNA v25.0: DEEP RL, MARL SWARM & CLOSED-LOOP RLAHF HOOKS
   - Actor-Critic PPO continuous assessment & DDQN 4-week roadmap trajectories
   - MAPPO (<10ms Nash) candidate-recruiter negotiation & QMIX value factorization
   - RLVR in-browser WASM test execution & non-leaking Socratic hints & DPO
   - 90-day post-hire telemetry, master R_outcome & automated vLLM policy triggers
   ========================================================================= */

// --- 1. Deep RL Adaptive Engine & DDQN Roadmap ---
export function usePPOCatStep() {
  return useMutation({
    mutationFn: async (payload: {
      theta_k: number;
      sci_vector: number[];
      response_latency_sec: number;
      answer_is_correct: boolean;
      current_question_difficulty: number;
      session_id?: string;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/rl-adaptive/cat/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to execute PPO CAT step');
      return res.json();
    },
  });
}

export function useOptimizeDDQNRoadmap() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      target_role: string;
      current_skill_vector: number[];
      target_skill_vector: number[];
      max_weeks?: number;
      learning_rate_preference?: number;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/rl-adaptive/roadmap/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to optimize DDQN learning roadmap');
      return res.json();
    },
  });
}

export function useRLAdaptivePolicyStatus() {
  return useQuery({
    queryKey: ['rl-adaptive-policy-status'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/rl-adaptive/policy-status`);
      if (!res.ok) throw new Error('Failed to fetch RL adaptive policy status');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

// --- 2. MARL Squad Orchestrator & QMIX Factorization ---
export function useMAPPONegotiate() {
  return useMutation({
    mutationFn: async (payload: {
      candidate: {
        agent_id: string;
        candidate_id: string;
        reservation_salary: number;
        flexibility_score: number;
        skill_premium: number;
      };
      recruiter: {
        agent_id: string;
        recruiter_id: string;
        budget_cap: number;
        urgency_factor: number;
        quality_threshold: number;
      };
      max_rounds?: number;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/marl-squad/negotiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('MAPPO negotiation failed');
      return res.json();
    },
  });
}

export function useQMIXFactorize() {
  return useMutation({
    mutationFn: async (payload: {
      team_id: string;
      agent_utilities: Record<string, number>;
      state_vector: number[];
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/marl-squad/qmix/factorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('QMIX value factorization failed');
      return res.json();
    },
  });
}

export function useMARLSwarmMetrics() {
  return useQuery({
    queryKey: ['marl-swarm-metrics'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/marl-squad/swarm-metrics`);
      if (!res.ok) throw new Error('Failed to fetch MARL swarm metrics');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

// --- 3. RLVR Code Co-Pilot & DPO Calibration ---
export function useEvaluateRLVRReward() {
  return useMutation({
    mutationFn: async (payload: {
      submission_id: string;
      language: string;
      source_code: string;
      test_cases_passed: number;
      test_cases_total: number;
      execution_latency_ms: number;
      memory_kb: number;
      ast_tree_depth?: number;
      forbidden_patterns_detected?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/rlvr-copilot/evaluate-reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('RLVR reward evaluation failed');
      return res.json();
    },
  });
}

export function useGenerateSocraticHint() {
  return useMutation({
    mutationFn: async (payload: {
      error_type: string;
      current_failures: number;
      problem_domain?: string;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/rlvr-copilot/socratic-hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to generate Socratic hint');
      return res.json();
    },
  });
}

export function useCalibrateDPOPreference() {
  return useMutation({
    mutationFn: async (payload: {
      prompt_context: string;
      winning_completion: string;
      losing_completion: string;
      beta?: number;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/rlvr-copilot/dpo/calibrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('DPO preference calibration failed');
      return res.json();
    },
  });
}

// --- 4. Closed-Loop RLAHF & vLLM Auto-Tuning ---
export function useIngestOutcomeTelemetryBatch() {
  return useMutation({
    mutationFn: async (payload: {
      employee_id: string;
      days_post_hire: number;
      github_pr_velocity: number;
      ticket_lead_time_hours: number;
      manager_rating: number;
      code_review_acceptance_rate: number;
      peer_satisfaction_score?: number;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/rlahf-closed-loop/telemetry/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to ingest 90-day outcome telemetry');
      return res.json();
    },
  });
}

export function useTriggerVLLMRetrain() {
  return useMutation({
    mutationFn: async (payload: { force?: boolean } = {}) => {
      const res = await fetch(`${API_BASE}/api/v1/rlahf-closed-loop/retrain/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to trigger vLLM retraining');
      return res.json();
    },
  });
}

export function useRLAHFCalibrationStatus() {
  return useQuery({
    queryKey: ['rlahf-calibration-status'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/rlahf-closed-loop/calibration-status`);
      if (!res.ok) throw new Error('Failed to fetch RLAHF calibration status');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

/* =========================================================================
   SKILLMATCH DNA v26.0: QUANTUM-NEUROMORPHIC SUPER-INTELLIGENCE HOOKS
   - Photonic Micro-Ring VMM (<0.8ps) & Intel Loihi 2 SNN Processing (<1W/100k)
   - Opto-Acoustic Pre-Verbal Telepathy & Thought-to-WASM Compiler (>1,000 WPM)
   - Planetary SkillSwap AMM v2.0 & Algorithmic Universal Basic Income (aUBI)
   - Recursive Plonky3 zk-STARK Ledger (<=4KB) & 100% Bias-Free Legal Compliance
   ========================================================================= */

// --- 1. Neuromorphic Photonic Mesh ---
export function useExecutePhotonicVMM() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      vector_a_1024d: number[];
      vector_b_1024d: number[];
      optical_wavelength_nm?: number;
      laser_power_mw?: number;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/neuromorphic-mesh/photonic/vmm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to execute Photonic VMM computation');
      return res.json();
    },
  });
}

export function useProcessSNNSpikes() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      eeg_nirs_channels: number[];
      membrane_threshold_v?: number;
      tau_membrane_ms?: number;
      sampling_window_ms?: number;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/neuromorphic-mesh/snn/spikes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to process SNN bio-telemetry spikes');
      return res.json();
    },
  });
}

export function useNeuromorphicHardwareStatus() {
  return useQuery({
    queryKey: ['neuromorphic-hardware-status'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/neuromorphic-mesh/hardware-status`);
      if (!res.ok) throw new Error('Failed to fetch neuromorphic hardware status');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

// --- 2. Sub-Cortical Telepathy & Thought Compilation ---
export function useDecodeSubcorticalIntuition() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      nirs_telemetry: any[];
      active_architectural_domain?: string;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/subcortical-telepathy/decode-intuition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to decode pre-verbal intuition');
      return res.json();
    },
  });
}

export function useCompileThoughtWASM() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      abstract_intent_syntax: string;
      intent_depth?: number;
      target_wasm_runtime?: string;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/subcortical-telepathy/compile-wasm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to compile thought into WebAssembly');
      return res.json();
    },
  });
}

export function useStreamCoProcessorScaffold() {
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      candidate_id: string;
      current_cognitive_friction: number;
      task_complexity_tier?: string;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/subcortical-telepathy/scaffolding-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to stream co-processor scaffolding');
      return res.json();
    },
  });
}

// --- 3. Planetary SkillSwap AMM v2.0 & aUBI ---
export function useCreateSkillAMMPool() {
  return useMutation({
    mutationFn: async (payload: {
      asset_name: string;
      module_type: string;
      candidate_zk_did: string;
      candidate_payout_address: string;
      initial_skill_reserve: number;
      initial_inr_reserve: number;
      royalty_basis_points?: number;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/skill-amm-v2/create-pool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create skill AMM pool');
      return res.json();
    },
  });
}

export function useSwapSkillAMMv2() {
  return useMutation({
    mutationFn: async (payload: {
      pool_id: string;
      enterprise_agent_id: string;
      inr_amount_in: number;
      min_skill_tokens_out?: number;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/skill-amm-v2/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Skill AMM swap failed');
      return res.json();
    },
  });
}

export function useClaimSkillAMMaUBIYield() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_zk_did: string;
      asset_id: string;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/skill-amm-v2/claim-aubi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to claim aUBI yield');
      return res.json();
    },
  });
}

export function usePlanetarySkillAMMMetrics() {
  return useQuery({
    queryKey: ['planetary-skill-amm-metrics'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/skill-amm-v2/metrics`);
      if (!res.ok) throw new Error('Failed to fetch planetary AMM metrics');
      return res.json();
    },
    refetchInterval: 8000,
  });
}

// --- 4. Plonky3 zk-STARK Ledger & Bias-Free Compliance ---
export function useGeneratePlonky3Proof() {
  return useMutation({
    mutationFn: async (payload: {
      candidate_id: string;
      candidate_zk_did: string;
      ccrs_scores_history: number[];
      pts_proctoring_trust_scores: number[];
      git_commit_hashes?: string[];
      include_demographic_masking?: boolean;
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/zk-plonky3-ledger/generate-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to generate Plonky3 zk-STARK proof');
      return res.json();
    },
  });
}

export function useVerifyBiasFreeCompliance() {
  return useMutation({
    mutationFn: async (payload: {
      proof_hash_hex: string;
      min_ccrs_threshold?: number;
      min_pts_threshold?: number;
      target_jurisdictions?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/api/v1/zk-plonky3-ledger/verify-compliance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Bias-free compliance verification failed');
      return res.json();
    },
  });
}

export function usePlonky3LedgerStatus() {
  return useQuery({
    queryKey: ['plonky3-ledger-status'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/zk-plonky3-ledger/status`);
      if (!res.ok) throw new Error('Failed to fetch Plonky3 ledger status');
      return res.json();
    },
    refetchInterval: 8000,
  });
}





// ============================================================================
// VERSION 27.0: POST-SIGN-IN PROFESSIONAL SOCIAL READINESS NETWORK
// (suggestion-v26.md Section 1 — Verified Feed, Identity Hub, Reach Accuracy)
// ============================================================================

const SOCIAL_API = `${API_BASE}/api/v1/readiness`;

/** Normalised query result so every v27.0 hook exposes data / error / loading / refetch. */
export interface SocialQueryResult<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => void;
}

function useSocialQuery<T>(key: unknown[], path: string, enabled = true): SocialQueryResult<T> {
  const query = useQuery({
    queryKey: key,
    enabled,
    queryFn: async () => {
      const res = await fetch(`${SOCIAL_API}${path}`);
      if (!res.ok) throw new Error(`Request failed (${res.status}) for ${path}`);
      return res.json() as Promise<T>;
    },
    refetchInterval: 15000,
  });

  return {
    data: (query.data ?? null) as T | null,
    error: (query.error as Error | null) ?? null,
    loading: query.isLoading,
    refetch: () => {
      void query.refetch();
    },
  };
}

/** Verified professional readiness feed (skill gaps, CAT mastery, voice rounds, benchmarks). */
export function useSocialFeed(limit = 12, candidateId?: string) {
  const query = candidateId
    ? `?limit=${limit}&candidate_id=${encodeURIComponent(candidateId)}`
    : `?limit=${limit}`;
  return useSocialQuery<ReadinessFeedResponse>(['readiness-social-feed', limit, candidateId ?? 'network'], `/social/feed${query}`);
}

/** Milestone posts published by a single candidate (identity hub timeline). */
export function useCandidatePosts(candidateId: string, limit = 12) {
  return useSocialQuery<ReadinessFeedResponse>(
    ['readiness-candidate-posts', candidateId, limit],
    `/social/posts/${encodeURIComponent(candidateId)}?limit=${limit}`,
    Boolean(candidateId)
  );
}

/** Publishes a verified readiness milestone on behalf of the signed-in candidate. */
export function usePublishPost() {
  return useMutation({
    mutationFn: async (payload: ReadinessPostCreate) => {
      const res = await fetch(`${SOCIAL_API}/social/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to publish readiness milestone');
      return res.json() as Promise<ReadinessFeedPost>;
    },
  });
}

/** Full Candidate Identity Hub payload (CCRS vector, liveness, voice snippet, ANC telemetry). */
export function useCandidateProfile(candidateId: string) {
  return useSocialQuery<CandidateProfile>(
    ['readiness-candidate-profile', candidateId],
    `/profiles/${encodeURIComponent(candidateId)}`,
    Boolean(candidateId)
  );
}

/** Upserts the editable identity hub fields for the signed-in candidate. */
export function useUpdateProfile() {
  return useMutation({
    mutationFn: async ({ candidateId, payload }: { candidateId: string; payload: CandidateProfileUpdate }) => {
      const res = await fetch(`${SOCIAL_API}/profiles/${encodeURIComponent(candidateId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update candidate profile');
      return res.json() as Promise<CandidateProfile>;
    },
  });
}

/** Records a recruiter / enterprise inspection event against a candidate profile. */
export function useRecordView() {
  return useMutation({
    mutationFn: async ({ candidateId, payload }: { candidateId: string; payload: ProfileViewCreate }) => {
      const res = await fetch(`${SOCIAL_API}/profiles/${encodeURIComponent(candidateId)}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to record profile view');
      return res.json() as Promise<ProfileViewRecord>;
    },
  });
}

/** Recruiter inspection log: who opened the profile, from where, and how well aligned. */
export function useProfileViews(candidateId: string, limit = 10) {
  return useSocialQuery<ProfileViewsResponse>(
    ['readiness-profile-views', candidateId, limit],
    `/profiles/${encodeURIComponent(candidateId)}/views?limit=${limit}`,
    Boolean(candidateId)
  );
}

/** Cumulative Reach Accuracy Index (Section 1.3 of suggestion-v26.md). */
export function useProfileAnalytics(candidateId: string) {
  return useSocialQuery<ProfileAnalytics>(
    ['readiness-profile-analytics', candidateId],
    `/profiles/${encodeURIComponent(candidateId)}/analytics`,
    Boolean(candidateId)
  );
}

/** Lightweight badge / liveness probe used by feed cards and shareable proof links. */
export function useProfileVerification(candidateId: string) {
  return useSocialQuery<ProfileVerification>(
    ['readiness-profile-verification', candidateId],
    `/profiles/${encodeURIComponent(candidateId)}/verification`,
    Boolean(candidateId)
  );
}

