'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook that provides route prefetching on hover/pointer-over for faster navigation.
 * Uses Next.js built-in router.prefetch which warms the RSC payload + route data.
 */
export function usePrefetchRoutes(routes: string[], enabled = true) {
  const router = useRouter();
  const prefetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || routes.length === 0) return;

    // Idle prefetch for all routes (low priority, after page settles)
    const idleId = window.requestIdleCallback
      ? window.requestIdleCallback(
          () => {
            routes.forEach((route) => {
              if (!prefetchedRef.current.has(route) && typeof window !== 'undefined') {
                prefetchedRef.current.add(route);
                router.prefetch(route);
              }
            });
          },
          { timeout: 2000 },
        )
      : (setTimeout(() => {
          routes.forEach((route) => {
            if (!prefetchedRef.current.has(route)) {
              prefetchedRef.current.add(route);
              router.prefetch(route);
            }
          });
        }, 1500) as unknown as number);

    return () => {
      if (window.requestIdleCallback) {
        window.cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId as unknown as ReturnType<typeof setTimeout>);
      }
    };
  }, [routes, enabled, router]);

  /**
   * Callback for onMouseEnter / onPointerOver events.
   * Immediately prefetches the route so navigation is instant when clicked.
   */
  const prefetchOnHover = (route: string) => {
    if (!enabled) return;
    if (prefetchedRef.current.has(route)) return;
    prefetchedRef.current.add(route);
    router.prefetch(route);
  };

  return { prefetchOnHover, prefetchAll: () => {
    routes.forEach((route) => {
      if (!prefetchedRef.current.has(route)) {
        prefetchedRef.current.add(route);
        router.prefetch(route);
      }
    });
  } };
}
