'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialStore } from '@/lib/store';

export default function IntroSequence() {
  const { hasSeenIntro, setHasSeenIntro } = useSpatialStore();
  const [show, setShow] = useState(!hasSeenIntro);
  const [phase, setPhase] = useState<'loading' | 'reveal' | 'exit'>('loading');

  useEffect(() => {
    if (hasSeenIntro) { setShow(false); return; }

    // Phase 1: loading for 1.8s
    const t1 = setTimeout(() => setPhase('reveal'), 1800);
    // Phase 2: reveal brand text for 1s
    const t2 = setTimeout(() => setPhase('exit'), 2900);
    // Phase 3: fade out and complete
    const t3 = setTimeout(() => {
      setHasSeenIntro(true);
      setShow(false);
    }, 3700);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [hasSeenIntro, setHasSeenIntro]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-[#09090b]"
        >
          {/* Loader ring */}
          <AnimatePresence mode="wait">
            {phase === 'loading' && (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-8"
              >
                {/* Minimal spinner */}
                <div className="relative w-14 h-14">
                  <svg viewBox="0 0 56 56" fill="none" className="w-full h-full animate-[spin_1.4s_linear_infinite]">
                    <circle
                      cx="28" cy="28" r="24"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="28" cy="28" r="24"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="40 110"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-mono text-white/25 uppercase tracking-[0.25em]">
                    Initializing
                  </span>
                </div>
              </motion.div>
            )}

            {phase === 'reveal' && (
              <motion.div
                key="brand"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2c4 4 4 16 0 20" />
                    <path d="M12 2c-4 4-4 16 0 20" />
                    <path d="M4 7h16M4 12h16M4 17h16" />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">SkillMatch DNA</h1>
                <p className="text-[11px] text-emerald-400 font-mono tracking-widest uppercase">Career Readiness Platform</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => { setHasSeenIntro(true); setShow(false); }}
            className="absolute bottom-8 text-[11px] text-white/20 hover:text-white/50 font-mono uppercase tracking-widest transition-colors"
          >
            Skip →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
