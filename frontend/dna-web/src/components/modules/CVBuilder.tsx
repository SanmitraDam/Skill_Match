'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Sparkles, CheckCircle2, AlertTriangle, Download, Copy,
  Check, ArrowRight, RefreshCw, Layers, ShieldCheck, Zap, Target,
  Briefcase, GraduationCap, Code2, Plus, Sliders
} from 'lucide-react';
import { useGenerateTailoredCV, useATSCheck } from '@/hooks/useFastAPI';
import { TailoredCVResponse, ATSEvaluation } from '@/types/api';
import { useSpatialStore } from '@/lib/store';

const PRESET_JDS: { label: string; role: string; jd: string }[] = [
  {
    label: 'Senior Full-Stack Cloud Engineer',
    role: 'Senior Full-Stack Cloud Engineer',
    jd: `We are seeking a Senior Full-Stack Cloud Engineer with deep expertise in Python, FastAPI, React, Next.js, and TypeScript.
Required Skills:
- Architecting resilient REST and gRPC microservices with PostgreSQL and Redis caching.
- Designing high-throughput event-driven architectures using Kafka or RabbitMQ.
- Deploying containerized workloads using Docker, Kubernetes, and CI/CD pipelines on AWS.
- Writing comprehensive unit and integration tests with Pytest and Jest.
- Familiarity with WebAudio DSP, active noise cancellation, or WebRTC is a strong plus.`
  },
  {
    label: 'Autonomous AI & ML Systems Lead',
    role: 'Autonomous AI & ML Systems Lead',
    jd: `Apex AI is looking for an AI/ML Platform Lead to build distributed inference engines and vector retrieval architectures.
Required Skills:
- Production deployment of Large Language Models (LLMs) with vLLM, TensorRT-LLM, and HuggingFace.
- 384-dimensional dense vector embeddings using Sentence-Transformers and Pinecone/pgvector.
- Natural Language Processing (NLP) pipelines with spaCy, PyMuPDF, and faster-whisper.
- Computerized Adaptive Testing (CAT) and Item Response Theory (IRT) modeling.
- Strong Python, PyTorch, FastAPI, and asynchronous concurrency fundamentals.`
  },
  {
    label: 'Staff Distributed Systems Architect',
    role: 'Staff Distributed Systems Architect',
    jd: `Looking for a Staff Distributed Systems Architect to lead high-concurrency cloud infrastructure.
Required Skills:
- Distributed consensus, CAP theorem trade-offs, and database replication in PostgreSQL and CockroachDB.
- High-performance caching layers with Redis, memcached, and cache-aside patterns.
- Asynchronous task processing with Celery, Redis queue, and exponential backoff retries.
- Zero-Knowledge proofs, security compliance, and microservices observability.`
  }
];

export function CVBuilder() {
  const { user } = useSpatialStore();

  // Inputs state
  const [targetRole, setTargetRole] = useState('Senior Full-Stack Cloud Engineer');
  const [jobDescription, setJobDescription] = useState(PRESET_JDS[0].jd);
  const [customDetails, setCustomDetails] = useState(
    "Spearheaded active noise cancellation (ANC) audio pipeline in WebAudio DSP reducing background clatter by 18.4 dB.\n" +
    "Scaled real-time FastAPI ingestion services from 500k to 2.5M daily active requests with sub-50ms p99 latency.\n" +
    "Automated end-to-end CI/CD deployments in Docker & Kubernetes, cutting release cycle time by 45%."
  );

  const [candidateProfile, setCandidateProfile] = useState({
    name: user?.name || "Alex Chen",
    role: "Senior Software Engineer",
    email: user?.email || "alex.chen@skillmatch.io",
    phone: "+1 (555) 438-9120",
    location: "San Francisco, CA (Open to Remote)",
    skills: ["Python", "FastAPI", "React", "Next.js", "TypeScript", "PostgreSQL", "Docker", "Git", "Redis"]
  });

  // Output & UI tab states
  const [activeViewTab, setActiveViewTab] = useState<'preview' | 'markdown' | 'ats_report'>('preview');
  const [generatedCV, setGeneratedCV] = useState<TailoredCVResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Sync candidate profile with logged in user
  useEffect(() => {
    if (user?.name || user?.email) {
      setCandidateProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        role: user.role === 'recruiter' ? 'Recruiter' : prev.role,
      }));
    }
  }, [user]);

  // API mutations
  const generateMut = useGenerateTailoredCV();
  const atsCheckMut = useATSCheck();

  const handleApplyPreset = (preset: typeof PRESET_JDS[0]) => {
    setTargetRole(preset.role);
    setJobDescription(preset.jd);
  };

  const handleGenerate = async () => {
    setGenError(null);
    try {
      const res = await generateMut.mutateAsync({
        profile_data: candidateProfile,
        custom_details: customDetails,
        job_description: jobDescription,
        target_role: targetRole
      });
      setGeneratedCV(res);

      // Proactive ATS Verification: If the response doesn't already contain a full audit,
      // we trigger a separate high-fidelity check to ensure alignment.
      if (!res.ats_evaluation) {
        try {
          const atsRes = await atsCheckMut.mutateAsync({
            cv_text: res.cv_markdown,
            job_description: jobDescription
          });
          setGeneratedCV(prev => prev ? { ...prev, ats_evaluation: atsRes } : null);
        } catch (atsErr) {
          console.warn("Proactive ATS check failed:", atsErr);
        }
      }
    } catch (err: any) {
      console.error("CV generation failed:", err);
      setGenError(err?.message || "Failed to generate tailored CV. Please retry.");
    }
  };

  const handleAddMissingKeyword = async (kw: string) => {
    const updatedDetails = `${customDetails}\nImplemented ${kw} in production.`;
    setCustomDetails(updatedDetails);

    // Trigger a re-check of the ATS score immediately after adding the keyword
    if (generatedCV) {
      try {
        const atsRes = await atsCheckMut.mutateAsync({
          cv_text: generatedCV.cv_markdown,
          job_description: jobDescription
        });
        setGeneratedCV(prev => prev ? { ...prev, ats_evaluation: atsRes } : null);
      } catch (err) {
        console.warn("Instant ATS re-check failed:", err);
      }
    }
  };

  const handleCopyMarkdown = () => {
    if (!generatedCV) return;
    navigator.clipboard.writeText(generatedCV.cv_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const atsEval: ATSEvaluation | undefined = generatedCV?.ats_evaluation;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Top Header Banner ── */}
      <div className="rounded-2xl theme-card p-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)]">
                <Sparkles size={11} className="text-[var(--accent-primary)] animate-pulse" /> ATS Optimization Active
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck size={11} /> ATS Target: 90%+
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg-color)]">
              JD-Tailored CV Builder &amp; ATS Checker
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--fg-muted)] max-w-2xl leading-relaxed">
              Synthesizes high-impact executive CVs aligned with your target Job Description, incorporating verified profile DNA, STAR action verbs, and instant ATS compatibility scoring.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generateMut.isPending}
            className="theme-primary-btn px-6 py-3 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[var(--accent-glow)] cursor-pointer disabled:opacity-50"
          >
            {generateMut.isPending ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Synthesizing Tailored CV...
              </>
            ) : (
              <>
                <Zap size={15} />
                Generate Tailored CV &amp; Check ATS
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {genError && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400 shrink-0" />
            <span className="font-mono">{genError}</span>
          </div>
          <button
            onClick={() => setGenError(null)}
            className="text-amber-300/60 hover:text-amber-300 font-mono text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 2-Column Grid: Inputs & Presets (Left) vs ATS Gauge & Preview (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT COLUMN: Configuration & Profile Data (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-5">
          {/* Target Role & Preset Selector */}
          <div className="rounded-2xl theme-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-1.5">
                <Target size={13} /> 1. Target Role &amp; JD Preset
              </label>
              <span className="text-[10px] font-mono text-[var(--fg-subtle)]">Auto-fill JD</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PRESET_JDS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleApplyPreset(p)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                    targetRole === p.role
                      ? 'border-[var(--accent-primary)] bg-[var(--pill-bg)] text-[var(--accent-primary)] font-semibold'
                      : 'border-[var(--glass-border-subtle)] bg-[var(--glass-bg)] text-[var(--fg-muted)] hover:border-[var(--glass-border)]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11px] font-medium text-[var(--fg-muted)] mb-1 block">
                Target Role Title:
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                placeholder="e.g. Senior Full-Stack Cloud Architect"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[var(--fg-muted)] mb-1 block">
                Target Job Description (JD):
              </label>
              <textarea
                rows={5}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs font-mono text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)] leading-relaxed"
                placeholder="Paste the full target job description here..."
              />
            </div>
          </div>

          {/* Supplementary Custom Details Input Area */}
          <div className="rounded-2xl theme-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-1.5">
                <Briefcase size={13} /> 2. Role-Specific Custom Highlights
              </label>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">STAR Format</span>
            </div>
            <p className="text-[11px] text-[var(--fg-subtle)]">
              Add supplementary achievements or custom metrics to weave into the tailored experience section:
            </p>
            <textarea
              rows={4}
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)] leading-relaxed font-mono"
              placeholder="e.g. Engineered active noise cancellation in WebAudio DSP reducing background clatter by 18.4 dB..."
            />
          </div>

          {/* Candidate Profile Auto-Fill Preview */}
          <div className="rounded-2xl theme-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--fg-muted)] flex items-center gap-1.5">
                <GraduationCap size={13} /> 3. Candidate Baseline Profile
              </label>
              <span className="text-[10px] font-mono text-[var(--fg-subtle)]">Verified DNA</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]">
                <span className="text-[10px] font-mono text-[var(--fg-subtle)] block">Name</span>
                <span className="font-semibold text-[var(--fg-color)] truncate block">{candidateProfile.name}</span>
              </div>
              <div className="p-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]">
                <span className="text-[10px] font-mono text-[var(--fg-subtle)] block">Contact</span>
                <span className="font-semibold text-[var(--fg-color)] truncate block">{candidateProfile.email}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[var(--fg-subtle)] block mb-1">Indexed Profile Skills:</span>
              <div className="flex flex-wrap gap-1">
                {candidateProfile.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: ATS Checker HUD & CV Preview (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-5">
          {/* ATS Compatibility HUD Card */}
          {atsEval && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl theme-card p-5 border-2 border-[var(--glass-border)] space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Radial score gauge indicator */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex flex-col items-center justify-center text-white shadow-md shadow-[var(--accent-glow)]">
                    <span className="text-xl font-black leading-none">{atsEval.ats_score}%</span>
                    <span className="text-[8px] font-mono uppercase tracking-widest mt-0.5">ATS Score</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[var(--fg-color)]">
                        ATS Compatibility: {atsEval.score_grade}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        VERIFIED
                      </span>
                    </div>
                    <p className="text-xs text-[var(--fg-muted)]">
                      Scored against {atsEval.matched_keywords.length + atsEval.missing_keywords.length} technical JD keywords
                    </p>
                  </div>
                </div>

                {/* Dimension scoring pills */}
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <div className="px-2.5 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)]">
                    Keywords: <span className="font-bold text-[var(--accent-primary)]">{atsEval.dimension_scores.keyword_matching}/40</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)]">
                    Sections: <span className="font-bold text-emerald-600 dark:text-emerald-400">{atsEval.dimension_scores.section_compliance}/20</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)]">
                    Metrics: <span className="font-bold text-cyan-600 dark:text-cyan-400">{atsEval.dimension_scores.action_verbs_metrics}/20</span>
                  </div>
                </div>
              </div>

              {/* Matched Keywords vs Missing Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                    <CheckCircle2 size={13} /> Matched ATS Keywords ({atsEval.matched_keywords.length})
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {atsEval.matched_keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 mb-2">
                    <AlertTriangle size={13} /> Recommended Missing Terms ({atsEval.missing_keywords.length})
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {atsEval.missing_keywords.length > 0 ? (
                      atsEval.missing_keywords.map((kw) => (
                        <button
                          key={kw}
                          onClick={() => setCustomDetails((prev) => prev + `\nImplemented ${kw} in production.`)}
                          title="Click to add to custom details"
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer flex items-center gap-1"
                        >
                          <Plus size={9} /> {kw}
                        </button>
                      ))
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        100% JD Keyword Alignment Achieved!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CV Workspace & Actions Bar */}
          <div className="rounded-2xl theme-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between border-b border-[var(--glass-border-subtle)] p-3 px-5 gap-2 bg-[var(--glass-bg)]">
              {/* Tab selector */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveViewTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeViewTab === 'preview'
                      ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                      : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)]'
                  }`}
                >
                  <FileText size={13} className="inline mr-1.5" />
                  Executive Preview
                </button>
                <button
                  onClick={() => setActiveViewTab('markdown')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeViewTab === 'markdown'
                      ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                      : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)]'
                  }`}
                >
                  <Code2 size={13} className="inline mr-1.5" />
                  Markdown Code
                </button>
                <button
                  onClick={() => setActiveViewTab('ats_report')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeViewTab === 'ats_report'
                      ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                      : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)]'
                  }`}
                >
                  <ShieldCheck size={13} className="inline mr-1.5" />
                  ATS Audit Report
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMarkdown}
                  disabled={!generatedCV}
                  className="px-3 py-1.5 rounded-lg border border-[var(--glass-border-subtle)] bg-[var(--bg-subtle)] text-[var(--fg-color)] hover:border-[var(--glass-border)] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                >
                  {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handlePrint}
                  disabled={!generatedCV}
                  className="px-3 py-1.5 rounded-lg border border-[var(--glass-border-subtle)] bg-[var(--bg-subtle)] text-[var(--fg-color)] hover:border-[var(--glass-border)] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Download size={13} />
                  Export PDF
                </button>
              </div>
            </div>

            {/* Content Container */}
            <div className="p-6 min-h-[480px]">
              {generatedCV ? (
                <>
                  {activeViewTab === 'preview' && (
                    <div className="space-y-6 max-w-3xl mx-auto bg-white text-slate-900 p-8 rounded-xl shadow-md font-sans print:shadow-none print:p-0">
                      {/* Executive Header */}
                      <div className="border-b border-slate-300 pb-4 text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                          {generatedCV.structured_cv.header.name}
                        </h2>
                        <div className="text-xs font-semibold text-slate-700 mt-1">
                          {generatedCV.structured_cv.header.role} • {generatedCV.structured_cv.header.location}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 space-x-2">
                          <span>{generatedCV.structured_cv.header.email}</span>
                          <span>•</span>
                          <span>{generatedCV.structured_cv.header.phone}</span>
                          <span>•</span>
                          <span>{generatedCV.structured_cv.header.links.join(" • ")}</span>
                        </div>
                      </div>

                      {/* Summary */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                          Professional Summary
                        </h3>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {generatedCV.structured_cv.summary}
                        </p>
                      </div>

                      {/* Core Skills */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                          Technical Competencies
                        </h3>
                        <div className="text-xs text-slate-800 space-y-1">
                          <div>
                            <span className="font-semibold">Core Technical Skills:</span>{" "}
                            {generatedCV.structured_cv.skills.core.join(", ")}
                          </div>
                          <div>
                            <span className="font-semibold">Tools &amp; Infrastructure:</span>{" "}
                            {generatedCV.structured_cv.skills.tools.join(", ")}
                          </div>
                        </div>
                      </div>

                      {/* Experience */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                          Professional Experience
                        </h3>
                        <div className="space-y-4">
                          {generatedCV.structured_cv.experience.map((exp, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-baseline text-xs">
                                <span className="font-bold text-slate-950">
                                  {exp.title} — <span className="font-semibold text-slate-700">{exp.company}</span>
                                </span>
                                <span className="font-mono text-[11px] text-slate-500">{exp.duration}</span>
                              </div>
                              <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-700 leading-relaxed">
                                {exp.bullets.map((b, bIdx) => (
                                  <li key={bIdx}>{b}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Education */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                          Education &amp; Credentials
                        </h3>
                        <div className="space-y-2">
                          {generatedCV.structured_cv.education.map((edu, idx) => (
                            <div key={idx} className="text-xs">
                              <div className="flex justify-between font-semibold text-slate-900">
                                <span>{edu.degree} — {edu.institution}</span>
                                <span className="font-mono text-[11px] text-slate-500">{edu.year}</span>
                              </div>
                              {edu.details && (
                                <p className="text-[11px] text-slate-600">{edu.details}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeViewTab === 'markdown' && (
                    <div className="space-y-2">
                      <textarea
                        readOnly
                        rows={20}
                        value={generatedCV.cv_markdown}
                        className="w-full p-4 rounded-xl bg-[var(--glass-bg)] text-[var(--fg-color)] font-mono text-xs leading-relaxed border border-[var(--glass-border-subtle)] focus:outline-none"
                      />
                    </div>
                  )}

                  {activeViewTab === 'ats_report' && atsEval && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-3">
                        <h4 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          ATS Keyword &amp; Formatting Compliance Checklist
                        </h4>
                        <div className="space-y-2 text-xs">
                          {atsEval.formatting_alerts.length === 0 ? (
                            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                              ✓ Perfect ATS formatting: Standard headings detected, clean single-column structure, and contact information present.
                            </div>
                          ) : (
                            atsEval.formatting_alerts.map((alert, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                <span>{alert}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-3">
                        <h4 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                          <Sparkles size={16} className="text-[var(--accent-primary)]" />
                          Recommended Optimization Strategy
                        </h4>
                        <ul className="space-y-2 text-xs text-[var(--fg-muted)] list-disc pl-5">
                          {atsEval.recommendations.map((rec, idx) => (
                            <li key={idx} className="leading-relaxed">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--pill-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--accent-primary)] shadow-md">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--fg-color)]">
                      Ready to Build Your JD-Tailored CV
                    </h3>
                    <p className="text-xs text-[var(--fg-muted)] max-w-sm mt-1">
                      Select a target role or paste a job description on the left, then click &quot;Generate Tailored CV&quot; to synthesize an ATS-compliant resume.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={generateMut.isPending}
                    className="theme-primary-btn px-5 py-2.5 text-xs font-bold cursor-pointer"
                  >
                    Generate Initial Preview
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CVBuilder;
