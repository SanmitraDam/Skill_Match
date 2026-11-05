'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Eye,
  Mic,
  Lock,
  ChevronUp,
  ChevronDown,
  Activity,
  X
} from 'lucide-react';

interface ProctoringHUDProps {
  ptsScore?: number;
  verdict?: 'VERIFIED_AUTHENTIC' | 'SOFT_WARNING' | 'SESSION_QUARANTINED';
  gazeDirection?: string;
  speakerMatch?: boolean;
  activeIncidentsCount?: number;
  recentIncidentText?: string;
  className?: string;
}

export const ProctoringHUD: React.FC<ProctoringHUDProps> = ({
  ptsScore = 94.5,
  verdict = 'VERIFIED_AUTHENTIC',
  gazeDirection = 'CENTER_SCREEN',
  speakerMatch = true,
  activeIncidentsCount = 0,
  recentIncidentText = 'All biometric telemetry normal',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pulsingWarning, setPulsingWarning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeIncidentsCount > 0) {
      setPulsingWarning(true);
      const t = setTimeout(() => setPulsingWarning(false), 3000);
      return () => clearTimeout(t);
    }
  }, [activeIncidentsCount]);

  /* Close telemetry drawer when clicking outside */
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isExpanded]);

  const getStatusColor = () => {
    if (ptsScore >= 85) return 'emerald';
    if (ptsScore >= 60) return 'amber';
    return 'rose';
  };

  const color = getStatusColor();

  return (
    <div ref={containerRef} className={`relative inline-flex items-center shrink-0 ${className}`}>
      {/* Main Pill Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border backdrop-blur-xl transition-all cursor-pointer select-none shadow-sm ${
          color === 'emerald'
            ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-400'
            : color === 'amber'
            ? 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-400'
            : 'bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-400'
        }`}
        title="AI Proctoring Trust Score & Telemetry Guard"
      >
        {/* Status Icon */}
        <div className={`p-1 rounded-md ${
          color === 'emerald'
            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
            : color === 'amber'
            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
            : 'bg-rose-500/20 text-rose-700 dark:text-rose-400 animate-pulse'
        }`}>
          {color === 'emerald' ? (
            <ShieldCheck className="w-3.5 h-3.5" />
          ) : color === 'amber' ? (
            <AlertTriangle className="w-3.5 h-3.5" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5" />
          )}
        </div>

        {/* Score & Verdict Text */}
        <div className="flex flex-col leading-tight">
          <div className="text-[9px] uppercase font-mono tracking-wider text-[var(--fg-muted)] font-semibold flex items-center gap-1">
            <span className="hidden sm:inline">Trust Score</span>
            <span className="sm:hidden">PTS</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="text-xs sm:text-sm font-bold font-mono text-[var(--fg-color)] flex items-baseline gap-1">
            <span>{ptsScore.toFixed(1)}%</span>
            <span className={`text-[9px] sm:text-[10px] font-bold ${
              color === 'emerald' ? 'text-emerald-700 dark:text-emerald-400' : (color === 'amber' ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400')
            }`}>
              {verdict === 'VERIFIED_AUTHENTIC' ? 'PASS' : (verdict === 'SOFT_WARNING' ? 'WARN' : 'QUARANTINE')}
            </span>
          </div>
        </div>

        {/* Quick Sensor State Indicators (Visible on xl+ screens) */}
        <div className="hidden xl:flex items-center gap-1.5 pl-1.5 border-l border-[var(--glass-border-subtle)]">
          {/* Gaze Icon */}
          <div
            title={`Gaze Tracking: ${gazeDirection}`}
            className={`p-1 rounded-md text-xs ${
              gazeDirection === 'CENTER_SCREEN'
                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30'
                : 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40'
            }`}
          >
            <Eye className="w-3 h-3" />
          </div>

          {/* Audio Icon */}
          <div
            title={speakerMatch ? 'Acoustic Voice: Authenticated' : 'Secondary Speaker Detected!'}
            className={`p-1 rounded-md text-xs ${
              speakerMatch
                ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30'
                : 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/40 animate-pulse'
            }`}
          >
            <Mic className="w-3 h-3" />
          </div>

          {/* Browser Lock Icon */}
          <div
            title="Browser Integrity Guard Active"
            className="p-1 rounded-md text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
          >
            <Lock className="w-3 h-3" />
          </div>
        </div>

        {/* Chevron Dropdown Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          aria-label={isExpanded ? 'Collapse Telemetry' : 'Expand Telemetry'}
          className="p-0.5 text-[var(--fg-muted)] hover:text-[var(--fg-color)] transition-colors ml-0.5"
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Telemetry Drawer (Floats below header bar, never covering header buttons) */}
      {isExpanded && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-80 rounded-2xl border border-[var(--glass-border)] bg-[var(--chrome-bg)] backdrop-blur-2xl shadow-2xl p-4 z-50 text-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--glass-border-subtle)]">
            <div className="flex items-center gap-1.5 font-semibold text-sm text-[var(--fg-color)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-Modal Telemetry</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[var(--fg-muted)]">Gaze Direction:</span>
              <span className="font-mono text-cyan-400 font-semibold">{gazeDirection}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[var(--fg-muted)]">Voice Diarization:</span>
              <span className={`font-mono font-semibold ${speakerMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                {speakerMatch ? 'Verified Candidate' : 'Secondary Voice'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[var(--fg-muted)]">Active Incidents:</span>
              <span className="font-mono text-amber-400 font-bold">{activeIncidentsCount}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[11px] text-[var(--fg-muted)] flex items-start gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{recentIncidentText}</span>
          </div>

          <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[var(--fg-subtle)]">
            <span>ZK-SNARK Attestation Active</span>
            <span className="text-emerald-400">99.8% Integrity</span>
          </div>
        </div>
      )}
    </div>
  );
};

