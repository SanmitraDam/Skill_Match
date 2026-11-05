"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { useStartQuiz, useNextQuestion, useSubmitAnswer, useFinishQuiz } from '@/hooks/useFastAPI';
import { MCQQuestion } from '@/types/api';
import { Brain, CheckCircle2, XCircle, Trophy, ArrowRight, Code, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIERS = [
  { level: 1, label: 'Foundational (L3 Associate)', diff: 'b = -1.0', desc: 'Core Data Structures, SQL Indexing & Basic Algorithm Complexity' },
  { level: 2, label: 'Intermediate (L4 Mid-Level)', diff: 'b = 0.0', desc: 'Concurrency, REST vs gRPC, Caching & Relational Query Tuning' },
  { level: 3, label: 'Senior (L5 Tech Lead)', diff: 'b = +1.2', desc: 'Distributed Consensus, Partitioning, Event-Driven & High-QPS Scaling', recommended: true },
  { level: 4, label: 'Staff / Principal (L6+)', diff: 'b = +2.2', desc: 'Memory Barriers, Kernel Bypass, Raft Quorums & Fault Domains' },
];

const DOMAINS = [
  { title: 'Distributed Consensus & Replication', tag: 'Raft / Paxos', desc: 'Quorum slices, split-brain mitigation, replication lag & linearizability.' },
  { title: 'High-Concurrency & Memory Models', tag: 'Atomics / CAS', desc: 'Lock-free queues, race condition detection, mutex contention, memory barriers.' },
  { title: 'Vector Indexing & Storage Engines', tag: 'HNSW / LSM', desc: 'LSM-tree compactions, bloom filters, write amplification, vector embeddings.' },
  { title: 'Resilience & Distributed Protocols', tag: 'Zero-Downtime', desc: 'Circuit breaking, token-bucket rate limiters, backpressure & hedged requests.' },
];

export function CATQuiz() {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<MCQQuestion | null>(null);
  const [difficulty, setDifficulty] = useState(3);
  const [thetaAbility, setThetaAbility] = useState(0.0);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [lastResult, setLastResult] = useState<{ correct: boolean; newDiff: number; theta?: number } | null>(null);
  const [selectedTier, setSelectedTier] = useState<number>(3);

  const startQuizMut = useStartQuiz();
  const nextQuestMut = useNextQuestion();
  const submitAnsMut = useSubmitAnswer();
  const finishQuizMut = useFinishQuiz();

  const startQuiz = async () => {
    try {
      const data = await startQuizMut.mutateAsync(selectedTier);
      setSessionId(data.session_id);
      setDifficulty(data.initial_difficulty || selectedTier);
      setThetaAbility(data.theta_ability || 0.0);
      await fetchNextQuestion(data.session_id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNextQuestion = async (id: number) => {
    try {
      const q = await nextQuestMut.mutateAsync(id);
      setCurrentQuestion(q);
      setLastResult(null);
    } catch (err) {
      console.error(err);
    }
  };

  const finishQuiz = async () => {
    if (!sessionId) return;
    try {
      const res = await finishQuizMut.mutateAsync(sessionId);
      if (res?.score !== undefined) {
        setScore(res.score);
      }
      if (res?.theta_final !== undefined) {
        setThetaAbility(res.theta_final);
      }
      setIsFinished(true);
    } catch (err) {
      console.error(err);
      setIsFinished(true);
    }
  };

  const submitAnswer = async (optionIndex: number) => {
    if (!sessionId || !currentQuestion) return;

    try {
      const res = await submitAnsMut.mutateAsync({
        sessionId,
        response: { question_id: 0, selected_option_index: optionIndex },
      });

      setLastResult({ correct: res.correct, newDiff: res.new_difficulty, theta: res.theta_ability });
      setDifficulty(res.new_difficulty);
      if (res.theta_ability !== undefined) {
        setThetaAbility(res.theta_ability);
      }
      if (res.correct) setScore(s => s + 1);
      const newTotal = totalAnswered + 1;
      setTotalAnswered(newTotal);

      setTimeout(() => {
        fetchNextQuestion(sessionId);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  if (isFinished) {
    return (
      <GlassCard title="Quiz Results" className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <Trophy size={80} className="text-emerald-500 animate-bounce" />
        <div>
          <h2 className="text-4xl font-black text-[var(--fg-color)] mb-2">Adaptive Assessment Complete!</h2>
          <p className="text-[var(--fg-muted)]">Your proficiency model and readiness metrics have been updated.</p>
        </div>
        <div className="text-6xl font-black text-[var(--accent-primary)]">
          {totalAnswered > 0 ? ((score / totalAnswered) * 100).toFixed(1) : score.toFixed(1)}%
        </div>
        <div className="text-xs font-mono text-cyan-500">
          Final Latent Ability (θ): {thetaAbility >= 0 ? `+${thetaAbility.toFixed(2)}` : thetaAbility.toFixed(2)}
        </div>
        <button
          onClick={() => {
            setIsFinished(false);
            setSessionId(null);
            setCurrentQuestion(null);
            setScore(0);
            setTotalAnswered(0);
            setDifficulty(3);
            setThetaAbility(0.0);
            setLastResult(null);
          }}
          className="px-8 py-3 theme-primary-btn font-bold rounded-xl transition-all shadow-lg cursor-pointer"
        >
          Return to Assessment Setup
        </button>
      </GlassCard>
    );
  }

  if (!sessionId) {
    return (
      <div className="space-y-6">
        {/* Top Status Header */}
        <div className="rounded-2xl theme-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-[var(--glass-border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-[var(--accent-primary)] flex items-center justify-center text-slate-950 font-bold shadow-md shadow-[var(--accent-glow)]">
              <Brain size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-[var(--fg-color)]">
                  Adaptive CAT Studio (IRT 2PL Engine)
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                  MLE Active
                </span>
              </div>
              <p className="text-xs text-[var(--fg-muted)]">
                Item Response Theory with 2-Parameter Logistic model calibrating latent ability (θ) in real time.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-muted)] flex items-center gap-1.5">
              <Activity size={13} className="text-emerald-500" />
              <span>θ Scale: [-3.0, +3.0]</span>
            </span>
            <span className="px-3 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-muted)] flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-cyan-400" />
              <span>10 Adaptive Questions</span>
            </span>
          </div>
        </div>

        {/* 2-Column Main Cockpit */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Difficulty Tiers & Start Action (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-2xl theme-card p-5 space-y-4 border border-[var(--glass-border-subtle)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-[var(--accent-primary)]" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                    Select Baseline Difficulty Tier
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                  Engine adapts θ from your answers
                </span>
              </div>

              <div className="space-y-2.5">
                {TIERS.map((tier) => {
                  const isSelected = selectedTier === tier.level;
                  return (
                    <button
                      key={tier.level}
                      onClick={() => setSelectedTier(tier.level)}
                      className={cn(
                        'w-full p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-3',
                        isSelected
                          ? 'border-[var(--accent-primary)] bg-[var(--glass-bg)] shadow-md shadow-[var(--accent-glow)]/10'
                          : 'border-[var(--glass-border-subtle)] hover:border-[var(--glass-border)] bg-transparent'
                      )}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-xs font-bold', isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--fg-color)]')}>
                            {tier.label}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-[var(--pill-bg)] text-[var(--accent-primary)]">
                            {tier.diff}
                          </span>
                          {tier.recommended && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--fg-muted)] truncate">
                          {tier.desc}
                        </p>
                      </div>
                      <div className={cn(
                        'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                        isSelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-slate-950' : 'border-[var(--glass-border-subtle)]'
                      )}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Latent Ability Calibration Meter Card */}
            <div className="rounded-2xl theme-surface p-5 space-y-3 border border-[var(--glass-border-subtle)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain size={15} className="text-cyan-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                    Dynamic Latent Ability (θ) Tracking
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[var(--accent-primary)]">
                  Maximum Fisher Info
                </span>
              </div>
              <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                The assessment uses Maximum Fisher Information item selection to converge on your true proficiency in fewest possible questions. Harder questions carry significantly higher weight toward your CCRS score.
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-[var(--fg-subtle)] border-t border-[var(--glass-border-subtle)]">
                <span>Novice (-3.0)</span>
                <span className="text-[var(--accent-primary)] font-bold">Initial: Tier {selectedTier}</span>
                <span>Principal (+3.0)</span>
              </div>
            </div>

            {/* Begin Button */}
            <div className="rounded-2xl theme-card p-5 space-y-3 border-2 border-[var(--accent-primary)]/40 shadow-xl shadow-[var(--accent-glow)]/15">
              <button
                onClick={startQuiz}
                disabled={startQuizMut.isPending}
                className="w-full theme-primary-btn py-4 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 shadow-lg shadow-[var(--accent-glow)]"
              >
                <Brain size={18} className={startQuizMut.isPending ? 'animate-spin' : ''} />
                <span>
                  {startQuizMut.isPending ? 'Calibrating IRT 2PL Engine…' : 'Begin Adaptive Assessment'}
                </span>
                <ArrowRight size={16} />
              </button>
              <p className="text-center text-[11px] text-[var(--fg-muted)]">
                10 questions • Instant explanation feedback • Verified attestation on completion.
              </p>
            </div>
          </div>

          {/* Right Column: Mathematical Model & Syllabus Domains (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Mathematical Model Card */}
            <div className="rounded-2xl theme-card p-5 space-y-3 border border-[var(--glass-border-subtle)]">
              <div className="flex items-center gap-2">
                <Code size={14} className="text-cyan-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                  Mathematical IRT 2PL Specification
                </h2>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-center font-mono text-xs text-[var(--accent-primary)] font-bold">
                P_i(θ) = 1 / [1 + exp(-a_i * (θ - b_i))]
              </div>
              <div className="space-y-1.5 text-xs text-[var(--fg-muted)]">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[var(--accent-primary)] font-bold shrink-0">a_i:</span>
                  <span><strong>Discrimination parameter</strong> — Slope steepness separating high vs low ability candidates.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[var(--accent-primary)] font-bold shrink-0">b_i:</span>
                  <span><strong>Difficulty parameter</strong> — Inflection point where probability of correct answer is exactly 50%.</span>
                </div>
              </div>
            </div>

            {/* Cognitive Syllabus Domains */}
            <div className="rounded-2xl theme-surface p-5 space-y-3 border border-[var(--glass-border-subtle)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-amber-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                    Tested Technical Domains
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[var(--fg-subtle)]">4 Core Pillars</span>
              </div>

              <div className="space-y-2.5">
                {DOMAINS.map((dom) => (
                  <div key={dom.title} className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--fg-color)]">{dom.title}</span>
                      <span className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                        {dom.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed">
                      {dom.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.question}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="h-full"
            >
              <GlassCard title="Adaptive Question Console" className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest flex items-center gap-1 font-semibold">
                    {currentQuestion.question_type === 'code_challenge' && <Code size={14} />}
                    Target: {currentQuestion.skill_targeted}
                  </span>
                  <span className="text-xs font-mono text-[var(--fg-muted)]">
                    Item #{totalAnswered + 1}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-[var(--fg-color)] mb-4 leading-relaxed">
                  {currentQuestion.question}
                </h2>

                {/* Code Challenge Snippet if present */}
                {currentQuestion.code_snippet && (
                  <div className="mb-6 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] font-mono text-xs text-[var(--accent-primary)] overflow-x-auto">
                    <div className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Code size={12} /> Code Context
                    </div>
                    <pre>{currentQuestion.code_snippet}</pre>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => submitAnswer(i)}
                      disabled={!!lastResult}
                      className={cn(
                        "p-4 text-left rounded-xl border transition-all duration-200 flex items-center justify-between text-sm cursor-pointer",
                        lastResult === null ? "bg-[var(--glass-bg)] border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] text-[var(--fg-color)]" :
                        i === currentQuestion.correct_option_index ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold" :
                        lastResult?.correct === false && i === 0 ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold" : "bg-[var(--glass-bg)] border-[var(--glass-border-subtle)] text-[var(--fg-subtle)]"
                      )}
                    >
                      <span>{opt}</span>
                      {lastResult && i === currentQuestion.correct_option_index && <CheckCircle2 size={18} className="text-emerald-500" />}
                      {lastResult && lastResult.correct === false && i === 0 && <XCircle size={18} className="text-amber-500" />}
                    </button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6">
        <GlassCard title="Proficiency Calibration" className="text-center p-6">
          <div className="text-xs text-[var(--fg-muted)] uppercase tracking-widest mb-1 font-semibold">Latent Ability (θ)</div>
          <div className="text-5xl font-black text-[var(--accent-primary)] mb-2">
            {thetaAbility >= 0 ? `+${thetaAbility.toFixed(2)}` : thetaAbility.toFixed(2)}
          </div>
          <div className="text-xs text-cyan-500 font-mono mb-4 font-semibold">
            Difficulty Tier: {difficulty} / 5
          </div>
          <div className="grid grid-cols-2 gap-2 text-left bg-[var(--glass-bg)] p-3 rounded-lg border border-[var(--glass-border-subtle)] text-[11px] font-mono">
            <div>
              <span className="text-[var(--fg-muted)] block">Item Difficulty (b):</span>
              <span className="text-[var(--fg-color)] font-bold">{currentQuestion?.item_difficulty_b?.toFixed(2) || '0.00'}</span>
            </div>
            <div>
              <span className="text-[var(--fg-muted)] block">Discrimination (a):</span>
              <span className="text-[var(--fg-color)] font-bold">{currentQuestion?.item_discrimination_a?.toFixed(2) || '1.20'}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Session Statistics" className="p-6">
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[var(--fg-muted)]">Items Answered</span>
              <span className="text-[var(--fg-color)] font-bold">{totalAnswered}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--fg-muted)]">Correct Answers</span>
              <span className="text-emerald-500 font-bold">{score} / {totalAnswered || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--fg-muted)]">Raw Accuracy</span>
              <span className="text-cyan-500 font-bold">
                {totalAnswered === 0 ? '0%' : `${((score / totalAnswered) * 100).toFixed(1)}%`}
              </span>
            </div>
            <button
              onClick={finishQuiz}
              className="w-full py-3 mt-4 theme-primary-btn font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              Finish Assessment <ArrowRight size={16} />
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
