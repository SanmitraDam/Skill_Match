'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialStore } from '@/lib/store';
import { Sun, Moon } from 'lucide-react';

/**
 * SkillMatch DNA v27.0: Dribbble-Grade Theme Toggle
 * Physics-based spring micro-interactions (stiffness: 420, damping: 28)
 * Seamlessly morphs between Warm Orange-Yellow (Light) and Cyber Obsidian-Emerald (Dark)
 * Integrated with the central CSS Variable system for professional theme consistency.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useSpatialStore();
  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative flex items-center shrink-0 w-[58px] h-[28px] rounded-full p-[3px] border cursor-pointer select-none focus:outline-none transition-colors duration-300"
      style={{
        backgroundColor: 'var(--theme-toggle-bg)',
        borderColor: 'var(--theme-toggle-border)',
        boxShadow: isDark
          ? '0 0 12px var(--accent-glow), inset 0 1px 2px var(--theme-toggle-inner-glow)'
          : '0 0 12px var(--accent-glow), inset 0 1px 2px var(--theme-toggle-inner-glow)',
      }}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
      title={`Switch to ${isDark ? 'Light (Warm Orange-Yellow)' : 'Dark (Cyber Obsidian-Emerald)'} Theme`}
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 rounded-full blur-sm opacity-40 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'var(--theme-toggle-ambient)',
        }}
      />

      {/* Background Track Icons (Sun on Left, Moon on Right) */}
      <div className="absolute inset-0 px-2 flex justify-between items-center pointer-events-none">
        <Sun
          size={11}
          className={`transition-all duration-300 ${
            isDark ? 'opacity-60 text-amber-400 scale-100' : 'opacity-0 scale-75'
          }`}
        />
        <Moon
          size={11}
          className={`transition-all duration-300 ${
            !isDark ? 'opacity-60 text-slate-500 scale-100' : 'opacity-0 scale-75'
          }`}
        />
      </div>

      {/* The Animated Sliding Knob */}
      <motion.div
        animate={{
          x: isDark ? 28 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 28,
        }}
        className="relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-md shrink-0"
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center transition-colors duration-300 shadow-sm"
          style={{
            background: 'var(--theme-toggle-knob-bg)',
            boxShadow: '0 2px 5px var(--theme-toggle-knob-shadow)',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ rotate: -70, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 70, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                className="flex items-center justify-center"
              >
                <Moon size={11} className="text-slate-950 stroke-[2.5]" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 70, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -70, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                className="flex items-center justify-center"
              >
                <Sun size={11} className="text-white stroke-[2.5]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.button>
  );
}
