/**
 * api-config.ts — Unified API Base URL Resolution for Vercel Services & Local Dev
 *
 * Resolves the backend base URL across execution environments:
 * 1. Server-side (Vercel Functions / SSR): uses internal service binding BACKEND_URL
 * 2. Client-side explicit override: NEXT_PUBLIC_API_URL if specified
 * 3. Client-side on Vercel deployment: returns '' (relative path) to leverage Vercel /api rewrites
 * 4. Local development fallback: 'http://localhost:8000'
 */

export function getBackendBaseUrl(): string {
  // 1. Server-side runtime (Node.js / Vercel Serverless Functions)
  // Vercel injects the private service binding into process.env.BACKEND_URL
  if (typeof window === 'undefined') {
    if (process.env.BACKEND_URL) {
      return process.env.BACKEND_URL.replace(/\/+$/, '');
    }
  }

  // 2. Explicit public environment variable override
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  // 3. Browser runtime in production on Vercel (same domain via /api rewrite)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '';
  }

  // 4. Local development fallback
  return 'http://localhost:8000';
}

export function getBackendUrl(path: string): string {
  if (!path) return '';
  const base = getBackendBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function getAuthApiBaseUrl(): string {
  // If running on server with internal service binding
  if (typeof window === 'undefined' && process.env.BACKEND_URL) {
    return `${process.env.BACKEND_URL.replace(/\/+$/, '')}/api/v1`;
  }

  // Explicit base URL
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, '');
  }

  const base = getBackendBaseUrl();
  return base ? `${base}/api/v1` : '/api/v1';
}

/**
 * Dynamic string wrapper so template literals `${API_BASE}/api/...` evaluate
 * dynamically at execution time rather than once at module load time.
 */
export const API_BASE: string = ({
  toString: () => getBackendBaseUrl(),
  valueOf: () => getBackendBaseUrl(),
} as unknown) as string;
