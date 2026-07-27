'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { fetchSiteSettings, type SiteSetting } from '@/services/public-api';

const DEFAULT_SETTINGS: SiteSetting = {
  site_name: 'PicPicxels',
  tagline: 'PicPicxels offers top-quality services that enhance revenue, increase profit margins, reduce operational costs, and save valuable time.',
  support_email: 'support@picpicxels.com',
  support_phone: '+1 (123) 456-7890',
  copyright_text: '© PicPicxels. All Rights Reserved.',
  address: '123 Business Avenue, Suite 100, New York, NY 10001',
  social_links: {},
};

interface SiteSettingsContextValue {
  siteSettings: SiteSetting | null;
  loading: boolean;
  error: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  siteSettings: DEFAULT_SETTINGS,
  loading: true,
  error: false,
});

export function SiteSettingsProvider({ children, initialSettings }: { children: ReactNode; initialSettings?: SiteSetting | null }) {
  const [siteSettings, setSiteSettings] = useState<SiteSetting | null>(initialSettings ?? DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(!initialSettings);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setLoading(false);
      return;
    }
    fetchSiteSettings()
      .then((data) => {
        setSiteSettings(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [initialSettings]);

  return (
    <SiteSettingsContext.Provider value={{ siteSettings, loading, error }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
