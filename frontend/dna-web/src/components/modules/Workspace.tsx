'use client';

import React, { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useSpatialStore } from '@/lib/store';
import OverviewDashboard from './OverviewDashboard';
import { ReadinessFeed } from '../social/ReadinessFeed';
import { ResumeMatcher } from './ResumeMatcher';
import { SkillGapIntelligence } from './SkillGapIntelligence';
import { CATQuiz } from './CATQuiz';
import { VoiceInterview } from './VoiceInterview';
import { FlashcardStudio } from './FlashcardStudio';
import { ReminderStudio } from '../workspace/ReminderStudio';
import { CodeSandboxStudio } from './CodeSandboxStudio';
import { ForensicDiagnosticsPortal } from './ForensicDiagnosticsPortal';
import { ProctoringMatrixStudio } from './ProctoringMatrixStudio';
import EnterpriseWorkforceGraph from '../dashboard/EnterpriseWorkforceGraph';
import AutonomousTalentExchange from '../exchange/AutonomousTalentExchange';
import CVBuilder from './CVBuilder';
import HeroSection from '../hero/HeroSection';
import { SkipTOCNav } from '../navigation/SkipTOCNav';

/* ── v27.0 social readiness surfaces are code-split: identity hub + reach analytics ── */
const CandidateProfile = lazy(() => import('../social/CandidateProfile'));
const ProfileAnalytics = lazy(() => import('../social/ProfileAnalytics'));

const LazyModuleFallback: React.FC<{ label: string }> = ({ label }) => (
  <div className="rounded-2xl theme-card p-8 flex items-center justify-center gap-2 text-xs font-mono text-[var(--fg-muted)]">
    <Loader2 size={14} className="animate-spin text-[var(--accent-primary)]" />
    <span>Loading {label}…</span>
  </div>
);

/**
 * SkillMatch DNA v2.1: Unified Master Workspace
 * Integrates PRD v2 Modules:
 * - Module 1: Awwwards/Dribbble Hero Experience & Live Demo Widget (HeroSection.tsx)
 * - Module 2: Live ANC Visualizer & Post-Interview Comparison Studio (VoiceInterview.tsx)
 * - Module 3: Smart Surrender & Auto-Advancement Engine (SurrenderHandler.ts)
 * - Module 4: JD-Tailored CV Builder & ATS Checker (CVBuilder.tsx)
 */
export default function Workspace() {
  const { activeTab } = useSpatialStore();

  return (
    <div className="w-full">
      {/* Universal Skip-TOC Header with Hotkey Shortcuts */}
      <SkipTOCNav />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full"
        >
          {activeTab === 'overview' && <OverviewDashboard />}
          {activeTab === 'hero' && <HeroSection />}
          {activeTab === 'feed' && <ReadinessFeed />}
          {activeTab === 'candidate_profile' && (
            <Suspense fallback={<LazyModuleFallback label="Candidate Identity Hub" />}>
              <CandidateProfile />
            </Suspense>
          )}
          {activeTab === 'profile_analytics' && (
            <Suspense fallback={<LazyModuleFallback label="Reach Accuracy Index" />}>
              <ProfileAnalytics />
            </Suspense>
          )}
          {activeTab === 'matcher' && <ResumeMatcher />}
          {activeTab === 'cv_builder' && <CVBuilder />}
          {activeTab === 'gap_intelligence' && <SkillGapIntelligence />}
          {activeTab === 'quiz' && <CATQuiz />}
          {activeTab === 'interview' && <VoiceInterview />}
          {activeTab === 'flashcards' && <FlashcardStudio />}
          {activeTab === 'reminders' && <ReminderStudio />}
          {activeTab === 'sandbox' && <CodeSandboxStudio />}
          {activeTab === 'forensics' && <ForensicDiagnosticsPortal />}
          {activeTab === 'proctoring' && <ProctoringMatrixStudio />}
          {activeTab === 'enterprise_ats' && <EnterpriseWorkforceGraph />}
          {activeTab === 'talent_exchange' && <AutonomousTalentExchange />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
