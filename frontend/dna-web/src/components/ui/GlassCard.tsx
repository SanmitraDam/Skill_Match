"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function GlassCard({ children, className, title }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        "glass-panel glass-panel-hover p-6 relative overflow-hidden",
        className
      )}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {title && (
        <h3 className="text-lg font-bold mb-4 text-[var(--fg-color)]">
          {title}
        </h3>
      )}
      <div className="relative z-10">
        {children}
      </div>

      {/* Ambient glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyber-violet/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-tech-cyan/20 blur-[100px] rounded-full pointer-events-none" />
    </motion.div>
  );
}
