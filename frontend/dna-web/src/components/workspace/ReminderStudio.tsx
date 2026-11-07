'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialStore, Tab } from '@/lib/store';
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
  ChevronRight,
  Plus,
  Tag,
  X,
  Check,
  Trash2,
  Filter,
  Search,
  Layers,
  Award
} from 'lucide-react';

export type ReminderCategory = 'MEMORY_DECAY' | 'INTERVIEW_COUNTDOWN' | 'DAILY_STREAK' | 'CUSTOM_TOPIC';

export interface ReminderItem {
  id: string;
  type: ReminderCategory;
  title: string;
  topicLabel: string;
  subtitle: string;
  timeDue: string;
  isUrgent: boolean;
  actionTab: Tab;
  actionLabel: string;
  completed?: boolean;
  createdAt: number;
}

const DEFAULT_REMINDERS: ReminderItem[] = [
  {
    id: 'rem_1',
    type: 'MEMORY_DECAY',
    title: '12 Distributed System Design Cards Due',
    topicLabel: 'Distributed Systems',
    subtitle: 'Ebbinghaus retention dropped below 70% for Redis Invalidation & PagedAttention.',
    timeDue: 'Due in 15 mins (Optimal Window)',
    isUrgent: true,
    actionTab: 'flashcards',
    actionLabel: 'Launch Recall Queue',
    completed: false,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'rem_2',
    type: 'INTERVIEW_COUNTDOWN',
    title: 'Senior MLOps Mock Interview',
    topicLabel: 'MLOps & Inference',
    subtitle: 'AI Bar Raiser Session. Pre-interview "Cram & Refresh" deck ready.',
    timeDue: 'Starts in 1 hour 45 mins',
    isUrgent: false,
    actionTab: 'interview',
    actionLabel: 'Pre-Flight Audio Check',
    completed: false,
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'rem_3',
    type: 'DAILY_STREAK',
    title: 'Daily Micro-Learning Goal',
    topicLabel: 'WebAssembly & AST',
    subtitle: '2 more WASM AST complexity audits needed to maintain 15-day streak.',
    timeDue: 'Before midnight',
    isUrgent: false,
    actionTab: 'sandbox',
    actionLabel: 'Open Code Sandbox',
    completed: false,
    createdAt: Date.now() - 10800000,
  },
];

const PRESET_TOPIC_TAGS = [
  'Distributed Systems',
  'Dynamic Programming',
  'FastAPI & Python',
  'PostgreSQL & Indexing',
  'Kubernetes & Helm',
  'Microservices & gRPC',
  'Redis Caching',
  'System Design',
  'MLOps & vLLM',
  'Next.js & React'
];

const PRESET_SCHEDULES = [
  'In 15 mins (Urgent)',
  'In 1 hour',
  'Tonight at 20:00',
  'Tomorrow at 09:00',
  'In 2 days',
  'Weekly Spaced Interval'
];

const ACTION_MODULES: { tab: Tab; name: string; defaultAction: string }[] = [
  { tab: 'flashcards', name: 'PDF & Study Flashcards', defaultAction: 'Launch Flashcards' },
  { tab: 'interview', name: 'Voice Interview Room', defaultAction: 'Start Voice Interview' },
  { tab: 'sandbox', name: 'Live Code Sandbox', defaultAction: 'Open Code Sandbox' },
  { tab: 'quiz', name: 'Adaptive CAT Assessment', defaultAction: 'Start Adaptive Quiz' },
  { tab: 'gap_intelligence', name: 'Skill Gap Intelligence', defaultAction: 'View Skill Gaps' },
  { tab: 'cv_builder', name: 'JD-Tailored CV Builder', defaultAction: 'Tailor Resume' }
];

const STORAGE_KEY = 'skillmatch_study_reminders_v2';

export const ReminderStudio: React.FC = () => {
  const { navigateTo } = useSpatialStore();

  const [reminders, setReminders] = useState<ReminderItem[]>(DEFAULT_REMINDERS);
  const [streakDays, setStreakDays] = useState(14);
  const [remediatedGapPct, setRemediatedGapPct] = useState(85.4);
  const [filterCategory, setFilterCategory] = useState<'ALL' | ReminderCategory | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for New Custom Reminder
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopicLabel, setNewTopicLabel] = useState('Distributed Systems');
  const [customTagInput, setCustomTagInput] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newType, setNewType] = useState<ReminderCategory>('CUSTOM_TOPIC');
  const [newTimeDue, setNewTimeDue] = useState('Tomorrow at 09:00');
  const [customScheduleInput, setCustomScheduleInput] = useState('');
  const [newIsUrgent, setNewIsUrgent] = useState(false);
  const [newActionTab, setNewActionTab] = useState<Tab>('flashcards');
  const [newActionLabel, setNewActionLabel] = useState('Launch Flashcards');

  // Load reminders from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReminders(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to load reminders from localStorage:', err);
      }
    }
  }, []);

  // Save reminders to localStorage on change
  const saveReminders = (updated: ReminderItem[]) => {
    setReminders(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save reminders to localStorage:', err);
      }
    }
  };

  const handleDismiss = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    saveReminders(updated);
  };

  const handleToggleComplete = (id: string) => {
    const updated = reminders.map((r) => {
      if (r.id === id) {
        const nextCompleted = !r.completed;
        if (nextCompleted && !r.completed) {
          setStreakDays((prev) => prev + 1);
          setRemediatedGapPct((prev) => Math.min(100, Math.round((prev + 1.2) * 10) / 10));
        }
        return { ...r, completed: nextCompleted };
      }
      return r;
    });
    saveReminders(updated);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const finalTopicLabel = customTagInput.trim() || newTopicLabel || 'General Study';
    const finalSchedule = customScheduleInput.trim() || newTimeDue || 'Scheduled Interval';

    const item: ReminderItem = {
      id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: newType,
      title: newTitle.trim(),
      topicLabel: finalTopicLabel,
      subtitle: newSubtitle.trim() || `Focus practice session for ${finalTopicLabel}.`,
      timeDue: finalSchedule,
      isUrgent: newIsUrgent,
      actionTab: newActionTab,
      actionLabel: newActionLabel || 'Review Topic',
      completed: false,
      createdAt: Date.now()
    };

    saveReminders([item, ...reminders]);

    // Reset Form
    setNewTitle('');
    setNewSubtitle('');
    setCustomTagInput('');
    setCustomScheduleInput('');
    setNewIsUrgent(false);
    setIsModalOpen(false);
  };

  // Filtered Reminders
  const filteredReminders = reminders.filter((rem) => {
    // Filter Category
    if (filterCategory === 'COMPLETED' && !rem.completed) return false;
    if (filterCategory !== 'ALL' && filterCategory !== 'COMPLETED' && rem.type !== filterCategory) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rem.title.toLowerCase().includes(q) ||
        rem.topicLabel.toLowerCase().includes(q) ||
        rem.subtitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = reminders.filter((r) => !r.completed).length;
  const urgentCount = reminders.filter((r) => !r.completed && r.isUrgent).length;
  const completedCount = reminders.filter((r) => r.completed).length;

  return (
    <div className="space-y-6">
      {/* ── Header Ribbon ── */}
      <div className="rounded-2xl theme-card p-6 relative overflow-hidden border border-[var(--glass-border-subtle)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)] flex items-center gap-1.5">
                <Bell size={11} className="text-[var(--accent-primary)]" /> Smart Reminder Workspace
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 font-bold flex items-center gap-1">
                <Flame size={11} /> Active Streak: {streakDays} Days
              </span>
              {urgentCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 font-bold flex items-center gap-1">
                  <AlertCircle size={11} /> {urgentCount} Urgent Decay
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-[var(--fg-color)] tracking-tight">
              Study Calendar, Memory Decay Alerts &amp; Interview Countdown
            </h1>
            <p className="text-sm text-[var(--fg-muted)] max-w-2xl mt-1 leading-relaxed">
              Automated spaced-repetition schedules, pre-interview cram deck synthesis, and customized reminders for your target study topics.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setIsModalOpen(true)}
              className="theme-primary-btn px-4 py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg shadow-[var(--accent-glow)]/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus size={15} /> Set New Study Reminder
            </button>
            <button
              onClick={() => navigateTo('flashcards')}
              className="px-3.5 py-2.5 rounded-xl border border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] bg-[var(--glass-bg)] text-[var(--fg-color)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <BookOpen size={14} /> Review Decayed Cards
            </button>
          </div>
        </div>
      </div>

      {/* ── 3 Overview Widgets ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Counter */}
        <div className="rounded-2xl theme-card p-5 space-y-2 border border-[var(--glass-border-subtle)]">
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
        <div className="rounded-2xl theme-card p-5 space-y-2 border border-[var(--glass-border-subtle)]">
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
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${remediatedGapPct}%` }} />
          </div>
          <p className="text-xs text-[var(--fg-subtle)]">
            14 of 16 critical requirements verified in sandbox &amp; quiz.
          </p>
        </div>

        {/* Next Scheduled Assessment */}
        <div className="rounded-2xl theme-card p-5 space-y-2 border border-[var(--glass-border-subtle)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Active Schedule Queue
            </span>
            <span className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Clock size={16} />
            </span>
          </div>
          <div className="text-lg font-bold text-[var(--fg-color)] flex items-center gap-2">
            <span>{activeCount} Active Reminders</span>
          </div>
          <div className="text-xs text-[var(--accent-primary)] font-mono flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" /> {completedCount} topics reviewed &amp; refreshed
          </div>
          <p className="text-xs text-[var(--fg-subtle)]">
            Memory decay prevention intervals dynamically calibrated.
          </p>
        </div>
      </div>

      {/* ── Active Smart Reminder Queue ── */}
      <div className="rounded-2xl theme-surface p-6 border border-[var(--glass-border-subtle)] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Bell size={18} className="text-[var(--accent-primary)]" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--fg-color)]">
                Active Study Reminders &amp; Schedule Queue
              </h2>
              <span className="text-xs text-[var(--fg-muted)]">
                {activeCount} active items &bull; {completedCount} completed
              </span>
            </div>
          </div>

          {/* Quick Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
              <input
                type="text"
                placeholder="Search topics or labels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[var(--accent-primary)] w-48 sm:w-56"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] hover:text-[var(--fg-color)]"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="theme-primary-btn px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Add Reminder
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === 'ALL'
                ? 'bg-[var(--accent-primary)] text-slate-950 font-bold shadow-sm'
                : 'bg-[var(--glass-bg)] text-[var(--fg-muted)] hover:text-[var(--fg-color)] border border-[var(--glass-border-subtle)]'
            }`}
          >
            All ({reminders.length})
          </button>
          <button
            onClick={() => setFilterCategory('CUSTOM_TOPIC')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === 'CUSTOM_TOPIC'
                ? 'bg-[var(--accent-primary)] text-slate-950 font-bold shadow-sm'
                : 'bg-[var(--glass-bg)] text-[var(--fg-muted)] hover:text-[var(--fg-color)] border border-[var(--glass-border-subtle)]'
            }`}
          >
            Custom Topics ({reminders.filter((r) => r.type === 'CUSTOM_TOPIC').length})
          </button>
          <button
            onClick={() => setFilterCategory('MEMORY_DECAY')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === 'MEMORY_DECAY'
                ? 'bg-[var(--accent-primary)] text-slate-950 font-bold shadow-sm'
                : 'bg-[var(--glass-bg)] text-[var(--fg-muted)] hover:text-[var(--fg-color)] border border-[var(--glass-border-subtle)]'
            }`}
          >
            Memory Decay ({reminders.filter((r) => r.type === 'MEMORY_DECAY').length})
          </button>
          <button
            onClick={() => setFilterCategory('INTERVIEW_COUNTDOWN')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === 'INTERVIEW_COUNTDOWN'
                ? 'bg-[var(--accent-primary)] text-slate-950 font-bold shadow-sm'
                : 'bg-[var(--glass-bg)] text-[var(--fg-muted)] hover:text-[var(--fg-color)] border border-[var(--glass-border-subtle)]'
            }`}
          >
            Interview Countdown ({reminders.filter((r) => r.type === 'INTERVIEW_COUNTDOWN').length})
          </button>
          <button
            onClick={() => setFilterCategory('DAILY_STREAK')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === 'DAILY_STREAK'
                ? 'bg-[var(--accent-primary)] text-slate-950 font-bold shadow-sm'
                : 'bg-[var(--glass-bg)] text-[var(--fg-muted)] hover:text-[var(--fg-color)] border border-[var(--glass-border-subtle)]'
            }`}
          >
            Daily Streak ({reminders.filter((r) => r.type === 'DAILY_STREAK').length})
          </button>
          <button
            onClick={() => setFilterCategory('COMPLETED')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === 'COMPLETED'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'bg-[var(--glass-bg)] text-[var(--fg-muted)] hover:text-[var(--fg-color)] border border-[var(--glass-border-subtle)]'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Reminder Card List */}
        <div className="space-y-3">
          {filteredReminders.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-[var(--glass-border-subtle)] p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--glass-bg)] text-[var(--accent-primary)] flex items-center justify-center mx-auto">
                <Bell size={22} />
              </div>
              <h3 className="text-sm font-bold text-[var(--fg-color)]">No study reminders found</h3>
              <p className="text-xs text-[var(--fg-muted)] max-w-sm mx-auto">
                {searchQuery
                  ? `No study topics match "${searchQuery}". Clear your search or create a new topic reminder.`
                  : 'You have no active reminders in this category. Set a new study topic reminder to stay on track!'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('ALL');
                  setIsModalOpen(true);
                }}
                className="theme-primary-btn px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <Plus size={14} /> + Set New Study Reminder
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {filteredReminders.map((rem) => (
                <motion.div
                  key={rem.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-4 rounded-xl theme-card border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    rem.completed
                      ? 'opacity-60 bg-[var(--glass-bg)] border-[var(--glass-border-subtle)]'
                      : rem.isUrgent
                      ? 'border-rose-500/40 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.08)]'
                      : 'border-[var(--glass-border-subtle)] hover:border-[var(--glass-border)]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Completion Checkbox / Type Icon */}
                    <button
                      onClick={() => handleToggleComplete(rem.id)}
                      title={rem.completed ? 'Mark as Incomplete' : 'Mark as Completed'}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                        rem.completed
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                          : rem.isUrgent
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                          : rem.type === 'CUSTOM_TOPIC'
                          ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/25'
                          : 'bg-[var(--pill-bg)] text-[var(--accent-primary)] border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)]'
                      }`}
                    >
                      {rem.completed ? (
                        <Check size={16} strokeWidth={3} />
                      ) : rem.type === 'MEMORY_DECAY' ? (
                        <BookOpen size={16} />
                      ) : rem.type === 'INTERVIEW_COUNTDOWN' ? (
                        <Mic size={16} />
                      ) : rem.type === 'DAILY_STREAK' ? (
                        <Flame size={16} />
                      ) : (
                        <Tag size={16} />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-bold ${
                            rem.completed
                              ? 'line-through text-[var(--fg-muted)]'
                              : 'text-[var(--fg-color)]'
                          }`}
                        >
                          {rem.title}
                        </h4>

                        {/* Customized Topic Label Badge */}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 flex items-center gap-1">
                          <Tag size={9} /> #{rem.topicLabel}
                        </span>

                        {/* Urgent Decay Pill */}
                        {rem.isUrgent && !rem.completed && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                            <AlertCircle size={9} /> Urgent Decay
                          </span>
                        )}

                        {/* Completed Pill */}
                        {rem.completed && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Completed
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                        {rem.subtitle}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--fg-subtle)] pt-0.5">
                        <span className="flex items-center gap-1 text-[var(--accent-primary)]">
                          <Clock size={11} /> {rem.timeDue}
                        </span>
                        <span>&bull;</span>
                        <span className="capitalize text-[var(--fg-muted)]">
                          {rem.type.toLowerCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleToggleComplete(rem.id)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg-color)] bg-[var(--glass-bg)] hover:bg-[var(--pill-bg)] border border-[var(--glass-border-subtle)] transition-colors cursor-pointer"
                    >
                      {rem.completed ? 'Mark Pending' : 'Mark Done'}
                    </button>

                    <button
                      onClick={() => handleDismiss(rem.id)}
                      title="Dismiss / Delete Reminder"
                      className="p-2 rounded-lg text-xs text-[var(--fg-subtle)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>

                    <button
                      onClick={() => navigateTo(rem.actionTab)}
                      className="theme-primary-btn px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[var(--accent-glow)]/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span>{rem.actionLabel}</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Modal Dialog: Create Customized Study Topic Reminder ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl rounded-2xl theme-surface border border-[var(--glass-border)] shadow-2xl p-6 space-y-5 overflow-y-auto max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[var(--glass-border-subtle)] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] flex items-center justify-center">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--fg-color)]">
                      Set New Study Topic Reminder
                    </h3>
                    <p className="text-xs text-[var(--fg-muted)]">
                      Create customized spaced-repetition notifications for your learning roadmap.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateReminder} className="space-y-4 text-xs">
                {/* Topic Title */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--fg-color)] block">
                    Study Goal / Topic Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Raft Consensus Split-Brain Scenarios or FastAPI Connection Pools"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[var(--accent-primary)] text-xs"
                  />
                </div>

                {/* Customized Topic Label / Tag */}
                <div className="space-y-2">
                  <label className="font-semibold text-[var(--fg-color)] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Tag size={12} className="text-cyan-400" /> Customized Topic Label / Tag
                    </span>
                    <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                      Select or type your own
                    </span>
                  </label>

                  {/* Preset Tag Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TOPIC_TAGS.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => {
                          setNewTopicLabel(tag);
                          setCustomTagInput('');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                          newTopicLabel === tag && !customTagInput
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-bold'
                            : 'bg-[var(--glass-bg)] text-[var(--fg-muted)] border border-[var(--glass-border-subtle)] hover:text-[var(--fg-color)]'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>

                  {/* Custom Label Input */}
                  <input
                    type="text"
                    placeholder="Or type a custom label (e.g. Distributed Consensus, PyTorch Kernels)..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[var(--accent-primary)] text-xs font-mono"
                  />
                </div>

                {/* Category Type */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--fg-color)] block">
                    Reminder Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'CUSTOM_TOPIC', label: 'Custom Topic', icon: Tag },
                      { id: 'MEMORY_DECAY', label: 'Memory Decay', icon: BookOpen },
                      { id: 'INTERVIEW_COUNTDOWN', label: 'Interview Prep', icon: Mic },
                      { id: 'DAILY_STREAK', label: 'Daily Streak', icon: Flame },
                    ].map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = newType === cat.id;
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => setNewType(cat.id as ReminderCategory)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            isSelected
                              ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold shadow-sm'
                              : 'border-[var(--glass-border-subtle)] bg-[var(--glass-bg)] text-[var(--fg-muted)] hover:text-[var(--fg-color)]'
                          }`}
                        >
                          <Icon size={14} />
                          <span className="text-[11px]">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Due Time Schedule */}
                <div className="space-y-2">
                  <label className="font-semibold text-[var(--fg-color)] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-amber-400" /> Target Due Schedule
                    </span>
                    <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                      Spaced repetition window
                    </span>
                  </label>

                  {/* Preset Schedule Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_SCHEDULES.map((sched) => (
                      <button
                        type="button"
                        key={sched}
                        onClick={() => {
                          setNewTimeDue(sched);
                          setCustomScheduleInput('');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                          newTimeDue === sched && !customScheduleInput
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400 font-bold'
                            : 'bg-[var(--glass-bg)] text-[var(--fg-muted)] border border-[var(--glass-border-subtle)] hover:text-[var(--fg-color)]'
                        }`}
                      >
                        {sched}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Or type a custom schedule (e.g. Tomorrow at 15:00 or In 4 hours)..."
                    value={customScheduleInput}
                    onChange={(e) => setCustomScheduleInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[var(--accent-primary)] text-xs"
                  />
                </div>

                {/* Target Workspace Action Module */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--fg-color)] block">
                      Target Action Module
                    </label>
                    <select
                      value={newActionTab}
                      onChange={(e) => {
                        const tab = e.target.value as Tab;
                        setNewActionTab(tab);
                        const found = ACTION_MODULES.find((m) => m.tab === tab);
                        if (found) setNewActionLabel(found.defaultAction);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)] text-xs cursor-pointer"
                    >
                      {ACTION_MODULES.map((m) => (
                        <option key={m.tab} value={m.tab} className="bg-slate-900 text-white">
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--fg-color)] block">
                      Action Button Label
                    </label>
                    <input
                      type="text"
                      value={newActionLabel}
                      onChange={(e) => setNewActionLabel(e.target.value)}
                      placeholder="e.g. Review Deck or Launch Sandbox"
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)] text-xs"
                    />
                  </div>
                </div>

                {/* Subtitle / Notes */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--fg-color)] block">
                    Key Focus Notes / Remediated Concepts (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Review leader election timeouts, term numbers, and append entries heartbeats..."
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[var(--accent-primary)] text-xs resize-none"
                  />
                </div>

                {/* Urgent Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} className={newIsUrgent ? 'text-rose-400' : 'text-[var(--fg-muted)]'} />
                    <div>
                      <span className="font-bold text-[var(--fg-color)] block">Urgent Priority / Imminent Decay</span>
                      <span className="text-[10px] text-[var(--fg-muted)]">Flags with high-contrast alert and priority placement in queue</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={newIsUrgent}
                    onChange={(e) => setNewIsUrgent(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-500 accent-rose-500 cursor-pointer"
                  />
                </div>

                {/* Modal Footer CTA */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--glass-border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="theme-primary-btn px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[var(--accent-glow)]/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Plus size={14} /> Add Reminder to Queue
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReminderStudio;
