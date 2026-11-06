'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSpatialStore } from '@/lib/store';
import { useProfileVerification, useProfileViews, usePublishPost, useSocialFeed } from '@/hooks/useFastAPI';
import type { ProfileViewRecord, ReadinessFeedPost } from '@/types/api';
import {
  ShieldCheck,
  TrendingUp,
  Award,
  Eye,
  CheckCircle2,
  Code2,
  Cpu,
  Share2,
  Flame,
  ArrowUpRight,
  Building2,
  Sparkles,
  Search,
  Users,
  Target,
  BarChart3,
  Lock,
  BadgeCheck,
  Fingerprint,
  Loader2,
  Send
} from 'lucide-react';

interface RecruiterView {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarBg: string;
  matchedSkills: string[];
  vectorAlignmentPct: number;
  timeAgo: string;
}

interface FeedPost {
  id: string;
  candidateName: string;
  candidateRole: string;
  avatarBg: string;
  ccrsScore: number;
  badge: string;
  achievementTitle: string;
  details: string;
  benchmarkMetric: string;
  codeSnippet?: string;
  verificationsCount: number;
  timeAgo: string;
  verificationBadge?: string;
  skillTags?: string[];
  proofHash?: string | null;
  createdAt?: string;
}

/** Live relative-time label that re-renders every minute (ISO createdAt preferred). */
const TimeAgo: React.FC<{ iso?: string; fallback: string }> = ({ iso, fallback }) => {
  const [label, setLabel] = useState<string>(fallback);

  useEffect(() => {
    const compute = () => {
      if (!iso) {
        setLabel(fallback);
        return;
      }

      /* Backend `createdAt` values are naive UTC ISO strings — normalise before diffing. */
      const isZoned = iso.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(iso);
      const deltaMs = Date.now() - new Date(isZoned ? iso : `${iso}Z`).getTime();
      if (Number.isNaN(deltaMs)) {
        setLabel(fallback);
        return;
      }

      const minutes = Math.max(0, Math.round(deltaMs / 60000));
      if (minutes < 1) setLabel('just now');
      else if (minutes < 60) setLabel(`${minutes}m ago`);
      else if (minutes < 1440) setLabel(`${Math.round(minutes / 60)}h ago`);
      else setLabel(`${Math.round(minutes / 1440)}d ago`);
    };

    compute();
    const timer = setInterval(compute, 60000);
    return () => clearInterval(timer);
  }, [iso, fallback]);

  return <>{label}</>;
};

/** Maps the v27.0 API contract onto the feed card view model. */
function mapFeedPost(post: ReadinessFeedPost): FeedPost {
  return {
    id: post.id,
    candidateName: post.candidateName,
    candidateRole: post.candidateRole,
    avatarBg: post.avatarGradient || 'from-emerald-400 to-cyan-500',
    ccrsScore: post.ccrsScore,
    badge: post.verificationBadge,
    verificationBadge: post.verificationBadge,
    achievementTitle: post.title,
    details: post.details ?? 'Verified readiness milestone published by the SkillMatch engine.',
    benchmarkMetric:
      post.benchmarkMetric ??
      `CCRS ${post.ccrsScore}% • ${post.postType} • proof ${post.proofHash ?? 'pending'}`,
    codeSnippet: post.codeSnippet ?? undefined,
    skillTags: post.skillTags,
    proofHash: post.proofHash ?? null,
    createdAt: post.createdAt,
    verificationsCount: post.peerVerificationsCount,
    timeAgo: post.timeAgo,
  };
}

function mapRecruiterView(view: ProfileViewRecord): RecruiterView {
  return {
    id: view.id,
    name: view.viewerName,
    role: view.viewerRole,
    company: view.viewerCompany,
    avatarBg: view.avatarGradient || 'from-emerald-400 to-cyan-500',
    matchedSkills: view.matchedSkills,
    vectorAlignmentPct: view.vectorAlignmentPct,
    timeAgo: view.timeAgo,
  };
}

export const ReadinessFeed: React.FC = () => {
  const { user, navigateTo } = useSpatialStore();
  const socialProfileId = useSpatialStore((state) => state.socialProfileId);
  const identityProfile = useSpatialStore((state) => state.candidateProfiles[state.socialProfileId]);
  const upsertFeedPost = useSpatialStore((state) => state.upsertFeedPost);
  const displayName = user?.name || 'Dev Candidate';

  const { data: liveFeed, loading: feedLoading, error: feedError } = useSocialFeed(12);
  const { data: liveViews } = useProfileViews(socialProfileId, 8);
  const { data: verification } = useProfileVerification(socialProfileId);
  const { mutateAsync: publishPost, isPending: publishing } = usePublishPost();

  const [publishTitle, setPublishTitle] = useState<string>('');
  const [publishTags, setPublishTags] = useState<string>('');
  const [publishStatus, setPublishStatus] = useState<string | null>(null);

  const [recruiterViews, setRecruiterViews] = useState<RecruiterView[]>([
    {
      id: 'rec_1',
      name: 'Elena Rostova',
      role: 'Staff Technical Recruiter',
      company: 'Anthropic AI',
      avatarBg: 'from-purple-500 to-indigo-600',
      matchedSkills: ['vLLM', 'PyTorch', 'Distributed Systems'],
      vectorAlignmentPct: 96.4,
      timeAgo: '2h ago',
    },
    {
      id: 'rec_2',
      name: 'David Chen',
      role: 'Head of Infrastructure Talent',
      company: 'Stripe',
      avatarBg: 'from-blue-500 to-cyan-600',
      matchedSkills: ['Go', 'Redis', 'PostgreSQL', 'FastAPI'],
      vectorAlignmentPct: 92.8,
      timeAgo: '5h ago',
    },
    {
      id: 'rec_3',
      name: 'Maya Patel',
      role: 'Principal Engineering Director',
      company: 'Datadog',
      avatarBg: 'from-emerald-500 to-teal-600',
      matchedSkills: ['Kubernetes', 'WebAssembly', 'Observability'],
      vectorAlignmentPct: 94.0,
      timeAgo: '1d ago',
    },
    {
      id: 'rec_4',
      name: 'Marcus Vance',
      role: 'Senior Talent Partner',
      company: 'Scale AI',
      avatarBg: 'from-amber-500 to-orange-600',
      matchedSkills: ['PPO RL', 'Sentence-Transformers', 'NLP'],
      vectorAlignmentPct: 93.5,
      timeAgo: '2d ago',
    },
  ]);

  const [posts, setPosts] = useState<FeedPost[]>([
    {
      id: 'post_1',
      candidateName: 'Sarah Jenkins',
      candidateRole: 'Senior LLM Infrastructure Engineer',
      avatarBg: 'from-emerald-400 to-cyan-500',
      ccrsScore: 92.4,
      badge: 'vLLM Kernel Master',
      achievementTitle: 'Solved 100% vLLM PagedAttention Memory Gap via Live Sandbox',
      details: 'Implemented non-contiguous virtual memory block paging and executed speculative decoding benchmarks in the Pyodide WebAssembly sandbox.',
      benchmarkMetric: 'Sub-4.2ms token latency • O(1) page lookup verified',
      codeSnippet: 'llm = LLM(model="meta-llama/Llama-3-8B-Instruct", gpu_memory_utilization=0.92)\nsampling_params = SamplingParams(temperature=0.7, top_p=0.95)',
      verificationsCount: 38,
      timeAgo: '1h ago',
    },
    {
      id: 'post_2',
      candidateName: 'Alex Rivera',
      candidateRole: 'Distributed Systems & Cloud Architect',
      avatarBg: 'from-violet-500 to-purple-600',
      ccrsScore: 95.1,
      badge: 'L6 Staff Verified',
      achievementTitle: 'Achieved 98.6% Proctoring Trust Score (PTS) on System Design Round',
      details: 'Zero-knowledge proof generated on-device (Groth16 8KB hash). Verified 30 FPS gaze compliance with zero off-camera speech diarization flags.',
      benchmarkMetric: 'PTS: 98.6% • zk-STARK Attestation sealed',
      verificationsCount: 52,
      timeAgo: '3h ago',
    },
    {
      id: 'post_3',
      candidateName: 'Kenji Takahashi',
      candidateRole: 'Full-Stack Performance Engineer',
      avatarBg: 'from-amber-400 to-orange-500',
      ccrsScore: 89.8,
      badge: 'Pyodide WASM Top 3%',
      achievementTitle: 'Completed O(1) LRU Doubly-Linked Cache with AST Complexity Audit',
      details: 'Static AST inspection verified zero quadratic loops and sub-150 microsecond execution across all 20 adversarial edge test fixtures.',
      benchmarkMetric: 'AST Complexity: O(1) • 100% Test Coverage',
      verificationsCount: 29,
      timeAgo: '6h ago',
    },
  ]);

  /* ── v27.0 live hydration: real feed rows and recruiter inspection log ── */
  useEffect(() => {
    if (liveFeed?.posts?.length) setPosts(liveFeed.posts.map(mapFeedPost));
  }, [liveFeed]);

  useEffect(() => {
    if (liveViews?.views?.length) setRecruiterViews(liveViews.views.map(mapRecruiterView));
  }, [liveViews]);

  // Cumulative Reach Modeling — live values when the API responds, calibrated fallback otherwise.
  const totalViews = liveViews?.total ?? 42;
  const avgVectorAlignment = useMemo(() => {
    const live = liveViews?.views ?? [];
    if (!live.length) return 94.2;

    const sum = live.reduce((acc, view) => acc + view.vectorAlignmentPct, 0);
    return Number((sum / live.length).toFixed(1));
  }, [liveViews]);

  const handleVerifyPost = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, verificationsCount: p.verificationsCount + 1 } : p
      )
    );
  };

  /** Publishes a verified readiness milestone through POST /readiness/social/posts. */
  const handlePublish = async () => {
    const title = publishTitle.trim();
    if (!title || publishing) return;

    setPublishStatus(null);
    try {
      const created = await publishPost({
        user_id: socialProfileId,
        title,
        post_type: 'PROJECT_BENCHMARK',
        skill_tags: publishTags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      upsertFeedPost(created);
      setPosts((prev) => [mapFeedPost(created), ...prev.filter((post) => post.id !== created.id)]);
      setPublishTitle('');
      setPublishTags('');
      setPublishStatus('Milestone published to the verified network');
    } catch {
      setPublishStatus('Publish failed — readiness API unreachable');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="rounded-2xl theme-card p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)] flex items-center gap-1.5">
                <Users size={11} /> SkillMatch Professional Network
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[var(--fg-muted)] border border-[var(--glass-border-subtle)]">
                Empirical CCRS vs. Traditional Fluff
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--fg-color)] tracking-tight">
              Professional Social Readiness Feed
            </h1>
            <p className="text-sm text-[var(--fg-muted)] max-w-2xl mt-1 leading-relaxed">
              Replacing unverified resume endorsements with proof-of-work code proofs, 384-D skill gap resolutions, and real-time recruiter visibility modeling.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => navigateTo('candidate_profile')}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold border border-[var(--glass-border-subtle)] text-[var(--fg-muted)] hover:text-[var(--fg-color)] flex items-center gap-1.5 cursor-pointer"
            >
              <Fingerprint size={14} /> Identity Hub
            </button>
            <button
              onClick={() => navigateTo('profile_analytics')}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold border border-[var(--glass-border-subtle)] text-[var(--fg-muted)] hover:text-[var(--fg-color)] flex items-center gap-1.5 cursor-pointer"
            >
              <BarChart3 size={14} /> Reach Accuracy
            </button>
            <button
              onClick={() => navigateTo('matcher')}
              className="theme-primary-btn px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <Sparkles size={14} /> Update Readiness DNA
            </button>
          </div>
        </div>
      </div>

      {/* ── Publish Milestone Composer (POST /readiness/social/posts) ── */}
      <div className="rounded-2xl theme-surface p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Share2 size={14} className="text-[var(--accent-primary)]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
              Publish Verified Milestone
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
            {feedLoading ? (
              <span className="flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" /> syncing feed…
              </span>
            ) : feedError ? (
              'offline seed cache'
            ) : (
              `${liveFeed?.total ?? posts.length} verified milestones`
            )}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={publishTitle}
            onChange={(event) => setPublishTitle(event.target.value)}
            placeholder="e.g. Cleared vLLM PagedAttention gap with O(1) page lookup proof"
            className="flex-1 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-2 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
          <input
            value={publishTags}
            onChange={(event) => setPublishTags(event.target.value)}
            placeholder="vLLM, CUDA, KV-cache"
            className="sm:w-52 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-2 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
          <button
            onClick={handlePublish}
            disabled={publishing || !publishTitle.trim()}
            className="theme-primary-btn px-4 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {publishing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Publish
          </button>
        </div>

        {publishStatus && (
          <p className="text-[11px] font-mono text-[var(--accent-primary)]">{publishStatus}</p>
        )}
      </div>

      {/* ── 3-Column Social Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Candidate Profile Card & Verified Badges (3 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Main Candidate Verified Card */}
          <div className="rounded-2xl theme-card p-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[var(--accent-glow)]">
                {displayName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-[var(--fg-color)] truncate">{displayName}</h3>
                <p className="text-xs text-[var(--fg-muted)] truncate">Distributed AI Systems Engineer</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 flex items-center gap-1">
                    <ShieldCheck size={10} /> {verification?.verification_badge ?? 'Verified Talent'}
                  </span>
                  {verification?.liveness_verified && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-500 border border-cyan-500/25 flex items-center gap-1">
                      <BadgeCheck size={10} /> Liveness attested
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CCRS Gauge */}
            <div className="p-3.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--fg-muted)] font-medium">Composite Career Readiness (CCRS)</span>
                <span className="font-mono font-bold text-emerald-500 text-sm">
                  {(identityProfile?.ccrs_score ?? 88.4).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-[var(--glass-border-subtle)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-[var(--accent-primary)] h-full rounded-full"
                  style={{ width: `${Math.min(100, identityProfile?.ccrs_score ?? 88.4)}%` }}
                />
              </div>
              <p className="text-[10px] text-[var(--fg-subtle)]">
                {identityProfile
                  ? identityProfile.ccrs_formula
                  : 'Calibrated across Live Pyodide Sandbox (92%), CAT Quiz (86%), and Voice STAR (88%).'}
              </p>
            </div>

            {/* Proof-of-Work Badges */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-subtle)]">
                Cryptographic Skill Badges
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 flex items-center gap-1">
                  <CheckCircle2 size={11} /> vLLM Gap Solved (100%)
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-cyan-500/10 text-cyan-500 border border-cyan-500/25 flex items-center gap-1">
                  <Code2 size={11} /> WASM AST O(1) Proof
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-purple-500/10 text-purple-500 border border-purple-500/25 flex items-center gap-1">
                  <Lock size={11} /> zk-Proctor PTS: 98.2%
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/25 flex items-center gap-1">
                  <Award size={11} /> L6 Staff Ready
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--glass-border-subtle)] flex items-center justify-between gap-2 text-xs text-[var(--fg-muted)]">
              <span>Public Proof URL</span>
              <span className="font-mono text-[var(--accent-primary)] truncate">
                {identityProfile?.public_proof_url ?? `skillmatch.id/verify/${displayName.toLowerCase().replace(/\s+/g, '')}`}
              </span>
            </div>

            <button
              onClick={() => navigateTo('candidate_profile')}
              className="w-full py-2 rounded-xl text-xs font-semibold border border-[var(--glass-border-subtle)] text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--pill-bg)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Fingerprint size={13} /> Open Candidate Identity Hub
            </button>
          </div>

          {/* Cumulative Reach Modeling Card */}
          <div className="rounded-2xl theme-surface p-5 border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={15} className="text-[var(--accent-primary)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                  Cumulative Reach Model
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--accent-primary)] bg-[var(--pill-bg)] px-2 py-0.5 rounded-full border border-[var(--glass-border-subtle)]">
                Formula Eq. 1.2
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]">
                <div className="text-[10px] text-[var(--fg-muted)]">Total Profile Views</div>
                <div className="text-lg font-bold text-[var(--fg-color)] font-mono">{totalViews}</div>
                <div className="text-[9px] text-emerald-500 mt-0.5">+14 this week</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]">
                <div className="text-[10px] text-[var(--fg-muted)]">Reach Accuracy</div>
                <div className="text-lg font-bold text-[var(--accent-primary)] font-mono">{avgVectorAlignment}%</div>
                <div className="text-[9px] text-[var(--fg-muted)] mt-0.5">High intent matching</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[10px] font-mono text-[var(--fg-muted)] leading-relaxed">
              Reach Accuracy Score = (&Sigma; Recruiter Vector &bull; Candidate CCRS Vector / {totalViews}) &times; 100 = <strong className="text-[var(--fg-color)]">94.2%</strong>
            </div>
          </div>
        </div>

        {/* Center Column: Trending Readiness Activity Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] flex items-center gap-1.5">
              <Flame size={13} className="text-[var(--accent-primary)]" />
              Verified Readiness Feed (Live)
            </h2>
            <span className="text-[10px] font-mono text-[var(--fg-subtle)]">Zero fluff • Proof-backed</span>
          </div>

          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl theme-card p-5 space-y-3 relative group"
            >
              {/* Post Author Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${post.avatarBg} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                    {post.candidateName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-1.5">
                      {post.candidateName}
                      <CheckCircle2 size={13} className="text-emerald-500" />
                    </h4>
                    <p className="text-[11px] text-[var(--fg-muted)]">{post.candidateRole}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                    CCRS: {post.ccrsScore}%
                  </span>
                  <div className="text-[10px] text-[var(--fg-subtle)] mt-0.5">
                    <TimeAgo iso={post.createdAt} fallback={post.timeAgo} />
                  </div>
                  {post.verificationBadge && (
                    <div className="text-[9px] font-mono text-cyan-500 mt-1 flex items-center justify-end gap-1">
                      <BadgeCheck size={9} /> {post.verificationBadge}
                    </div>
                  )}
                </div>
              </div>

              {/* Achievement Content */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-semibold text-[var(--fg-color)] group-hover:text-[var(--accent-primary)] transition-colors">
                  {post.achievementTitle}
                </h5>
                <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                  {post.details}
                </p>
              </div>

              {/* Verified skill tags emitted by the readiness engine */}
              {post.skillTags && post.skillTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.skillTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Code Snippet if present */}
              {post.codeSnippet && (
                <div className="rounded-xl p-3 bg-black/80 border border-white/10 text-emerald-300 font-mono text-xs overflow-x-auto">
                  <pre>{post.codeSnippet}</pre>
                </div>
              )}

              {/* Empirical Proof Metric Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--glass-border-subtle)] text-xs">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)] truncate">
                    {post.benchmarkMetric}
                  </span>
                  {post.proofHash && (
                    <span className="text-[9px] font-mono text-[var(--fg-subtle)] truncate">
                      proof: {post.proofHash}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => navigateTo('candidate_profile')}
                    className="flex items-center gap-1 text-[11px] text-[var(--fg-subtle)] hover:text-[var(--accent-primary)] transition-colors font-medium cursor-pointer"
                  >
                    <Fingerprint size={12} />
                    <span>Identity Hub</span>
                  </button>

                  <button
                    onClick={() => handleVerifyPost(post.id)}
                    className="flex items-center gap-1.5 text-xs text-[var(--fg-muted)] hover:text-[var(--accent-primary)] transition-colors font-medium cursor-pointer"
                  >
                    <ShieldCheck size={13} />
                    <span>Verify Proof ({post.verificationsCount})</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Column: "Who Viewed Your Profile" Recruiter HUD (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl theme-surface p-5 border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={15} className="text-cyan-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                  Who Viewed Your Profile
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                Enterprise HUD
              </span>
            </div>

            <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
              Active enterprise recruiters and hiring directors matching your verified skill vectors.
            </p>

            {/* Recruiter List */}
            <div className="space-y-3">
              {recruiterViews.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-2 hover:border-[var(--glass-border)] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${rec.avatarBg} flex items-center justify-center text-white font-bold text-xs`}>
                        {rec.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-[var(--fg-color)] truncate">{rec.name}</h5>
                        <p className="text-[10px] text-[var(--fg-muted)] truncate">{rec.company}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-emerald-500">
                      {rec.vectorAlignmentPct}%
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {rec.matchedSkills.slice(0, 2).map((skill, si) => (
                      <span
                        key={si}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/5 text-[var(--fg-muted)] border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                    {rec.matchedSkills.length > 2 && (
                      <span className="text-[9px] text-[var(--fg-subtle)] self-center">
                        +{rec.matchedSkills.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigateTo('cv_builder')}
              className="w-full py-2 rounded-xl text-xs font-semibold text-[var(--accent-primary)] border border-[var(--glass-border-subtle)] hover:bg-[var(--pill-bg)] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View JD-Tailored CV & ATS Optimization</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReadinessFeed;
