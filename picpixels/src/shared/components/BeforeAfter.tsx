'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './BeforeAfter.module.css';

interface BeforeAfterProps {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  showLabels?: boolean;
  className?: string;
}

export default function BeforeAfter({
  beforeImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=75&w=1200&auto=format&fit=crop&fm=webp',
  afterImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=75&w=1200&auto=format&fit=crop&fm=webp&sat=-100&contrast=150',
  beforeLabel = 'Before',
  afterLabel = 'After',
  showLabels = true,
  className = ''
}: BeforeAfterProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  }, [handleMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };
    const handleEnd = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <div
      className={`${styles.container} ${className} ${isDragging ? styles.dragging : ''}`}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="slider"
      aria-label="Before and after image comparison"
      aria-valuenow={Math.round(sliderPosition)}
      tabIndex={0}
    >
      {/* Before image — base (always fully visible) */}
      <img
        src={beforeImage}
        alt={beforeLabel}
        className={styles.image}
        draggable={false}
      />

      {/* After image — clipped overlay */}
      <div
        className={styles.afterContainer}
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={afterImage}
          alt={afterLabel}
          className={styles.image}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className={styles.sliderBar}
        style={{ left: `${sliderPosition}%` }}
      >
        <div className={styles.handle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      {showLabels && (
        <>
          <span className={`${styles.label} ${styles.labelBefore}`}>{beforeLabel}</span>
          <span className={`${styles.label} ${styles.labelAfter}`}>{afterLabel}</span>
        </>
      )}
    </div>
  );
}
