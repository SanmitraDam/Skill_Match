'use client';

import React, { useState } from 'react';
import {
  FileText,
  Activity,
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Brain,
  Zap,
  Mic,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Hash,
  Sparkles,
  RotateCw
} from 'lucide-react';
import {
  useParseSTAR,
  useAnalyzeProsody,
  useGenerateForensicReport,
  useSyncRemediation
} from '@/hooks/useFastAPI';

export const ForensicDiagnosticsPortal: React.FC = () => {
  // Mock transcript default for interactive STAR testing
  const [candidateTranscript, setCandidateTranscript] = useState(
    "When I was leading the infrastructure team at FinTech Corp, the legacy transaction clearing engine suffered critical latency spikes during market open. My responsibility was to overhaul the payment gateway and ensure sub-100ms processing under peak loads. I implemented a distributed Redis caching layer, I designed an event-driven Go queue, and I refactored the database connection pool. As a result, we reduced latency by 68%, scaled to 50000 rps, and saved ₹3.74 Cr annually in cloud infrastructure."
  );

  const [starAnalysis, setStarAnalysis] = useState<any>({
    composite_star_score: 86.5,
    weights: { situation_weight: 0.15, task_weight: 0.15, action_weight: 0.5, result_weight: 0.2 },
    sub_scores: { situation_score: 85, task_score: 85, action_score: 90, result_score: 95 },
    quantified_impacts_detected: ['68%', '50000 rps', '₹3.74 Cr'],
    has_empirical_impact: true,
    star_compliance_verdict: 'COMPLIANT'
  });

  const [prosodyMetrics, setProsodyMetrics] = useState<any>({
    words_per_minute: 138.5,
    pace_rating: 'OPTIMAL',
    total_filler_count: 2,
    filler_ratio_percent: 2.1,
    composure_index: 89.2,
    vocal_stability: 'EXCELLENT'
  });

  const [forensicReport, setForensicReport] = useState<any>({
    report_id: 'forensic_a89f3c21b4',
    candidate_id: 'cand_sovereign_001',
    composite_score: 87.4,
    readiness_tier: 'L6_STAFF_READY',
    pillar_breakdown: {
      quiz_score: 88.0,
      code_sandbox_score: 92.5,
      voice_stability_score: 89.2,
      star_method_score: 86.5
    },
    weaknesses_flagged: [
      'Distributed Raft Consensus Quorums',
      'B-Tree Storage Engine Indexing'
    ],
    recommendation: 'Exceptional performance across AST execution and STAR impact articulation. Advance to executive round.',
    audit_hash: '0x8f2c91b54a20e9834d193ef20bc76a401bca03f84e8a156c221190bdce81aa12',
    remediation_status: 'PENDING_SYNC'
  });

  const [remediationSyncResult, setRemediationSyncResult] = useState<any>(null);

  const parseSTARMutation = useParseSTAR();
  const analyzeProsodyMutation = useAnalyzeProsody();
  const generateReportMutation = useGenerateForensicReport();
  const syncRemediationMutation = useSyncRemediation();

  const handleAnalyzeTranscript = () => {
    parseSTARMutation.mutate(
      {
        candidate_id: 'cand_sovereign_001',
        response_text: candidateTranscript
      },
      {
        onSuccess: (data) => {
          setStarAnalysis(data);
        }
      }
    );

    analyzeProsodyMutation.mutate(
      {
        candidate_id: 'cand_sovereign_001',
        audio_transcript: candidateTranscript,
        duration_seconds: 45.0,
        pitch_variance_hz: 14.5
      },
      {
        onSuccess: (data) => {
          setProsodyMetrics(data);
        }
      }
    );
  };

  const handleGenerateFreshReport = () => {
    generateReportMutation.mutate(
      {
        candidate_id: 'cand_sovereign_001',
        quiz_score: 88.0,
        code_score: 92.5,
        voice_stability_score: prosodyMetrics.composure_index,
        star_score: starAnalysis.composite_star_score,
        identified_weaknesses: [
          'Distributed Raft Consensus Quorums',
          'B-Tree Storage Engine Indexing'
        ]
      },
      {
        onSuccess: (data) => {
          setForensicReport(data);
          setRemediationSyncResult(null);
        }
      }
    );
  };

  const handleTriggerRemediationSync = () => {
    syncRemediationMutation.mutate(
      {
        candidate_id: 'cand_sovereign_001',
        report_id: forensicReport.report_id,
        override_ease_factor: 1.3,
        reset_interval_days: 1,
        rebalance_roadmap: true
      },
      {
        onSuccess: (data) => {
          setRemediationSyncResult(data);
          setForensicReport((prev: any) => ({ ...prev, remediation_status: 'SYNCED' }));
        }
      }
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl theme-card p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Post-Interview Forensics & Remediation Loop
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/30">
                SM-2 Priority Override Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--fg-color)] tracking-tight">
              Forensic Diagnostics & Dynamic Remediation
            </h1>
            <p className="text-sm text-[var(--fg-muted)] max-w-2xl mt-1">
              Multi-pillar candidate diagnostics synthesizing code execution, behavioral STAR structure, vocal composure, and spaced-repetition roadmap rebalancing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateFreshReport}
              disabled={generateReportMutation.isPending}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--fg-muted)] bg-[var(--glass-bg)] hover:bg-[var(--glass-border-subtle)] border border-[var(--glass-border-subtle)] transition-all flex items-center gap-1.5"
            >
              <RotateCw className={`w-3.5 h-3.5 ${generateReportMutation.isPending ? 'animate-spin' : ''}`} />
              Recalculate Diagnostics
            </button>
            <button
              onClick={handleTriggerRemediationSync}
              disabled={syncRemediationMutation.isPending || forensicReport?.remediation_status === 'SYNCED'}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg ${
                forensicReport?.remediation_status === 'SYNCED'
                  ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-500 cursor-default'
                  : 'theme-primary-btn'
              }`}
            >
              <Zap className="w-4 h-4" />
              {forensicReport?.remediation_status === 'SYNCED'
                ? 'SM-2 Remediation Synced'
                : 'Sync SM-2 Dynamic Remediation'}
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Pillar Readiness Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pillar 1: Quiz */}
        <div className="p-4 rounded-2xl theme-card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--fg-muted)] uppercase font-mono font-medium">Adaptive Quiz (25%)</span>
            <Brain className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--fg-color)]">
            {forensicReport.pillar_breakdown.quiz_score}%
          </div>
          <div className="w-full bg-[var(--glass-border-subtle)] rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${forensicReport.pillar_breakdown.quiz_score}%` }} />
          </div>
        </div>

        {/* Pillar 2: Code Sandbox */}
        <div className="p-4 rounded-2xl theme-card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--fg-muted)] uppercase font-mono font-medium">AST Sandbox (35%)</span>
            <Zap className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--fg-color)]">
            {forensicReport.pillar_breakdown.code_sandbox_score}%
          </div>
          <div className="w-full bg-[var(--glass-border-subtle)] rounded-full h-1.5 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${forensicReport.pillar_breakdown.code_sandbox_score}%` }} />
          </div>
        </div>

        {/* Pillar 3: Vocal Stability */}
        <div className="p-4 rounded-2xl theme-card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--fg-muted)] uppercase font-mono font-medium">Vocal Composure (15%)</span>
            <Mic className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--fg-color)]">
            {forensicReport.pillar_breakdown.voice_stability_score}%
          </div>
          <div className="w-full bg-[var(--glass-border-subtle)] rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${forensicReport.pillar_breakdown.voice_stability_score}%` }} />
          </div>
        </div>

        {/* Pillar 4: STAR Score */}
        <div className="p-4 rounded-2xl theme-card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--fg-muted)] uppercase font-mono font-medium">STAR Method (25%)</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--fg-color)]">
            {forensicReport.pillar_breakdown.star_method_score}%
          </div>
          <div className="w-full bg-[var(--glass-border-subtle)] rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${forensicReport.pillar_breakdown.star_method_score}%` }} />
          </div>
        </div>
      </div>

      {/* Main Grid: Left STAR & Behavioral Analytics, Right Remediation & Registry Proof */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive STAR Method & Prosody Inspector (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="rounded-2xl theme-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-500" />
                STAR Method Behavioral NLP Parser
              </h2>
              <button
                onClick={handleAnalyzeTranscript}
                disabled={parseSTARMutation.isPending}
                className="px-3 py-1 rounded-lg text-xs font-medium text-[var(--accent-primary)] bg-[var(--pill-bg)] hover:opacity-80 border border-[var(--glass-border-subtle)] transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analyze STAR Narrative
              </button>
            </div>

            <textarea
              value={candidateTranscript}
              onChange={(e) => setCandidateTranscript(e.target.value)}
              rows={4}
              className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] rounded-xl p-3 text-xs text-[var(--fg-color)] outline-none leading-relaxed focus:border-[var(--accent-primary)]"
              placeholder="Paste candidate behavioral narrative..."
            />

            {/* STAR Breakdown 15/15/50/20 */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]">
                <div className="text-[10px] text-[var(--fg-muted)] uppercase">Situation (15%)</div>
                <div className="text-base font-bold text-cyan-500 mt-1">{starAnalysis.sub_scores?.situation_score}%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]">
                <div className="text-[10px] text-[var(--fg-muted)] uppercase">Task (15%)</div>
                <div className="text-base font-bold text-indigo-500 mt-1">{starAnalysis.sub_scores?.task_score}%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]">
                <div className="text-[10px] text-[var(--fg-muted)] uppercase">Action (50%)</div>
                <div className="text-base font-bold text-emerald-500 mt-1">{starAnalysis.sub_scores?.action_score}%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]">
                <div className="text-[10px] text-[var(--fg-muted)] uppercase">Result (20%)</div>
                <div className="text-base font-bold text-amber-500 mt-1">{starAnalysis.sub_scores?.result_score}%</div>
              </div>
            </div>

            {/* Empirical Quantified Impact Badges */}
            <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--fg-muted)] font-medium flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  Empirical Quantified Impacts Detected
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {starAnalysis.quantified_impacts_detected?.length || 0} Metrics Flagged
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {starAnalysis.quantified_impacts_detected?.map((imp: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  >
                    {imp}
                  </span>
                ))}
              </div>
            </div>

            {/* Prosody & Composure Telemetry */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]">
                <div className="text-[var(--fg-muted)] text-[10px]">Speech Pace (130-150 WPM)</div>
                <div className="text-sm font-bold text-[var(--fg-color)] mt-1 font-mono">{prosodyMetrics.words_per_minute} WPM</div>
                <div className="text-[10px] text-emerald-500 mt-0.5">{prosodyMetrics.pace_rating}</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]">
                <div className="text-[var(--fg-muted)] text-[10px]">Filler Words</div>
                <div className="text-sm font-bold text-[var(--fg-color)] mt-1 font-mono">{prosodyMetrics.total_filler_count} instances</div>
                <div className="text-[10px] text-[var(--fg-muted)] mt-0.5">{prosodyMetrics.filler_ratio_percent}% ratio</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]">
                <div className="text-[var(--fg-muted)] text-[10px]">Composure Index</div>
                <div className="text-sm font-bold text-[var(--accent-primary)] mt-1 font-mono">{prosodyMetrics.composure_index}/100</div>
                <div className="text-[10px] text-cyan-500 mt-0.5">{prosodyMetrics.vocal_stability}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Remediation Loop & Smart Contract Audit Proof (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Forensic Post-Mortem Verdict */}
          <div className="rounded-2xl theme-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                Post-Mortem Verdict & Readiness Tier
              </h2>
              <span className="px-2.5 py-1 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                {forensicReport.readiness_tier}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--fg-muted)]">Composite Forensic Score:</span>
                <span className="text-lg font-bold text-[var(--fg-color)] font-mono">{forensicReport.composite_score}/100</span>
              </div>
              <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                {forensicReport.recommendation}
              </p>
            </div>

            {/* Cryptographic Registry Hash */}
            <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-1">
              <div className="text-[10px] uppercase font-mono text-[var(--fg-muted)] flex items-center gap-1">
                <Hash className="w-3 h-3 text-cyan-500" />
                Audit Hash Verification
              </div>
              <div className="text-[11px] font-mono text-[var(--accent-primary)] break-all">
                {forensicReport.audit_hash}
              </div>
            </div>
          </div>

          {/* SM-2 Dynamic Remediation Sync Card */}
          <div className="rounded-2xl theme-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                SM-2 Priority Queue Overrides
              </h2>
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                forensicReport.remediation_status === 'SYNCED'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
              }`}>
                {forensicReport.remediation_status}
              </span>
            </div>

            <div className="space-y-2">
              {forensicReport.weaknesses_flagged?.map((topic: string, idx: number) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[var(--fg-color)]">{topic}</div>
                    <div className="text-[10px] text-amber-500 font-mono">
                      EF Override: 1.3 (Min) • Interval: 1 Day
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/25">
                    Priority #{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* 4-Week Rebalanced Roadmap Summary */}
            {remediationSyncResult?.rebalanced_roadmap && (
              <div className="pt-3 border-t border-[var(--glass-border-subtle)] space-y-2">
                <div className="text-xs font-semibold text-cyan-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  4-Week Rebalanced Roadmap Applied
                </div>
                <div className="space-y-1.5">
                  {remediationSyncResult.rebalanced_roadmap.map((w: any) => (
                    <div key={w.week} className="text-[11px] text-[var(--fg-muted)] flex items-start gap-1.5">
                      <span className="font-bold text-indigo-500 shrink-0">W{w.week}:</span>
                      <span>{w.focus}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
