'use client';
import { useState, useEffect, useRef } from 'react';
import { mediaUrl, type BrandLogo } from '@/services/public-api';
import SectionHeading from './SectionHeading';
import styles from './TrustBar.module.css';

export default function TrustBar({ brands: initialBrands }: { brands: BrandLogo[] }) {
  const [brands, setBrands] = useState<BrandLogo[]>(initialBrands);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setBrands(initialBrands);
  }, [initialBrands]);

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

  if (brands.length === 0) {
    return (
      <section ref={sectionRef} className={`${styles.section} ${visible ? styles.visible : ''}`}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <SectionHeading text="Trusted by Leading Brands &amp; Businesses" className={styles.title} />
            <p className={styles.description}>
              Join thousands of businesses that trust us for professional photo editing —
              delivered with speed, precision, and reliability.
            </p>
          </div>
          <div className={styles.marqueeOuter}>
            <div className={styles.marqueeTrack}>
              {[1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8].map((_, i) => (
                <div key={i} className={styles.card}>
                  <div style={{ width: 120, height: 40, background: '#e5e7eb', borderRadius: 6 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const duplicatedBrands = [...brands, ...brands];

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${visible ? styles.visible : ''}`}
    >
      <div className={styles.inner}>
        <div className={styles.header}>
            <SectionHeading text="Trusted by Leading Brands &amp; Businesses" className={styles.title} />
          <p className={styles.description}>
            Join thousands of businesses that trust us for professional photo editing —
            delivered with speed, precision, and reliability.
          </p>
        </div>

        <div className={styles.marqueeOuter}>
          <div className={styles.marqueeTrack}>
            {duplicatedBrands.map((brand, i) => {
              const logoSrc = brand.logo ? mediaUrl(brand.logo) : null;
              if (!logoSrc) {
                return (
                  <div key={`${brand.id}-${i}`} className={styles.card}>
                    <span className={styles.logoText}>{brand.name}</span>
                  </div>
                );
              }
              return (
                <div key={`${brand.id}-${i}`} className={styles.card}>
                  <img
                    src={logoSrc}
                    alt={brand.name}
                    className={styles.logoImage}
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
  );
}
