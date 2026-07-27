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
    // First, remove ALL existing favicon links to prevent defaults
    document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="shortcut icon"]')
      .forEach(el => el.remove());

    // Then add the one from admin panel settings (if set)
    if (!href) return;

    const url = faviconUrl(href);
    ['icon', 'apple-touch-icon'].forEach(rel => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = url;
      document.head.appendChild(link);
    });
  }, [siteSettings?.favicon]);

  return null;
}
