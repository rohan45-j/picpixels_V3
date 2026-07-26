'use client';

import { useState, useMemo } from 'react';
import type { ServiceGalleryImage } from '@/services/public-api';

interface PortfolioGalleryProps {
  images: ServiceGalleryImage[];
  title?: string;
  subtitle?: string;
  onImageClick?: (index: number) => void;
}

export default function PortfolioGallery({ images, title, subtitle, onImageClick }: PortfolioGalleryProps) {
  const [activeFilter, setActiveFilter] = useState('all');

  const visible = useMemo(
    () => images.filter((img) => img.is_visible !== false),
    [images],
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    visible.forEach((img) => {
      if (img.category) cats.add(img.category);
    });
    return ['all', ...Array.from(cats)];
  }, [visible]);

  const filtered = useMemo(
    () => (activeFilter === 'all' ? visible : visible.filter((img) => img.category === activeFilter)),
    [visible, activeFilter],
  );

  if (visible.length === 0) return null;

  return (
    <section className="portfolio-gallery">
      <div className="container">
        {title && <h2 className="portfolio-gallery-title gradient-text">{title}</h2>}
        {subtitle && <p className="portfolio-gallery-subtitle">{subtitle}</p>}

        {categories.length > 1 && (
          <div className="portfolio-gallery-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`portfolio-filter-btn ${activeFilter === cat ? 'active' : ''}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}

        <div className="portfolio-gallery-grid">
          {filtered.map((img, i) => (
            <div
              key={img.id || i}
              className="portfolio-card"
              onClick={() => onImageClick?.(i)}
            >
              <div className="portfolio-card-img-wrap">
                <img
                  src={img.image}
                  alt={img.alt_text || img.caption || ''}
                  className="portfolio-card-img"
                  loading="lazy"
                  decoding="async"
                />
                <div className="portfolio-card-overlay">
                  <div className="portfolio-card-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                  </div>
                </div>
              </div>
              {(img.caption || img.category) && (
                <div className="portfolio-card-info">
                  {img.caption && <span className="portfolio-card-caption">{img.caption}</span>}
                  {img.category && <span className="portfolio-card-category">{img.category}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}