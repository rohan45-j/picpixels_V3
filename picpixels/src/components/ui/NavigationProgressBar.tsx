'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchedUrls = useRef<Set<string>>(new Set());

  const start = () => {
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);

    startTimeoutRef.current = setTimeout(() => {
      setVisible(true);
      setLoading(true);
      setProgress(20);

      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 85;
          }
          const diff = 85 - prev;
          return prev + Math.max(diff * 0.2, 3);
        });
      }, 100);
    }, 120);
  };

  const finish = () => {
    if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);

    finishTimeoutRef.current = setTimeout(() => {
      setVisible(false);
      setLoading(false);
      setProgress(0);
    }, 200);
  };

  useEffect(() => {
    finish();
  }, [pathname]);

  useEffect(() => {
    const isInternalLink = (target: HTMLElement | null): HTMLAnchorElement | null => {
      const anchor = target?.closest('a');
      if (!anchor) return null;
      const href = anchor.getAttribute('href');
      if (!href) return null;
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        anchor.getAttribute('target') === '_blank'
      ) {
        return null;
      }
      return anchor;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const anchor = isInternalLink(e.target as HTMLElement);
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;

      const path = href.split('#')[0];
      if (path && !prefetchedUrls.current.has(path)) {
        prefetchedUrls.current.add(path);
        try {
          router.prefetch(path);
        } catch {}
      }
    };

    const handleGlobalClick = (e: MouseEvent) => {
      const anchor = isInternalLink(e.target as HTMLElement);
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      const currentFullUrl = window.location.pathname + window.location.search;
      if (href === currentFullUrl || href === window.location.pathname) {
        return;
      }

      start();
    };

    document.addEventListener('mouseover', handleMouseOver, { passive: true, capture: true });
    document.addEventListener('click', handleGlobalClick, { capture: true });

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, { capture: true });
      document.removeEventListener('click', handleGlobalClick, { capture: true });
      if (timerRef.current) clearInterval(timerRef.current);
      if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    };
  }, [router]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 999999,
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #FF8A50 0%, #FF6B2B 100%)',
          boxShadow: '0 0 12px rgba(255, 138, 80, 0.9), 0 0 4px #FF8A50',
          transition: progress === 100 ? 'width 150ms ease-out, opacity 200ms ease-out' : 'width 200ms ease-out',
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
