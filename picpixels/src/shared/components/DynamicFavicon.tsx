'use client';

import { useEffect, useRef } from 'react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

export function DynamicFavicon() {
  const { siteSettings } = useSiteSettings();
  const injectedRef = useRef<HTMLLinkElement[]>([]);

  useEffect(() => {
    injectedRef.current.forEach(el => el.remove());
    injectedRef.current = [];

    if (!siteSettings?.favicon) return;

    const existingFavicons = document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="apple-touch-icon"]');
    existingFavicons.forEach(el => el.remove());

    const faviconUrl = siteSettings.favicon.startsWith('http://') || siteSettings.favicon.startsWith('https://')
      ? siteSettings.favicon
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${siteSettings.favicon.startsWith('/') ? '' : '/'}${siteSettings.favicon}`;

    const createLink = (rel: string) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = faviconUrl;
      document.head.appendChild(link);
      injectedRef.current.push(link);
      return link;
    };

    createLink('icon');
    createLink('apple-touch-icon');

    return () => {
      injectedRef.current.forEach(el => el.remove());
      injectedRef.current = [];
    };
  }, [siteSettings?.favicon]);

  return null;
}
