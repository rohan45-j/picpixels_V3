'use client';
import { useState, useEffect, useRef } from 'react';
import { mediaUrl, type ServiceBrandLogo } from '../../../services/public-api';
import SectionHeading from '../SectionHeading';
import trustStyles from '../TrustBar.module.css';

interface Props {
  logos: ServiceBrandLogo[]
  title?: string
}

export default function ServiceBrandLogosSection({ logos, title }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!logos?.length) return null;

  const uniqueLogos = [...new Map(logos.map(logo => [logo.id, logo])).values()];

  return (
    <section
      ref={sectionRef}
      className={`${trustStyles.section} ${visible ? trustStyles.visible : ''}`}
    >
      <div className={trustStyles.inner}>
        <div className={trustStyles.header}>
          <span className={trustStyles.badge}>Trusted by Businesses Worldwide</span>
          <SectionHeading text={title || 'Trusted by Leading Brands & Growing Businesses'} className={trustStyles.title} />
          <p className={trustStyles.description}>
            Join thousands of businesses that trust us for professional photo editing —
            delivered with speed, precision, and reliability.
          </p>
        </div>

        <div className={trustStyles.marqueeOuter}>
          <div className={trustStyles.marqueeTrack}>
            {uniqueLogos.map((logo, i) => {
              const logoSrc = logo.logo ? mediaUrl(logo.logo) : null;
              if (!logoSrc) {
                return (
                  <div key={logo.id} className={trustStyles.card}>
                    <span className={trustStyles.logoText}>{logo.brand_name}</span>
                  </div>
                );
              }
              return (
                <div key={logo.id} className={trustStyles.card}>
                  <img
                    src={logoSrc}
                    alt={logo.logo_alt || logo.brand_name}
                    className={trustStyles.logoImage}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  )
}