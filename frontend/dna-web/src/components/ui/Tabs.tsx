"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useSpatialStore, Tab } from '@/lib/store';
import {
  Layout,
  Activity,
  Mic,
  Brain,
  Briefcase,
  BookOpen,
  Code2,
  LayoutDashboard,
  Bell,
  Sparkles,
  Fingerprint,
} from 'lucide-react';

const TAB_CONFIG: Record<Tab, { label: string; icon: any }> = {
  overview: { label: 'Command Center', icon: LayoutDashboard },
  hero: { label: 'Landing Experience', icon: Sparkles },
  candidate_profile: { label: 'Identity Hub', icon: Fingerprint },
  matcher: { label: 'DNA Matcher', icon: Layout },
  cv_builder: { label: 'JD-Tailored CV & ATS', icon: Briefcase },
  gap_intelligence: { label: 'Skill Gap Intelligence', icon: Brain },
  quiz: { label: 'CAT Studio', icon: Activity },
  interview: { label: 'Voice Room', icon: Mic },
  flashcards: { label: 'PDF Flashcards', icon: BookOpen },
  reminders: { label: 'Study Reminders', icon: Bell },
  sandbox: { label: 'Live Sandbox', icon: Code2 },
};

export const Tabs: React.FC = () => {
  const { activeTab, setActiveTab } = useSpatialStore();

  return (
    <div className="flex items-center space-x-1 border-b border-[var(--glass-border-subtle)] overflow-x-auto scrollbar-none py-2 px-3 bg-[var(--glass-bg)] backdrop-blur-md rounded-xl">
      {(Object.keys(TAB_CONFIG) as Tab[]).map((tab) => {
        const { label, icon: Icon } = TAB_CONFIG[tab];
        const isActive = activeTab === tab;

        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              isActive
                ? 'text-[var(--accent-primary)] font-bold'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)]'
            }`}
          >
            <Icon size={14} className={isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--fg-muted)]'} />
            <span>{label}</span>
            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 bg-[var(--pill-bg)] border border-[var(--glass-border-subtle)] rounded-lg -z-10 shadow-xs"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
