'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Reveal from '@/components/animations/Reveal';
import { fetchHomepageCTASection, type HomepageCTASection as HomepageCTAData } from '@/services/public-api';
import styles from './HomeCTASection.module.css';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface HomeCTASectionProps {
  data?: HomepageCTAData | null;
}

export default function HomeCTASection({ data: propData }: HomeCTASectionProps) {
  const [data, setData] = useState<HomepageCTAData | null | undefined>(propData);

  useEffect(() => {
    if (propData !== undefined) {
      setData(propData);
    } else {
      fetchHomepageCTASection().then((res) => {
        if (res) setData(res);
      });
    }
  }, [propData]);

  // If explicitly disabled in CMS, do not render
  if (data && data.is_active === false) {
    return null;
  }

  // Fallbacks for data fields
  const badgeText = data?.badge_text ?? 'Free Trial Available';
  const title = data?.title || 'Experience Our World-Class Photo Editing';
  const titleColor = data?.title_color || undefined;
  const subtitle = data?.subtitle || 'Get your quote within 45 minutes. Upload your images via Wetransfer or Dropbox. Your first (3-5) images are free. No credit card required.';

  // Dynamic button flags & values
  const hasPrimary = data ? (data.primary_button_is_active !== false && !!data.primary_button_text) : true;
  const primaryText = data?.primary_button_text || 'Start Free Trial →';
  const primaryLink = data?.primary_button_link || '/free-trial';

  const hasSecondary = data ? (data.secondary_button_is_active !== false && !!data.secondary_button_text) : true;
  const secondaryText = data?.secondary_button_text || 'Contact Us';
  const secondaryLink = data?.secondary_button_link || '/contact';

  return (
    <section className={styles.ctaSection} aria-label="Free Trial & Call to Action">
      <div className={styles.container}>
        <Reveal variant="fadeUp" once={false}>
          <div className={styles.card}>
            {/* Ambient decorative glow blobs */}
            <div className={styles.glowTopRight} aria-hidden="true" />
            <div className={styles.glowBottomLeft} aria-hidden="true" />

            <div className={styles.innerContent}>
              {badgeText && (
                <div className={styles.badge}>
                  <span className={styles.badgeDot} />
                  <span>{badgeText}</span>
                </div>
              )}

              <h2 className={styles.title} style={titleColor ? { color: titleColor } : undefined}>
                {title}
              </h2>

              {subtitle && (
                <p className={styles.subtitle}>
                  {subtitle}
                </p>
              )}

              {/* Dynamic Button Group: 1 button or 2 buttons */}
              {(hasPrimary || hasSecondary) && (
                <div className={styles.ctaGroup}>
                  {hasPrimary && (
                    <Link href={primaryLink} className={styles.primaryBtn}>
                      <span>{primaryText.replace('→', '').trim()}</span>
                      <ArrowRight className={styles.arrowIcon} size={18} />
                    </Link>
                  )}

                  {hasSecondary && (
                    <Link href={secondaryLink} className={styles.secondaryBtn}>
                      <span>{secondaryText}</span>
                    </Link>
                  )}
                </div>
              )}

              <div className={styles.trustNote}>
                <CheckCircle2 size={16} />
                <span>No credit card required • 24/7 dedicated support • 100% satisfaction guarantee</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
