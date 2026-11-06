'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialStore, Tab } from '@/lib/store';
import {
  Compass,
  ArrowRight,
  Command,
  Flame,
  LayoutDashboard,
  Users,
  BookOpen,
  Bell,
  Code2,
  Mic,
  Activity,
  ChevronDown,
  Fingerprint
} from 'lucide-react';

interface QuickLink {
  tab: Tab;
  label: string;
  hotkey: string;
  icon: any;
}

const QUICK_LINKS: QuickLink[] = [
  { tab: 'overview', label: 'Command Center', hotkey: 'Alt + 1', icon: LayoutDashboard },
  { tab: 'feed', label: 'Social Feed', hotkey: 'Alt + 2', icon: Users },
  { tab: 'candidate_profile', label: 'Identity Hub', hotkey: 'Alt + 3', icon: Fingerprint },
  { tab: 'flashcards', label: 'PDF Flashcards', hotkey: 'Alt + 4', icon: BookOpen },
  { tab: 'reminders', label: 'Study Reminders', hotkey: 'Alt + 5', icon: Bell },
  { tab: 'interview', label: 'Voice AI Room', hotkey: 'Alt + 6', icon: Mic },
  { tab: 'sandbox', label: 'Code Sandbox', hotkey: 'Alt + 7', icon: Code2 },
  { tab: 'quiz', label: 'CAT Quiz', hotkey: 'Alt + 8', icon: Activity },
  { tab: 'cv_builder', label: 'CV & ATS Builder', hotkey: 'Alt + 9', icon: Compass },
];

export const SkipTOCNav: React.FC = () => {
  const { activeTab, navigateTo } = useSpatialStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Keyboard Hotkey Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + T toggles TOC bar
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Alt + 1 through 8
      if (e.altKey && !isNaN(Number(e.key))) {
        const index = Number(e.key) - 1;
        if (index >= 0 && index < QUICK_LINKS.length) {
          e.preventDefault();
          navigateTo(QUICK_LINKS[index].tab);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateTo]);

  return (
    <div className="w-full mb-4">
      {/* ── Compact TOC Bar ── */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono text-[var(--accent-primary)] bg-[var(--pill-bg)] border border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] transition-all shrink-0 cursor-pointer"
            title="Press Alt + T to toggle shortcuts"
          >
            <Compass size={11} />
            <span>Skip-TOC [Alt+T]</span>
            <ChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className="h-3 w-px bg-[var(--glass-border-subtle)] shrink-0" />

          {/* Inline Quick Jump Pills */}
          {QUICK_LINKS.slice(0, 5).map((ql) => {
            const Icon = ql.icon;
            const isActive = activeTab === ql.tab;

            return (
              <button
                key={ql.tab}
                onClick={() => navigateTo(ql.tab)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-gradient)] text-white font-semibold shadow-sm shadow-[var(--accent-glow)]'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)] border border-transparent hover:border-[var(--glass-border-subtle)]'
                }`}
              >
                <Icon size={11} className={isActive ? 'text-white' : 'text-[var(--accent-primary)]'} />
                <span>{ql.label}</span>
                <span className={`text-[9px] font-mono px-1 rounded ${isActive ? 'bg-black/25 text-white font-semibold' : 'text-[var(--fg-muted)] bg-[var(--pill-bg)] border border-[var(--glass-border-subtle)]'}`}>
                  {ql.hotkey.replace('Alt + ', '⌥')}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-[var(--fg-subtle)] shrink-0 pl-2">
          <span>⌥ + [1-8] Fast Jump</span>
        </div>
      </div>

      {/* ── Expanded Full TOC Overlay Dropdown ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-2"
          >
            <div className="p-4 rounded-2xl theme-surface border shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-2">
              {QUICK_LINKS.map((ql) => {
                const Icon = ql.icon;
                const isActive = activeTab === ql.tab;

                return (
                  <button
                    key={ql.tab}
                    onClick={() => {
                      navigateTo(ql.tab);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      isActive
                        ? 'border-[var(--accent-primary)] bg-[var(--pill-bg)] text-[var(--fg-color)]'
                        : 'border-[var(--glass-border-subtle)] bg-[var(--glass-bg)] text-[var(--fg-muted)] hover:border-[var(--glass-border)] hover:text-[var(--fg-color)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon size={14} className={isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--fg-muted)]'} />
                      <span className="truncate">{ql.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--fg-muted)] px-1.5 py-0.5 rounded bg-[var(--pill-bg)] border border-[var(--glass-border-subtle)]">
                      {ql.hotkey}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default SkipTOCNav;
