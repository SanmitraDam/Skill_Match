'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroScene from '@/components/3d/HeroScene';
import MetricPods from './MetricPods';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useSpatialStore } from '@/lib/store';
import {
  Sparkles, Zap, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck,
  Radio, FileText, Cpu, Play, RefreshCw, Layers, Compass, LogIn,
  UserPlus, Dna, LogOut, Check, Shield, Award, Terminal, Code2, Headphones
} from 'lucide-react';

const DEMO_PRESETS = [
  {
    role: 'Senior Cloud & Backend Architect',
    jd: 'Looking for a Senior Backend Architect with Python, FastAPI, PostgreSQL, Redis caching, Docker, Kubernetes, and microservices.',
    sampleMatch: 88,
    matched: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Microservices'],
    gaps: ['Redis Caching', 'Kubernetes Clusters']
  },
  {
    role: 'Autonomous AI & Inference Systems Lead',
    jd: 'Lead AI Engineer with experience in LLM serving, Sentence-Transformers, vector search, PyTorch, and Active Noise Cancellation DSP.',
    sampleMatch: 92,
    matched: ['Sentence-Transformers', 'Vector Search', 'FastAPI', 'Python', 'PyTorch'],
    gaps: ['WebAudio DSP', 'vLLM Optimization']
  },
  {
    role: 'Full-Stack Distributed Systems Engineer',
    jd: 'Full-Stack Engineer with React, Next.js, TypeScript, PostgreSQL, REST APIs, CI/CD, and real-time audio WebRTC.',
    sampleMatch: 85,
    matched: ['React', 'Next.js', 'TypeScript', 'PostgreSQL', 'REST APIs'],
    gaps: ['WebRTC Audio', 'CI/CD Pipelines']
  }
];

export default function HeroSection({
  onAuthClick
}: {
  onAuthClick?: (mode: 'signin' | 'signup') => void;
}) {
  const { theme, navigateTo, user, isAuthenticated, setAuthenticated, setUser } = useSpatialStore();

  // Live Demo Match Widget state
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [demoInputJD, setDemoInputJD] = useState(DEMO_PRESETS[0].jd);
  const [demoMatchResult, setDemoMatchResult] = useState<typeof DEMO_PRESETS[0] | null>(DEMO_PRESETS[0]);
  const [isMatching, setIsMatching] = useState(false);

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setDemoInputJD(DEMO_PRESETS[index].jd);
    setDemoMatchResult(DEMO_PRESETS[index]);
  };

  const handleRunDemoMatch = () => {
    setIsMatching(true);
    setTimeout(() => {
      const active = DEMO_PRESETS[selectedPresetIndex];
      setDemoMatchResult(active);
      setIsMatching(false);
    }, 450);
  };

  const handleSignOut = () => {
    setUser(null);
    setAuthenticated(false);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[var(--bg-color)] text-[var(--fg-color)] transition-colors duration-500 overflow-x-hidden flex flex-col">

      {/* ─────────────────────────────────────────────────────────────
          1. DEDICATED HERO / LANDING NAVBAR (High-Impact Glassmorphic)
          ───────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[var(--glass-border-subtle)] bg-[var(--chrome-bg)]/85 backdrop-blur-2xl transition-colors duration-300">
        <div className="hero-navbar-inner max-w-7xl mx-auto h-full px-2.5 xs:px-3 phone-sm:px-4 sm:px-6 flex items-center justify-between gap-1.5 xs:gap-2 sm:gap-4">

          {/* Brand Logo & Status */}
          <div className="flex items-center gap-2 xs:gap-3 shrink-0">
            <div className="w-8 h-8 xs:w-9 xs:h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-emerald-400 flex items-center justify-center shadow-lg shadow-[var(--accent-glow)] shrink-0">
              <Dna size={18} className="text-slate-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="hero-brand-text text-xs xs:text-sm sm:text-base font-extrabold tracking-tight text-[var(--fg-color)]">
                  SkillMatch DNA
                </span>
              </div>
              <span className="hero-brand-subtitle hidden sm:inline-block text-[10px] font-mono text-[var(--fg-subtle)]">
                Career Readiness Platform
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hero-center-nav hidden lg:flex items-center gap-1">
            <button
              onClick={() => scrollToSection('live-demo')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)] transition-colors cursor-pointer"
            >
              Live Demo
            </button>
            <button
              onClick={() => navigateTo('interview')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Radio size={13} className="text-emerald-500" />
              Voice AI (ANC)
            </button>
            <button
              onClick={() => navigateTo('cv_builder')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileText size={13} className="text-[var(--accent-primary)]" />
              ATS CV Builder
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)] transition-colors cursor-pointer"
            >
              Architecture
            </button>
          </nav>

          {/* Right Action Controls: Theme Switcher + Auth Buttons */}
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 shrink-0">
            {/* Theme Toggle */}
            <ThemeToggle />

            {!isAuthenticated ? (
              <>
                {/* Sign In Button */}
                <button
                  onClick={() => onAuthClick?.('signin')}
                  className="hero-auth-btn flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 phone-sm:px-3.5 py-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--glass-border-subtle)] text-[var(--fg-color)] text-[11px] xs:text-xs font-semibold hover:border-[var(--accent-primary)] transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  <LogIn size={12} className="text-[var(--accent-primary)] shrink-0" />
                  <span>Sign In</span>
                </button>

                {/* Sign Up Button (High-converting gradient) */}
                <button
                  onClick={() => onAuthClick?.('signup')}
                  className="hero-auth-btn flex items-center gap-1 xs:gap-1.5 px-2.5 xs:px-3 phone-sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 text-[11px] xs:text-xs font-extrabold shadow-md shadow-emerald-500/25 hover:brightness-110 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <UserPlus size={12} className="shrink-0" />
                  <span>Sign Up</span>
                </button>

                {/* Direct App Launch Button for frictionless exploration */}
                <button
                  onClick={() => navigateTo('overview')}
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--bg-subtle)] text-[var(--fg-muted)] hover:text-[var(--fg-color)] text-xs font-medium hover:border-[var(--glass-border)] transition-all cursor-pointer"
                  title="Direct preview of platform workspace"
                >
                  <span>Workspace</span>
                  <ArrowRight size={12} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('overview')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 hover:brightness-110 transition-all cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>Launch Platform</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl text-[var(--fg-muted)] hover:text-rose-500 hover:bg-rose-500/10 border border-[var(--glass-border-subtle)] transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO MAIN STAGE (Kinetic 3D Typography & Direct CTAs)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] w-full pt-28 pb-16 px-4 flex flex-col items-center justify-center text-center">
        {/* 3D Background Scene */}
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-60 pointer-events-none">
          <HeroScene onTransitionComplete={() => {}} />
        </div>

        {/* Ambient Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-br from-[var(--accent-glow-strong)] to-transparent rounded-full blur-3xl pointer-events-none -z-10 opacity-70" />

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center space-y-8">
          {/* Kinetic Typography Title */}
          <div className="max-w-4xl space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="hero-main-heading text-3xl xs:text-4xl phone-sm:text-4xl phone:text-5xl sm:text-6xl md:text-7xl lg:text-7xl 3xl:text-8xl font-extrabold tracking-tight text-[var(--fg-color)]"
            >
              <span className="block">{`AI-Powered `}</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-emerald-400">
                {`Skill Gap Analysis`}
              </span>
              <span className="block">{`& Career DNA Engine`}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="hero-subheading text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-[var(--fg-muted)] max-w-3xl mx-auto font-normal leading-relaxed px-2"
            >
              Replace black-hole job applications with a closed-loop talent intelligence platform.
              Combining 384-dimensional vector skill matching, adaptive CAT testing, real-time Voice AI with verifiable Active Noise Cancellation, and JD-tailored CV synthesis.
            </motion.p>
          </div>

          {/* Primary Action Hero Buttons (Prominent SignUp & Login) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="hero-cta-group flex flex-col xs:flex-row flex-wrap items-center justify-center gap-2.5 xs:gap-3 pt-2 w-full max-w-xs xs:max-w-none"
          >
            {/* Primary Sign Up Free Button */}
            <button
              onClick={() => onAuthClick?.('signup')}
              className="hero-cta-btn theme-primary-btn px-6 xs:px-7 py-3 xs:py-3.5 text-xs xs:text-sm font-bold shadow-xl shadow-[var(--accent-glow)] flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all w-full xs:w-auto"
            >
              <UserPlus size={16} />
              <span>Sign Up Free</span>
            </button>

            {/* Sign In Button */}
            <button
              onClick={() => onAuthClick?.('signin')}
              className="hero-cta-btn px-5 xs:px-6 py-3 xs:py-3.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--fg-color)] hover:border-[var(--accent-primary)] text-xs xs:text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-xl shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 w-full xs:w-auto"
            >
              <LogIn size={15} className="text-[var(--accent-primary)]" />
              <span>Sign In</span>
            </button>

            {/* Scroll down to Live Demo */}
            <button
              onClick={() => scrollToSection('live-demo')}
              className="hero-cta-btn px-5 xs:px-6 py-3 xs:py-3.5 rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--bg-subtle)] text-[var(--fg-color)] hover:border-[var(--glass-border)] text-xs xs:text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-xl transition-all cursor-pointer hover:scale-105 active:scale-95 w-full xs:w-auto"
            >
              <Sparkles size={15} className="text-amber-400" />
              <span>Try Live Demo</span>
            </button>

            {/* Direct Platform Workspace Entrance */}
            <button
              onClick={() => navigateTo('overview')}
              className="hero-cta-btn px-4 xs:px-5 py-3 xs:py-3.5 rounded-xl border border-dashed border-[var(--glass-border)] text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:border-[var(--accent-primary)] text-xs xs:text-sm font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full xs:w-auto"
            >
              <span>Explore Platform</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>

          {/* Quick Metrics Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[var(--fg-muted)]"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>384-D Vector Embedding Model</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio size={15} className="text-emerald-500 animate-pulse" />
              <span>-18.4 dB Active Noise Cancellation</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={15} className="text-[var(--accent-primary)]" />
              <span>100% ATS Ready Resume Synthesis</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. INTERACTIVE LIVE DEMO MATCH WIDGET (PRD v2 FR-01)
          ───────────────────────────────────────────────────────────── */}
      <section id="live-demo" className="relative z-10 w-full py-16 px-4 bg-[var(--bg-subtle)]/40 border-y border-[var(--glass-border-subtle)]">
        <div className="max-w-4xl mx-auto space-y-6">

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold">
              <Sparkles size={13} />
              <span>Zero-Auth Interactive Simulation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--fg-color)] tracking-tight">
              Test Instant 384-D Vector Skill Matching
            </h2>
            <p className="text-xs sm:text-sm text-[var(--fg-muted)] max-w-xl mx-auto">
              Simulate candidate resume DNA alignment against real-world target Job Descriptions with real-time cosine similarity calculation.
            </p>
          </div>

          <div className="rounded-2xl theme-card p-6 sm:p-8 border-2 border-[var(--glass-border)] shadow-2xl space-y-5 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--glass-border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[var(--pill-bg)] text-[var(--accent-primary)]">
                  <Cpu size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--fg-color)]">
                    Preset Target Job Profiles
                  </h3>
                  <p className="text-[11px] text-[var(--fg-muted)]">
                    Select a preset or customize the JD snippet below
                  </p>
                </div>
              </div>

              {/* Quick preset selector buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {DEMO_PRESETS.map((p, idx) => (
                  <button
                    key={p.role}
                    onClick={() => handleSelectPreset(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      selectedPresetIndex === idx
                        ? 'bg-[var(--accent-primary)] text-white font-bold shadow-md shadow-[var(--accent-glow)]'
                        : 'bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-muted)] hover:text-[var(--fg-color)]'
                    }`}
                  >
                    Preset {idx + 1}: {p.role.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Description Textarea & Action */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[var(--fg-subtle)]">
                <span>Target Job Description:</span>
                <span className="text-[10px] text-[var(--accent-primary)]">Active Role: {DEMO_PRESETS[selectedPresetIndex].role}</span>
              </div>
              <div className="relative">
                <textarea
                  rows={3}
                  value={demoInputJD}
                  onChange={(e) => setDemoInputJD(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)] font-mono leading-relaxed pb-12 sm:pb-3.5"
                  placeholder="Paste any job description to run an instant skill match..."
                />
                <button
                  onClick={handleRunDemoMatch}
                  disabled={isMatching}
                  className="mt-2 sm:mt-0 sm:absolute sm:right-2.5 sm:bottom-2.5 w-full sm:w-auto theme-primary-btn px-3.5 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isMatching ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                  Run Live Vector Match
                </button>
              </div>
            </div>

            {/* Live Match Results HUD */}
            {demoMatchResult && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={demoMatchResult.role + selectedPresetIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="p-4 sm:p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-emerald-400 flex flex-col items-center justify-center text-white font-black text-xl shadow-lg shadow-[var(--accent-glow)] shrink-0">
                        {demoMatchResult.sampleMatch}%
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--fg-color)]">
                          Cosine Similarity Alignment: High Match
                        </div>
                        <div className="text-[11px] font-mono text-[var(--fg-muted)]">
                          Model: Sentence-Transformers (all-MiniLM-L6-v2) • 384-D Dense Vectors
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateTo('cv_builder')}
                        className="px-3 py-1.5 rounded-lg border border-[var(--glass-border-subtle)] bg-[var(--bg-subtle)] text-[var(--fg-color)] hover:border-[var(--accent-primary)] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText size={13} className="text-[var(--accent-primary)]" />
                        Build Tailored CV <ArrowRight size={12} />
                      </button>
                      <button
                        onClick={() => navigateTo('interview')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShieldCheck size={13} /> Practice with ANC
                      </button>
                    </div>
                  </div>

                  {/* Skills tags breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Matched Verified DNA ({demoMatchResult.matched.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {demoMatchResult.matched.map((m) => (
                          <span key={m} className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <AlertTriangle size={12} /> Critical Skill Gaps ({demoMatchResult.gaps.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {demoMatchResult.gaps.map((g) => (
                          <span key={g} className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. CORE PLATFORM ARCHITECTURE PILLARS (Awwwards-Grade Grid)
          ───────────────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 w-full py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-12">

          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--fg-color)] tracking-tight">
              Core Platform Capabilities
            </h2>
            <p className="text-xs sm:text-base text-[var(--fg-muted)] max-w-2xl mx-auto">
              Integrated tools to evaluate technical skills, prepare for interviews, and optimize your career trajectory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1 */}
            <div className="theme-card p-6 rounded-2xl border border-[var(--glass-border)] space-y-3 flex flex-col justify-between hover:border-[var(--accent-primary)] hover:shadow-xl transition-all group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                  <Cpu size={20} />
                </div>
                <h3 className="text-sm font-bold text-[var(--fg-color)] group-hover:text-[var(--accent-primary)] transition-colors">
                  384-D Vector Engine
                </h3>
                <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                  Dense semantic embeddings calculate cosine similarity between candidate resume DNA and job postings with sub-millisecond latency.
                </p>
              </div>
              <button
                onClick={() => navigateTo('matcher')}
                className="text-xs font-semibold text-[var(--accent-primary)] flex items-center gap-1 hover:underline pt-2 cursor-pointer"
              >
                Scan Matrix <ArrowRight size={12} />
              </button>
            </div>

            {/* Pillar 2 */}
            <div className="theme-card p-6 rounded-2xl border border-[var(--glass-border)] space-y-3 flex flex-col justify-between hover:border-emerald-500 hover:shadow-xl transition-all group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <Headphones size={20} />
                </div>
                <h3 className="text-sm font-bold text-[var(--fg-color)] group-hover:text-emerald-400 transition-colors">
                  Live ANC Audio Studio
                </h3>
                <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                  Real-time WebAudio DSP active noise cancellation with glowing decibel reduction telemetry (-18.4 dB) and post-interview dual-stream audio comparison player.
                </p>
              </div>
              <button
                onClick={() => navigateTo('interview')}
                className="text-xs font-semibold text-emerald-500 flex items-center gap-1 hover:underline pt-2 cursor-pointer"
              >
                Launch Voice AI <ArrowRight size={12} />
              </button>
            </div>

            {/* Pillar 3 */}
            <div className="theme-card p-6 rounded-2xl border border-[var(--glass-border)] space-y-3 flex flex-col justify-between hover:border-amber-500 hover:shadow-xl transition-all group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <FileText size={20} />
                </div>
                <h3 className="text-sm font-bold text-[var(--fg-color)] group-hover:text-amber-400 transition-colors">
                  JD-Tailored CV Builder
                </h3>
                <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                  Deep ATS scoring engine with STAR action verbs, quantified metrics enforcement, missing keyword detection, and one-click PDF export.
                </p>
              </div>
              <button
                onClick={() => navigateTo('cv_builder')}
                className="text-xs font-semibold text-amber-500 flex items-center gap-1 hover:underline pt-2 cursor-pointer"
              >
                Tailor Your CV <ArrowRight size={12} />
              </button>
            </div>

            {/* Pillar 4 */}
            <div className="theme-card p-6 rounded-2xl border border-[var(--glass-border)] space-y-3 flex flex-col justify-between hover:border-cyan-500 hover:shadow-xl transition-all group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-sm font-bold text-[var(--fg-color)] group-hover:text-cyan-400 transition-colors">
                  Adaptive CAT & Proctoring
                </h3>
                <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                  Dynamic Item Response Theory questions adjusting in real time, accompanied by Zero-Knowledge proctoring with Trust Score telemetry.
                </p>
              </div>
              <button
                onClick={() => navigateTo('quiz')}
                className="text-xs font-semibold text-cyan-500 flex items-center gap-1 hover:underline pt-2 cursor-pointer"
              >
                Test Adaptive CAT <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CALL TO ACTION CONVERSION BANNER (High Impact)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 w-full py-16 px-4">
        <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden bg-gradient-to-b from-[var(--glass-bg)] to-[var(--pill-bg)] border-2 border-[var(--glass-border)] shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent-glow)] rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--fg-color)] tracking-tight">
              Ready to Decode Your Career DNA?
            </h2>
            <p className="text-xs sm:text-base text-[var(--fg-muted)] max-w-xl mx-auto leading-relaxed">
              Create your account to run deep vector gap analyses, generate 100% ATS-ready resumes, and practice technical interviews with active noise cancellation.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onAuthClick?.('signup')}
              className="theme-primary-btn px-8 py-3.5 text-sm font-bold shadow-xl shadow-[var(--accent-glow)] flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <UserPlus size={16} />
              <span>Create Free Account</span>
            </button>
            <button
              onClick={() => onAuthClick?.('signin')}
              className="px-6 py-3.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--fg-color)] hover:border-[var(--accent-primary)] text-sm font-bold flex items-center gap-2 backdrop-blur-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => navigateTo('overview')}
              className="px-5 py-3.5 rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--bg-subtle)] text-[var(--fg-muted)] hover:text-[var(--fg-color)] text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Explore Dashboard</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. LANDING PAGE FOOTER
          ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 w-full py-8 px-4 border-t border-[var(--glass-border-subtle)] bg-[var(--chrome-bg)]/60 text-xs text-[var(--fg-subtle)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dna size={16} className="text-[var(--accent-primary)]" />
            <span className="font-bold text-[var(--fg-color)]">SkillMatch DNA</span>
            <span>• Career Readiness Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button onClick={() => scrollToSection('live-demo')} className="hover:text-[var(--fg-color)] transition-colors">Live Demo</button>
            <button onClick={() => navigateTo('cv_builder')} className="hover:text-[var(--fg-color)] transition-colors">CV Builder</button>
            <button onClick={() => navigateTo('interview')} className="hover:text-[var(--fg-color)] transition-colors">Voice AI</button>
            <button onClick={() => navigateTo('overview')} className="hover:text-[var(--fg-color)] transition-colors">Command Center</button>
          </div>

          <div>
            &copy; {new Date().getFullYear()} SkillMatch AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
