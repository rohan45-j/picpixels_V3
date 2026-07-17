'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { mediaUrl, type PricingPromotion } from '../../services/public-api';
import styles from '../styles/modules/promotion-section.module.css';

export default function PromotionSection({ data }: { data: PricingPromotion | null }) {
  if (!data) return null;

  const desktopSrc = mediaUrl(data.image_desktop);
  const mobileSrc = mediaUrl(data.image_mobile);

  return (
    <section className={styles.section}>
      <div className={styles.glow} />

      <div className={styles.grid}>
        {/* ── LEFT: Text side ── */}
        <div className={styles.textCol}>
          {data.badge_text && (
            <div className={styles.badge}>
              <Sparkles size={12} />
              <span>{data.badge_text}</span>
            </div>
          )}

          {data.title && <h2 className={styles.title}>{data.title}</h2>}

          {data.subtitle && <p className={styles.subtitle}>{data.subtitle}</p>}

          {data.description && (
            <div
              className={styles.description}
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          )}

          {data.cta_text && (
            <Link href={data.cta_url || '/pricing'} className={styles.cta}>
              {data.cta_text} <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          )}
        </div>

        {/* ── RIGHT: Image side ── */}
        {(desktopSrc || mobileSrc) && (
          <div className={styles.imageCol}>
            {desktopSrc && (
              <img
                src={desktopSrc}
                alt={data.title || 'Promotion'}
                className={styles.imageDesktop}
                loading="lazy"
              />
            )}
            {mobileSrc && (
              <img
                src={mobileSrc}
                alt={data.title || 'Promotion'}
                className={styles.imageMobile}
                loading="lazy"
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
