'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSpatialStore } from '@/lib/store';
import { findTabMeta, findGroupForTab, TOTAL_SECTIONS } from '@/lib/navigation';
import { useIsDesktop, SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED } from '@/lib/useMediaQuery';
import ThemeToggle from './ThemeToggle';
import { ProctoringHUD } from '../proctoring/ProctoringHUD';
import {
  Menu, Search, Shield, Bell, ChevronRight, Building2, Command as CommandIcon, LogOut, User as UserIcon, Sparkles,
} from 'lucide-react';
import { authService } from '@/lib/auth/auth-service';
import { getBackendUrl } from '@/lib/api-config';

const TENANTS = ['tenant_default', 'acme_global', 'northwind', 'helios_labs'];

export default function TopHeader({ onAuthClick }: { onAuthClick: (mode?: 'signin' | 'signup') => void }) {
  const {
    activeTab, user, isAuthenticated, sidebarCollapsed,
    setMobileNavOpen, setCommandPaletteOpen, activeTenantId, setActiveTenantId,
    setUser, setAuthenticated, navigateTo,
  } = useSpatialStore();
  const [backendOnline, setBackendOnline] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isDesktop = useIsDesktop();

  // Restore session from localStorage if present
  useEffect(() => {
    const savedUser = authService.getSavedUser();
    const token = authService.getSavedToken();
    if (savedUser && token && !isAuthenticated) {
      setUser(savedUser);
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch(getBackendUrl('/health'));
        setBackendOnline(r.ok);
      } catch {
        setBackendOnline(false);
      }
    };
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);

  const meta = findTabMeta(activeTab);
  const group = findGroupForTab(activeTab);
  const label = meta?.label ?? String(activeTab).replace(/_/g, ' ');
  const left = isDesktop ? (sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH) : 0;

  return (
    <header
      className="fixed top-0 right-0 z-40 h-14 flex items-center px-2 xs:px-3 sm:px-5 gap-1.5 xs:gap-2 sm:gap-3 border-b border-[var(--glass-border-subtle)] bg-[var(--chrome-bg)] text-[var(--fg-color)] backdrop-blur-xl transition-[left] duration-300 ease-out"
      style={{ left }}
    >
      {/* Mobile nav trigger */}
      <button
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open navigation"
        className="lg:hidden p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)] transition-all shrink-0"
      >
        <Menu size={17} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        {group && (
          <>
            <span className="hidden md:inline text-[11px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] shrink-0">
              {group.label}
            </span>
            <ChevronRight size={12} className="hidden md:block text-[var(--fg-subtle)] shrink-0 opacity-60" />
          </>
        )}
        <span className="text-[var(--fg-color)] font-semibold text-sm truncate">{label}</span>
      </div>

      <div className="flex-1" />

      {/* Command palette trigger */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden md:flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[11px] text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:border-[var(--glass-border)] transition-all"
        aria-label={`Search ${TOTAL_SECTIONS} sections`}
      >
        <Search size={12} />
        <span className="hidden lg:inline">Search sections</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 font-mono text-[9px] text-[var(--fg-subtle)] border border-[var(--glass-border-subtle)] rounded px-1 py-0.5">
          <CommandIcon size={8} />K
        </kbd>
      </button>

      {/* Engine status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest border ${
          backendOnline
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold'
            : 'bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300 font-semibold'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
        {backendOnline ? 'Engine Active' : 'Backend Pending'}
      </motion.div>

      {/* Compliance posture */}
      <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[11px] font-mono shadow-sm">
        <Shield size={12} className="text-emerald-600 dark:text-emerald-400" />
        <span className="text-emerald-800 dark:text-emerald-300 font-bold">94.5%</span>
        <span className="text-[var(--fg-muted)] ml-0.5 font-bold">CCRS</span>
      </div>

      {/* Tenant switcher */}
      <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] shadow-sm">
        <Building2 size={12} className="text-cyan-600 dark:text-cyan-400" />
        <select
          value={activeTenantId}
          onChange={(e) => setActiveTenantId(e.target.value)}
          aria-label="Active tenant"
          className="bg-transparent text-[11px] font-mono text-[var(--fg-color)] font-medium outline-none border-none cursor-pointer [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#0b0f17] dark:[&>option]:text-white"
        >
          {TENANTS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Real-Time Proctoring Trust Score (PTS) HUD - Perfectly in-flow, never obscuring adjacent controls */}
      <ProctoringHUD />

      {/* Notifications */}
      <button
        className="relative hidden sm:flex p-2 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)] transition-all shrink-0"
        aria-label="Notifications"
      >
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
      </button>

      {/* Dribbble-Grade Theme Switcher */}
      <ThemeToggle />

      {/* User Authentication Status */}
      {!isAuthenticated ? (
        <div className="flex items-center gap-1.5 xs:gap-2 shrink-0">
          <button
            onClick={() => onAuthClick('signin')}
            className="px-2 xs:px-2.5 phone-sm:px-3 py-1 xs:py-1.5 rounded-lg bg-[var(--pill-bg)] border border-[var(--glass-border)] text-[var(--pill-text)] text-[11px] xs:text-xs font-semibold hover:bg-[var(--glass-border)] transition-all cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => onAuthClick('signup')}
            className="hidden phone-sm:inline-flex px-2.5 phone-sm:px-3 py-1 xs:py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[11px] xs:text-xs font-bold shadow-sm shadow-emerald-500/20 hover:brightness-110 transition-all cursor-pointer"
          >
            Sign Up
          </button>
        </div>
      ) : (
        <div className="relative shrink-0">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] transition-all cursor-pointer shadow-sm"
            aria-label={`Signed in as ${user.name}`}
            title={user.name}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold text-xs shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline text-xs font-medium text-[var(--fg-color)] max-w-[100px] truncate">
              {user.name}
            </span>
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 top-10 z-50 w-56 p-2 rounded-2xl bg-[var(--chrome-bg)] border border-[var(--glass-border)] backdrop-blur-2xl shadow-2xl text-[var(--fg-color)] space-y-2">
                <div className="px-3 py-2 border-b border-[var(--glass-border-subtle)]">
                  <div className="font-semibold text-xs text-[var(--fg-color)] truncate">{user.name}</div>
                  <div className="text-[10px] text-[var(--fg-muted)] truncate">{user.email}</div>
                  <div className="mt-1.5 inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {user.role}
                  </div>
                </div>

                <button
                  onClick={() => {
                    authService.logout();
                    setUser(null);
                    setAuthenticated(false);
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 transition-colors font-medium cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
