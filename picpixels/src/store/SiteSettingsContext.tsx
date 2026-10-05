'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { fetchSiteSettings, type SiteSetting } from '@/services/public-api';

const DEFAULT_SETTINGS: SiteSetting = {
  site_name: 'PicPicxels',
  tagline: 'Professional Photo Editing Services at Affordable Pricing',
  support_email: 'info@picpicxels.com',
  support_phone: '+880 1622915832',
  copyright_text: '© PicPicxels. All Rights Reserved.',
  address: '71&45, House, Road-28, Dhaka 1230, Bangladesh',
  social_links: {
    facebook: 'https://www.facebook.com/picpicxelsLTD',
    linkedin: 'https://www.linkedin.com/company/photoexpert-bd/',
    instagram: 'https://www.instagram.com/picpicxelsltd/',
    pinterest: 'https://www.pinterest.com/picpicxels/',
  },
  footer_location_title: 'Location Based Services',
  footer_locations: 'Texas\nCalifornia\nFlorida\nNew York\nArizona\nNevada\nColorado\nWashington\nNew Jersey',
  usa_office_title: 'Corporate Office - USA',
  usa_office_phone: '+1 409 419 3704',
  usa_office_email: 'info@picpixels.com',
  usa_office_address: '3150 Roswell Rd. NW #1004, Atlanta, GA 30305, USA',
  bd_office_title: 'Production House - Bangladesh',
  bd_office_phone: '+880 1622915832',
  bd_office_email: 'info@picpixels.com',
  bd_office_address: '71&45, House, Road-28, Dhaka 1230, Bangladesh',
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
