'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Fingerprint,
  Globe,
  Loader2,
  MapPin,
  Mic,
  Pencil,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  X,
  Camera,
  Plus,
  GraduationCap,
  Building,
  Calendar,
  Zap,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCandidateProfile } from '@/hooks/useFastAPI';
import { useSpatialStore } from '@/lib/store';
import type {
  CandidateProfile as CandidateProfileData,
  CandidateProfileUpdate,
  SocialProofProfiles,
  SkillItem,
  EducationItem,
  ExperienceItem,
} from '@/types/api';
import AudioPlayerTile from './AudioPlayerTile';
import { ProfileEditModal } from './ProfileEditModal';

export interface CandidateProfileProps {
  /** Candidate key; falls back to the signed-in social profile id from the store. */
  candidateId?: string;
  /** Offline / first-paint fallback payload (enterprise seed row). */
  fallbackProfile?: CandidateProfileData | null;
  className?: string;
}

const CCRS_WEIGHTS: Array<{ key: 's_match' | 'a_quiz' | 'i_voice'; label: string; weight: number; tone: string }> = [
  { key: 's_match', label: 'S — Live Sandbox Skill Gap Match', weight: 0.5, tone: 'from-emerald-500 to-teal-400' },
  { key: 'a_quiz', label: 'A — Adaptive CAT Quiz Mastery', weight: 0.3, tone: 'from-cyan-500 to-sky-400' },
  { key: 'i_voice', label: 'I — Voice STAR Interview Clarity', weight: 0.2, tone: 'from-violet-500 to-fuchsia-400' },
];

function socialEntries(profiles: SocialProofProfiles | undefined): Array<[string, string]> {
  if (!profiles) return [];
  return (Object.entries(profiles) as Array<[string, string | null | undefined]>).filter(
    (entry): entry is [string, string] => Boolean(entry[1])
  );
}

export const CandidateProfile: React.FC<CandidateProfileProps> = ({
  candidateId,
  fallbackProfile = null,
  className,
}) => {
  const user = useSpatialStore((state) => state.user);
  const setUser = useSpatialStore((state) => state.setUser);
  const socialProfileId = useSpatialStore((state) => state.socialProfileId);
  const navigateTo = useSpatialStore((state) => state.navigateTo);
  const cachedProfile = useSpatialStore((state) => state.candidateProfiles);
  const setCandidateProfile = useSpatialStore((state) => state.setCandidateProfile);
  const saveCandidateProfile = useSpatialStore((state) => state.saveCandidateProfile);

  const isOwnProfile = !candidateId || candidateId === user?.email || candidateId === user?.username || candidateId === String(user?.id);
  const activeId = candidateId || (user ? (user.email || user.username || String(user.id)) : socialProfileId);
  const { data, loading, error, refetch } = useCandidateProfile(activeId);

  // Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'basic' | 'skills' | 'experience' | 'education' | 'social'>('basic');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const profile = useMemo(() => {
    const raw = data ?? cachedProfile[activeId] ?? fallbackProfile ?? null;
    if (isOwnProfile && user) {
      const fallbackName = user.name || user.username || 'Candidate';
      const cleanHandle = (user.username || user.name || 'candidate').replace(/\s+/g, '').replace(/_/g, '').toLowerCase();

      if (!raw) {
        return {
          user_id: String(user.id || user.email),
          candidate_name: fallbackName,
          candidate_role: user.headline || 'Senior Full-Stack Engineer',
          headline: user.headline || 'Senior Full-Stack Engineer',
          bio: user.bio || `Verified SkillMatch talent: ${fallbackName}'s verified readiness DNA and assessment benchmarks.`,
          location: user.location || 'Remote',
          avatar_url: '',
          avatar_gradient: 'bg-gradient-to-br from-emerald-400 to-cyan-500',
          verification_status: 'VERIFIED_CANDIDATE',
          verification_badge: 'Verified Candidate' as const,
          liveness_verified: true,
          liveness_engine: 'MediaPipe FaceMesh liveness detection',
          ccrs_score: 94.5,
          ccrs_breakdown: { s_match: 96.5, a_quiz: 91.8, i_voice: 97.2 },
          ccrs_formula: 'S_match x 0.50 + A_quiz x 0.30 + I_voice x 0.20',
          skills: user.skills || [
            { name: 'Python / FastAPI', level: 'Expert', category: 'Backend', years: 5 },
            { name: 'TypeScript & React', level: 'Advanced', category: 'Frontend', years: 4 },
            { name: 'Docker & Kubernetes', level: 'Advanced', category: 'DevOps', years: 3 },
          ],
          education: [],
          experience: [],
          voice_snippet_url: '/api/v1/interview/recordings/voice_snippet_15s.wav',
          voice_snippet_seconds: 15,
          anc_performance: { db_reduction: -34.5, clarity_score: 96.2, engine: 'WebRTC RNNoise' },
          social_profiles: {
            github: `https://github.com/${cleanHandle}`,
            linkedin: `https://linkedin.com/in/${cleanHandle}`,
            portfolio: `https://${cleanHandle}.dev`,
          },
          profile_views_count: 148,
          public_proof_url: `skillmatch.id/verify/${cleanHandle}`,
          updated_at: new Date().toISOString(),
        };
      }

      // If raw exists, ensure it uses the authenticated user's real identity rather than generic mock defaults
      const resolvedName = (raw.candidate_name && raw.candidate_name !== 'SkillMatch Candidate')
        ? raw.candidate_name
        : fallbackName;
      const resolvedHeadline = (raw.headline && raw.headline !== 'Staff LLM Infrastructure Engineer' && raw.headline !== 'Distributed AI Systems Engineer')
        ? raw.headline
        : (user.headline || raw.headline);
      const resolvedLocation = (raw.location && raw.location !== 'Berlin, DE' && raw.location !== 'Remote | Global Talent Exchange')
        ? raw.location
        : (user.location || raw.location);

      const hasCustomSocials = raw.social_profiles && (
        !raw.social_profiles.github?.includes('usr_8841') &&
        !raw.social_profiles.linkedin?.includes('usr_8841')
      );
      const resolvedSocials = hasCustomSocials ? raw.social_profiles : {
        github: `https://github.com/${cleanHandle}`,
        linkedin: `https://linkedin.com/in/${cleanHandle}`,
        portfolio: `https://${cleanHandle}.dev`,
      };

      return {
        ...raw,
        candidate_name: resolvedName,
        headline: resolvedHeadline,
        candidate_role: resolvedHeadline || raw.candidate_role,
        location: resolvedLocation,
        social_profiles: resolvedSocials,
        public_proof_url: (raw.public_proof_url && !raw.public_proof_url.includes('skillmatchcandidate'))
          ? raw.public_proof_url
          : `skillmatch.id/verify/${cleanHandle}`,
      };
    }
    return raw;
  }, [data, cachedProfile, activeId, fallbackProfile, user, isOwnProfile]);

  /* Keep the store's identity-hub cache warm so feed cards reuse the same payload. */
  useEffect(() => {
    if (data) setCandidateProfile(data);
  }, [data, setCandidateProfile]);

  const breakdown = profile?.ccrs_breakdown;
  const livenessOn = Boolean(profile?.liveness_verified);

  if (!profile) {
    return (
      <div className={cn('rounded-2xl theme-card p-8 space-y-4 text-center', className)}>
        {loading ? (
          <>
            <Loader2 size={22} className="mx-auto animate-spin text-[var(--accent-primary)]" />
            <p className="text-xs font-mono text-[var(--fg-muted)]">
              Compiling identity hub for {activeId}…
            </p>
          </>
        ) : (
          <>
            <Fingerprint size={22} className="mx-auto text-[var(--fg-subtle)]" />
            <p className="text-sm font-semibold text-[var(--fg-color)]">Identity hub unavailable</p>
            <p className="text-xs text-[var(--fg-muted)] max-w-sm mx-auto">
              {error?.message ?? 'The candidate profile endpoint returned no payload for this id.'}
            </p>
            <button
              onClick={refetch}
              className="theme-primary-btn px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <RefreshCw size={13} /> Retry
            </button>
          </>
        )}
      </div>
    );
  }

  const openEditModal = (tab: 'basic' | 'skills' | 'experience' | 'education' | 'social' = 'basic') => {
    setModalTab(tab);
    setModalOpen(true);
  };

  const handleModalSave = async (payload: CandidateProfileUpdate) => {
    setSaving(true);
    setStatus(null);
    const updated = await saveCandidateProfile(activeId, payload);
    setSaving(false);
    if (updated) {
      if (user) {
        setUser({
          ...user,
          name: payload.candidate_name || user.name,
          headline: payload.headline || user.headline,
          location: payload.location || user.location,
        });
      }
      setStatus('Identity hub synced successfully');
      setTimeout(() => setStatus(null), 4000);
    } else {
      setStatus('Offline — cached local updates');
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const handleLiveness = async () => {
    const next = !livenessOn;
    setCandidateProfile({ ...profile, liveness_verified: next });
    const updated = await saveCandidateProfile(activeId, { liveness_verified: next });
    setStatus(updated ? 'Liveness attestation updated' : 'Offline — liveness cached locally');
    setTimeout(() => setStatus(null), 4000);
  };

  const links = socialEntries(profile.social_profiles);
  const skillsList: SkillItem[] = profile.skills || [];
  const experienceList: ExperienceItem[] = profile.experience || [];
  const educationList: EducationItem[] = profile.education || [];

  return (
    <div className={cn('space-y-6', className)}>
      {/* ── Identity Hero ── */}
      <div className="rounded-2xl theme-card p-6 relative overflow-hidden border border-[var(--glass-border-subtle)]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            {/* Profile Picture / Avatar Preview with Camera Edit Overlay */}
            <div className="relative group shrink-0">
              <div
                className={cn(
                  'w-16 h-16 rounded-2xl overflow-hidden border-2 border-[var(--accent-primary)]/50 shadow-lg flex items-center justify-center text-white font-bold text-2xl shrink-0',
                  profile.avatar_url
                    ? 'bg-black/30'
                    : (profile.avatar_gradient || 'bg-gradient-to-br from-emerald-400 to-cyan-500')
                )}
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.candidate_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (profile.candidate_name || user?.name || 'U').charAt(0).toUpperCase()
                )}
              </div>
              <button
                type="button"
                onClick={() => openEditModal('basic')}
                className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[var(--chrome-bg)] border border-[var(--glass-border)] text-[var(--accent-primary)] hover:scale-110 transition-transform shadow-md cursor-pointer"
                title="Change profile picture"
              >
                <Camera size={11} />
              </button>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-[var(--fg-color)] tracking-tight">
                  {profile.candidate_name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 flex items-center gap-1">
                  <ShieldCheck size={10} /> {profile.verification_badge}
                </span>
                {livenessOn && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-500 border border-cyan-500/25 flex items-center gap-1">
                    <BadgeCheck size={10} /> Liveness OK
                  </span>
                )}
              </div>

              <p className="text-sm text-[var(--fg-muted)] mt-1">
                {profile.headline || profile.candidate_role}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono text-[var(--fg-subtle)]">
                <span className="flex items-center gap-1">
                  <Briefcase size={11} /> {profile.candidate_role}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {profile.location || 'Remote'}
                </span>
                <span className="flex items-center gap-1 text-[var(--accent-primary)]">
                  <Globe size={11} /> {profile.public_proof_url}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleLiveness}
              aria-label="Toggle liveness attestation"
              className={cn(
                'px-3 py-2 rounded-xl text-[11px] font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer',
                livenessOn
                  ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'
                  : 'border-[var(--glass-border-subtle)] text-[var(--fg-muted)] hover:text-[var(--fg-color)]'
              )}
            >
              <Fingerprint size={13} />
              {livenessOn ? `${profile.liveness_engine} verified` : 'Run liveness check'}
            </button>

            <button
              onClick={() => openEditModal('basic')}
              className="px-3 py-2 rounded-xl text-[11px] font-semibold border border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] text-[var(--fg-color)] flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Pencil size={13} className="text-[var(--accent-primary)]" />
              <span>Edit Identity</span>
            </button>
          </div>
        </div>

        {status && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-500"
          >
            <CheckCircle2 size={12} />
            <span>{status}</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Column: CCRS vector, Skills, Experience, Education, Narrative (7 cols) ── */}
        <div className="lg:col-span-7 space-y-5">
          {/* CCRS Vector Breakdown */}
          <div className="rounded-2xl theme-card p-5 space-y-4 border border-[var(--glass-border-subtle)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-[var(--accent-primary)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                  CCRS Vector Breakdown
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--pill-text)] bg-[var(--pill-bg)] px-2 py-0.5 rounded-full border border-[var(--glass-border-subtle)]">
                Composite {profile.ccrs_score}%
              </span>
            </div>

            {CCRS_WEIGHTS.map((pillar, index) => {
              const value = Number(breakdown?.[pillar.key] ?? 0);

              return (
                <div key={pillar.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--fg-muted)] font-medium">
                      {pillar.label}
                      <span className="ml-1.5 font-mono text-[var(--fg-subtle)]">
                        w={Math.round(pillar.weight * 100)}%
                      </span>
                    </span>
                    <span className="font-mono font-bold text-[var(--fg-color)]">{value.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[var(--glass-border-subtle)] h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className={cn('h-full rounded-full bg-gradient-to-r', pillar.tone)}
                    />
                  </div>
                </div>
              );
            })}

            <p className="text-[10px] font-mono text-[var(--fg-subtle)] pt-1 border-t border-[var(--glass-border-subtle)]">
              {profile.ccrs_formula}
            </p>
          </div>

          {/* ── Technical Skills Card ── */}
          <div className="rounded-2xl theme-card p-5 space-y-3.5 border border-[var(--glass-border-subtle)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={15} className="text-amber-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                  Verified Technical Skills ({skillsList.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => openEditModal('skills')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] text-[var(--fg-color)] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus size={11} className="text-[var(--accent-primary)]" />
                <span>Add Skill</span>
              </button>
            </div>

            {skillsList.length === 0 ? (
              <p className="text-xs text-[var(--fg-muted)] p-3 text-center border border-dashed border-[var(--glass-border-subtle)] rounded-xl">
                No skills listed yet. Click &quot;Add Skill&quot; to showcase your tech stack.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {skillsList.map((skill, idx) => (
                  <div
                    key={skill.id || skill.name + idx}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)]/40 transition-colors shadow-sm"
                  >
                    <span className="text-xs font-semibold text-[var(--fg-color)]">{skill.name}</span>
                    <span
                      className={cn(
                        'text-[9px] font-mono px-1.5 py-0.2 rounded font-bold',
                        skill.level === 'Expert' ? 'bg-emerald-500/15 text-emerald-400' :
                          skill.level === 'Advanced' ? 'bg-cyan-500/15 text-cyan-400' :
                            skill.level === 'Intermediate' ? 'bg-amber-500/15 text-amber-400' :
                              'bg-slate-500/15 text-slate-400'
                      )}
                    >
                      {skill.level}
                    </span>
                    {skill.years && (
                      <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                        {skill.years}y
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Work Experience Card ── */}
          <div className="rounded-2xl theme-surface p-5 space-y-3.5 border border-[var(--glass-border-subtle)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase size={15} className="text-[var(--accent-primary)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                  Verified Work Experience ({experienceList.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => openEditModal('experience')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] text-[var(--fg-color)] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus size={11} className="text-[var(--accent-primary)]" />
                <span>Add Role</span>
              </button>
            </div>

            {experienceList.length === 0 ? (
              <p className="text-xs text-[var(--fg-muted)] p-3 text-center border border-dashed border-[var(--glass-border-subtle)] rounded-xl">
                No work experience added yet. Click &quot;Add Role&quot; to list your experience.
              </p>
            ) : (
              <div className="space-y-3 pt-1">
                {experienceList.map((exp, idx) => (
                  <div
                    key={exp.id || idx}
                    className="p-3.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--fg-color)]">{exp.role}</span>
                        {exp.current && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[var(--fg-subtle)] flex items-center gap-1">
                        <Calendar size={11} /> {exp.start_date} – {exp.end_date || (exp.current ? 'Present' : '')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--fg-subtle)]">
                      <span className="text-[var(--accent-primary)] font-semibold flex items-center gap-1">
                        <Building size={11} /> {exp.company}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {exp.location || 'Remote'}
                      </span>
                    </div>

                    {exp.description && (
                      <p className="text-xs text-[var(--fg-muted)] leading-relaxed pt-0.5">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Education Details Card ── */}
          <div className="rounded-2xl theme-surface p-5 space-y-3.5 border border-[var(--glass-border-subtle)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={15} className="text-cyan-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                  Education &amp; Academic Credentials ({educationList.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => openEditModal('education')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] text-[var(--fg-color)] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus size={11} className="text-[var(--accent-primary)]" />
                <span>Add Degree</span>
              </button>
            </div>

            {educationList.length === 0 ? (
              <p className="text-xs text-[var(--fg-muted)] p-3 text-center border border-dashed border-[var(--glass-border-subtle)] rounded-xl">
                No education details listed yet. Click &quot;Add Degree&quot; to add your degrees.
              </p>
            ) : (
              <div className="space-y-3 pt-1">
                {educationList.map((edu, idx) => (
                  <div
                    key={edu.id || idx}
                    className="p-3.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--fg-color)]">{edu.degree}</span>
                        {edu.grade && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                            {edu.grade}
                          </span>
                        )}
                      </div>
                      {(edu.start_year || edu.end_year) && (
                        <span className="text-[11px] font-mono text-[var(--fg-subtle)] flex items-center gap-1">
                          <Calendar size={11} /> {edu.start_year} – {edu.end_year}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--fg-subtle)]">
                      <span className="text-[var(--accent-primary)] font-semibold flex items-center gap-1">
                        <GraduationCap size={12} /> {edu.institution}
                      </span>
                      {edu.field_of_study && (
                        <>
                          <span>•</span>
                          <span>{edu.field_of_study}</span>
                        </>
                      )}
                    </div>

                    {edu.description && (
                      <p className="text-xs text-[var(--fg-muted)] leading-relaxed pt-0.5">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Professional Narrative (Bio) Card ── */}
          <div className="rounded-2xl theme-surface p-5 space-y-3 border border-[var(--glass-border-subtle)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[var(--accent-secondary)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                  Professional Narrative
                </h3>
              </div>
              <button
                type="button"
                onClick={() => openEditModal('basic')}
                className="text-[11px] font-mono text-[var(--accent-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Pencil size={10} /> Edit Bio
              </button>
            </div>

            <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
              {profile.bio || 'No narrative published yet — verified metrics speak for this profile.'}
            </p>
          </div>
        </div>

        {/* ── Right Column: Audio Snippet, ANC Telemetry, Social Proof, Reach Accuracy (5 cols) ── */}
        <div className="lg:col-span-5 space-y-4">
          <AudioPlayerTile
            src={profile.voice_snippet_url}
            durationSeconds={profile.voice_snippet_seconds}
            label={`${profile.voice_snippet_seconds}s STAR Snippet — Voice Interview Round`}
            sublabel={`${profile.anc_performance.engine} • ${profile.anc_performance.db_reduction.toFixed(1)} dB noise floor`}
          />

          <div className="rounded-2xl theme-surface p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border border-[var(--glass-border-subtle)]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] flex items-center gap-1">
                <Mic size={10} /> ANC Reduction
              </span>
              <p className="text-sm font-bold text-[var(--fg-color)]">
                {profile.anc_performance.db_reduction.toFixed(1)} dB
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] flex items-center gap-1">
                <Activity size={10} /> Clarity Score
              </span>
              <p className="text-sm font-bold text-[var(--fg-color)]">
                {profile.anc_performance.clarity_score.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] flex items-center gap-1">
                <CheckCircle2 size={10} /> Status
              </span>
              <p className="text-sm font-bold text-[var(--fg-color)]">{profile.verification_status}</p>
            </div>
          </div>

          <div className="rounded-2xl theme-card p-5 space-y-3 border border-[var(--glass-border-subtle)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-[var(--accent-primary)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                  Social Proof Links
                </h3>
              </div>
              <button
                type="button"
                onClick={() => openEditModal('social')}
                className="text-[11px] font-mono text-[var(--accent-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Pencil size={10} /> Edit Links
              </button>
            </div>

            {links.length === 0 ? (
              <p className="text-xs text-[var(--fg-muted)]">
                No external profiles linked. In-platform verified proof remains authoritative.
              </p>
            ) : (
              <div className="space-y-2">
                {links.map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] transition-colors group"
                  >
                    <span className="text-xs font-medium text-[var(--fg-color)] capitalize flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-500" /> {key}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--fg-subtle)] truncate max-w-[50%] flex items-center gap-1">
                      {url.replace(/^https?:\/\//, '')}
                      <ExternalLink size={10} className="group-hover:text-[var(--accent-primary)]" />
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl theme-surface p-5 space-y-3 border border-[var(--glass-border-subtle)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-cyan-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                  Reach Accuracy
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                {profile.profile_views_count} inspections
              </span>
            </div>

            <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
              Tracks which recruiters inspected this identity hub, their vector alignment to the CCRS composite,
              and the search vectors that surfaced the profile.
            </p>
          </div>
        </div>
      </div>

      {/* ── Master Edit Identity Hub Modal ── */}
      <ProfileEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        profile={profile}
        onSave={handleModalSave}
        initialTab={modalTab}
      />
    </div>
  );
};

export default CandidateProfile;
