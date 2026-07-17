'use client';

import Link from 'next/link';
import Reveal from '../../shared/components/Reveal';
import styles from '../../shared/styles/modules/services.module.css';
import type { Service } from '../../services/public-api';

export default function ServicesClient({ services }: { services: Service[] }) {
  return (
    <main>
      <Reveal variant="fadeDown">
        <section className={styles.headerSection}>
          <div className={styles.headerContent}>
            <h1 className={`${styles.title} gradient-text`}>Our Photo Editing Services</h1>
            <p className={styles.subtitle}>
              {services.length} services available. Your trusted virtual photo editing studio.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal variant="fadeUp">
        <section className="container" style={{ padding: '4rem 0' }}>
          {services.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <p>No services available at the moment. Please check back later.</p>
            </div>
          )}
          <div className={styles.serviceIndexGrid}>
            {services.filter((s) => s.is_active !== false).map((svc, i) => {
              const link = svc.slug ? `/services/${svc.slug}` : '/services';
              return (
                <Link href={link} key={svc.id || i} className={styles.serviceIndexCard}>
                  {svc.image ? (
                    <img src={svc.image} alt={svc.image_alt || svc.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }} loading="lazy" />
                  ) : svc.icon ? (
                    <span className={styles.serviceIndexIcon}>{svc.icon}</span>
                  ) : null}
                  <h3 className={styles.serviceIndexTitle}>{svc.title}</h3>
                  <p className={styles.serviceIndexDesc}>{svc.short_description || svc.description}</p>
                  {svc.features && svc.features.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                      {svc.features.slice(0, 3).map((feat, fi) => (
                        <span key={fi} style={{ fontSize: '0.75rem', background: 'var(--primary-subtle, rgba(99,102,241,0.1))', color: 'var(--primary)', padding: '2px 8px', borderRadius: 4 }}>{feat}</span>
                      ))}
                      {svc.features.length > 3 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{svc.features.length - 3} more</span>}
                    </div>
                  )}
                  <span className={styles.serviceIndexPrice}>From ${parseFloat(svc.price || '0').toFixed(2)}/image</span>
                  <span className={styles.serviceIndexLink}>Learn More →</span>
                </Link>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal variant="fadeUp">
        <section className={styles.ctaSection}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2>Need a Custom Solution?</h2>
            <p>Contact us for bulk discounts and custom project requirements.</p>
            <Link href="/contact" className="btn btn-primary btn-lg">Contact Us</Link>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
