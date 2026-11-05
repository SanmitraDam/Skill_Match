'use client';

import React from 'react';
import { motion } from 'framer-motion';

const pods = [
  {
    title: 'Vector Precision',
    content: '384-Dim Vector Embeddings',
    formula: 'cos(θ) = (S_res · S_job) / (||S_res|| · ||S_job||)',
    position: { top: '30%', left: '15%' },
    color: 'border-emerald-500/30'
  },
  {
    title: 'Adaptive Testing',
    content: 'Computerized Adaptive Testing',
    formula: 'Difficulty Scale: D_{k+1} = f(θ, R_k)',
    position: { top: '50%', left: '10%' },
    color: 'border-cyan-500/30'
  },
  {
    title: 'Voice Intelligence',
    content: 'Real-Time AI Voice Analytics',
    formula: 'STFT(x[n]) = Σ x[n]w[m-n]e^{-j2πkn/N}',
    position: { top: '70%', left: '15%' },
    color: 'border-indigo-500/30'
  }
];

export default function MetricPods() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {pods.map((pod, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -50 }}
          animate={{
            opacity: 1,
            x: 0,
            y: [0, -10, 0]
          }}
          transition={{
            opacity: { duration: 0.8, delay: 0.8 + i * 0.2 },
            x: { duration: 0.8, delay: 0.8 + i * 0.2 },
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{ top: pod.position.top, left: pod.position.left }}
          className={`absolute w-64 p-4 rounded-2xl theme-card backdrop-blur-xl border ${pod.color} pointer-events-auto shadow-2xl`}
        >
          <div className="text-[10px] font-mono text-[var(--accent-primary)] uppercase tracking-widest mb-1">{pod.title}</div>
          <div className="text-sm font-bold text-[var(--fg-color)] mb-2">{pod.content}</div>
          <div className="text-[10px] font-mono text-[var(--fg-muted)] italic leading-relaxed">
            {pod.formula}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
