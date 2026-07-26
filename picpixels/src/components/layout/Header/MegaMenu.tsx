'use client';

import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: -15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={styles.container}
    >
      <div className={styles.grid}>
        <div className={styles.servicesSection}>
          {services.length === 0 && (
            <p className={styles.emptyState}>Loading services...</p>
          )}
          <div className={styles.servicesGrid}>
            <div className={styles.servicesColumn}>
              {leftCol.map((svc, i) => (
                <motion.a
                  key={svc.id}
                  href={`/services/${svc.slug}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  whileHover={{ x: 4 }}
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
                  <div className={styles.itemContent}>
                    <span className={styles.menuLabel}>{svc.title}</span>
                    {svc.short_description && (
                      <span className={styles.menuDesc}>{svc.short_description}</span>
                    )}
                  </div>
                </motion.a>
              ))}
            </div>
            <div className={styles.servicesColumn}>
              {rightCol.map((svc, i) => (
                <motion.a
                  key={svc.id}
                  href={`/services/${svc.slug}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: (mid + i) * 0.04 }}
                  whileHover={{ x: 4 }}
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
                  <div className={styles.itemContent}>
                    <span className={styles.menuLabel}>{svc.title}</span>
                    {svc.short_description && (
                      <span className={styles.menuDesc}>{svc.short_description}</span>
                    )}
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
          <Link href="/services" className={styles.viewAllBtn}>
            View All Services
            <ArrowRight className={styles.viewAllIcon} />
          </Link>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.promoCard}>
            <div className={styles.promoBlob1} />
            <div className={styles.promoBlob2} />
            <div className={styles.promoOverlay} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className={styles.promoContent}
            >
              <h3 className={styles.promoTitle}>
                Transform Your Business With Professional Digital Solutions
              </h3>
              <p className={styles.promoSubtext}>
                Expert photo editing services tailored to your brand.
              </p>
              <Link href="/book-demo" className={styles.promoBtn}>
                Book a Free Demo
                <ArrowRight />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
