'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { MapPin, X, Globe } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';
import styles from '@/styles/modules/services.module.css';
import type { Service } from '@/services/public-api';
import OptimizedImage from '@/components/media/OptimizedImage';

function formatLocationName(loc: string): string {
  if (!loc) return '';
  return loc
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ServicesClient({
  services,
  initialLocation = '',
}: {
  services: Service[];
  initialLocation?: string;
}) {
  const activeLocation = initialLocation.trim();
  const formattedLocation = formatLocationName(activeLocation);

  // Client-side filtering as safety & immediate interactivity
  const filteredServices = useMemo(() => {
    if (!activeLocation) {
      return services.filter((s) => s.is_active !== false);
    }
    const target = activeLocation.toLowerCase().replace(/\s+/g, '-');
    const targetRaw = activeLocation.toLowerCase();

    return services.filter((s) => {
      if (s.is_active === false) return false;
      // If service has no specific locations defined, it is available everywhere
      if (!s.available_locations || s.available_locations.length === 0) return true;

      return s.available_locations.some((loc) => {
        const l = loc.toLowerCase().trim();
        return l === targetRaw || l.replace(/\s+/g, '-') === target;
      });
    });
  }, [services, activeLocation]);

  return (
    <main>
      <Reveal variant="fadeDown">
        <section className={styles.headerSection}>
          <div className={styles.headerContent}>
            {activeLocation ? (
              <>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 9999, background: 'rgba(255, 138, 80, 0.12)', color: '#ea580c', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                  <MapPin size={14} />
                  <span>Location: {formattedLocation}</span>
                </div>
                <h1 className={styles.title} style={{ color: '#000000' }}>
                  Photo Editing Services in {formattedLocation}
                </h1>
                <p className={styles.subtitle}>
                  Showing services available for clients in {formattedLocation}. Your trusted virtual photo editing studio.
                </p>

                {/* Clear Location Filter Button */}
                <div style={{ marginTop: 14 }}>
                  <Link
                    href="/services"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#0f172a',
                      color: '#ffffff',
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <X size={14} />
                    <span>View All Locations (Clear Filter)</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className={styles.title} style={{ color: '#000000' }}>Our Photo Editing Services</h1>
                <p className={styles.subtitle}>
                  {services.length} services available. Your trusted virtual photo editing studio.
                </p>
              </>
            )}
          </div>
        </section>
      </Reveal>

      <Reveal variant="fadeUp">
        <section className="container" style={{ padding: '4rem 0' }}>
          {filteredServices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', maxWidth: 600, margin: '0 auto' }}>
              <MapPin size={36} color="#94a3b8" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                No services specifically found for {formattedLocation}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: 20 }}>
                We serve global clients! Browse our complete catalog of professional visual editing solutions.
              </p>
              <Link
                href="/services"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#FF8A50',
                  color: '#ffffff',
                  padding: '8px 20px',
                  borderRadius: 10,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <span>Browse All Services</span>
              </Link>
            </div>
          ) : (
            <div className={styles.serviceIndexGrid}>
              {filteredServices.map((svc, i) => {
                const link = svc.slug ? `/services/${svc.slug}` : '/services';
                const hasSpecificLocations = svc.available_locations && svc.available_locations.length > 0;

                return (
                  <Link href={link} key={svc.id || i} className={styles.serviceIndexCard}>
                    {svc.image ? (
                      <OptimizedImage
                        src={svc.image}
                        alt={svc.image_alt || svc.title}
                        width={400}
                        height={180}
                        className={styles.serviceCardImg}
                      />
                    ) : svc.icon ? (
                      <span className={styles.serviceIndexIcon}>{svc.icon}</span>
                    ) : null}

                    {/* Location Badge */}
                    <div style={{ marginTop: 8, marginBottom: 4 }}>
                      {hasSpecificLocations ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.725rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                          <MapPin size={11} />
                          <span>{svc.available_locations!.join(', ')}</span>
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.725rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                          <Globe size={11} />
                          <span>Available Globally</span>
                        </span>
                      )}
                    </div>

                    <h3 className={styles.serviceIndexTitle}>{svc.title}</h3>
                    <p className={styles.serviceIndexDesc}>{svc.short_description || svc.description}</p>

                    {svc.features && svc.features.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                        {svc.features.slice(0, 3).map((feat, fi) => (
                          <span
                            key={fi}
                            style={{
                              fontSize: '0.75rem',
                              background: 'var(--primary-subtle, rgba(99,102,241,0.1))',
                              color: 'var(--primary)',
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}
                          >
                            {feat}
                          </span>
                        ))}
                        {svc.features.length > 3 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            +{svc.features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <span className={styles.serviceIndexPrice}>
                      From ${parseFloat(svc.price || '0').toFixed(2)}/image
                    </span>
                    <span className={styles.serviceIndexLink}>Learn More →</span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </Reveal>
    </main>
  );
}
