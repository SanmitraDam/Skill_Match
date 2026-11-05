'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSpatialStore } from '@/lib/store';
import {
  Bell,
  Clock,
  Flame,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Mic,
  Code2,
  Target,
  ChevronRight
} from 'lucide-react';

interface ReminderItem {
  id: string;
  type: 'MEMORY_DECAY' | 'INTERVIEW_COUNTDOWN' | 'DAILY_STREAK';
  title: string;
  subtitle: string;
  timeDue: string;
  isUrgent: boolean;
  actionTab: 'flashcards' | 'interview' | 'sandbox';
  actionLabel: string;
}

export const ReminderStudio: React.FC = () => {
  const { navigateTo } = useSpatialStore();

  const [reminders, setReminders] = useState<ReminderItem[]>([
    {
      id: 'rem_1',
      type: 'MEMORY_DECAY',
      title: '12 Distributed System Design Cards Due',
      subtitle: 'Ebbinghaus retention dropped below 70% for Redis Invalidation & PagedAttention.',
      timeDue: 'Due in 15 mins (Optimal Window)',
      isUrgent: true,
      actionTab: 'flashcards',
      actionLabel: 'Launch Recall Queue',
    },
    {
      id: 'rem_2',
      type: 'INTERVIEW_COUNTDOWN',
      title: 'Senior MLOps Mock Interview',
      subtitle: 'AI Bar Raiser Session. Pre-interview "Cram & Refresh" deck ready.',
      timeDue: 'Starts in 1 hour 45 mins',
      isUrgent: false,
      actionTab: 'interview',
      actionLabel: 'Pre-Flight Audio Check',
    },
    {
      id: 'rem_3',
      type: 'DAILY_STREAK',
      title: 'Daily Micro-Learning Goal',
      subtitle: '2 more WASM AST complexity audits needed to maintain 15-day streak.',
      timeDue: 'Before midnight',
      isUrgent: false,
      actionTab: 'sandbox',
      actionLabel: 'Open Code Sandbox',
    },
  ]);

  const [streakDays, setStreakDays] = useState(14);
  const [remediatedGapPct, setRemediatedGapPct] = useState(85.4);

  const handleDismiss = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="rounded-2xl theme-card p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)] flex items-center gap-1.5">
                <Bell size={11} /> Smart Reminder Workspace
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
                Active Streak: {streakDays} Days
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--fg-color)] tracking-tight">
              Study Calendar, Memory Decay Alerts &amp; Interview Countdown
            </h1>
            <p className="text-sm text-[var(--fg-muted)] max-w-2xl mt-1 leading-relaxed">
              Automated spaced-repetition schedules, pre-interview cram deck synthesis, and real-time cognitive decay notifications.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigateTo('flashcards')}
              className="theme-primary-btn px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <BookOpen size={14} /> Review Decayed Cards
            </button>
          </div>
        </div>
      </div>

      {/* ── 3 Overview Widgets ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Counter */}
        <div className="rounded-2xl theme-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Learning Streak
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Flame size={16} />
            </span>
          </div>
          <div className="text-3xl font-bold text-[var(--fg-color)] font-mono">
            {streakDays} <span className="text-sm font-normal text-[var(--fg-muted)]">Consecutive Days</span>
          </div>
          <p className="text-xs text-[var(--fg-subtle)]">
            +3 days to unlock 18-Day Continuous Recall Master Badge.
          </p>
        </div>

        {/* Skill Gap Remediated */}
        <div className="rounded-2xl theme-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Skill Gap Remediated
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Target size={16} />
            </span>
          </div>
          <div className="text-3xl font-bold text-emerald-500 font-mono">
            {remediatedGapPct}%
          </div>
          <div className="w-full bg-[var(--glass-border-subtle)] h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${remediatedGapPct}%` }} />
          </div>
          <p className="text-xs text-[var(--fg-subtle)]">
            14 of 16 critical requirements verified in sandbox &amp; quiz.
          </p>
        </div>

        {/* Next Scheduled Assessment */}
        <div className="rounded-2xl theme-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Next Live Assessment
            </span>
            <span className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center">
              <Clock size={16} />
            </span>
          </div>
          <div className="text-lg font-bold text-[var(--fg-color)]">
            Senior MLOps Mock Room
          </div>
          <div className="text-xs text-[var(--accent-primary)] font-mono flex items-center gap-1">
            <Clock size={12} /> Today at 14:00 (in 1h 45m)
          </div>
          <p className="text-xs text-[var(--fg-subtle)]">
            Pre-flight audio &amp; gaze proctoring calibration required.
          </p>
        </div>
      </div>

      {/* ── Active Smart Reminder Queue ── */}
      <div className="rounded-2xl theme-surface p-6 border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-[var(--accent-primary)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--fg-color)]">
              Active Reminder &amp; Study Schedule Queue
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--fg-muted)]">
            {reminders.length} actionable items
          </span>
        </div>

        <div className="space-y-3">
          {reminders.map((rem) => (
            <motion.div
              key={rem.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-xl theme-card flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    rem.isUrgent
                      ? 'bg-red-500/15 text-red-500 border-red-500/30'
                      : 'bg-[var(--pill-bg)] text-[var(--accent-primary)] border-[var(--glass-border-subtle)]'
                  }`}
                >
                  {rem.type === 'MEMORY_DECAY' && <BookOpen size={16} />}
                  {rem.type === 'INTERVIEW_COUNTDOWN' && <Mic size={16} />}
                  {rem.type === 'DAILY_STREAK' && <Flame size={16} />}
                </span>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[var(--fg-color)]">{rem.title}</h4>
                    {rem.isUrgent && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold bg-red-500/20 text-red-500 border border-red-500/30">
                        Urgent Decay
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{rem.subtitle}</p>
                  <div className="text-[10px] font-mono text-[var(--fg-subtle)] pt-1 flex items-center gap-1">
                    <Clock size={10} /> {rem.timeDue}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleDismiss(rem.id)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[var(--fg-subtle)] hover:text-[var(--fg-color)] transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => navigateTo(rem.actionTab)}
                  className="theme-primary-btn px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1"
                >
                  <span>{rem.actionLabel}</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ReminderStudio;
