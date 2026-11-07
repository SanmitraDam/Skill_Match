'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PDFSection,
  GeneratedCard,
} from '@/lib/flashcards/PDFFlashcardGenerator';
import { MemoryEngine } from '@/lib/memory/MemoryEngine';
import {
  RotateCw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Code2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Activity,
  Flame,
  Shuffle,
  RefreshCw,
  Check
} from 'lucide-react';

interface FlashcardScrollContainerProps {
  sections: PDFSection[];
  onReviewCard?: (cardId: string, grade: number) => void;
}

export const FlashcardScrollContainer: React.FC<FlashcardScrollContainerProps> = ({
  sections,
  onReviewCard,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.section_id || ''
  );
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [cardOrder, setCardOrder] = useState<number[]>([]);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Sync selectedSectionId when sections change
  useEffect(() => {
    if (sections && sections.length > 0) {
      if (!sections.some((s) => s.section_id === selectedSectionId)) {
        setSelectedSectionId(sections[0].section_id);
        setActiveCardIndex(0);
        setIsFlipped(false);
      }
    }
  }, [sections, selectedSectionId]);

  const activeSection =
    sections.find((s) => s.section_id === selectedSectionId) || sections[0];
  const activeCards = activeSection?.cards || [];

  // Reset or initialize card order for current section
  useEffect(() => {
    if (activeCards.length > 0) {
      setCardOrder(activeCards.map((_, i) => i));
      if (activeCardIndex >= activeCards.length) {
        setActiveCardIndex(0);
      }
    } else {
      setCardOrder([]);
    }
  }, [selectedSectionId, activeCards.length]);

  const currentOrderedIndex = cardOrder[activeCardIndex] ?? activeCardIndex;
  const activeCard: GeneratedCard | undefined = activeCards[currentOrderedIndex];
  const retentionStatus = activeCard ? MemoryEngine.assessCard(activeCard) : null;

  const handleNext = useCallback(() => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setActiveCardIndex((prev) => (prev + 1) % activeCards.length);
  }, [activeCards.length]);

  const handlePrev = useCallback(() => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setActiveCardIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
  }, [activeCards.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleGrade = (grade: number) => {
    if (activeCard && onReviewCard) {
      onReviewCard(activeCard.card_id, grade);
    }

    const labels: Record<number, string> = {
      1: 'Marked as Forgot • Interval reset to 1 day',
      2: 'Marked as Hard • Interval reduced',
      3: 'Hesitant • Stability refreshed',
      4: 'Marked as Good • Interval extended 1.8x',
      5: 'Mastered! • Full retention calibrated',
    };
    setFeedbackToast(labels[grade] || 'Review recorded');
    setTimeout(() => setFeedbackToast(null), 2000);

    handleNext();
  };

  const handleShuffle = () => {
    if (activeCards.length <= 1) return;
    const shuffled = activeCards.map((_, i) => i).sort(() => Math.random() - 0.5);
    setCardOrder(shuffled);
    setActiveCardIndex(0);
    setIsFlipped(false);
    setFeedbackToast('Deck shuffled');
    setTimeout(() => setFeedbackToast(null), 1500);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.key === '1') handleGrade(1);
        if (e.key === '2' || e.key === '3') handleGrade(3);
        if (e.key === '4') handleGrade(4);
        if (e.key === '5') handleGrade(5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleFlip, isFlipped]);

  return (
    <div className="space-y-6">
      {/* ── Section selector (Horizontal Pill Rail) ── */}
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-2">
        {sections.map((sec) => {
          const isSelected = sec.section_id === selectedSectionId;
          const decayCount = sec.cards.filter(c => MemoryEngine.assessCard(c).is_decayed).length;

          return (
            <button
              key={sec.section_id}
              onClick={() => {
                setSelectedSectionId(sec.section_id);
                setActiveCardIndex(0);
                setIsFlipped(false);
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-md shadow-[var(--accent-glow)]'
                  : 'bg-[var(--glass-bg)] text-[var(--fg-muted)] border-[var(--glass-border-subtle)] hover:text-[var(--fg-color)] hover:border-[var(--glass-border)]'
              }`}
            >
              <Layers size={13} />
              <span>{sec.title}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono border ${
                isSelected ? 'bg-white/20 text-white border-white/30' : 'bg-[var(--pill-bg)] text-[var(--fg-subtle)] border-[var(--glass-border-subtle)]'
              }`}>
                {sec.cards.length}
              </span>
              {decayCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                  <Flame size={9} /> {decayCount} due
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Main Flashcard Deck View ── */}
      {activeCard ? (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Status & Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between text-xs text-[var(--fg-muted)] px-1 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--fg-color)]">{activeSection?.chapter || 'Chapter'}</span>
              <span>•</span>
              <span className="font-mono text-[var(--accent-primary)] font-medium">
                Card {activeCardIndex + 1} of {activeCards.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffle}
                title="Shuffle cards in this section"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:border-[var(--glass-border)] transition-colors"
              >
                <Shuffle size={11} /> Shuffle
              </button>

              {retentionStatus && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                  retentionStatus.is_decayed
                    ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                }`}>
                  <Clock size={11} />
                  <span>Retention: {retentionStatus.retention_percent}</span>
                  {retentionStatus.is_decayed && (
                    <span className="font-bold uppercase tracking-wider text-[9px] bg-red-500/20 text-red-400 px-1 rounded">
                      DECAY ALERT
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Step Indicators */}
          {activeCards.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 py-1">
              {activeCards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveCardIndex(idx);
                    setIsFlipped(false);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeCardIndex
                      ? 'w-6 bg-[var(--accent-primary)]'
                      : 'w-2 bg-[var(--glass-border)] hover:bg-[var(--fg-muted)]'
                  }`}
                  title={`Jump to Card ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Toast Notification */}
          <AnimatePresence>
            {feedbackToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center flex items-center justify-center gap-2"
              >
                <Check size={13} /> {feedbackToast}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3D Flippable Flashcard Card */}
          <div
            onClick={handleFlip}
            className="cursor-pointer perspective-1000 min-h-[340px] rounded-2xl theme-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group select-none transition-all hover:border-[var(--accent-primary)]/50"
            style={{
              boxShadow: 'var(--card-shadow)',
              borderColor: retentionStatus?.is_decayed ? 'rgba(239, 68, 68, 0.4)' : 'var(--glass-border)',
            }}
          >
            {/* Ambient Background Gradient */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent-glow)] rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)]">
                  {activeCard.sub_skill}
                </span>
                <span className="text-[11px] font-mono text-[var(--fg-subtle)] flex items-center gap-1">
                  <RotateCw size={11} className="group-hover:rotate-180 transition-transform duration-500" />
                  {isFlipped ? 'Click card to see Question' : 'Click card to see Answer'}
                </span>
              </div>

              {/* Question / Answer Text */}
              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  <motion.div
                    key="question"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--accent-primary)] font-semibold flex items-center gap-1.5">
                      <Sparkles size={12} /> Question Prompt
                    </div>
                    <p className="text-lg md:text-xl font-medium text-[var(--fg-color)] leading-relaxed">
                      {activeCard.question}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="answer"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-500 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> Verified Technical Answer
                    </div>
                    <p className="text-sm md:text-base text-[var(--fg-color)] leading-relaxed whitespace-pre-line">
                      {activeCard.answer}
                    </p>

                    {activeCard.code_snippet && (
                      <div className="mt-4 rounded-xl p-3 bg-black/70 border border-white/10 text-emerald-300 font-mono text-xs overflow-x-auto">
                        <div className="flex items-center gap-1 text-[10px] text-white/50 mb-1">
                          <Code2 size={10} /> Implementation Reference
                        </div>
                        <pre className="whitespace-pre">{activeCard.code_snippet}</pre>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Controls inside the card */}
            <div className="pt-4 border-t border-[var(--glass-border-subtle)] flex items-center justify-between text-xs text-[var(--fg-subtle)]">
              <span>Difficulty: Level {activeCard.difficulty_level}/5</span>
              <span className="font-mono text-[10px] text-[var(--fg-muted)]">
                Press Space to flip • ← → arrows to navigate
              </span>
              <span>Stability: {activeCard.stability_factor}h</span>
            </div>
          </div>

          {/* SM-2 Recall Rating Bar (visible when card is flipped) */}
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] backdrop-blur-md space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-medium px-1">
                <span>Rate your active recall mastery:</span>
                <span className="font-mono text-[10px] text-[var(--fg-subtle)]">Keys: 1, 3, 4, 5</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleGrade(1); }}
                  className="p-2.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/25 transition-all text-center flex flex-col items-center gap-0.5"
                >
                  <span>Forgot (1)</span>
                  <span className="text-[9px] font-mono opacity-70">Reset 1d</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleGrade(3); }}
                  className="p-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/25 transition-all text-center flex flex-col items-center gap-0.5"
                >
                  <span>Hard (3)</span>
                  <span className="text-[9px] font-mono opacity-70">Short interval</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleGrade(4); }}
                  className="p-2.5 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/25 transition-all text-center flex flex-col items-center gap-0.5"
                >
                  <span>Good (4)</span>
                  <span className="text-[9px] font-mono opacity-70">Interval +1.8x</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleGrade(5); }}
                  className="p-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/25 transition-all text-center flex flex-col items-center gap-0.5"
                >
                  <span>Easy (5)</span>
                  <span className="text-[9px] font-mono opacity-70">Mastered</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Navigation & Flip Action Bar (ALWAYS visible for complete control) */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={handlePrev}
              disabled={activeCards.length <= 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)] hover:border-[var(--glass-border)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Previous Card
            </button>

            <button
              onClick={handleFlip}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--pill-bg)] border border-[var(--glass-border-subtle)] text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-colors"
            >
              <RotateCw size={13} /> {isFlipped ? 'Show Question' : 'Reveal Answer'}
            </button>

            <button
              onClick={handleNext}
              disabled={activeCards.length <= 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)] hover:border-[var(--glass-border)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next Card <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-[var(--fg-muted)] rounded-2xl theme-surface border">
          No cards generated in this section.
        </div>
      )}
    </div>
  );
};
