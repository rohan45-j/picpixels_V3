'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { fetchSiteSettings, type SiteSetting } from '../../services/public-api';

interface SiteSettingsContextValue {
  siteSettings: SiteSetting | null;
  loading: boolean;
  error: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  siteSettings: null,
  loading: true,
  error: false,
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [siteSettings, setSiteSettings] = useState<SiteSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchSiteSettings()
      .then((data) => {
        setSiteSettings(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ siteSettings, loading, error }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
