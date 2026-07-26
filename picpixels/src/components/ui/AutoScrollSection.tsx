import React from 'react';
import styles from './AutoScrollSection.module.css';

/**
 * AutoScrollSection renders its children inside a horizontally scrolling container.
 * The scroll speed can be customized via the `speed` prop (seconds for a full loop).
 */
interface AutoScrollSectionProps {
  children: React.ReactNode;
  speed?: number; // seconds for a full scroll loop
}

export default function AutoScrollSection({ children, speed = 30 }: AutoScrollSectionProps) {
  return (
    <section
      className={styles.scrollContainer}
      aria-label="Features auto scroll"
      style={{ '--scroll-speed': `${speed}s` } as React.CSSProperties}
    >
      <div className={styles.scrollContent}>{children}</div>
    </section>
  );
}
