import { ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';
import styles from './MegaMenu.module.css';
import type { Service } from '@/services/public-api';

interface MegaMenuProps {
  services: Service[];
}

export default function MegaMenu({ services }: MegaMenuProps) {
  const mid = Math.ceil(services.length / 2);
  const leftCol = services.slice(0, mid);
  const rightCol = services.slice(mid);

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.servicesSection}>
          {services.length === 0 && (
            <p className={styles.emptyState}>Loading services...</p>
          )}
          <div className={styles.servicesGrid}>
            <div className={styles.servicesColumn}>
              {leftCol.map((svc) => (
                <Link
                  key={svc.id}
                  href={`/services/${svc.slug}`}
                  prefetch={true}
                  className={styles.menuItem}
                >
                  <div className={styles.iconBox}>
                    {svc.icon ? (
                      <span
                        className={styles.iconEmoji}
                        dangerouslySetInnerHTML={{ __html: svc.icon }}
                      />
                    ) : (
                      <FileText />
                    )}
                  </div>
                  <span className={styles.menuLabel}>{svc.title}</span>
                </Link>
              ))}
            </div>
            <div className={styles.servicesColumn}>
              {rightCol.map((svc) => (
                <Link
                  key={svc.id}
                  href={`/services/${svc.slug}`}
                  prefetch={true}
                  className={styles.menuItem}
                >
                  <div className={styles.iconBox}>
                    {svc.icon ? (
                      <span
                        className={styles.iconEmoji}
                        dangerouslySetInnerHTML={{ __html: svc.icon }}
                      />
                    ) : (
                      <FileText />
                    )}
                  </div>
                  <span className={styles.menuLabel}>{svc.title}</span>
                </Link>
              ))}
            </div>
          </div>
          <Link href="/services" prefetch={true} className={styles.viewAllBtn}>
            View All Services
            <ArrowRight className={styles.viewAllIcon} />
          </Link>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.promoCard}>
            <div className={styles.promoBlob1} />
            <div className={styles.promoBlob2} />
            <div className={styles.promoOverlay} />
            <div className={styles.promoContent}>
              <h3 className={styles.promoTitle}>
                Transform Your Business With Professional Digital Solutions
              </h3>
              <p className={styles.promoSubtext}>
                Expert photo editing services tailored to your brand.
              </p>
              <Link href="/free-trial" className={styles.promoBtn}>
                Free Trial
                <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
