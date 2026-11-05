'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  RotateCw,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Code2,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Flame,
  Lightbulb,
  SlidersHorizontal,
  RefreshCw,
  FileText,
  Upload,
  Activity,
  TrendingDown
} from 'lucide-react';
import {
  useGenerateFlashcards,
  useReviewFlashcard,
  useCramFlashcards
} from '@/hooks/useFastAPI';
import {
  SAMPLE_TECHNICAL_CHAPTERS,
  PDFSection,
  parseSectionsFromText
} from '@/lib/flashcards/PDFFlashcardGenerator';
import { MemoryEngine } from '@/lib/memory/MemoryEngine';
import { FlashcardScrollContainer } from '@/components/flashcards/FlashcardScrollContainer';

export function FlashcardStudio() {
  const [viewMode, setViewMode] = useState<'pdf_sectional' | 'sm2_cram'>('pdf_sectional');
  const [pdfSections, setPdfSections] = useState<PDFSection[]>(SAMPLE_TECHNICAL_CHAPTERS);
  const [uploadedDocName, setUploadedDocName] = useState<string>('Distributed_AI_Systems_Blueprint.pdf');
  const [activeTopic, setActiveTopic] = useState<string>('All Topics');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [hesitationTimer, setHesitationTimer] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);
  const [isCramMode, setIsCramMode] = useState<boolean>(false);
  const [reviewFeedback, setReviewFeedback] = useState<any>(null);

  const generateMutation = useGenerateFlashcards();
  const reviewMutation = useReviewFlashcard();
  const { data: cramData, refetch: refetchCram } = useCramFlashcards(undefined, 15);

  const [deck, setDeck] = useState<any>({
    deck_id: 'deck_initial',
    target_job_title: 'Senior Distributed AI Systems Engineer',
    cards: [
      {
        card_id: 'card_demo_001',
        topic: 'System Design & Distributed Architecture',
        sub_skill: 'Distributed Caching (Redis)',
        question: 'Explain write-through vs write-back cache invalidation strategies in horizontally scaled Redis clusters. What happens during split-brain scenarios?',
        answer: '1. Write-Through: Synchronously updates database and cache before returning. Strong consistency, higher write latency.\n2. Write-Back (Write-Behind): Writes to cache first and queues asynchronous background writes to DB. Lower write latency, risk of data loss on crash.\n3. Split-Brain: Prevent via quorum writes (e.g. Raft consensus with min-replicas-to-write) and sentinel failover barriers.',
        code_snippet: 'async def write_through_update(key: str, val: dict):\n    await db.execute("UPDATE items SET data = :v WHERE id = :k", {"v": val, "k": key})\n    await redis.set(f"cache:{key}", json.dumps(val), ex=3600)',
        difficulty_level: 4,
        explanation_diagram_svg: '<svg width="240" height="70" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="35" x="10" y="15" fill="#3b82f6" rx="6"/><text x="25" y="38" fill="#fff" font-size="11">App</text><path d="M 70 32 L 100 32" stroke="#94a3b8" stroke-width="2"/><rect width="60" height="35" x="100" y="15" fill="#10b981" rx="6"/><text x="110" y="38" fill="#fff" font-size="11">Cache</text><path d="M 160 32 L 180 32" stroke="#94a3b8" stroke-width="2"/><rect width="50" height="35" x="180" y="15" fill="#6366f1" rx="6"/><text x="195" y="38" fill="#fff" font-size="11">DB</text></svg>',
        ease_factor: 2.5,
        interval_days: 1
      },
      {
        card_id: 'card_demo_002',
        topic: 'Specialized Stack Tools',
        sub_skill: 'vLLM & PagedAttention',
        question: 'How does vLLM’s PagedAttention algorithm eliminate memory fragmentation during high-concurrency LLM inference batching?',
        answer: '1. Traditional LLMs allocate contiguous memory for KV-cache, causing up to 80% internal/external fragmentation.\n2. PagedAttention borrows virtual memory paging principles from operating systems: allocates fixed-size physical memory blocks on demand.\n3. Enables non-contiguous KV-cache storage and sharing across parallel generation sequences (beam search / speculative decoding).',
        code_snippet: 'from vllm import LLM, SamplingParams\n\nsampling_params = SamplingParams(temperature=0.7, top_p=0.95, max_tokens=256)\nllm = LLM(model="meta-llama/Llama-3-8B-Instruct", gpu_memory_utilization=0.90)',
        difficulty_level: 5,
        ease_factor: 2.4,
        interval_days: 1
      },
      {
        card_id: 'card_demo_003',
        topic: 'Algorithmic Data Structures & Complexity',
        sub_skill: 'Dynamic Programming',
        question: 'How do you space-optimize a 2D dynamic programming grid from O(M * N) space to O(min(M, N))?',
        answer: '1. Observe that DP[i][j] typically only depends on values from the current row DP[i] and immediately preceding row DP[i-1].\n2. Maintain two 1D rolling array buffers (or a single 1D buffer updated in-place from right-to-left).\n3. Space drops from O(M*N) to O(N), yielding major cache locality improvements.',
        code_snippet: 'def min_path_sum(grid):\n    m, n = len(grid), len(grid[0])\n    dp = [float("inf")] * (n + 1)\n    dp[1] = 0\n    for row in grid:\n        for j in range(1, n + 1):\n            dp[j] = min(dp[j], dp[j - 1]) + row[j - 1]\n    return dp[n]',
        difficulty_level: 4,
        ease_factor: 2.5,
        interval_days: 1
      },
      {
        card_id: 'card_demo_004',
        topic: 'Behavioral Leadership & STAR Scenarios',
        sub_skill: 'Crisis Architecture & STAR',
        question: 'A critical production microservice crashed during peak traffic due to an unhandled downstream timeout. Walk through your response using STAR.',
        answer: 'Situation: Payment gateway timed out, causing order queue pileups.\nTask: Restore service under 5 minutes and prevent customer charge duplication.\nAction: Executed circuit breaker fallback, shed non-essential telemetry load, and added exponential backoff jitter.\nResult: Restored uptime in 3.5 minutes; instituted automated chaos drills.',
        difficulty_level: 3,
        ease_factor: 2.5,
        interval_days: 1
      }
    ]
  });

  // Hesitation timer
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && !isFlipped && viewMode === 'sm2_cram') {
      interval = setInterval(() => {
        setHesitationTimer((prev) => parseFloat((prev + 0.1).toFixed(1)));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [timerRunning, isFlipped, viewMode]);

  const handleReview = async (grade: number) => {
    setTimerRunning(false);
    const card = deck.cards[currentIndex];
    if (!card) return;

    try {
      // SM-2 Spaced Repetition Calculation (Client-Side Prediction)
      // Quality Grade: 1 (Forgot) to 5 (Easy)
      const { newInterval, newEase } = MemoryEngine.calculateSM2(
        card.interval_days,
        card.ease_factor,
        grade
      );

      const res = await reviewMutation.mutateAsync({
        card_id: card.card_id,
        quality_rating: grade,
        hesitation_seconds: hesitationTimer,
        current_interval: card.interval_days,
        current_ef: card.ease_factor,
        repetition_count: card.repetition_count || 0
      });

      setReviewFeedback(res);

      setTimeout(() => {
        setReviewFeedback(null);
        setCurrentIndex((prev) => (prev + 1) % deck.cards.length);
        setIsFlipped(false);
        setHesitationTimer(0);
        setTimerRunning(true);
      }, 1200);
    } catch (err) {
      console.error(err);
      setCurrentIndex((prev) => (prev + 1) % deck.cards.length);
      setIsFlipped(false);
      setHesitationTimer(0);
      setTimerRunning(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedDocName(file.name);
    // Simulate multi-page heading parsing
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string || '';
      const parsed = parseSectionsFromText(text, file.name);
      if (parsed && parsed.length > 0) {
        setPdfSections(parsed);
      }
    };
    reader.readAsText(file);
  };

  const curveData = MemoryEngine.generateCurveData(36);
  const totalCardsCount = pdfSections.reduce((acc, s) => acc + s.cards.length, 0);
  const decayedCardsCount = pdfSections.flatMap(s => s.cards).filter(c => MemoryEngine.assessCard(c).is_decayed).length;

  return (
    <div className="space-y-6">
      {/* ── Top Header & Mode Switcher ── */}
      <div className="rounded-2xl theme-card p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)] flex items-center gap-1.5">
                <BookOpen size={11} /> Memory Retention Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[var(--fg-muted)] border border-[var(--glass-border-subtle)]">
                Spaced Repetition
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--fg-color)] tracking-tight">
              Section-Wise PDF Flashcard &amp; Memory Retention Studio
            </h1>
            <p className="text-sm text-[var(--fg-muted)] max-w-2xl mt-1 leading-relaxed">
              Upload technical PDFs to extract chapter sections, or practice with active spaced-repetition memory decay queues.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] shrink-0">
            <button
              onClick={() => setViewMode('pdf_sectional')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'pdf_sectional'
                  ? 'bg-[var(--accent-primary)] text-white shadow-md'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)]'
              }`}
            >
              <FileText size={13} /> PDF Sections &amp; Memory
            </button>
            <button
              onClick={() => setViewMode('sm2_cram')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'sm2_cram'
                  ? 'bg-[var(--accent-primary)] text-white shadow-md'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)]'
              }`}
            >
              <Flame size={13} /> SM-2 Classical &amp; Cram
            </button>
          </div>
        </div>
      </div>

      {/* ── Mode 1: PDF Sectional & Ebbinghaus Retention View ── */}
      {viewMode === 'pdf_sectional' && (
        <div className="space-y-6">
          {/* Top Document Upload & Retention Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Upload Box */}
            <div className="rounded-2xl theme-surface p-5 border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
                    Document Section Ingestion
                  </span>
                  <span className="text-[10px] font-mono text-[var(--fg-subtle)]">PyMuPDF Layout</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--fg-color)] truncate mb-1">
                  <FileText size={16} className="text-[var(--accent-primary)] shrink-0" />
                  <span className="truncate">{uploadedDocName}</span>
                </div>
                <p className="text-xs text-[var(--fg-muted)]">
                  {pdfSections.length} sections segmented • {totalCardsCount} cards synthesized
                </p>
              </div>

              <label className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--accent-primary)]/40 hover:border-[var(--accent-primary)] bg-[var(--pill-bg)] text-xs font-semibold text-[var(--accent-primary)] cursor-pointer transition-colors">
                <Upload size={13} /> Upload New Technical PDF
                <input type="file" accept=".pdf,.txt,.md" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Ebbinghaus Memory Retention Curve Telemetry */}
            <div className="lg:col-span-2 rounded-2xl theme-surface p-5 border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-emerald-500" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                    Ebbinghaus Memory Retention Decay Curve
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Target: &ge; 70%
                </span>
              </div>

              {/* Sparkline curve visualization */}
              <div className="h-20 flex items-end justify-between gap-2 pt-2 px-1 border-b border-[var(--glass-border-subtle)] pb-2">
                {curveData.map((pt, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex items-end justify-center gap-0.5 h-14">
                      {/* Theoretical fragile baseline */}
                      <div
                        style={{ height: `${pt.retention_baseline}%` }}
                        className="w-1/2 bg-red-500/25 rounded-t-sm group-hover:bg-red-500/40 transition-all"
                        title={`Day ${pt.day} Unreviewed: ${pt.retention_baseline}%`}
                      />
                      {/* Calibrated retention */}
                      <div
                        style={{ height: `${pt.retention_calibrated}%` }}
                        className="w-1/2 bg-[var(--accent-primary)] rounded-t-sm group-hover:brightness-125 transition-all"
                        title={`Day ${pt.day} Calibrated: ${pt.retention_calibrated}%`}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-[var(--fg-subtle)]">{pt.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 text-[11px] text-[var(--fg-muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                  Calibrated Active Retrieval
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500/40" />
                  Passive Unreviewed Memory Decay
                </span>
                <span className="text-amber-500 font-mono">
                  {decayedCardsCount} cards due for injection
                </span>
              </div>
            </div>
          </div>

          {/* Scrollable Flashcard Container */}
          <FlashcardScrollContainer
            sections={pdfSections}
            onReviewCard={(cardId, grade) => {
              setPdfSections((prev) =>
                prev.map((sec) => ({
                  ...sec,
                  cards: sec.cards.map((c) => {
                    if (c.card_id === cardId) {
                      const { newStability } = MemoryEngine.recordReview(c.stability_factor, grade);
                      return {
                        ...c,
                        stability_factor: newStability,
                        last_reviewed_timestamp: Date.now(),
                        retention_score: 1.0,
                      };
                    }
                    return c;
                  }),
                }))
              );
            }}
          />
        </div>
      )}

      {/* ── Mode 2: SM-2 Classical Leitner & Cram View ── */}
      {viewMode === 'sm2_cram' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--fg-color)]">SM-2 Spaced Repetition Queue</span>
              <span className="text-xs text-[var(--fg-muted)]">• Hesitation Timer Active</span>
            </div>
            <button
              onClick={() => setIsCramMode(!isCramMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                isCramMode
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-[var(--glass-bg)] text-[var(--accent-primary)] border-[var(--glass-border-subtle)]'
              }`}
            >
              <Flame size={12} /> {isCramMode ? 'Exit Cram Mode' : '15-Min Cram & Refresh'}
            </button>
          </div>

          {deck.cards[currentIndex] && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer min-h-[280px] rounded-2xl theme-card p-6 md:p-8 flex flex-col justify-between select-none"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[var(--fg-subtle)] mb-3">
                    <span className="text-[var(--accent-primary)] font-mono">{deck.cards[currentIndex].sub_skill}</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock size={11} /> Hesitation: {hesitationTimer.toFixed(1)}s
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-[var(--fg-color)]">
                    {deck.cards[currentIndex].question}
                  </h3>
                  {isFlipped && (
                    <div className="mt-4 pt-4 border-t border-[var(--glass-border-subtle)] text-sm text-[var(--fg-color)] leading-relaxed whitespace-pre-line">
                      {deck.cards[currentIndex].answer}
                    </div>
                  )}
                </div>

                <div className="text-[11px] font-mono text-[var(--fg-subtle)] flex items-center justify-between">
                  <span>Card {currentIndex + 1} of {deck.cards.length}</span>
                  <span className="text-[var(--accent-primary)]">Click card to reveal answer</span>
                </div>
              </div>

              {isFlipped && (
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => handleReview(1)} className="p-2.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20">
                    Forgot (1)
                  </button>
                  <button onClick={() => handleReview(3)} className="p-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20">
                    Hard (3)
                  </button>
                  <button onClick={() => handleReview(4)} className="p-2.5 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20">
                    Good (4)
                  </button>
                  <button onClick={() => handleReview(5)} className="p-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20">
                    Easy (5)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default FlashcardStudio;
