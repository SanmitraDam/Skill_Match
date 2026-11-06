'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import TopHeader from '@/components/ui/TopHeader';
import Workspace from '@/components/modules/Workspace';
import AuthModal from '@/components/auth/AuthModal';
import OnboardingModal from '@/components/auth/OnboardingModal';
import IntroSequence from '@/components/3d/IntroSequence';
import CommandPalette from '@/components/ui/CommandPalette';
import HeroSection from '@/components/hero/HeroSection';
import { useSpatialStore } from '@/lib/store';
import { useIsDesktop, SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED, HEADER_HEIGHT } from '@/lib/useMediaQuery';

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { activeTab, sidebarCollapsed } = useSpatialStore();
  const isDesktop = useIsDesktop();

  /* Shell offset tracks the collapsible sidebar + collapses to 0 on mobile. */
  const padLeft = isDesktop ? (sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH) : 0;

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <main className="relative min-h-screen w-full bg-[var(--bg-color)] text-[var(--fg-color)] theme-transition overflow-x-hidden">

      {/* Loader overlay — renders on top, auto-exits after ~3s */}
      <IntroSequence />

      {activeTab === 'hero' ? (
        /* Standalone Edge-to-Edge Hero Landing Page with dedicated Navbar & Sign Up / Sign In buttons */
        <HeroSection onAuthClick={handleOpenAuth} />
      ) : (
        /* Platform Workspace Shell (Sidebar + TopHeader + Workspace) */
        <>
          {/* Left sidebar (persistent rail on desktop, drawer on mobile) */}
          <Sidebar />

          {/* Top header bar */}
          <TopHeader onAuthClick={handleOpenAuth} />

          {/* Main content area */}
          <div
            className="flex flex-col min-h-screen transition-[padding] duration-300 ease-out"
            style={{ paddingLeft: padLeft, paddingTop: `${HEADER_HEIGHT}px` }}
            id="app-shell"
          >
            <div className="flex-1 w-full px-4 sm:px-6 py-5 sm:py-6 pb-16" id="workspace-section">
              <Workspace />
            </div>
          </div>

          {/* Global ⌘K section search across every module */}
          <CommandPalette />
        </>
      )}

      {/* Global Auth Modal for Login and Registration */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />

      {/* Mandatory Onboarding Profile Setup Modal for new or incomplete accounts */}
      <OnboardingModal />
    </main>
  );
}
