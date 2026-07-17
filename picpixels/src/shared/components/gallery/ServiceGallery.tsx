'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import type { ServiceGalleryImage } from '../../../services/public-api';
import BeforeAfterSlider from './BeforeAfterSlider';
import PortfolioGallery from './PortfolioGallery';
import GalleryLightbox from './GalleryLightbox';

interface ServiceGalleryProps {
  images: ServiceGalleryImage[];
  serviceTitle: string;
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`gallery-reveal ${visible ? 'gallery-reveal-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function ServiceGallery({ images, serviceTitle }: ServiceGalleryProps) {
  const visible = useMemo(
    () => images.filter((img) => img.is_visible !== false),
    [images],
  );

  const beforeAfter = useMemo(
    () => visible.filter((img) => img.gallery_type === 'before_after' && img.before_image && img.after_image),
    [visible],
  );

  const portfolio = useMemo(
    () => visible.filter((img) => img.gallery_type === 'portfolio'),
    [visible],
  );

  const [lightboxBeforeAfter, setLightboxBeforeAfter] = useState<number | null>(null);
  const [lightboxPortfolio, setLightboxPortfolio] = useState<number | null>(null);

  const baLightboxImages = useMemo(
    () => beforeAfter.map((img) => ({ src: img.after_image || img.image, alt: img.alt_text || img.caption })),
    [beforeAfter],
  );

  const portfolioLightboxImages = useMemo(
    () => portfolio.map((img) => ({ src: img.image, alt: img.alt_text || img.caption })),
    [portfolio],
  );

  if (visible.length === 0) return null;

  return (
    <section className="service-gallery-wrapper">
      {/* Section 1: Featured Before & After Showcase */}
      {beforeAfter.length > 0 && (
        <AnimatedSection>
          <div className="container">
            <div className="service-gallery-section">
              <h2 className="service-gallery-heading gradient-text">Featured Before & After Showcase</h2>
              <p className="service-gallery-desc">
                See the transformation quality of our {serviceTitle.toLowerCase()} service
              </p>
            </div>
            <div className="ba-grid">
              {beforeAfter.slice(0, 3).map((img, i) => (
                <AnimatedSection key={img.id || i} delay={i * 150}>
                  <div
                    className="ba-card"
                    onClick={() => {
                      const idx = beforeAfter.indexOf(img);
                      setLightboxBeforeAfter(idx);
                    }}
                  >
                    <BeforeAfterSlider
                      beforeImage={img.before_image!}
                      afterImage={img.after_image!}
                      beforeLabel="Before"
                      afterLabel="After"
                      alt={img.alt_text || img.caption || serviceTitle}
                    />
                    {img.caption && <p className="ba-card-caption">{img.caption}</p>}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {lightboxBeforeAfter !== null && beforeAfter[lightboxBeforeAfter] && (
        <GalleryLightbox
          images={baLightboxImages}
          currentIndex={lightboxBeforeAfter}
          onClose={() => setLightboxBeforeAfter(null)}
          onPrev={() => setLightboxBeforeAfter((i) => (i! > 0 ? i! - 1 : beforeAfter.length - 1))}
          onNext={() => setLightboxBeforeAfter((i) => (i! < beforeAfter.length - 1 ? i! + 1 : 0))}
        />
      )}

      {/* Section 2: Recent Portfolio Examples */}
      {portfolio.length > 0 && (
        <AnimatedSection delay={200}>
          <PortfolioGallery
            images={portfolio}
            title="Recent Portfolio Examples"
            subtitle="Browse our latest work samples across different categories"
            onImageClick={(i) => setLightboxPortfolio(i)}
          />
        </AnimatedSection>
      )}

      {lightboxPortfolio !== null && portfolio[lightboxPortfolio] && (
        <GalleryLightbox
          images={portfolioLightboxImages}
          currentIndex={lightboxPortfolio}
          onClose={() => setLightboxPortfolio(null)}
          onPrev={() => setLightboxPortfolio((i) => (i! > 0 ? i! - 1 : portfolio.length - 1))}
          onNext={() => setLightboxPortfolio((i) => (i! < portfolio.length - 1 ? i! + 1 : 0))}
        />
      )}
    </section>
  );
}
