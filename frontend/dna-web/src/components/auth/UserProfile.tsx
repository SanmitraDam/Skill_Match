'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialStore } from '@/lib/store';
import { signOut } from 'next-auth/react';
import { User, Settings, LogOut, Shield } from 'lucide-react';

export default function UserProfile() {
  const { user, isAuthenticated } = useSpatialStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 pr-3 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] transition-all group cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white font-bold text-xs">
          {user.name.charAt(0)}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs font-bold text-[var(--fg-color)] leading-none">{user.name}</span>
          <span className="text-[10px] font-mono text-[var(--accent-primary)] uppercase tracking-tighter">
            {user.role}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute top-full right-0 mt-2 w-56 p-2 rounded-2xl theme-card backdrop-blur-xl border border-[var(--glass-border-subtle)] shadow-2xl z-[100]"
          >
            <div className="p-3 border-b border-[var(--glass-border-subtle)] mb-2">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-widest">Active Session</span>
              </div>
            </div>

            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)] transition-all text-sm cursor-pointer">
                <User className="w-4 h-4" />
                Profile Settings
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)] transition-all text-sm cursor-pointer">
                <Settings className="w-4 h-4" />
                Account Preferences
              </button>
              <div className="h-px bg-[var(--glass-border-subtle)] my-2" />
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all text-sm cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
