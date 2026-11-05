'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialStore } from '@/lib/store';
import { NAV_GROUPS, TOTAL_SECTIONS } from '@/lib/navigation';
import { Dna, ChevronDown, X, Menu, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarBodyProps {
  collapsed: boolean;
  onToggle: () => void;
  variant: 'desktop' | 'mobile';
}

/**
 * Shared navigation rail. Rendered twice: as the persistent desktop rail and
 * as the slide-in mobile drawer, so both stay perfectly in sync.
 */
function SidebarBody({ collapsed, onToggle, variant }: SidebarBodyProps) {
  const { activeTab, navigateTo } = useSpatialStore();
  const [query, setQuery] = useState('');
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(NAV_GROUPS.map((g) => g.label))
  );

  /* Always reveal the vertical that owns the active section */
  useEffect(() => {
    const group = NAV_GROUPS.find((g) => g.tabs.some((t) => t.id === activeTab));
    if (group) {
      setOpenGroups((prev) => (prev.has(group.label) ? prev : new Set(prev).add(group.label)));
    }
  }, [activeTab]);

  const searching = query.trim().length > 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV_GROUPS;
    return NAV_GROUPS.map((g) => ({
      ...g,
      tabs: g.tabs.filter((t) =>
        `${t.label} ${t.description ?? ''}`.toLowerCase().includes(q)
      ),
    })).filter((g) => g.tabs.length > 0);
  }, [query]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isGroupOpen = (label: string) => searching || openGroups.has(label);

  return (
    <div className="flex h-full w-full flex-col">
      {/* ─ Brand header ── */}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-[var(--glass-border-subtle)] shrink-0 bg-gradient-to-r from-[var(--pill-bg)] to-transparent">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shrink-0 shadow-md shadow-[var(--accent-glow)]">
          <Dna size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col min-w-0 overflow-hidden"
            >
              <span className="text-sm font-bold text-[var(--fg-color)] tracking-tight leading-none whitespace-nowrap">
                SkillMatch
              </span>
              <span className="text-[10px] font-mono font-bold text-[var(--accent-primary)] tracking-widest uppercase leading-none mt-0.5">
                DNA Platform
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          aria-label={variant === 'mobile' ? 'Close navigation' : collapsed ? 'Expand navigation' : 'Collapse navigation'}
          className="ml-auto p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)] transition-all shrink-0 cursor-pointer"
        >
          {variant === 'mobile' ? <X size={15} /> : collapsed ? <Menu size={14} /> : <X size={14} />}
        </button>
      </div>

      {/* ── Section search ── */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-2.5 pt-2.5 shrink-0 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] focus-within:border-[var(--accent-primary)] transition-colors">
              <Search size={12} className="text-[var(--fg-muted)] shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter sections…"
                aria-label="Filter navigation sections"
                className="w-full bg-transparent text-[11px] text-[var(--fg-color)] placeholder:text-[var(--fg-subtle)] outline-none border-none font-medium"
              />
              {searching && (
                <button onClick={() => setQuery('')} aria-label="Clear filter" className="text-[var(--fg-muted)] hover:text-[var(--fg-color)]">
                  <X size={11} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scrollable navigation ── */}
      <nav className="nav-scroll flex-1 overflow-y-auto overflow-x-hidden py-2">
        {filtered.length === 0 && !collapsed && (
          <div className="px-4 py-6 text-center text-[11px] text-[var(--fg-muted)]">
            No sections match “{query}”.
          </div>
        )}

        {filtered.map((group) => {
          const groupOpen = isGroupOpen(group.label);
          const GroupIcon = group.icon;

          return (
            <div key={group.label} className="mb-0.5">
              {/* Group header */}
              <button
                onClick={() => !collapsed && !searching && toggleGroup(group.label)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2 py-1.5 mx-1 text-left transition-all duration-150 hover:bg-[var(--glass-bg)] rounded-lg cursor-pointer',
                  collapsed && 'justify-center'
                )}
                style={{ width: 'calc(100% - 8px)' }}
              >
                <GroupIcon size={14} className={cn(group.color, 'shrink-0')} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--fg-muted)] truncate">
                      {group.label}
                    </span>
                    <span className="shrink-0 text-[9px] font-mono text-[var(--fg-subtle)] mr-1">{group.tabs.length}</span>
                    <motion.span
                      animate={{ rotate: groupOpen ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 text-[var(--fg-subtle)]"
                    >
                      <ChevronDown size={11} />
                    </motion.span>
                  </>
                )}
              </button>

              {/* Section items */}
              <AnimatePresence initial={false}>
                {(groupOpen || collapsed) && (
                  <motion.div
                    key={group.label + '-items'}
                    initial={collapsed ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    {group.tabs.map((tab) => {
                      const TabIcon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => navigateTo(tab.id)}
                          title={collapsed ? tab.label : tab.description}
                          className={cn(
                            'relative flex items-center gap-2.5 py-1.5 transition-all duration-150 rounded-lg mx-1 group cursor-pointer',
                            collapsed ? 'justify-center px-2' : 'pl-6 pr-2',
                            isActive
                              ? 'bg-[var(--pill-bg)] text-[var(--accent-primary)] font-bold border border-[var(--glass-border-subtle)] shadow-sm'
                              : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)] font-medium'
                          )}
                          style={{ width: 'calc(100% - 8px)' }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId={`sidebarActiveIndicator-${variant}`}
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--accent-primary)] rounded-r-full"
                              transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                            />
                          )}
                          <TabIcon
                            size={14}
                            className={cn(
                              'shrink-0 transition-all duration-150',
                              isActive ? 'text-[var(--accent-primary)]' : 'group-hover:text-[var(--fg-color)] text-[var(--fg-muted)]'
                            )}
                          />
                          {!collapsed && (
                            <span className="flex-1 flex items-center gap-1.5 min-w-0">
                              <span className="text-xs truncate">{tab.label}</span>
                              {tab.badge && (
                                <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)] leading-none">
                                  {tab.badge}
                                </span>
                              )}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-[var(--glass-border-subtle)] p-3">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9px] font-mono text-[var(--fg-subtle)] uppercase tracking-widest text-center leading-relaxed"
            >
              &copy; 2026 SkillMatch DNA
              <br />
              <span className="text-[var(--accent-primary)] font-semibold">
                {TOTAL_SECTIONS} sections · Quantum-Neuromorphic
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Responsive navigation shell:
 *  · persistent collapsible rail on desktop (lg+)
 *  · slide-in drawer on mobile, driven by the shared store
 */
export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen } = useSpatialStore();

  return (
    <>
      {/* Desktop rail */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 56 : 244 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-[var(--chrome-bg)] backdrop-blur-2xl border-r border-[var(--glass-border-subtle)] overflow-hidden select-none shadow-xl"
        style={{ willChange: 'width' }}
      >
        <SidebarBody collapsed={sidebarCollapsed} onToggle={toggleSidebar} variant="desktop" />
      </motion.aside>

      {/* Mobile scrim */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            key="mobile-nav-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.aside
            key="mobile-nav-drawer"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[280px] flex flex-col bg-[var(--chrome-bg)] backdrop-blur-2xl border-r border-[var(--glass-border-subtle)] overflow-hidden lg:hidden shadow-2xl"
          >
            <SidebarBody collapsed={false} onToggle={() => setMobileNavOpen(false)} variant="mobile" />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}