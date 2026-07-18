'use client';
import { ServicePricingTierCard } from '../../../services/public-api'
import SectionHeading from '../SectionHeading'
import Reveal from '../Reveal'
import pricingStyles from './ServicePricingSection.module.css'

interface Props {
  cards: ServicePricingTierCard[]
  badgeText?: string
  heading?: string
  description?: string
  startingPrice?: string
  unit?: string
  notes?: string
  features?: string[]
  ctaText?: string
  ctaLink?: string
  cta2Text?: string
  cta2Link?: string
}

export default function ServicePricingSection({
  cards,
  badgeText,
  heading,
  description,
  startingPrice,
  unit = '/image',
  notes,
  features,
  ctaText,
  ctaLink,
  cta2Text,
  cta2Link,
}: Props) {
  const popularCard = cards?.find(card => card.is_popular) || cards?.[0]

  if (!cards?.length) return null

  return (
    <section className={pricingStyles.section}>
      <div className={pricingStyles.bgOrbLarge} />
      <div className={pricingStyles.bgOrbSmall} />
      <div className={pricingStyles.bgPattern} />

      <div className={pricingStyles.container}>
        <Reveal variant="fadeUp" once={false}>
          <div className={pricingStyles.header}>
            {badgeText && <span className={pricingStyles.badge}>{badgeText}</span>}
            {heading && <SectionHeading text={heading} className={pricingStyles.heading} />}
            {description && <p className={pricingStyles.description}>{description}</p>}
          </div>
        </Reveal>

        <div className={pricingStyles.grid}>
          <Reveal variant="fadeUp" delay={100} once={false}>
            <div className={pricingStyles.pricingCard}>
              <div className={pricingStyles.cardGlow} />

              {popularCard?.badge_text && (
                <span
                  className={pricingStyles.cardBadge}
                  style={{ backgroundColor: popularCard.badge_color || 'var(--color-primary)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {popularCard.badge_text}
                </span>
              )}

              <span className={pricingStyles.cardLabel}>Starting from</span>

              <div className={pricingStyles.priceRow}>
                <span className={pricingStyles.priceCurrency}>$</span>
                <span className={pricingStyles.price}>
                  {startingPrice || popularCard?.price || '70'}
                </span>
                <span className={pricingStyles.unit}>{unit}</span>
              </div>

              {notes && <p className={pricingStyles.notes}>{notes}</p>}

              <div className={pricingStyles.divider} />

              {features && features.length > 0 && (
                <ul className={pricingStyles.featureList}>
                  {features.map((feature, i) => (
                    <li key={i} className={pricingStyles.featureItem}>
                      <span className={pricingStyles.checkIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {popularCard?.features && popularCard.features.length > 0 && (
                <ul className={pricingStyles.featureList}>
                  {popularCard.features.map((feature, i) => (
                    <li key={i} className={pricingStyles.featureItem}>
                      <span className={pricingStyles.checkIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <a
                href={cta2Link || popularCard?.button_link || '#'}
                className={pricingStyles.ctaButton}
              >
                {cta2Text || popularCard?.button_text || 'Get Started Now'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </Reveal>

          <Reveal variant="fadeUp" delay={200} once={false}>
            <div className={pricingStyles.contentRight}>
              <span className={pricingStyles.featuredTag}>What&apos;s Included</span>
              <h3 className={pricingStyles.contentTitle}>
                Everything you need for <span className={pricingStyles.highlight}>professional results</span>
              </h3>
              <p className={pricingStyles.contentText}>
                Get access to our full suite of editing services with guaranteed quality, 
                fast turnaround, and dedicated support from experienced professionals.
              </p>

              <div className={pricingStyles.benefitGrid}>
                <div className={pricingStyles.benefitItem}>
                  <div className={pricingStyles.benefitIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20V10M18 20V4M6 20v-4"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Quality Guaranteed</strong>
                    <span>100% satisfaction or revision</span>
                  </div>
                </div>
                <div className={pricingStyles.benefitItem}>
                  <div className={pricingStyles.benefitIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Fast Turnaround</strong>
                    <span>24-48 hour delivery</span>
                  </div>
                </div>
                <div className={pricingStyles.benefitItem}>
                  <div className={pricingStyles.benefitIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Secure & Confidential</strong>
                    <span>Your files are always safe</span>
                  </div>
                </div>
                <div className={pricingStyles.benefitItem}>
                  <div className={pricingStyles.benefitIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Dedicated Support</strong>
                    <span>Personal account manager</span>
                  </div>
                </div>
              </div>

              <a href={ctaLink || '#'} className={pricingStyles.secondaryCta}>
                {ctaText || 'Learn More'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
