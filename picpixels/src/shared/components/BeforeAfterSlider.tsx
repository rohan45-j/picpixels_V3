'use client';
import { useRef, useState, useEffect, useCallback } from 'react';

interface Props {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({ beforeSrc, afterSrc, beforeLabel = 'Before', afterLabel = 'After' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    updatePosition(e.clientX);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setDragging(true);
    updatePosition(e.touches[0].clientX);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const cx = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      updatePosition(cx);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging, updatePosition]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        background: '#e5e7eb',
        cursor: 'ew-resize',
        userSelect: 'none',
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* After image (full width) */}
      <img
        src={afterSrc}
        alt={afterLabel}
        style={{ display: 'block', width: '100%', height: 'auto' }}
        draggable={false}
      />

      {/* Before image (clipped to slider position) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
        }}
      >
        <img
          src={beforeSrc}
          alt={beforeLabel}
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
          draggable={false}
        />
      </div>

      {/* Handle line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPos}%`,
          width: '3px',
          background: '#fff',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 2,
          boxShadow: '0 0 8px rgba(0,0,0,0.3)',
        }}
      />

      {/* Handle circle */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: `${sliderPos}%`,
          transform: 'translate(-50%, -50%)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
          pointerEvents: 'none',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#212529" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </div>

      {/* Labels */}
      <span
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          padding: '3px 12px',
          borderRadius: '9999px',
          background: 'rgba(0,0,0,0.55)',
          color: '#fff',
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        {beforeLabel}
      </span>
      <span
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          padding: '3px 12px',
          borderRadius: '9999px',
          background: 'rgba(0,0,0,0.55)',
          color: '#fff',
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        {afterLabel}
      </span>
    </div>
  );
}
