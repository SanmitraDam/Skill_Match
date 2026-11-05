'use client';

import React, { useEffect } from 'react';
import { useSpatialStore } from '@/lib/store';
import NeuralCursor from '@/components/ui/NeuralCursor';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useSpatialStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      <NeuralCursor />
      {children}
    </>
  );
}
