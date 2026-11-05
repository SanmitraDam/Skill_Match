'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

/** useLayoutEffect on the client (avoids a first-paint flash), useEffect on the server. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * SSR-safe media-query hook.
 * The initial render is always `false` so server and client markup match;
 * the value is then resolved in a layout effect *before* the browser paints.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);

  return matches;
}

/** True on lg+ viewports, where the persistent sidebar rail is rendered. */
export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}

/** Width of the persistent sidebar rail (px) for the current shell state. */
export const SIDEBAR_WIDTH = 244;
export const SIDEBAR_WIDTH_COLLAPSED = 56;
export const HEADER_HEIGHT = 56;
