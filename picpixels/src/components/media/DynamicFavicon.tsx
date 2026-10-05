'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/store/SiteSettingsContext';

function faviconUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';
  const normalized = path.startsWith('/media/') ? path : `/${path}`;
  if (normalized.startsWith('/media/')) {
    return `${base}${normalized}`;
  }
  return `${base}/media${normalized}`;
}

export function DynamicFavicon() {
  const { siteSettings } = useSiteSettings();

  useEffect(() => {
    const href = siteSettings?.favicon;
    if (!href) return;

    const url = faviconUrl(href);
    const version = siteSettings?.updated_at ? `?v=${siteSettings.updated_at}` : '';
    const fullUrl = `${url}${version}`;

    // Update existing favicon link hrefs safely in-place without deleting nodes from the DOM
    const existingLinks = document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"]');
    if (existingLinks.length > 0) {
      existingLinks.forEach(link => {
        link.href = fullUrl;
      });
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = fullUrl;
      document.head.appendChild(link);
    }
  }, [siteSettings?.favicon, siteSettings?.updated_at]);

  return null;
}
