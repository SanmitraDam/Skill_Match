"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { useSpatialStore } from '@/lib/store';
import {
  Brain, AlertTriangle, CheckCircle2, ArrowRight, ExternalLink,
  Target, Sparkles, BookOpen, Layers, ShieldCheck, RefreshCw,
  Award, Terminal, Zap, Code2, Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SkillGapIntelligence() {
  const { setActiveTab } = useSpatialStore();
  const [activeResumeName, setActiveResumeName] = useState('sample_resume.pdf');
  const [roleTitle, setRoleTitle] = useState('Senior Python Developer');
  const [matchScore, setMatchScore] = useState(66.5);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Dynamic sample state representing active gap intelligence
  const criticalGaps = [
    { skill: "SQL", category: "HARD TECHNICAL", severity: "HIGH GAP", priority: "Must-Have Requirement", reason: "Target JD requires relational query design & data modeling; no sufficient evidence detected in resume." },
    { skill: "APIs", category: "HARD TECHNICAL", severity: "HIGH GAP", priority: "Must-Have Requirement", reason: "Production service integration requirement; resume lacks verified REST/gRPC API endpoints." },
    { skill: "Debugging", category: "HARD TECHNICAL", severity: "HIGH GAP", priority: "Core Competency", reason: "JD prioritizes distributed latency profiling; insufficient evidence in current candidate projects." },
    { skill: "Testing", category: "HARD TECHNICAL", severity: "HIGH GAP", priority: "Must-Have Requirement", reason: "Automated regression testing (pytest/CI) required for senior service delivery." },
    { skill: "Web Development", category: "HARD TECHNICAL", severity: "MEDIUM GAP", priority: "Preferred Competency", reason: "Full-lifecycle web application deployment expected by hiring managers." }
  ];

  const improvementPlans = [
    {
      skill: "SQL",
      priority: "HIGH PRIORITY",
      why: "Essential data querying and manipulation standard for relational databases across all software roles.",
      learn: "Complex JOINs, Window Functions (ROW_NUMBER, RANK, LAG), CTEs, Indexing.",
      practice: "Solve 30+ SQL query puzzles analyzing customer cohort retention and aggregate revenue metrics.",
      project: "Financial Transaction Analytics & Auditing Pipeline",
      evidence: "Provide a GitHub repository with schema migration scripts, complex analytics queries, and index benchmarks.",
      topics: ["Indexing", "Window Functions", "Query Plan", "ACID Transactions"]
    },
    {
      skill: "APIs",
      priority: "HIGH PRIORITY",
      why: "Foundation of inter-service communication and client-server contract architecture.",
      learn: "RESTful principles, HTTP status codes, Idempotency, JWT/OAuth2 authentication, Rate limiting.",
      practice: "Design and document a complete API specification with error formats, pagination, and filtering.",
      project: "High-Throughput Public API Service with API Keys",
      evidence: "Include a Postman collection or OpenAPI 3.0 spec alongside your backend repository.",
      topics: ["Idempotency", "HTTP Status Codes", "REST Constraints", "API Versioning"]
    },
    {
      skill: "Testing",
      priority: "HIGH PRIORITY",
      why: "Critical quality assurance capability required for reliable, regression-free software releases.",
      learn: "Unit testing, Integration testing, Pytest fixtures/mocking, Test-Driven Development (TDD), CI test runners.",
      practice: "Write comprehensive unit and integration test suites reaching 85%+ branch coverage.",
      project: "End-to-End Test Suite with Automated CI Quality Gate",
      evidence: "Display a repository with passing CI badges (GitHub Actions) running automated pytest suites.",
      topics: ["Unit vs Integration", "Mocking vs Stubbing", "TDD Cycle", "Code Coverage"]
    }
  ];

  const roadmapSteps = [
    { num: "01", phase: "FOUNDATION", title: "SQL Fundamentals & Relational Algebra", desc: "Master complex JOINs, GROUP BY, and database indexing strategies.", action: "Complete focused SQL querying drills on PostgreSQL." },
    { num: "02", phase: "PRACTICE", title: "REST APIs & Asynchronous Architecture", desc: "Build asynchronous FastAPI microservices with JWT security and rate limiting.", action: "Implement rate-limited endpoints with Redis." },
    { num: "03", phase: "FRAMEWORK & TOOLS", title: "Automated Testing & CI/CD Pipelines", desc: "Integrate pytest suites, fixtures, and GitHub Actions automated test runners.", action: "Attain 85%+ branch test coverage." },
    { num: "04", phase: "CAPSTONE PROJECT", title: "Build: High-Throughput Public API Service", desc: "Architect an end-to-end portfolio project uniting SQL, APIs, and automated testing.", action: "Deploy live service with OpenAPI documentation." },
    { num: "05", phase: "INTERVIEW PREPARATION", title: "Technical Gap Interview Drills", desc: "Rehearse domain technical questions covering SQL, APIs, and debugging.", action: "Complete mock panel interview with real-time feedback." }
  ];

  const handleReanalyze = () => {
    setIsReanalyzing(true);
    setTimeout(() => {
      setIsReanalyzing(false);
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header & Re-analysis */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--glass-border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-primary)] mb-1">
            <Sparkles size={14} /> Recovery Analysis • Core Assessment
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--fg-color)] flex items-center gap-3">
            Skill Gap <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-[var(--accent-primary)]">Intelligence</span>
          </h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            Target Role: <strong className="text-cyan-600 dark:text-cyan-400">{roleTitle}</strong> • Personalized Recovery Roadmap, Projects &amp; Interview Prep
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('matcher')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--fg-color)] bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] transition-all flex items-center gap-2 cursor-pointer"
          >
            ← Back to Skill Matcher
          </button>
          <button
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="theme-primary-btn px-5 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={cn(isReanalyzing && "animate-spin")} />
            {isReanalyzing ? "Re-Analyzing..." : "↻ RE-ANALYZE MY RESUME"}
          </button>
        </div>
      </div>

      {/* TOP DASHBOARD (4 KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-6 text-center relative overflow-hidden">
          <div className="text-4xl font-black text-cyan-600 dark:text-cyan-400">
            {matchScore.toFixed(1)}%
          </div>
          <div className="text-[11px] font-bold tracking-widest text-[var(--fg-muted)] uppercase mt-1">
            CURRENT MATCH
          </div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent" />
        </GlassCard>

        <GlassCard className="p-6 text-center relative overflow-hidden">
          <div className="text-4xl font-black text-[var(--fg-color)]">5</div>
          <div className="text-[11px] font-bold tracking-widest text-[var(--fg-muted)] uppercase mt-1">
            SKILL GAPS
          </div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-transparent" />
        </GlassCard>

        <GlassCard className="p-6 text-center relative overflow-hidden">
          <div className="text-4xl font-black text-rose-500">4</div>
          <div className="text-[11px] font-bold tracking-widest text-[var(--fg-muted)] uppercase mt-1">
            CRITICAL GAPS
          </div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-transparent" />
        </GlassCard>

        <GlassCard className="p-6 text-center relative overflow-hidden">
          <div className="text-xl font-black text-amber-500 mt-2">
            MODERATE READINESS
          </div>
          <div className="text-[11px] font-bold tracking-widest text-[var(--fg-muted)] uppercase mt-1">
            READINESS ASSESSMENT
          </div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-transparent" />
        </GlassCard>
      </div>

      {/* CRITICAL SKILL GAPS INTELLIGENCE */}
      <GlassCard title="Critical Skill Gaps Intelligence">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {criticalGaps.map((g, i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-[var(--fg-color)]">{g.skill}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--fg-muted)]">{g.category}</span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                    g.severity.includes("HIGH") ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  )}>{g.severity}</span>
                </div>
              </div>
              <div className="text-xs text-purple-400 font-semibold mb-1">
                JD Priority: {g.priority}
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                {g.reason}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* AI-POWERED IMPROVEMENT PLAN */}
      <GlassCard title="AI-Powered Improvement Plan">
        <div className="grid grid-cols-1 gap-4 mt-2">
          {improvementPlans.map((plan, i) => (
            <div key={i} className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[var(--fg-color)] flex items-center gap-2">
                  <Target size={16} className="text-cyan-500" /> {plan.skill}
                </span>
                <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/30">
                  {plan.priority}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-bold text-[var(--fg-color)] mb-1">🎯 WHY IT MATTERS</div>
                  <div className="text-[var(--fg-muted)] mb-3">{plan.why}</div>

                  <div className="font-bold text-cyan-600 dark:text-cyan-400 mb-1">📚 WHAT TO LEARN</div>
                  <div className="text-[var(--fg-muted)] mb-3">{plan.learn}</div>

                  <div className="font-bold text-[var(--fg-color)] mb-1">⚡ WHAT TO PRACTICE</div>
                  <div className="text-[var(--fg-muted)]">{plan.practice}</div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-[var(--glass-border-subtle)] md:pl-4 pt-3 md:pt-0">
                  <div className="font-bold text-purple-600 dark:text-purple-400 mb-1">🛠️ SUGGESTED PROJECT</div>
                  <div className="text-[var(--fg-color)] font-semibold mb-3">{plan.project}</div>

                  <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">📝 RESUME EVIDENCE TO ADD</div>
                  <div className="text-[var(--fg-muted)] mb-3">{plan.evidence}</div>

                  <div className="font-bold text-[var(--fg-color)] mb-1">🎙️ INTERVIEW TOPICS</div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {plan.topics.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[10px] text-[var(--fg-color)] border border-[var(--glass-border-subtle)]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* PERSONALIZED RECOVERY ROADMAP */}
      <GlassCard title="Your Skill Recovery Roadmap">
        <div className="space-y-3 mt-2">
          {roadmapSteps.map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--glass-bg)] border-l-4 border-l-[var(--accent-primary)] border border-[var(--glass-border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-lg font-mono font-black text-cyan-600 dark:text-cyan-400">{s.num}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">{s.phase}</span>
                    <h4 className="text-sm font-bold text-[var(--fg-color)]">{s.title}</h4>
                  </div>
                  <p className="text-xs text-[var(--fg-muted)] mt-1">{s.desc}</p>
                </div>
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium shrink-0 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                ➔ Action: {s.action}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* TWO-COLUMN: Build To Close The Gap & Recommended Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Build To Close The Gap">
          <div className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/30 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300">PORTFOLIO BLUEPRINT</span>
            <h3 className="text-lg font-bold text-[var(--fg-color)] mt-1">High-Throughput Public API Service with API Keys</h3>
            <p className="text-xs text-[var(--fg-muted)] mt-1">
              Closing your largest gap in APIs directly addresses the top must-have requirement for the Senior Python Developer role.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-[var(--fg-muted)]">Target Competency:</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-300 font-bold border border-rose-500/30">APIs</span>
            </div>
            <div>
              <span className="font-bold text-[var(--fg-muted)]">Skills Covered:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {["REST APIs", "SQL", "Testing", "FastAPI", "Redis"].map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="font-bold text-[var(--fg-muted)]">Difficulty:</span> <span className="text-[var(--fg-color)] font-medium">Intermediate</span> • <span className="font-bold text-[var(--fg-muted)]">Portfolio Impact:</span> <span className="text-emerald-600 dark:text-emerald-400 font-bold">High Hiring Value</span>
            </div>
            <div>
              <span className="font-bold text-[var(--fg-muted)]">Expected Outcome:</span>
              <p className="text-[var(--fg-muted)] mt-0.5">A deployed, rate-limited REST microservice with automated test suites and live Swagger API documentation.</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Recommended Resources">
          <div className="space-y-3 mt-2">
            {[
              { skill: "SQL", title: "PostgreSQL Tutorial & Interactive SQL", type: "Interactive Guide", url: "https://www.postgresqltutorial.com/" },
              { skill: "APIs", title: "REST API Tutorial & Best Practices", type: "Official Reference", url: "https://restfulapi.net/" },
              { skill: "Testing", title: "Pytest Documentation & Testing Patterns", type: "Official Documentation", url: "https://docs.pytest.org/en/stable/" },
              { skill: "Debugging", title: "Python Debugging with pdb", type: "Official Guide", url: "https://docs.python.org/3/library/pdb.html" }
            ].map((res, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:border-cyan-400/40 transition-all flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase font-semibold">{res.skill} • {res.type}</div>
                  <div className="text-sm font-bold text-[var(--fg-color)] mt-0.5">{res.title}</div>
                </div>
                <a href={res.url} target="_blank" rel="noreferrer" className="text-xs text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1 hover:underline shrink-0">
                  Open Docs <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* RESUME IMPROVEMENT SIGNALS */}
      <GlassCard title="Resume Improvement Signals">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          <div>
            <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Demonstrated Skills (8)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Python", "Data Structures & Algorithms", "DBMS", "OOP", "Problem Solving", "Streamlit", "Communication", "Teamwork"].map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-medium">
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle size={14} /> Needs Stronger Evidence (1)
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-medium">
                ~ Web Development
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-rose-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle size={14} /> Critical Missing Skills (4)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["SQL", "APIs", "Debugging", "Testing"].map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-medium">
                  ✕ {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
          <ShieldCheck size={18} className="text-tech-cyan shrink-0 mt-0.5" />
          <div>
            <strong className="text-tech-cyan">Veracity-First Principle:</strong> Never fabricate or claim unverified skills on your resume. Instead, build the recommended capstone project, write automated tests, deploy the service on GitHub, and document quantifiable performance metrics before adding verified skills to your profile.
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
