'use client';

import { useState, useMemo } from 'react';
import { mediaUrl, type ServiceGalleryImage } from '@/services/public-api';

interface PortfolioGalleryProps {
  images: ServiceGalleryImage[];
  title?: string;
  subtitle?: string;
  onImageClick?: (index: number) => void;
}

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
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

  if (visible.length === 0) return null;

  return (
    <section className="portfolio-gallery">
      <div className="container">
        {title && <h2 className="portfolio-gallery-title" style={{ color: '#000000' }}>{title}</h2>}
        {subtitle && <p className="portfolio-gallery-subtitle">{subtitle}</p>}

        <div className="portfolio-gallery-controls">
          {/* Native Radio inputs for pure CSS tab switching without JavaScript */}
          {categories.map((cat) => {
            const slug = toSlug(cat);
            return (
              <input
                key={cat}
                type="radio"
                name="portfolio_gallery_filter"
                id={`tab-${slug}`}
                className="portfolio-tab-radio"
                defaultChecked={cat === 'all'}
                onChange={() => setActiveFilter(cat)}
              />
            );
          })}

          {/* Filter Tab Labels */}
          {categories.length > 1 && (
            <div className="portfolio-gallery-filters">
              {categories.map((cat) => {
                const slug = toSlug(cat);
                return (
                  <label
                    key={cat}
                    htmlFor={`tab-${slug}`}
                    className={`portfolio-filter-btn ${activeFilter === cat ? 'active' : ''}`}
                    onClick={() => setActiveFilter(cat)}
                  >
                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </label>
                );
              })}
            </div>
          )}

          {/* Dynamic pure CSS rules - enables instant tab filtering without JavaScript */}
          <style>{`
            .portfolio-tab-radio {
              position: absolute;
              opacity: 0;
              width: 0;
              height: 0;
              margin: 0;
              pointer-events: none;
            }
            #tab-all:checked ~ .portfolio-gallery-filters label[for="tab-all"] {
              background: var(--color-primary, #ff8a50) !important;
              color: #ffffff !important;
              border-color: var(--color-primary, #ff8a50) !important;
              box-shadow: 0 4px 12px rgba(255, 138, 80, 0.3) !important;
            }
            #tab-all:checked ~ .portfolio-gallery-grid .portfolio-card {
              display: block !important;
            }
            ${categories
              .filter((c) => c !== 'all')
              .map((cat) => {
                const slug = toSlug(cat);
                return `
                  #tab-${slug}:checked ~ .portfolio-gallery-filters label[for="tab-${slug}"] {
                    background: var(--color-primary, #ff8a50) !important;
                    color: #ffffff !important;
                    border-color: var(--color-primary, #ff8a50) !important;
                    box-shadow: 0 4px 12px rgba(255, 138, 80, 0.3) !important;
                  }
                  #tab-${slug}:checked ~ .portfolio-gallery-grid .portfolio-card:not([data-category="${slug}"]) {
                    display: none !important;
                  }
                  #tab-${slug}:checked ~ .portfolio-gallery-grid .portfolio-card[data-category="${slug}"] {
                    display: block !important;
                  }
                `;
              })
              .join('\n')}
          `}</style>

          {/* Portfolio Grid */}
          <div className="portfolio-gallery-grid">
            {visible.map((img, i) => {
              const catSlug = img.category ? toSlug(img.category) : 'all';
              return (
                <div
                  key={img.id || i}
                  className="portfolio-card"
                  data-category={catSlug}
                  onClick={() => onImageClick?.(i)}
                >
                  <div className="portfolio-card-img-wrap">
                    <img
                      src={mediaUrl(img.image) || img.image}
                      alt={img.alt_text || img.caption || ''}
                      className="portfolio-card-img"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="portfolio-card-overlay">
                      <div className="portfolio-card-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                        </svg>
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
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}