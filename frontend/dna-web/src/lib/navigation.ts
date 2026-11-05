import {
  Layout,
  Activity,
  Mic,
  Brain,
  ShieldAlert,
  ShieldCheck,
  Briefcase,
  TrendingUp,
  BookOpen,
  Code2,
  Gauge,
  LayoutDashboard,
  Rocket,
  Sparkles,
  Users,
  Bell,
  Fingerprint,
  BarChart3,
} from 'lucide-react';
import type { Tab } from './store';

export interface TabItem {
  id: Tab;
  label: string;
  icon: any;
  badge?: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  icon: any;
  color: string;
  accent: string;
  tabs: TabItem[];
}

/**
 * Master Navigation Architecture strictly mapped to suggestion.md (v27.0 Unified Blueprint).
 * Surfaces the 6 defined architectural pillars + Social Feed & Reminders.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Platform',
    icon: Rocket,
    color: 'text-emerald-400',
    accent: '#34d399',
    tabs: [
      {
        id: 'overview',
        label: 'Command Center',
        icon: LayoutDashboard,
        description: 'Unified overview across assessment modules, scores, and active roadmaps.',
      },
      {
        id: 'feed',
        label: 'Social Readiness Hub',
        icon: Users,
        badge: 'NEW',
        description: 'Verified candidate milestones, skill assessments, and hiring views.',
      },
      {
        id: 'candidate_profile',
        label: 'Candidate Identity Hub',
        icon: Fingerprint,
        description: 'Readiness score breakdown, verified skills, and interview recordings.',
      },
      {
        id: 'profile_analytics',
        label: 'Reach Analytics',
        icon: BarChart3,
        badge: 'RAI',
        description: 'Profile views, recruiter engagement, and role alignment metrics.',
      },
    ],
  },
  {
    label: 'DNA Assessment',
    icon: Gauge,
    color: 'text-emerald-400',
    accent: '#34d399',
    tabs: [
      {
        id: 'matcher',
        label: 'Resume & Skill Matcher',
        icon: Layout,
        description: 'Resume parsing, standard skill taxonomy alignment, and semantic matching.',
      },
      {
        id: 'cv_builder',
        label: 'JD-Tailored CV & ATS',
        icon: Briefcase,
        badge: 'ATS Audit',
        description: 'Generate role-tailored CVs with real-time ATS keyword compatibility checks.',
      },
      {
        id: 'gap_intelligence',
        label: 'Skill Gap Intelligence',
        icon: Brain,
        description: 'Identify missing requirements and build actionable upskilling roadmaps.',
      },
      {
        id: 'quiz',
        label: 'Adaptive CAT Studio',
        icon: Activity,
        badge: 'Adaptive',
        description: 'Computerized adaptive testing adjusting question difficulty to performance.',
      },
    ],
  },
  {
    label: 'Interview, Code & Memory',
    icon: Sparkles,
    color: 'text-cyan-400',
    accent: '#22d3ee',
    tabs: [
      {
        id: 'interview',
        label: 'Voice Interview Room',
        icon: Mic,
        badge: 'LIVE',
        description: 'Real-time mock interview studio with noise cancellation and speech analysis.',
      },
      {
        id: 'flashcards',
        label: 'PDF & Study Flashcards',
        icon: BookOpen,
        description: 'Document-driven revision decks with spaced repetition review schedules.',
      },
      {
        id: 'reminders',
        label: 'Study Reminders',
        icon: Bell,
        badge: 'Streak',
        description: 'Decay alerts, interview countdowns, and daily revision tracking.',
      },
      {
        id: 'sandbox',
        label: 'Live Code Sandbox',
        icon: Code2,
        badge: 'Code',
        description: 'In-browser execution sandbox with automated test cases and algorithmic analysis.',
      },
      {
        id: 'forensics',
        label: 'Performance Post-Mortem',
        icon: ShieldCheck,
        badge: 'STAR',
        description: 'STAR behavioral evaluation, technical weak-area analysis, and drill recommendations.',
      },
    ],
  },
  {
    label: 'Trust & Enterprise',
    icon: ShieldCheck,
    color: 'text-purple-400',
    accent: '#a855f7',
    tabs: [
      {
        id: 'proctoring',
        label: 'Assessment Proctoring',
        icon: ShieldAlert,
        badge: 'PTS',
        description: 'Integrity monitoring, ambient focus telemetry, and proctoring trust scores.',
      },
      {
        id: 'enterprise_ats',
        label: 'Enterprise ATS Gateway',
        icon: Briefcase,
        description: 'Applicant tracking integrations, candidate sync, and workforce mobility.',
      },
      {
        id: 'talent_exchange',
        label: 'Talent Mobility Exchange',
        icon: TrendingUp,
        description: 'Offer management and role requirement exchange for hiring teams.',
      },
    ],
  },
];

/** Flat, searchable index of every section in the platform. */
export const NAV_INDEX: (TabItem & { group: string; groupAccent: string })[] = NAV_GROUPS.flatMap(
  (group) =>
    group.tabs.map((tab) => ({
      ...tab,
      group: group.label,
      groupAccent: group.accent,
    }))
);

/** Total number of addressable sections. */
export const TOTAL_SECTIONS = NAV_INDEX.length;

/** Look up a single section by tab id (used by breadcrumbs + palette). */
export function findTabMeta(id: Tab) {
  return NAV_INDEX.find((t) => t.id === id);
}

/** Resolve the parent group for a tab id. */
export function findGroupForTab(id: Tab) {
  return NAV_GROUPS.find((g) => g.tabs.some((t) => t.id === id));
}
