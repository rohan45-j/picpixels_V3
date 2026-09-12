'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import HomeLink from '@/components/layout/HomeLink';
import { useSiteSettings } from '@/store/SiteSettingsContext';
import styles from './styles.module.css';
import { mediaUrl, type Service, type SiteSetting, type HomepageCTASection as HomepageCTAData } from '@/services/public-api';
import OptimizedImage from '@/components/media/OptimizedImage';
import HomeCTASection from '@/components/ui/HomeCTASection';

export default function Footer({
  siteSettings: serverSettings,
  footerServices: _serverFooterServices,
  homepageCTA,
  hideCTA = false,
}: {
  siteSettings?: SiteSetting | null;
  footerServices?: Service[];
  homepageCTA?: HomepageCTAData | null;
  hideCTA?: boolean;
}) {
  const ctx = useSiteSettings();
  const siteSettings = serverSettings || ctx.siteSettings;
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const siteName = siteSettings?.site_name || 'PicPixels';

  // Location Based Services (Editable from Django Admin)
  const locationTitle = siteSettings?.footer_location_title || 'Location Based Services';
  const rawLocations = siteSettings?.footer_locations || 'Texas\nCalifornia\nFlorida\nNew York';
  const locationItems = rawLocations
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.includes('|')) {
        const [name, url] = line.split('|').map((s) => s.trim());
        return {
          name,
          url: url || `/services?location=${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`,
        };
      }
      return {
        name: line,
        url: `/services?location=${encodeURIComponent(line.toLowerCase().replace(/\s+/g, '-'))}`,
      };
    });

  // Corporate Office – USA (Fully dynamic from Django Admin - no hardcoded fallbacks)
  const usaTitle = siteSettings?.usa_office_title?.trim() || '';
  const usaPhone = siteSettings?.usa_office_phone?.trim() || '';
  const usaEmail = siteSettings?.usa_office_email?.trim() || '';
  const usaAddress = siteSettings?.usa_office_address?.trim() || '';
  const hasUsaOffice = Boolean(usaTitle || usaPhone || usaEmail || usaAddress);

  // Production House – Bangladesh (Fully dynamic from Django Admin)
  const bdTitle = siteSettings?.bd_office_title?.trim() || '';
  const bdPhone = siteSettings?.bd_office_phone?.trim() || siteSettings?.support_phone?.trim() || '';
  const bdEmail = siteSettings?.bd_office_email?.trim() || siteSettings?.support_email?.trim() || '';
  const bdAddress = siteSettings?.bd_office_address?.trim() || siteSettings?.address?.trim() || '';
  const hasBdOffice = Boolean(bdTitle || bdPhone || bdEmail || bdAddress);

  // Social Links
  const socials = siteSettings?.social_links || {};
  const facebookUrl = socials.facebook || 'https://www.facebook.com/picpicxelsLTD';
  const xUrl = socials.x || socials.twitter || 'https://x.com';
  const linkedinUrl = socials.linkedin || 'https://www.linkedin.com/company/photoexpert-bd/';
  const instagramUrl = socials.instagram || 'https://www.instagram.com/picpicxelsltd/';
  const artstationUrl = socials.artstation || 'https://www.artstation.com';
  const redditUrl = socials.reddit || 'https://www.reddit.com';
  const behanceUrl = socials.behance || 'https://www.behance.net';

  return (
    <>
      {!hideCTA && <HomeCTASection data={homepageCTA} />}

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Column 1: Brand & Tagline */}
            <div className={styles.brandCol}>
              <HomeLink className={styles.logo}>
                {siteSettings?.logo && mediaUrl(siteSettings.logo) ? (
                  <OptimizedImage
                    src={mediaUrl(siteSettings.logo)!}
                    alt={siteSettings.logo_alt || siteName}
                    width={180}
                    height={50}
                  />
                ) : (
                  <span>{siteName}</span>
                )}
              </HomeLink>
              <p className={styles.pitch}>
                {siteSettings?.tagline ||
                  'Professional Photo Editing Services at Affordable Pricing'}
              </p>
            </div>

            {/* Column 2: Resources */}
            <div className={styles.linksCol}>
              <h4 className={styles.colTitle}>Resources</h4>
              <ul className={styles.list}>
                <li><Link href="/guid">Guides</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/case-studies">Case Studies</Link></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className={styles.linksCol}>
              <h4 className={styles.colTitle}>{siteName}</h4>
              <ul className={styles.list}>
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/pricing">Price</Link></li>
              </ul>
            </div>

            {/* Column 4: Location Based Services Accordion Card */}
            <div className={styles.locationCol}>
              <div className={styles.locationCard}>
                <div
                  className={styles.locationHeader}
                  onClick={() => setIsLocationOpen(!isLocationOpen)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsLocationOpen(!isLocationOpen)}
                >
                  <span>{locationTitle}</span>
                  {isLocationOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>

                {isLocationOpen && (
                  <ul className={styles.locationList}>
                    {locationItems.map((item, idx) => (
                      <li key={idx}>
                        <Link href={item.url}>{item.name}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Column 5: OFFICE ADDRESS */}
            {(hasUsaOffice || hasBdOffice) && (
              <div className={styles.addressCol}>
                <h4 className={styles.addressTitle}>OFFICE ADDRESS</h4>

                {/* USA Office Block */}
                {hasUsaOffice && (
                  <div className={styles.officeBlock}>
                    {usaTitle && (
                      <div className={styles.officeHeading}>
                        <span>🇺🇸</span> {usaTitle}
                      </div>
                    )}
                    {usaPhone && (
                      <a href={`tel:${usaPhone.replace(/\s+/g, '')}`} className={styles.addressItem}>
                        <span className={styles.itemIcon}>📞</span>
                        <span>{usaPhone}</span>
                      </a>
                    )}
                    {usaEmail && (
                      <a href={`mailto:${usaEmail}`} className={styles.addressItem}>
                        <span className={styles.itemIcon}>✉️</span>
                        <span>{usaEmail}</span>
                      </a>
                    )}
                    {usaAddress && (
                      <div className={styles.addressItem}>
                        <span className={styles.itemIcon}>🏢</span>
                        <span>{usaAddress}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bangladesh Office Block */}
                {hasBdOffice && (
                  <div className={styles.officeBlock}>
                    {bdTitle && (
                      <div className={styles.officeHeading}>
                        <span>🇧🇩</span> {bdTitle}
                      </div>
                    )}
                    {bdPhone && (
                      <a href={`tel:${bdPhone.replace(/\s+/g, '')}`} className={styles.addressItem}>
                        <span className={styles.itemIcon}>📞</span>
                        <span>{bdPhone}</span>
                      </a>
                    )}
                    {bdEmail && (
                      <a href={`mailto:${bdEmail}`} className={styles.addressItem}>
                        <span className={styles.itemIcon}>✉️</span>
                        <span>{bdEmail}</span>
                      </a>
                    )}
                    {bdAddress && (
                      <div className={styles.addressItem}>
                        <span className={styles.itemIcon}>🏢</span>
                        <span>{bdAddress}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className={styles.bottom}>
            <p className={styles.copy}>
              © {siteName} LLC 2018-{currentYear}
            </p>

            <div className={styles.legalLinks}>
              <Link href="/terms" className={styles.legalLink}>Terms of Service</Link>
              <Link href="/privacy" className={styles.legalLink}>Privacy</Link>
            </div>

            {/* Circular Social Buttons */}
            <div className={styles.socials}>
              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                aria-label="Facebook"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href={xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                aria-label="X"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                aria-label="LinkedIn"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                aria-label="Instagram"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* Artstation */}
              <a
                href={artstationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                aria-label="Artstation"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 17.723l2.027 3.509h.002a2.42 2.42 0 002.164 1.332h13.257l-2.92-5.061H0v.22zm24-.515L15.344 2.434a2.43 2.43 0 00-2.12-1.2h-.032a2.41 2.41 0 00-2.102 1.229L9.845 4.604l10.96 18.986h.002c.453-.25.83-.623 1.085-1.076l2.108-3.662a2.43 2.43 0 000-2.444zM8.307 7.27L3.197 16.12h10.222L8.307 7.27z"/>
                </svg>
              </a>

              {/* Reddit */}
              <a
                href={redditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                aria-label="Reddit"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-4.722 3.829c-.068.001-.137.027-.189.079-.104.104-.104.273 0 .377 1.026 1.026 3.02 1.026 4.046 0 .104-.104.104-.273 0-.377-.104-.104-.273-.104-.377 0-.819.819-2.474.819-3.293 0a.267.267 0 0 0-.187-.079z"/>
                </svg>
              </a>

              {/* Behance */}
              <a
                href={behanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                aria-label="Behance"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-4.254 0-5.834-3.097-5.834-6.042 0-3.666 2.379-6.082 5.748-6.082 3.655 0 5.378 2.686 5.378 6.082 0 .524-.047 1.139-.107 1.488h-8.08c.088 1.637 1.082 2.768 2.784 2.768 1.405 0 2.215-.769 2.56-1.504l2.652.29zm-7.85-4.225h5.059c-.115-1.402-.857-2.441-2.449-2.441-1.558 0-2.395 1.039-2.61 2.441zm-10.876 7.225h-5v-14h5.719c3.09 0 4.887 1.542 4.887 4.148 0 1.564-.816 2.871-2.094 3.513 1.579.52 2.488 1.957 2.488 3.738 0 2.924-2.128 4.601-6 4.601zm-2.344-8.497h2.228c1.55 0 2.469-.646 2.469-1.928 0-1.192-.85-1.848-2.338-1.848h-2.359v3.776zm0 2.417v4.301h2.511c1.68 0 2.684-.783 2.684-2.164 0-1.483-1.078-2.137-2.732-2.137h-2.463z"/>
                </svg>
              </a>
            </div>

            <div className={styles.developedBy}>
              Developed by{' '}
              <a href="https://arntech.netlify.app/" target="_blank" rel="noopener noreferrer">
                ARN Tech
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
