'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getBackendUrl } from '@/lib/api-config';

export default function StatusPill() {
  const [status, setStatus] = useState<{ online: boolean; engine: string }>({
    online: false,
    engine: 'Initializing...'
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await axios.get(getBackendUrl('/health'));
        setStatus({
          online: true,
          engine: '384D Vector Cosine Engine Online'
        });
      } catch (e) {
        setStatus({
          online: false,
          engine: 'Backend Connection Pending...'
        });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="absolute top-8 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] shadow-lg">
        <div className="relative flex h-2 w-2">
          {status.online && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${status.online ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
        </div>
        <span className="text-[10px] font-mono text-[var(--fg-color)] uppercase tracking-widest font-semibold">
          {status.online ? 'Backend Active' : 'Backend Offline'} • {status.engine}
        </span>
      </div>
    </motion.div>
  );
}
