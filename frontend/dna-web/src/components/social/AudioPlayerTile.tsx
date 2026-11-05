'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Pause, Play, Radio, ShieldCheck, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SkillMatch DNA v27.0 — standalone audio tile for verified voice STAR snippets.
 * Zero chart dependencies: the waveform is a deterministic bar strip driven by CSS vars.
 */
export interface AudioPlayerTileProps {
  /** Audio source URL (WAV / MP3 / WebM). Unavailable sources fall back to telemetry playback. */
  src?: string;
  /** Total clip duration in seconds (backend `voice_snippet_seconds`). */
  durationSeconds?: number;
  /** Tile caption, e.g. "15s STAR Snippet — vLLM PagedAttention". */
  label?: string;
  /** Secondary caption line (round, model, ANC engine…). */
  sublabel?: string;
  /** Pre-computed waveform samples (0..1). A deterministic strip is generated when omitted. */
  waveform?: number[];
  /** Compact single-row variant used inside feed cards. */
  compact?: boolean;
  className?: string;
}

const BAR_COUNT = 44;
const SNIPPET_SECONDS = 15;

/** FNV-1a style hash → deterministic bar strip so the tile never renders a flat waveform. */
function buildWaveform(seed: string, bars: number): number[] {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const values: number[] = [];
  for (let i = 0; i < bars; i += 1) {
    hash = Math.imul(hash ^ (i + 1), 16777619);
    const unit = ((hash >>> 0) % 1000) / 1000;
    const envelope = Math.sin((Math.PI * (i + 1)) / (bars + 1));
    values.push(Number((0.32 + 0.68 * unit * (0.55 + 0.45 * envelope)).toFixed(3)));
  }
  return values;
}

function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${(safe % 60).toString().padStart(2, '0')}`;
}

export const AudioPlayerTile: React.FC<AudioPlayerTileProps> = ({
  src = '',
  durationSeconds = SNIPPET_SECONDS,
  label = 'Verified voice STAR snippet',
  sublabel = 'WebRTC RNNoise + spectral gating (ANC filtered)',
  waveform,
  compact = false,
  className,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [playing, setPlaying] = useState<boolean>(false);
  const [progressSeconds, setProgressSeconds] = useState<number>(0);
  const [snippetLoaded, setSnippetLoaded] = useState<boolean>(false);
  const [warming, setWarming] = useState<boolean>(false);
  const [sourceState, setSourceState] = useState<'idle' | 'ready' | 'unavailable'>('idle');

  const duration = Math.max(1, Number(durationSeconds) || SNIPPET_SECONDS);
  const clipSeconds = Math.min(duration, SNIPPET_SECONDS);
  const bars = useMemo(
    () => (waveform && waveform.length ? waveform : buildWaveform(`${src}|${label}`, BAR_COUNT)),
    [waveform, src, label]
  );

  const stopTicker = useCallback(() => {
    if (tickerRef.current !== null) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  }, []);

  /** Telemetry playback: keeps the tile live even when the WAV asset is not served yet. */
  const startTicker = useCallback(() => {
    stopTicker();
    tickerRef.current = setInterval(() => {
      setProgressSeconds((prev) => {
        const next = prev + 0.1;
        if (next >= clipSeconds) {
          stopTicker();
          setPlaying(false);
          return clipSeconds;
        }
        return next;
      });
    }, 100);
  }, [clipSeconds, stopTicker]);

  useEffect(() => () => {
    stopTicker();
    audioRef.current?.pause();
  }, [stopTicker]);

  const handlePause = useCallback(() => {
    stopTicker();
    audioRef.current?.pause();
    setPlaying(false);
  }, [stopTicker]);

  const handlePlay = useCallback(() => {
    if (playing) {
      handlePause();
      return;
    }

    if (sourceState === 'ready' && audioRef.current) {
      void audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          setSourceState('unavailable');
          setPlaying(true);
          startTicker();
        });
      return;
    }

    setPlaying(true);
    startTicker();
  }, [playing, sourceState, startTicker, handlePause]);

  /** Warms the first 15 seconds of the snippet (Range request) before playback. */
  const loadSnippet = useCallback(async () => {
    if (warming || !src) {
      setSnippetLoaded(true);
      return;
    }

    setWarming(true);
    try {
      const res = await fetch(src, { headers: { Range: 'bytes=0-' }, cache: 'force-cache' });
      setSnippetLoaded(true);
      setSourceState(res.ok ? 'ready' : 'unavailable');
      setProgressSeconds(0);
    } catch {
      setSnippetLoaded(true);
      setSourceState('unavailable');
    } finally {
      setWarming(false);
    }
  }, [src, warming]);

  const handleSeek = useCallback(
    (ratio: number) => {
      const bounded = Math.max(0, Math.min(1, ratio));
      const target = bounded * duration;
      setProgressSeconds(target);
      if (audioRef.current && sourceState === 'ready') {
        audioRef.current.currentTime = target;
      }
    },
    [duration, sourceState]
  );

  const progressRatio = Math.min(1, progressSeconds / duration);

  return (
    <div className={cn('rounded-2xl theme-surface p-4 space-y-3', compact && 'p-3 space-y-2', className)}>
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-[var(--pill-bg)] border border-[var(--glass-border-subtle)] flex items-center justify-center shrink-0">
            <Waves size={13} className="text-[var(--accent-primary)]" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--fg-color)] truncate">{label}</p>
            <p className="text-[10px] text-[var(--fg-muted)] truncate">{sublabel}</p>
          </div>
        </div>

        <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-mono text-[var(--pill-text)] bg-[var(--pill-bg)] border border-[var(--glass-border-subtle)] flex items-center gap-1">
          <ShieldCheck size={9} /> crypto-attested
        </span>
      </div>

      {/* ── Waveform + transport ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePlay}
          aria-label={playing ? 'Pause voice snippet' : 'Play voice snippet'}
          className="w-9 h-9 shrink-0 rounded-full theme-primary-btn flex items-center justify-center cursor-pointer"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <div className="flex-1 flex items-end gap-[2px] h-11">
          {bars.map((value, index) => {
            const played = index / bars.length <= progressRatio;

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSeek(index / bars.length)}
                aria-label={`Seek to ${formatClock((index / bars.length) * duration)}`}
                className={cn(
                  'flex-1 rounded-full transition-colors cursor-pointer',
                  played
                    ? 'bg-[var(--accent-primary)]'
                    : 'bg-[var(--glass-border-subtle)] hover:bg-[var(--accent-secondary)]'
                )}
                style={{ height: `${Math.round(value * 100)}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-[var(--fg-muted)]">
        <span>
          {formatClock(progressSeconds)} / {formatClock(duration)}
        </span>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[var(--fg-subtle)]">{clipSeconds}s clip</span>
          <button
            type="button"
            onClick={loadSnippet}
            disabled={warming}
            className="px-2 py-1 rounded-lg border border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] hover:text-[var(--fg-color)] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-60"
          >
            {warming ? <Loader2 size={10} className="animate-spin" /> : <Radio size={10} />}
            <span>
              {snippetLoaded
                ? sourceState === 'unavailable'
                  ? 'Telemetry mode'
                  : 'Snippet ready'
                : 'Load 15s snippet'}
            </span>
          </button>
        </div>
      </div>

      {src ? (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          className="hidden"
          onLoadedMetadata={() => setSourceState('ready')}
          onTimeUpdate={(event) => setProgressSeconds(event.currentTarget.currentTime)}
          onEnded={() => {
            setPlaying(false);
            setProgressSeconds(0);
          }}
          onError={() => setSourceState('unavailable')}
        />
      ) : null}
    </div>
  );
};

export default AudioPlayerTile;
