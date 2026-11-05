'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialStore } from '@/lib/store';
import { NAV_INDEX, TOTAL_SECTIONS } from '@/lib/navigation';
import { Search, CornerDownLeft, Command as CommandIcon, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type Result = (typeof NAV_INDEX)[number];

/** Normalise a string for cheap fuzzy matching. */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, navigateTo, activeTab } = useSpatialStore();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* ── Global Cmd/Ctrl+K shortcut ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  /* ── Reset + focus whenever the palette opens ── */
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [commandPaletteOpen]);

  const results: Result[] = useMemo(() => {
    const q = norm(query);
    if (!q) return NAV_INDEX.slice(0, 8);
    const terms = q.split(/\s+/).filter(Boolean);
    return NAV_INDEX.filter((item) => {
      const haystack = norm(`${item.label} ${item.group} ${item.description ?? ''}`);
      return terms.every((t) => haystack.includes(t));
    }).slice(0, 40);
  }, [query]);

  useEffect(() => { setActive(0); }, [query]);

  /* ── Keep the highlighted row in view ── */
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const commit = (item?: Result) => {
    const target = item ?? results[active];
    if (!target) return;
    navigateTo(target.id);
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <motion.div
          key="command-palette"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[3000] flex items-start justify-center px-4 pt-[12vh] bg-black/70 backdrop-blur-sm"
          onClick={() => setCommandPaletteOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Section search"
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onListKeyDown}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--chrome-bg)] shadow-2xl backdrop-blur-2xl"
          >
            {/* Search row */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--glass-border-subtle)]">
              <Search size={16} className="text-[var(--fg-muted)] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${TOTAL_SECTIONS} platform sections…`}
                className="flex-1 bg-transparent text-sm text-[var(--fg-color)] placeholder:text-[var(--fg-subtle)] outline-none border-none focus:outline-none font-medium"
                aria-label="Search sections"
              />
              <kbd className="hidden sm:block text-[10px] font-mono text-[var(--fg-muted)] border border-[var(--glass-border-subtle)] bg-[var(--pill-bg)] rounded px-1.5 py-0.5">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-2">
              {results.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-[var(--fg-muted)]">
                  No section matches “{query}”.
                </div>
              )}

              {results.map((item, idx) => {
                const Icon = item.icon;
                const isActive = idx === active;
                return (
                  <button
                    key={item.id}
                    data-idx={idx}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => commit(item)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer',
                      isActive ? 'bg-[var(--pill-bg)]' : 'hover:bg-[var(--glass-bg)]'
                    )}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border shadow-xs"
                      style={{ borderColor: `${item.groupAccent}44`, backgroundColor: `${item.groupAccent}18` }}
                    >
                      <Icon size={14} style={{ color: item.groupAccent }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--fg-color)] truncate">{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)] leading-none">
                            {item.badge}
                          </span>
                        )}
                        {activeTab === item.id && (
                          <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">current</span>
                        )}
                      </span>
                      <span className="block text-[11px] text-[var(--fg-muted)] truncate mt-0.5">
                        {item.group} · {item.description}
                      </span>
                    </span>
                    {isActive && <CornerDownLeft size={13} className="text-[var(--accent-primary)] shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--glass-border-subtle)] text-[10px] font-mono text-[var(--fg-muted)]">
              <span className="flex items-center gap-1.5">
                <CommandIcon size={11} /> K to toggle
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <ShieldCheck size={11} className="text-emerald-600 dark:text-emerald-400" /> SSO · SOC 2 · ISO 27001
              </span>
              <span>{TOTAL_SECTIONS} sections indexed</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

