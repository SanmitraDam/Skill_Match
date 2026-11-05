'use client';

import React from 'react';

interface SpatialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  children: React.ReactNode;
}

export default function SpatialButton({
  variant = 'primary',
  children,
  className = '',
  ...props
}: SpatialButtonProps) {
  const base = "relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    primary: "bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:brightness-110",
    secondary: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md",
    accent: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:brightness-110"
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
