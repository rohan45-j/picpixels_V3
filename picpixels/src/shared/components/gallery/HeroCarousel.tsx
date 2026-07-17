'use client';

import { useState, useEffect, useCallback } from 'react';
import { mediaUrl } from '../../../services/public-api';
import type { ServiceHeroImage } from '../../../services/public-api';

interface HeroCarouselProps {
  images: ServiceHeroImage[];
  autoPlayInterval?: number;
}

export default function HeroCarousel({ images, autoPlayInterval = 4000 }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imgError, setImgError] = useState<Set<number>>(new Set());

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % images.length);
  }, [current, images.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + images.length) % images.length);
  }, [current, images.length, goTo]);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(next, autoPlayInterval);
    return () => clearInterval(timer);
  }, [next, images.length, autoPlayInterval]);

  const handleImgError = useCallback((id: number) => {
    setImgError(prev => new Set(prev).add(id));
  }, []);

  if (!images.length) return null;

  return (
    <div className="hero-carousel">
      <div className="hero-carousel-track">
        {images.map((img, i) => (
          <div
            key={img.id || i}
            className={`hero-carousel-slide ${i === current ? 'active' : ''}`}
            style={{ transform: `translateX(${(i - current) * 100}%)` }}
          >
            {!imgError.has(img.id ?? i) ? (
              <img
                src={mediaUrl(img.image)}
                alt={img.alt_text || `Slide ${i + 1}`}
                className="hero-carousel-img"
                onError={() => handleImgError(img.id ?? i)}
                decoding="async"
              />
            ) : (
              <div className="hero-carousel-fallback">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Image unavailable</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button className="hero-carousel-arrow hero-carousel-arrow-left" onClick={prev} aria-label="Previous slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="hero-carousel-arrow hero-carousel-arrow-right" onClick={next} aria-label="Next slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div className="hero-carousel-dots">
            {images.map((img, i) => (
              <button
                key={img.id || i}
                className={`hero-carousel-dot ${i === current ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}