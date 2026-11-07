'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  TrendingDown,
  Loader2,
  Check
} from 'lucide-react';
import {
  useGenerateFlashcards,
  useReviewFlashcard,
  useCramFlashcards,
  useUploadPDFFlashcards
} from '@/hooks/useFastAPI';
import {
  SAMPLE_TECHNICAL_CHAPTERS,
  PDFSection,
  GeneratedCard,
  parseSectionsFromText
} from '@/lib/flashcards/PDFFlashcardGenerator';
import { MemoryEngine } from '@/lib/memory/MemoryEngine';
import { FlashcardScrollContainer } from '@/components/flashcards/FlashcardScrollContainer';

export function FlashcardStudio() {
  const [viewMode, setViewMode] = useState<'pdf_sectional' | 'sm2_cram'>('pdf_sectional');
  const [pdfSections, setPdfSections] = useState<PDFSection[]>(SAMPLE_TECHNICAL_CHAPTERS);
  const [uploadedDocName, setUploadedDocName] = useState<string>('Distributed_AI_Systems_Blueprint.pdf');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [hesitationTimer, setHesitationTimer] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);
  const [isCramMode, setIsCramMode] = useState<boolean>(false);
  const [reviewFeedback, setReviewFeedback] = useState<any>(null);

  const generateMutation = useGenerateFlashcards();
  const reviewMutation = useReviewFlashcard();
  const uploadMutation = useUploadPDFFlashcards();
  const { data: cramData, refetch: refetchCram } = useCramFlashcards(undefined, 15);

  // Sync initial deck from SAMPLE_TECHNICAL_CHAPTERS
  const [deck, setDeck] = useState<any>(() => {
    const allCards = SAMPLE_TECHNICAL_CHAPTERS.flatMap((s) => s.cards);
    return {
      deck_id: 'deck_initial',
      target_job_title: 'Senior Distributed AI Systems Engineer',
      cards: allCards.map((c) => ({
        card_id: c.card_id,
        topic: c.topic,
        sub_skill: c.sub_skill,
        question: c.question,
        answer: c.answer,
        code_snippet: c.code_snippet,
        difficulty_level: c.difficulty_level,
        ease_factor: 2.5,
        interval_days: Math.max(1, Math.round(c.stability_factor / 24)),
        repetition_count: c.retention_score >= 0.8 ? 1 : 0
      }))
    };
  });

  // Keep deck in sync when pdfSections change
  const syncDeckFromSections = (sections: PDFSection[]) => {
    const allCards = sections.flatMap((s) => s.cards);
    setDeck({
      deck_id: `deck_${Date.now()}`,
      target_job_title: 'Computer Science & Engineering',
      cards: allCards.map((c) => ({
        card_id: c.card_id,
        topic: c.topic,
        sub_skill: c.sub_skill,
        question: c.question,
        answer: c.answer,
        code_snippet: c.code_snippet,
        difficulty_level: c.difficulty_level,
        ease_factor: 2.5,
        interval_days: Math.max(1, Math.round(c.stability_factor / 24)),
        repetition_count: c.retention_score >= 0.8 ? 1 : 0
      }))
    });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Hesitation timer for SM-2 Cram mode
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && !isFlipped && viewMode === 'sm2_cram') {
      interval = setInterval(() => {
        setHesitationTimer((prev) => parseFloat((prev + 0.1).toFixed(1)));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [timerRunning, isFlipped, viewMode]);

  const activeCramCards = useMemo(() => {
    if (!isCramMode) return deck.cards || [];
    return (deck.cards || []).filter((c: any) => c.difficulty_level >= 4 || (c.interval_days || 1) <= 2);
  }, [deck.cards, isCramMode]);

  const currentCramCard = activeCramCards[currentIndex] || activeCramCards[0];

  const handleReview = async (grade: number) => {
    setTimerRunning(false);
    const card = currentCramCard;
    if (!card) return;

    try {
      const { newInterval, newEase } = MemoryEngine.calculateSM2(
        card.interval_days,
        card.ease_factor,
        grade
      );

      // Attempt backend review mutation if available
      try {
        const res = await reviewMutation.mutateAsync({
          card_id: card.card_id,
          quality_rating: grade,
          hesitation_seconds: hesitationTimer,
          current_interval: card.interval_days,
          current_ef: card.ease_factor,
          repetition_count: card.repetition_count || 0
        });
        setReviewFeedback(res);
      } catch (e) {
        // Local calculation fallback
        setReviewFeedback({
          card_id: card.card_id,
          effective_quality_rating: grade,
          new_ease_factor: newEase,
          new_interval_days: newInterval,
          next_review_due: `in ${newInterval} day(s)`
        });
      }

      // Update card in local deck
      setDeck((prev: any) => ({
        ...prev,
        cards: prev.cards.map((c: any) => {
          if (c.card_id === card.card_id) {
            return {
              ...c,
              ease_factor: newEase,
              interval_days: newInterval,
              repetition_count: (c.repetition_count || 0) + 1
            };
          }
          return c;
        })
      }));

      setTimeout(() => {
        setReviewFeedback(null);
        setCurrentIndex((prev) => (prev + 1) % activeCramCards.length);
        setIsFlipped(false);
        setHesitationTimer(0);
        setTimerRunning(true);
      }, 1000);
    } catch (err) {
      console.error(err);
      setCurrentIndex((prev) => (prev + 1) % activeCramCards.length);
      setIsFlipped(false);
      setHesitationTimer(0);
      setTimerRunning(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedDocName(file.name);
    setIsUploading(true);
    setUploadMessage('Ingesting PDF and synthesizing structured chapter flashcards...');

    try {
      // 1. Try backend PDF extraction endpoint with PyMuPDF
      const res = await uploadMutation.mutateAsync(file);
      if (res && res.sections && res.sections.length > 0) {
        setPdfSections(res.sections);
        syncDeckFromSections(res.sections);
        setUploadMessage(`Successfully segmented ${res.sections_count} sections and synthesized ${res.total_cards} flashcards!`);
        setTimeout(() => setUploadMessage(null), 3500);
        setIsUploading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend upload PDF parsing failed or offline, using resilient client synthesis:', err);
    }

    // 2. Client-side fallback: reads text or parses filename/structure
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      const parsed = parseSectionsFromText(text, file.name);
      if (parsed && parsed.length > 0) {
        setPdfSections(parsed);
        syncDeckFromSections(parsed);
        const cardTotal = parsed.reduce((acc, s) => acc + s.cards.length, 0);
        setUploadMessage(`Successfully segmented ${parsed.length} sections and synthesized ${cardTotal} flashcards!`);
        setTimeout(() => setUploadMessage(null), 3500);
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      const parsed = parseSectionsFromText('', file.name);
      setPdfSections(parsed);
      syncDeckFromSections(parsed);
      setIsUploading(false);
    };

    reader.readAsText(file);
  };

  const totalCardsCount = pdfSections.reduce((acc, s) => acc + s.cards.length, 0);
  const decayedCardsCount = pdfSections
    .flatMap((s) => s.cards)
    .filter((c) => MemoryEngine.assessCard(c).is_decayed).length;

  const avgStability = useMemo(() => {
    const all = pdfSections.flatMap((s) => s.cards);
    if (all.length === 0) return 36;
    const sum = all.reduce((acc, c) => acc + (c.stability_factor || 24), 0);
    return Math.round(sum / all.length);
  }, [pdfSections]);

  const curveData = useMemo(() => MemoryEngine.generateCurveData(avgStability), [avgStability]);

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
                  <span className="truncate font-mono text-xs">{uploadedDocName}</span>
                </div>
                <p className="text-xs text-[var(--fg-muted)]">
                  {pdfSections.length} sections segmented • {totalCardsCount} cards synthesized
                </p>
              </div>

              {uploadMessage && (
                <div className="my-2 p-2 rounded-xl bg-[var(--pill-bg)] border border-[var(--accent-primary)]/30 text-[11px] font-mono text-[var(--accent-primary)] flex items-center gap-1.5">
                  <Check size={12} /> {uploadMessage}
                </div>
              )}

              <label className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--accent-primary)]/40 hover:border-[var(--accent-primary)] bg-[var(--pill-bg)] text-xs font-semibold text-[var(--accent-primary)] cursor-pointer transition-colors disabled:opacity-50">
                {isUploading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Synthesizing Cards...
                  </>
                ) : (
                  <>
                    <Upload size={13} /> Upload New Technical PDF
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  disabled={isUploading}
                  onChange={handleFileUpload}
                  className="hidden"
                />
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
              <span className="text-xs font-mono text-[var(--accent-primary)]">
                ({activeCramCards.length} cards in queue)
              </span>
            </div>
            <button
              onClick={() => {
                setIsCramMode(!isCramMode);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                isCramMode
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-[var(--glass-bg)] text-[var(--accent-primary)] border-[var(--glass-border-subtle)]'
              }`}
            >
              <Flame size={12} /> {isCramMode ? 'Exit Cram Mode' : '15-Min Cram & Refresh'}
            </button>
          </div>

          {currentCramCard ? (
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Feedback Alert */}
              <AnimatePresence>
                {reviewFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={13} /> Recall verified! Next review: {reviewFeedback.next_review_due || 'in 1 day'}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer min-h-[300px] rounded-2xl theme-card p-6 md:p-8 flex flex-col justify-between select-none hover:border-[var(--accent-primary)]/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[var(--fg-subtle)] mb-3">
                    <span className="text-[var(--accent-primary)] font-mono">{currentCramCard.sub_skill || currentCramCard.topic}</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock size={11} /> Hesitation: {hesitationTimer.toFixed(1)}s
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-[var(--fg-color)]">
                    {currentCramCard.question}
                  </h3>
                  {isFlipped && (
                    <div className="mt-4 pt-4 border-t border-[var(--glass-border-subtle)] text-sm text-[var(--fg-color)] leading-relaxed whitespace-pre-line">
                      {currentCramCard.answer}
                      {currentCramCard.code_snippet && (
                        <div className="mt-3 p-3 rounded-xl bg-black/70 border border-white/10 text-emerald-300 font-mono text-xs overflow-x-auto">
                          <pre>{currentCramCard.code_snippet}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-[11px] font-mono text-[var(--fg-subtle)] flex items-center justify-between pt-4 border-t border-[var(--glass-border-subtle)]">
                  <span>Card {currentIndex + 1} of {activeCramCards.length}</span>
                  <span className="text-[var(--accent-primary)]">
                    {isFlipped ? 'Click card to see Question' : 'Click card to reveal answer'}
                  </span>
                </div>
              </div>

              {/* SM-2 Rating Buttons when flipped */}
              {isFlipped && (
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => handleReview(1)} className="p-2.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all">
                    Forgot (1)
                  </button>
                  <button onClick={() => handleReview(3)} className="p-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all">
                    Hard (3)
                  </button>
                  <button onClick={() => handleReview(4)} className="p-2.5 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 transition-all">
                    Good (4)
                  </button>
                  <button onClick={() => handleReview(5)} className="p-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                    Easy (5)
                  </button>
                </div>
              )}

              {/* Navigation Bar */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIndex((prev) => (prev - 1 + activeCramCards.length) % activeCramCards.length);
                  }}
                  disabled={activeCramCards.length <= 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)] hover:border-[var(--glass-border)] transition-colors disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--pill-bg)] border border-[var(--glass-border-subtle)] text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-colors"
                >
                  <RotateCw size={13} /> {isFlipped ? 'Show Question' : 'Reveal Answer'}
                </button>

                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIndex((prev) => (prev + 1) % activeCramCards.length);
                  }}
                  disabled={activeCramCards.length <= 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)] hover:border-[var(--glass-border)] transition-colors disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--fg-muted)] rounded-2xl theme-surface border">
              No cards match the active cram filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FlashcardStudio;
