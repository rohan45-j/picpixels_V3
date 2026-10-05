'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook that provides route prefetching on hover/pointer-over for faster navigation.
 * Uses Next.js built-in router.prefetch without flooding the server with simultaneous requests.
 */
export function usePrefetchRoutes(routes: string[], enabled = true) {
  const router = useRouter();
  const prefetchedRef = useRef<Set<string>>(new Set());

  // Throttled sequential prefetch for critical routes (one by one, 1s interval)
  useEffect(() => {
    if (!enabled || routes.length === 0) return;

    // Pick only top 3 primary routes for idle prefetch to avoid server exhaustion
    const primaryRoutes = routes.slice(0, 4);
    let index = 0;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const prefetchNext = () => {
      if (index >= primaryRoutes.length) return;
      const route = primaryRoutes[index];
      index += 1;

      if (!prefetchedRef.current.has(route)) {
        prefetchedRef.current.add(route);
        try {
          router.prefetch(route);
        } catch {
          // ignore
        }
      }

      // Schedule next route prefetch with safe 1200ms delay to keep server workers free
      timerId = setTimeout(prefetchNext, 1200);
    };

    // Start idle prefetching after 3 seconds when page is completely idle
    timerId = setTimeout(prefetchNext, 3000);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [routes, enabled, router]);

  /**
   * Immediately prefetches on hover/focus when the user actually shows intent to click.
   * This warms the RSC cache ~200ms before click, making navigation feel instant.
   */
  const prefetchOnHover = useCallback((route: string) => {
    if (!enabled || !route || route === '#' || route.startsWith('http')) return;
    if (prefetchedRef.current.has(route)) return;
    prefetchedRef.current.add(route);
    try {
      router.prefetch(route);
    } catch {
      // ignore
    }
  }, [enabled, router]);

  return {
    prefetchOnHover,
    prefetchAll: () => {
      // Intentionally a no-op or hover-driven to avoid Gunicorn worker starvation
    },
  };
}
