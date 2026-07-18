'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import HomeLink from '../shared/components/HomeLink';
import { useSiteSettings } from '../shared/contexts/SiteSettingsContext';
import styles from './Footer.module.css';
import { fetchFooterServices, mediaUrl, type Service } from '../services/public-api';

function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'facebook':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
        </svg>
      );
    case 'x':
    case 'twitter':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

export default function Footer() {
  const { siteSettings, loading: settingsLoading } = useSiteSettings();
  const [footerServices, setFooterServices] = useState<Service[]>([]);

  useEffect(() => {
    fetchFooterServices().then(setFooterServices);
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} container`}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <HomeLink className={styles.logo}>
              {settingsLoading ? (
                <div className={styles.logoSkeleton} />
              ) : siteSettings?.logo ? (
                <img src={mediaUrl(siteSettings.logo) ?? undefined} alt={siteSettings.logo_alt || siteSettings.site_name} />
              ) : siteSettings?.site_name ? (
                <span>{siteSettings.site_name}</span>
              ) : null}
            </HomeLink>
            <p className={styles.pitch}>
              {siteSettings?.tagline || 'PicPicxels offers top-quality services that enhance revenue, increase profit margins, reduce operational costs, and save valuable time.'}
            </p>
            <div className={styles.contactList}>
              {siteSettings?.support_email && (
                <a href={`mailto:${siteSettings.support_email}`} className={styles.contactItem}>
                  <Mail size={16} />
                  {siteSettings.support_email}
                </a>
              )}
              {siteSettings?.support_phone && (
                <a href={`tel:${siteSettings.support_phone}`} className={styles.contactItem}>
                  <Phone size={16} />
                  {siteSettings.support_phone}
                </a>
              )}
            </div>
            {siteSettings?.social_links && Object.keys(siteSettings.social_links).length > 0 && (
              <div className={styles.socials}>
                {Object.entries(siteSettings.social_links).map(([platform, url]) => (
                  <a key={platform} href={url} className={styles.socialLink} aria-label={platform} target="_blank" rel="noopener noreferrer">
                    <SocialIcon platform={platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className={styles.linksCol}>
            <h4 className={styles.title}>Services</h4>
            <ul className={styles.list}>
              {footerServices.slice(0, 5).map((svc) => (
                <li key={svc.id}>
                  <a href={`/services/${svc.slug}`}>{svc.title}</a>
                </li>
              ))}
              <li>
                <a href="/services" className={styles.allLink}>View All Services →</a>
              </li>
            </ul>
          </div>

          <div className={styles.linksCol}>
            <h4 className={styles.title}>Support</h4>
            <ul className={styles.list}>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/terms">Terms & Conditions</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            {siteSettings?.copyright_text || `© ${new Date().getFullYear()} ${siteSettings?.site_name || 'PicPicxels'}. All Rights Reserved.`}
          </p>
          <p className={styles.developedBy}>Developed by <a href="https://arntech.netlify.app/" target="_blank" rel="noopener noreferrer">ARN Tech</a></p>
        </div>
      </div>
    </footer>
  );
}
