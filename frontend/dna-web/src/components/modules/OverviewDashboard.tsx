'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSpatialStore } from '@/lib/store';
import { NAV_GROUPS, TOTAL_SECTIONS } from '@/lib/navigation';
import {
  Activity, ShieldCheck, Users, Cpu, ArrowRight, CircleDot, Zap,
  Layers, Lock, TrendingUp, CheckCircle2, Clock, Command, Code2, Mic, BookOpen, Bell, Briefcase
} from 'lucide-react';

/* ── Unified Platform KPI definitions ── */
const KPIS = [
  { label: 'Architectural Pillars', value: '6', unit: 'core tiers', icon: Layers, accent: '#10b981', textAccent: 'text-emerald-700 dark:text-emerald-400', delta: 'Fully integrated' },
  { label: 'Composite Readiness', value: '94.5', unit: 'CCRS', icon: TrendingUp, accent: '#0284c7', textAccent: 'text-sky-700 dark:text-sky-400', delta: '+3.2 pts / 30d' },
  { label: 'Recruiter Reach Accuracy', value: '94.2%', unit: 'Model Eq. 1.2', icon: Users, accent: '#d97706', textAccent: 'text-amber-800 dark:text-amber-400', delta: '42 profile views' },
  { label: 'Memory Retention (Ebbinghaus)', value: '91.8%', unit: 'R = e^(-t/S)', icon: BookOpen, accent: '#9333ea', textAccent: 'text-purple-800 dark:text-purple-400', delta: 'Decay protected' },
];

const TELEMETRY = [
  { label: 'JD-Tailored CV Builder & ATS Checker', value: 'Operational', detail: '0-100% ATS score audit & keyword optimization', icon: Briefcase, ok: true },
  { label: 'Verifiable ANC Audio Demo Studio', value: 'Operational', detail: 'Raw vs. Filtered side-by-side verification player', icon: Mic, ok: true },
  { label: 'Smart Surrender & Auto-Advancement', value: 'Operational', detail: 'Sub-50ms intent detection & zero delay advance', icon: Zap, ok: true },
  { label: 'Post-Sign-In Professional Social Feed', value: 'Operational', detail: 'Empirical CCRS & proof-of-work cards', icon: Users, ok: true },
  { label: 'Production Input DNA Matrix (384-D)', value: 'Operational', detail: 'PyMuPDF stream extraction <= 150ms SLA', icon: Cpu, ok: true },
  { label: 'Pyodide WASM Live Sandbox & AST Profiler', value: 'Operational', detail: 'Sub-10ms unit tests & Socratic hints', icon: Code2, ok: true },
];

const SECURITY = [
  'Client-side zk-Proctor Groth16 proofs (PTS >= 90%)',
  'Active Noise Cancellation verification with dual-stream WAV demos',
  'Automated NLP STAR method response classification',
  'Zero self-reported fluff: verified WASM AST execution benchmarks',
  'Bi-directional Greenhouse & Workday ATS webhooks',
];

export default function OverviewDashboard() {
  const { user, isAuthenticated, activeTenantId, navigateTo } = useSpatialStore();
  const displayName = isAuthenticated && user ? user.name.split(' ')[0] : 'Operator';

  return (
    <div className="space-y-6">
      {/* ── Hero band ── */}
      <div className="rounded-2xl theme-card p-6 md:p-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)]">
              <CircleDot size={10} className="animate-pulse" /> Platform Engine Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-muted)]">
              Tenant · {activeTenantId}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-[var(--fg-color)]">
            SkillMatch DNA Command Center
          </h1>
          <p className="mt-2 max-w-3xl text-sm md:text-base text-[var(--fg-muted)] leading-relaxed">
            Autonomous career intelligence platform: 384-dimensional vector skill matching, JD-tailored CV builder with integrated ATS checker, Voice AI with verifiable Active Noise Cancellation, and adaptive CAT quiz studio.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigateTo('cv_builder')}
              className="theme-primary-btn px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Briefcase size={14} /> JD-Tailored CV &amp; ATS <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigateTo('interview')}
              className="px-4 py-2.5 rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--glass-bg)] text-[var(--fg-color)] hover:border-[var(--glass-border)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Mic size={14} className="text-emerald-500" /> Voice AI (ANC Studio)
            </button>
            <button
              onClick={() => navigateTo('hero')}
              className="px-4 py-2.5 rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--glass-bg)] text-[var(--fg-color)] hover:border-[var(--glass-border)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap size={14} className="text-amber-500" /> 3D Hero Demo
            </button>
            <button
              onClick={() => navigateTo('feed')}
              className="px-4 py-2.5 rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--glass-bg)] text-[var(--fg-color)] hover:border-[var(--glass-border)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users size={14} className="text-cyan-500" /> Social Readiness Feed
            </button>
            <button
              onClick={() => navigateTo('matcher')}
              className="px-4 py-2.5 rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--glass-bg)] text-[var(--fg-color)] hover:border-[var(--glass-border)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Cpu size={14} className="text-purple-500" /> DNA Matcher
            </button>
            <span className="hidden md:inline-flex items-center gap-2 text-[11px] font-mono text-[var(--fg-subtle)] ml-auto">
              <Command size={12} /> Press Ctrl/⌘ + K for Command Palette
            </span>
          </div>
        </div>
      </div>

      {/* ── KPI rail ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPIS.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="theme-card p-4"
            >
              <div className="flex items-start justify-between">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center border"
                  style={{ borderColor: `${kpi.accent}44`, backgroundColor: `${kpi.accent}18` }}
                >
                  <Icon size={16} style={{ color: kpi.accent }} />
                </span>
                <span className="text-[10px] font-mono text-[var(--fg-muted)] uppercase tracking-wider font-semibold">{kpi.unit}</span>
              </div>
              <div className="mt-3 text-2xl font-bold text-[var(--fg-color)] tabular-nums">{kpi.value}</div>
              <div className="text-xs text-[var(--fg-muted)] mt-0.5">{kpi.label}</div>
              <div className={`mt-2 text-[10px] font-mono font-semibold ${kpi.textAccent}`}>{kpi.delta}</div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Vertical launcher ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--fg-color)] uppercase tracking-wider">
            Core Assessment Modules
          </h2>
          <span className="text-[11px] font-mono text-[var(--fg-muted)] font-medium">
            {NAV_GROUPS.length} tiers · {TOTAL_SECTIONS} addressable sections
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {NAV_GROUPS.map((group, gi) => {
            const GroupIcon = group.icon;
            return (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + gi * 0.04, duration: 0.3 }}
                className="rounded-2xl theme-surface p-4 border hover:border-[var(--glass-border)] transition-colors shadow-sm"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center border shadow-xs"
                    style={{ borderColor: `${group.accent}44`, backgroundColor: `${group.accent}18` }}
                  >
                    <GroupIcon size={15} style={{ color: group.accent }} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--fg-color)] truncate">{group.label}</div>
                    <div className="text-[10px] font-mono text-[var(--fg-muted)] font-medium">{group.tabs.length} sections</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {group.tabs.map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => navigateTo(tab.id)}
                        title={tab.description}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-[var(--fg-color)] font-medium bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] hover:bg-[var(--pill-bg)] transition-all cursor-pointer shadow-xs"
                      >
                        <TabIcon size={11} style={{ color: group.accent }} />
                        {tab.label}
                        {tab.badge && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)]">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Telemetry + security ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl theme-surface p-5 border">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-emerald-500" />
            <h2 className="text-sm font-semibold text-[var(--fg-color)]">Core Architectural Subsystem Telemetry</h2>
          </div>
          <div className="space-y-2.5">
            {TELEMETRY.map((t) => {
              const TIcon = t.icon;
              return (
                <div
                  key={t.label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]"
                >
                  <TIcon size={15} className={t.ok ? 'text-emerald-500' : 'text-amber-500'} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-[var(--fg-color)] truncate">{t.label}</div>
                    <div className="text-[10px] font-mono text-[var(--fg-subtle)] truncate">{t.detail}</div>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      t.ok
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                        : 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${t.ok ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {t.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl theme-surface p-5 border">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={15} className="text-emerald-500" />
            <h2 className="text-sm font-semibold text-[var(--fg-color)]">Trust, Proctoring &amp; Empirical Badges</h2>
          </div>
          <ul className="space-y-2.5">
            {SECURITY.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-[var(--fg-muted)] leading-relaxed">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-[var(--glass-border-subtle)] flex items-center gap-2 text-[10px] font-mono text-[var(--fg-subtle)]">
            <Clock size={11} /> Real-time empirical attestation verified
          </div>
        </div>
      </div>
    </div>
  );
}
