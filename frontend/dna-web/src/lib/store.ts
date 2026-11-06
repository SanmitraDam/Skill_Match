import { create } from 'zustand';
import type {
  CandidateProfile,
  CandidateProfileUpdate,
  ProfileAnalytics,
  ProfileViewCreate,
  ProfileViewRecord,
  ReadinessFeedPost,
  ReadinessPostCreate,
} from '@/types/api';
import { API_BASE } from './api-config';
const SOCIAL_API = `${API_BASE}/api/v1/readiness`;

/**
 * Thin fetch wrapper for the v27.0 social readiness endpoints. Store mutations never
 * throw: they resolve to `null` so the UI can keep rendering cached / seed state offline.
 */
async function socialRequest<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${SOCIAL_API}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type Tab =
  | 'overview'
  | 'hero'
  | 'feed'
  | 'candidate_profile'
  | 'profile_analytics'
  | 'matcher'
  | 'cv_builder'
  | 'gap_intelligence'
  | 'quiz'
  | 'interview'
  | 'flashcards'
  | 'reminders'
  | 'sandbox';


export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'candidate' | 'recruiter' | 'hiring_manager' | 'compliance_officer' | 'admin' | string;
  tenant_id?: string;
  avatar?: string;
  username?: string;
  headline?: string;
  location?: string;
  bio?: string;
  skills?: any[];
  profile_completed?: boolean;
}

/** ── v27.0: Professional social readiness network slice (suggestion-v26.md Section 1) ── */
export interface SocialState {
  /** Canonical candidate key used by every v27.0 social network endpoint. */
  socialProfileId: string;
  /** Latest verified milestone feed (GET /social/feed). */
  feedPosts: ReadinessFeedPost[];
  /** Identity hub payloads keyed by candidate id. */
  candidateProfiles: Record<string, CandidateProfile>;
  /** Recruiter inspection logs keyed by candidate id. */
  profileViews: Record<string, ProfileViewRecord[]>;
  /** Reach accuracy analytics keyed by candidate id. */
  analyticsCache: Record<string, ProfileAnalytics>;

  setSocialProfileId: (id: string) => void;
  setFeedPosts: (posts: ReadinessFeedPost[]) => void;
  upsertFeedPost: (post: ReadinessFeedPost) => void;
  setCandidateProfile: (profile: CandidateProfile) => void;
  setProfileViews: (candidateId: string, views: ProfileViewRecord[]) => void;
  setProfileAnalytics: (candidateId: string, analytics: ProfileAnalytics) => void;
  /** POST /readiness/social/posts — publishes a milestone and prepends it to the cached feed. */
  publishMilestone: (payload: ReadinessPostCreate) => Promise<ReadinessFeedPost | null>;
  /** POST /readiness/profiles/{id}/view — logs an enterprise inspection event. */
  recordProfileView: (candidateId: string, payload: ProfileViewCreate) => Promise<ProfileViewRecord | null>;
  /** PUT /readiness/profiles/{id} — upserts the editable identity hub fields. */
  saveCandidateProfile: (candidateId: string, payload: CandidateProfileUpdate) => Promise<CandidateProfile | null>;
}

interface SpatialState extends SocialState {
  activeTab: Tab;
  isBackendOnline: boolean;
  globalIntensity: number;
  dnaRotationSpeed: number;
  hasSeenIntro: boolean;
  performanceMode: 'high' | 'low';
  user: UserProfile | null;
  isAuthenticated: boolean;
  theme: 'dark' | 'light';
  activeTenantId: string;
  dspNoiseSuppressionActive: boolean;
  webxrMode: 'desktop' | 'room_canvas' | 'visionos_spatial';
  spatialBinauralAudio: boolean;
  /* ── Shell / navigation UI state (responsive chrome) ── */
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  commandPaletteOpen: boolean;

  setActiveTab: (tab: Tab) => void;
  setBackendOnline: (status: boolean) => void;
  setGlobalIntensity: (val: number) => void;
  setDnaRotationSpeed: (val: number) => void;
  setHasSeenIntro: (val: boolean) => void;
  setPerformanceMode: (mode: 'high' | 'low') => void;
  setUser: (user: UserProfile | null) => void;
  setAuthenticated: (status: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setActiveTenantId: (tenant: string) => void;
  toggleDspNoiseSuppression: () => void;
  setWebxrMode: (mode: 'desktop' | 'room_canvas' | 'visionos_spatial') => void;
  toggleSpatialBinauralAudio: () => void;
  setSidebarCollapsed: (val: boolean) => void;
  toggleSidebar: () => void;
  setMobileNavOpen: (val: boolean) => void;
  setCommandPaletteOpen: (val: boolean) => void;
  toggleCommandPalette: () => void;
  /** Navigate to a section and close any transient navigation overlays. */
  navigateTo: (tab: Tab) => void;
}

const getInitialUser = (): UserProfile | null => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('skillmatch_user');
      if (saved) return JSON.parse(saved);
    } catch {}
  }
  return null;
};

const initialUser = getInitialUser();

export const useSpatialStore = create<SpatialState>((set, get) => ({
  activeTab: 'hero',
  isBackendOnline: false,
  globalIntensity: 1.0,
  dnaRotationSpeed: 0.5,
  hasSeenIntro: false,
  performanceMode: 'high',
  user: initialUser,
  isAuthenticated: Boolean(initialUser),
  theme: 'dark',
  activeTenantId: 'tenant_default',
  dspNoiseSuppressionActive: true,
  webxrMode: 'desktop',
  spatialBinauralAudio: true,
  sidebarCollapsed: false,
  mobileNavOpen: false,
  commandPaletteOpen: false,

  /* ── v27.0 social readiness network defaults ── */
  socialProfileId: initialUser ? (initialUser.email || initialUser.username || String(initialUser.id)) : 'usr_8841',
  feedPosts: [],
  candidateProfiles: {},
  profileViews: {},
  analyticsCache: {},

  setActiveTab: (tab) => set({ activeTab: tab }),
  setBackendOnline: (status) => set({ isBackendOnline: status }),
  setGlobalIntensity: (val) => set({ globalIntensity: val }),
  setDnaRotationSpeed: (val) => set({ dnaRotationSpeed: val }),
  setHasSeenIntro: (val) => set({ hasSeenIntro: val }),
  setPerformanceMode: (mode) => set({ performanceMode: mode }),
  setUser: (user) => {
    if (user) {
      const activeId = user.email || user.username || String(user.id);
      set({ user, isAuthenticated: true, socialProfileId: activeId });
      try {
        localStorage.setItem('skillmatch_user', JSON.stringify(user));
      } catch (e) {}
    } else {
      set({ user: null, isAuthenticated: false, socialProfileId: 'usr_8841' });
      try {
        localStorage.removeItem('skillmatch_user');
      } catch (e) {}
    }
  },
  setAuthenticated: (status) => set({ isAuthenticated: status }),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setActiveTenantId: (activeTenantId) => set({ activeTenantId }),
  toggleDspNoiseSuppression: () => set((state) => ({ dspNoiseSuppressionActive: !state.dspNoiseSuppressionActive })),
  setWebxrMode: (mode) => set({ webxrMode: mode }),
  toggleSpatialBinauralAudio: () => set((state) => ({ spatialBinauralAudio: !state.spatialBinauralAudio })),
  setSidebarCollapsed: (val) => set({ sidebarCollapsed: val }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileNavOpen: (val) => set({ mobileNavOpen: val }),
  setCommandPaletteOpen: (val) => set({ commandPaletteOpen: val }),
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  /* ── v27.0 social readiness network actions ── */
  setSocialProfileId: (socialProfileId) => set({ socialProfileId }),
  setFeedPosts: (feedPosts) => set({ feedPosts }),
  upsertFeedPost: (post) =>
    set((state) => ({
      feedPosts: [
        post,
        ...state.feedPosts.filter((existing) => String(existing.id) !== String(post.id)),
      ].slice(0, 50),
    })),
  setCandidateProfile: (profile) =>
    set((state) => ({
      candidateProfiles: { ...state.candidateProfiles, [profile.user_id]: profile },
    })),
  setProfileViews: (candidateId, views) =>
    set((state) => ({ profileViews: { ...state.profileViews, [candidateId]: views } })),
  setProfileAnalytics: (candidateId, analytics) =>
    set((state) => ({ analyticsCache: { ...state.analyticsCache, [candidateId]: analytics } })),

  publishMilestone: async (payload) => {
    const post = await socialRequest<ReadinessFeedPost>('/social/posts', {
      method: 'POST',
      body: JSON.stringify({ user_id: get().socialProfileId, ...payload }),
    });
    if (post) get().upsertFeedPost(post);
    return post;
  },

  recordProfileView: async (candidateId, payload) => {
    const record = await socialRequest<ProfileViewRecord>(
      `/profiles/${encodeURIComponent(candidateId)}/view`,
      { method: 'POST', body: JSON.stringify(payload) },
    );
    if (record) {
      const existing = get().profileViews[candidateId] ?? [];
      get().setProfileViews(
        candidateId,
        [record, ...existing.filter((view) => view.id !== record.id)],
      );
      const cached = get().candidateProfiles[candidateId];
      if (cached) {
        get().setCandidateProfile({
          ...cached,
          profile_views_count: record.profile_views_count ?? cached.profile_views_count + 1,
        });
      }
    }
    return record;
  },

  saveCandidateProfile: async (candidateId, payload) => {
    const cached = get().candidateProfiles[candidateId];
    if (cached) {
      // Optimistic local update
      const merged: CandidateProfile = {
        ...cached,
        ...payload,
        candidate_name: payload.candidate_name ?? cached.candidate_name,
        avatar_url: payload.avatar_url ?? cached.avatar_url,
        headline: payload.headline ?? cached.headline,
        bio: payload.bio ?? cached.bio,
        location: payload.location ?? cached.location,
        skills: payload.skills ?? cached.skills,
        education: payload.education ?? cached.education,
        experience: payload.experience ?? cached.experience,
      };
      get().setCandidateProfile(merged);
    }
    const profile = await socialRequest<CandidateProfile>(
      `/profiles/${encodeURIComponent(candidateId)}`,
      { method: 'PUT', body: JSON.stringify(payload) },
    );
    if (profile) {
      get().setCandidateProfile(profile);
      return profile;
    }
    return cached ? ({ ...cached, ...payload } as CandidateProfile) : null;
  },

  navigateTo: (tab) =>
    set({ activeTab: tab, commandPaletteOpen: false, mobileNavOpen: false }),
}));
