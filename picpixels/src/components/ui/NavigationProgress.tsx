'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import CenteredLoader from './CenteredLoader';

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // When pathname or searchParams change, navigation has completed - immediately hide
  useEffect(() => {
    clearTimeout(showTimerRef.current);
    setIsLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept clicks on REAL internal links to provide smooth visual feedback for slow loads
    const handleLinkClick = (e: MouseEvent) => {
      // If event was cancelled / prevented by a component (like a tab filter), NEVER show loader
      if (e.defaultPrevented) return;

      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      // Ignore buttons, tabs, or elements with data-no-progress
      if (
        (e.target as HTMLElement).closest('button') ||
        target.getAttribute('role') === 'tab' ||
        target.hasAttribute('data-no-progress')
      ) {
        return;
      }

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Ignore external links, downloads, new tabs, in-page hash links, mailto, tel
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        targetAttr === '_blank' ||
        target.hasAttribute('download') ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if it's pointing to a different internal route
      try {
        const url = new URL(href, window.location.href);
        if (url.origin === window.location.origin) {
          // If only hash changed on current page, ignore
          if (url.pathname === window.location.pathname && url.search === window.location.search) {
            return;
          }

          clearTimeout(showTimerRef.current);
          // Only show loader if the transition takes more than 250ms (fast pages load with zero delay)
          showTimerRef.current = setTimeout(() => {
            setIsLoading(true);
          }, 250);
        }
      } catch {
        // ignore invalid urls
      }
    };

    const handlePopState = () => {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = setTimeout(() => {
        setIsLoading(true);
      }, 250);
    };

    document.addEventListener('click', handleLinkClick);
    window.addEventListener('popstate', handlePopState);

    return () => {
      clearTimeout(showTimerRef.current);
      document.removeEventListener('click', handleLinkClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Safety fallback: auto-dismiss after 3s in case navigation stalls
  useEffect(() => {
    if (isLoading) {
      const safety = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      return () => clearTimeout(safety);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return <CenteredLoader />;
}
