'use client';
import { ServicePricingTierCard } from '../../../services/public-api'
import SectionHeading from '../SectionHeading'
import Reveal from '../Reveal'
import pricingStyles from './ServicePricingSection.module.css'

interface PricingFeature {
  id?: number;
  text: string;
}

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
      <div className={pricingStyles.container}>
        <div className={pricingStyles.split}>
          <div className={pricingStyles.left}>
            <Reveal variant="fadeUp" once={false}>
              {badgeText && <span className={pricingStyles.badge}>{badgeText}</span>}
              {heading && <SectionHeading text={heading} className={pricingStyles.title} />}
              {description && <p className={pricingStyles.description}>{description}</p>}
              <a href={ctaLink || '#'} className={pricingStyles.ctaPrimary}>
              {ctaText || 'Get Started'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            </Reveal>
          </div>

          <div className={pricingStyles.right}>
            <Reveal variant="fadeUp" delay={150} once={false}>
              <div className={pricingStyles.premiumCard}>
                {popularCard?.badge_text && (
                  <span className={pricingStyles.cardBadge} style={{ backgroundColor: popularCard.badge_color || 'var(--color-primary)' }}>
                    {popularCard.badge_text}
                  </span>
                )}
                <span className={pricingStyles.cardLabel}>Starting From</span>
                <div className={pricingStyles.priceRow}>
                  <span className={pricingStyles.price}>{startingPrice || popularCard?.price || '$70'}</span>
                  <span className={pricingStyles.unit}>{unit || '/image'}</span>
                </div>
                {notes && <p className={pricingStyles.priceNotes}>{notes}</p>}
                
                {features && features.length > 0 && (
                  <ul className={pricingStyles.featureList}>
                    {features.map((feature, i) => (
                      <li key={i} className={pricingStyles.featureItem}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                {popularCard?.features && popularCard.features.length > 0 && (
                  <ul className={pricingStyles.featureList}>
                    {popularCard.features.map((feature, i) => (
                      <li key={i} className={pricingStyles.featureItem}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <a href={cta2Link || popularCard?.button_link || '#'} className={pricingStyles.ctaSecondary}>
                  {cta2Text || popularCard?.button_text || 'View All Plans'}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}