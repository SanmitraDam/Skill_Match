'use client';

import React, { useState } from 'react';
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
  Flame
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

  const activeSection =
    sections.find((s) => s.section_id === selectedSectionId) || sections[0];
  const activeCards = activeSection?.cards || [];
  const activeCard: GeneratedCard | undefined = activeCards[activeCardIndex];
  const retentionStatus = activeCard ? MemoryEngine.assessCard(activeCard) : null;

  const handleNext = () => {
    setIsFlipped(false);
    setActiveCardIndex((prev) => (prev + 1) % activeCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setActiveCardIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
  };

  const handleGrade = (grade: number) => {
    if (activeCard && onReviewCard) {
      onReviewCard(activeCard.card_id, grade);
    }
    handleNext();
  };

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
              {decayCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-red-500/20 text-red-500 border border-red-500/30 flex items-center gap-1">
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
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] px-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--fg-color)]">{activeSection.chapter}</span>
              <span>•</span>
              <span>Card {activeCardIndex + 1} of {activeCards.length}</span>
            </div>

            {retentionStatus && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                retentionStatus.is_decayed
                  ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
              }`}>
                <Clock size={11} />
                <span>Retention: {retentionStatus.retention_percent}</span>
                {retentionStatus.is_decayed && (
                  <span className="font-bold uppercase tracking-wider text-[9px]">DECAY ALERT</span>
                )}
              </div>
            )}
          </div>

          {/* 3D Flippable Flashcard Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer perspective-1000 min-h-[320px] rounded-2xl theme-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group select-none"
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
                  <RotateCw size={11} className="group-hover:rotate-180 transition-transform duration-500" /> Click to flip
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
                    <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--accent-primary)] font-semibold">
                      Question Prompt
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
                      <CheckCircle2 size={13} /> Verified Architecture Answer
                    </div>
                    <p className="text-sm md:text-base text-[var(--fg-color)] leading-relaxed whitespace-pre-line">
                      {activeCard.answer}
                    </p>

                    {activeCard.code_snippet && (
                      <div className="mt-4 rounded-xl p-3 bg-black/70 border border-white/10 text-emerald-300 font-mono text-xs overflow-x-auto">
                        <div className="flex items-center gap-1 text-[10px] text-white/40 mb-1">
                          <Code2 size={10} /> Implementation Reference
                        </div>
                        <pre>{activeCard.code_snippet}</pre>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Controls inside the card */}
            <div className="pt-4 border-t border-[var(--glass-border-subtle)] flex items-center justify-between text-xs text-[var(--fg-subtle)]">
              <span>Difficulty: Level {activeCard.difficulty_level}/5</span>
              <span>Stability: {activeCard.stability_factor}h</span>
            </div>
          </div>

          {/* Grade / Response Bar when flipped */}
          {isFlipped ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] backdrop-blur-md"
            >
              <span className="text-xs text-[var(--fg-muted)] font-medium">Rate Recall:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleGrade(1); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                  Forgot (1)
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleGrade(3); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                >
                  Hesitant (3)
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleGrade(5); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                >
                  Mastered (5)
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)] hover:border-[var(--glass-border)] transition-colors"
              >
                <ChevronLeft size={14} /> Previous Card
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)] hover:border-[var(--glass-border)] transition-colors"
              >
                Next Card <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-[var(--fg-muted)]">
          No cards generated in this section.
        </div>
      )}
    </div>
  );
};
