'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Building2,
  Clock,
  Compass,
  Database,
  LineChart,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Target,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfileAnalytics, useProfileViews } from '@/hooks/useFastAPI';
import { useSpatialStore } from '@/lib/store';
import type { AlignmentWeight, ProfileAnalytics as ProfileAnalyticsData, ProfileViewRecord, WeeklyImpressionPoint } from '@/types/api';

export interface ProfileAnalyticsProps {
  /** Candidate key; falls back to the signed-in social profile id from the store. */
  candidateId?: string;
  /** Offline / first-paint fallback payload. */
  fallbackAnalytics?: ProfileAnalyticsData | null;
  className?: string;
}

interface ChartPoint {
  x: number;
  y: number;
}

const CHART_W = 560;
const CHART_H = 168;
const PAD_X = 30;
const PAD_Y = 20;

const numberFormat = new Intl.NumberFormat('en-IN');

function toPath(points: ChartPoint[]): string {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(' ');
}

/** Deterministic fallback series so the chart never collapses when the API is offline. */
function fallbackSeries(): WeeklyImpressionPoint[] {
  const labels = ['W-5', 'W-4', 'W-3', 'W-2', 'W-1', 'Now'];
  return labels.map((label, index) => ({
    label,
    impressions: 180 + index * 42,
    recruiter_views: 24 + index * 7,
  }));
}

export const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({
  candidateId,
  fallbackAnalytics = null,
  className,
}) => {
  const socialProfileId = useSpatialStore((state) => state.socialProfileId);
  const navigateTo = useSpatialStore((state) => state.navigateTo);
  const analyticsCache = useSpatialStore((state) => state.analyticsCache);
  const setProfileAnalytics = useSpatialStore((state) => state.setProfileAnalytics);
  const recordProfileView = useSpatialStore((state) => state.recordProfileView);

  const activeId = candidateId ?? socialProfileId;
  const { data, loading, error, refetch } = useProfileAnalytics(activeId);
  const { data: viewsData } = useProfileViews(activeId, 6);

  const [logging, setLogging] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);

  const analytics = useMemo(
    () => data ?? analyticsCache[activeId] ?? fallbackAnalytics ?? null,
    [data, analyticsCache, activeId, fallbackAnalytics]
  );

  useEffect(() => {
    if (data) setProfileAnalytics(activeId, data);
  }, [data, activeId, setProfileAnalytics]);

  const series = analytics?.weekly_impressions?.length ? analytics.weekly_impressions : fallbackSeries();

  const chart = useMemo(() => {
    const maxValue = Math.max(1, ...series.map((point) => Math.max(point.impressions, point.recruiter_views)));
    const stepX = series.length > 1 ? (CHART_W - PAD_X * 2) / (series.length - 1) : 0;
    const project = (value: number, index: number): ChartPoint => ({
      x: PAD_X + index * stepX,
      y: CHART_H - PAD_Y - (value / maxValue) * (CHART_H - PAD_Y * 2),
    });

    const impressions = series.map((point, index) => project(point.impressions, index));
    const recruiter = series.map((point, index) => project(point.recruiter_views, index));
    const baseline = CHART_H - PAD_Y;

    return {
      maxValue,
      impressions,
      recruiter,
      impressionsPath: toPath(impressions),
      recruiterPath: toPath(recruiter),
      areaPath:
        impressions.length > 1
          ? `${toPath(impressions)} L${impressions[impressions.length - 1].x.toFixed(1)},${baseline} L${impressions[0].x.toFixed(1)},${baseline} Z`
          : '',
      baseline,
    };
  }, [series]);

  const recruiterViewers: ProfileViewRecord[] = viewsData?.views ?? analytics?.recruiter_viewers ?? [];

  const handleLogView = async () => {
    setLogging(true);
    setStatus(null);
    const record = await recordProfileView(activeId, {
      viewer_name: 'Unnamed Enterprise Recruiter',
      viewer_company: 'SkillMatch Talent Cloud',
      viewer_role: 'Talent Intelligence Scout',
      is_recruiter: true,
    });
    setLogging(false);
    setStatus(record ? 'Inspection logged into the reach model' : 'Offline — inspection queued locally');
  };

  if (!analytics) {
    return (
      <div className={cn('rounded-2xl theme-card p-8 space-y-4 text-center', className)}>
        {loading ? (
          <>
            <Loader2 size={22} className="mx-auto animate-spin text-[var(--accent-primary)]" />
            <p className="text-xs font-mono text-[var(--fg-muted)]">
              Computing reach accuracy for {activeId}…
            </p>
          </>
        ) : (
          <>
            <AlertTriangle size={22} className="mx-auto text-[var(--status-warning)]" />
            <p className="text-sm font-semibold text-[var(--fg-color)]">Analytics unavailable</p>
            <p className="text-xs text-[var(--fg-muted)] max-w-sm mx-auto">
              {error?.message ?? 'The reach analytics endpoint returned no payload for this candidate.'}
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

  const share = Math.max(0, Math.min(100, analytics.recruiter_view_share_pct));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const stats: Array<{ label: string; value: string; icon: React.ReactNode; tone: string }> = [
    {
      label: 'Profile Impressions',
      value: numberFormat.format(analytics.total_profile_impressions),
      icon: <TrendingUp size={13} />,
      tone: 'text-[var(--accent-primary)]',
    },
    {
      label: 'Recruiter Companies',
      value: numberFormat.format(analytics.unique_recruiter_companies),
      icon: <Building2 size={13} />,
      tone: 'text-cyan-500',
    },
    {
      label: 'Reach Accuracy Index',
      value: `${analytics.reach_accuracy_score.toFixed(1)}%`,
      icon: <Target size={13} />,
      tone: 'text-emerald-500',
    },
    {
      label: 'Peak Visibility',
      value: analytics.peak_visibility_window,
      icon: <Clock size={13} />,
      tone: 'text-violet-500',
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* ── Header + metric strip ── */}
      <div className="rounded-2xl theme-card p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)] flex items-center gap-1.5">
                <Compass size={11} /> Reach Accuracy Index
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[var(--fg-muted)] border border-[var(--glass-border-subtle)]">
                {activeId}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--fg-color)] tracking-tight">
              Verified Recruiter Reach Model
            </h1>
            <p className="text-sm text-[var(--fg-muted)] max-w-2xl mt-1 leading-relaxed">
              Every inspection is scored against the CCRS composite vector — measuring how precisely this profile
              reaches the hiring teams it was engineered for.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleLogView}
              disabled={logging}
              className="px-3 py-2 rounded-xl text-[11px] font-semibold border border-[var(--glass-border-subtle)] text-[var(--fg-muted)] hover:text-[var(--fg-color)] flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {logging ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Log inspection
            </button>
            <button
              onClick={() => navigateTo('candidate_profile')}
              className="theme-primary-btn px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <Database size={14} /> Back to Identity Hub
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-3.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-1"
            >
              <span
                className={cn(
                  'text-[10px] font-mono uppercase tracking-wider flex items-center gap-1',
                  stat.tone
                )}
              >
                {stat.icon} {stat.label}
              </span>
              <p className="text-sm font-bold text-[var(--fg-color)] truncate">{stat.value}</p>
            </div>
          ))}
        </div>

        {status && <p className="text-[11px] font-mono text-[var(--accent-primary)]">{status}</p>}

        <p className="text-[10px] font-mono text-[var(--fg-subtle)] border-t border-[var(--glass-border-subtle)] pt-3">
          {analytics.formula}
        </p>
      </div>

      {/* ── 6-week impression series + recruiter donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-2xl theme-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LineChart size={15} className="text-[var(--accent-primary)]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                6-Week Impression Velocity
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--fg-subtle)]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)]" /> Impressions
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Recruiter views
              </span>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            className="w-full h-44"
            role="img"
            aria-label="Weekly impression series"
          >
            <defs>
              <linearGradient id="raiAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.32" />
                <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0.25, 0.5, 0.75].map((tick) => (
              <line
                key={tick}
                x1={PAD_X}
                x2={CHART_W - PAD_X}
                y1={chart.baseline - tick * (CHART_H - PAD_Y * 2)}
                y2={chart.baseline - tick * (CHART_H - PAD_Y * 2)}
                stroke="var(--glass-border-subtle)"
                strokeDasharray="4 6"
              />
            ))}

            {chart.areaPath && <path d={chart.areaPath} fill="url(#raiAreaGradient)" />}

            <motion.path
              d={chart.impressionsPath}
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth={2.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />

            <path
              d={chart.recruiterPath}
              fill="none"
              stroke="#06B6D4"
              strokeWidth={2}
              strokeDasharray="5 4"
              strokeLinecap="round"
            />

            {chart.impressions.map((point, index) => (
              <circle key={`imp-${index}`} cx={point.x} cy={point.y} r={3} fill="var(--accent-primary)" />
            ))}

            {series.map((point, index) => (
              <text
                key={`${point.label}-${index}`}
                x={chart.impressions[index]?.x ?? PAD_X}
                y={CHART_H - 4}
                textAnchor="middle"
                className="fill-[var(--fg-subtle)] text-[9px] font-mono"
              >
                {point.label}
              </text>
            ))}
          </svg>

          <p className="text-[10px] font-mono text-[var(--fg-subtle)]">
            Peak visibility window: {analytics.peak_visibility_window} • {series.length} tracked weeks
          </p>
        </div>

        <div className="lg:col-span-4 rounded-2xl theme-surface p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-cyan-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
              Recruiter View Share
            </h3>
          </div>

          <div className="flex items-center justify-center">
            <svg viewBox="0 0 140 140" className="w-40 h-40" role="img" aria-label="Recruiter view share">
              <defs>
                <linearGradient id="raiDonutGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" />
                  <stop offset="100%" stopColor="var(--accent-secondary)" />
                </linearGradient>
              </defs>

              <circle cx={70} cy={70} r={radius} fill="none" stroke="var(--glass-border-subtle)" strokeWidth={12} />
              <circle
                cx={70}
                cy={70}
                r={radius}
                fill="none"
                stroke="url(#raiDonutGradient)"
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray={`${(share / 100) * circumference} ${circumference}`}
                transform="rotate(-90 70 70)"
              />
              <text x={70} y={66} textAnchor="middle" className="fill-[var(--fg-color)] text-[20px] font-bold">
                {share.toFixed(0)}%
              </text>
              <text x={70} y={84} textAnchor="middle" className="fill-[var(--fg-subtle)] text-[9px] font-mono">
                recruiters
              </text>
            </svg>
          </div>

          <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
            {numberFormat.format(analytics.unique_recruiter_companies)} hiring organisations inspected this profile —
            remaining impressions came from peer verifications inside the network.
          </p>
        </div>
      </div>

      {/* ── Alignment table + search vectors + viewer log ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl theme-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={15} className="text-emerald-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                Vector Alignment Breakdown
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--fg-subtle)]">dot-product × weighted CCRS</span>
          </div>

          <div className="space-y-2">
            {(analytics.alignment_breakdown ?? []).map((row: AlignmentWeight) => {
              const contribution = row.value * row.weight;

              return (
                <div
                  key={row.component}
                  className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="font-medium text-[var(--fg-color)]">
                      {row.label}
                      <span className="ml-1.5 font-mono text-[10px] text-[var(--fg-subtle)]">{row.component}</span>
                    </span>
                    <span className="font-mono text-[var(--fg-muted)]">
                      {row.value.toFixed(1)}% × w{Math.round(row.weight * 100)}% =
                      <span className="text-[var(--accent-primary)] font-bold"> {contribution.toFixed(1)}</span>
                    </span>
                  </div>
                  <div className="w-full bg-[var(--glass-border-subtle)] h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, Math.min(100, row.value))}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl theme-surface p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Search size={14} className="text-[var(--accent-primary)]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                Top Search Vectors
              </h3>
            </div>

            {(analytics.top_search_vectors ?? []).length === 0 ? (
              <p className="text-xs text-[var(--fg-muted)]">No search vectors recorded for this period.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {(analytics.top_search_vectors ?? []).map((vector) => (
                  <span
                    key={vector}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)]"
                  >
                    {vector}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl theme-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-cyan-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-color)]">
                  Inspection Log
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                {recruiterViewers.length} recent
              </span>
            </div>

            {recruiterViewers.length === 0 ? (
              <p className="text-xs text-[var(--fg-muted)]">
                No recruiter inspections yet — publish a verified milestone to enter enterprise search vectors.
              </p>
            ) : (
              <div className="space-y-2">
                {recruiterViewers.map((view) => (
                  <div
                    key={view.id}
                    className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            'w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs shrink-0',
                            view.avatarGradient || 'from-emerald-400 to-cyan-500'
                          )}
                        >
                          {view.viewerName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-[var(--fg-color)] truncate flex items-center gap-1.5">
                            {view.viewerName}
                            {view.isRecruiter && (
                              <span className="text-[9px] font-mono text-cyan-500 bg-cyan-500/10 px-1.5 rounded">
                                recruiter
                              </span>
                            )}
                          </h5>
                          <p className="text-[10px] text-[var(--fg-muted)] truncate">
                            {view.viewerRole} • {view.viewerCompany}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-500 shrink-0">
                        {view.vectorAlignmentPct.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      {view.matchedSkills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)]"
                        >
                          {skill}
                        </span>
                      ))}
                      <span className="ml-auto text-[9px] font-mono text-[var(--fg-subtle)]">{view.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAnalytics;



