'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/store/SiteSettingsContext';

function faviconUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}/media${normalized}`;
}

export function DynamicFavicon() {
  const { siteSettings } = useSiteSettings();

  useEffect(() => {
    const href = siteSettings?.favicon;
    if (!href) return;

    const url = faviconUrl(href);
    const links = document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="apple-touch-icon"]');

    if (links.length > 0) {
      links.forEach(el => { el.href = url; });
    } else {
      ['icon', 'apple-touch-icon'].forEach(rel => {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = url;
        document.head.appendChild(link);
      });
    }
  }, [siteSettings?.favicon]);

  return null;
}
