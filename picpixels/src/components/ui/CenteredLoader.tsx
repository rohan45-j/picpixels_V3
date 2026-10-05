'use client';

import styles from './CenteredLoader.module.css';

interface CenteredLoaderProps {
  text?: string;
  className?: string;
}

export default function CenteredLoader({ text = 'Loading', className = '' }: CenteredLoaderProps) {
  return (
    <div className={`${styles.overlay} ${className}`} role="status" aria-live="polite" aria-label="Loading">
      <div className={styles.loaderCard}>
        <div className={styles.spinnerWrap}>
          <div className={styles.spinnerOuter} />
          <div className={styles.spinnerInner} />
          <div className={styles.spinnerCenter} />
        </div>
        <div className={styles.loadingText}>
          <span>{text}</span>
          <span className={styles.dots}>
            <span className={styles.dot}>.</span>
            <span className={styles.dot}>.</span>
            <span className={styles.dot}>.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
