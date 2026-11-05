'use client';

import React from 'react';
import { useSpatialStore } from '@/lib/store';
import AuthModal from './AuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
}

export default function ProtectedRoute({ children, authOpen, setAuthOpen }: ProtectedRouteProps) {
  const { isAuthenticated } = useSpatialStore();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full theme-card border-dashed border-[var(--accent-primary)]/30 rounded-3xl p-8 text-center">
        <div className="max-w-md space-y-4">
          <h3 className="text-xl font-bold text-[var(--fg-color)]">Identity Verification Required</h3>
          <p className="text-[var(--fg-muted)] text-sm">
            This module requires an authenticated session to persist data and access platform intelligence.
          </p>
          <button
            onClick={() => setAuthOpen(true)}
            className="theme-primary-btn px-6 py-2.5 text-sm uppercase tracking-wider cursor-pointer"
          >
            Authenticate Identity
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
