/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',           /* 320px   → small phone */
        'phone-sm': '375px',     /* 375px   → iPhone-sized */
        'phone': '390px',        /* 390px   → modern phone */
        'phone-lg': '430px',     /* 430px   → large phone */
        'sm': '640px',           /* standard small */
        'md': '768px',           /* 768px   → tablet */
        'tablet': '768px',       /* alias for tablet */
        'lg': '1024px',          /* 1024px  → tablet/laptop */
        'laptop': '1024px',      /* alias for tablet/laptop */
        'xl': '1280px',          /* 1280px  → laptop */
        '2xl': '1440px',         /* 1440px  → desktop */
        'desktop': '1440px',     /* alias for desktop */
        '3xl': '1920px',         /* 1920px  → large desktop */
        'desktop-lg': '1920px',  /* alias for large desktop */
      },
      colors: {
        /* ── Brand tokens used across 60+ module components ── */
        'cyber-violet': '#8b5cf6',
        'cyber-indigo': '#6366f1',
        'cyber-amber': '#f59e0b',
        'tech-cyan': '#22d3ee',
        'vivid-emerald': '#34d399',
        'neural-alpha': '#a78bfa',
        /* ── Enterprise surface scale (Obsidian) ── */
        surface: {
          base: '#05070a',
          overlay: '#07090f',
          elevated: '#0b0f17',
          hairline: '#151a24',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-violet': '0 0 24px rgba(139,92,246,0.35)',
        'glow-cyan': '0 0 24px rgba(34,211,238,0.30)',
        'glow-emerald': '0 0 24px rgba(52,211,153,0.28)',
        enterprise: '0 18px 45px -20px rgba(0,0,0,0.85)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '1' },
          '100%': { transform: 'scale(1.7)', opacity: '0' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        float: 'float 5s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite',
        'gradient-pan': 'gradient-pan 8s ease infinite',
      },
    },
  },
  plugins: [],
};
