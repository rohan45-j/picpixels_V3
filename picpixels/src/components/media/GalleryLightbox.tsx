'use client';

import { useEffect, useCallback, useRef } from 'react';
import styles from '@/styles/modules/gallery-lightbox.module.css';

interface LightboxImage {
  src: string;
  alt: string;
  label?: string;
}

interface GalleryLightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  isOpen?: boolean;
  title?: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function GalleryLightbox({
  images,
  currentIndex,
  isOpen = true,
  title = '',
  onClose,
  onPrev,
  onNext,
}: GalleryLightboxProps) {
  const current = images[currentIndex];
  const total = images.length;
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const linksRef = useRef<HTMLLinkElement[]>([]);

  const preloadSrc = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < images.length) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = images[idx].src;
        document.head.appendChild(link);
        linksRef.current.push(link);
        const tid = setTimeout(() => {
          link.remove();
          linksRef.current = linksRef.current.filter(l => l !== link);
        }, 2000);
        timeoutsRef.current.push(tid);
      }
    },
    [images]
  );

  useEffect(() => {
    if (isOpen) {
      preloadSrc(currentIndex - 1);
      preloadSrc(currentIndex + 1);
    }
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      linksRef.current.forEach(l => l.remove());
      linksRef.current = [];
    };
  }, [isOpen, currentIndex, preloadSrc]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [isOpen, onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) onNext();
      else onPrev();
    }
  }, [onNext, onPrev]);

  return (
    <div
      className={`${styles.overlay} ${!isOpen ? styles.hidden : ''}`}
      onClick={onClose}
      role="dialog"
      aria-label="Image gallery lightbox"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.backdrop} />

      <button className={styles.closeBtn} onClick={onClose} aria-label="Close lightbox">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
      </button>

      {total > 1 && (
        <>
          <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous image">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button className={`${styles.navBtn} ${styles.navNext}`} onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next image">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </>
      )}

      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        {current && (
          <img
            src={current.src}
            alt={current.alt}
            className={styles.image}
          />
        )}
      </div>

      <div className={styles.footer}>
        {total > 0 && (
          <>
            <span className={styles.counter}>
              {currentIndex + 1} / {total}
            </span>
            {current?.label && (
              <span className={styles.imageLabel}>{current.label}</span>
            )}
            {current?.alt && !current?.label && (
              <span className={styles.imageAlt}>{current.alt}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
