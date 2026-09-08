'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { mediaUrl, type PortfolioItem, type PortfolioCategory } from '@/services/public-api';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/animations/Reveal';
import GalleryLightbox from '@/components/media/GalleryLightbox';
import styles from '@/styles/modules/portfolio-grid.module.css';

export default function PortfolioGrid({
  portfolios,
  categories,
}: {
  portfolios: PortfolioItem[];
  categories: PortfolioCategory[];
}) {
  const [activeCategory, setActiveCategory] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () =>
      activeCategory === ''
        ? portfolios
        : portfolios.filter((item) => item.category_slug === activeCategory),
    [activeCategory, portfolios]
  );

  const lightboxImages = useMemo(() => {
    return items.map((item) => ({
      src: mediaUrl(item.featured_image_url || item.featured_image) || '',
      alt: item.featured_image_alt || item.title,
      title: item.title,
      category: item.category_name,
      slug: item.slug,
    }));
  }, [items]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLDivElement>(`.${styles.card}`);
    if (!cards.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -30px 0px' }
    );

    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, [items]);

  const handleFilter = (slug: string) => {
    setActiveCategory(slug);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <Reveal variant="fadeUp" once={false}>
          <div className={styles.header}>
            <SectionHeading text="Our Latest Work" className={styles.title} />
            <div className={styles.divider} />
            <p className={styles.subtitle}>
              A curated selection of our finest projects — each one reflects our commitment to quality and creative excellence.
            </p>
          </div>
        </Reveal>

        <div className={styles.filterBar}>
          <button
            className={`${styles.filterBtn} ${activeCategory === '' ? styles.filterActive : ''}`}
            onClick={() => handleFilter('')}
          >
            <span>All</span>
            <span className={styles.filterCount}>{portfolios.length}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.filterBtn} ${activeCategory === cat.slug ? styles.filterActive : ''}`}
              onClick={() => handleFilter(cat.slug)}
            >
              <span>{cat.name}</span>
              <span className={styles.filterCount}>{cat.portfolio_count || 0}</span>
            </button>
          ))}
        </div>

        <div ref={gridRef} className={styles.grid}>
          {items.length > 0 ? (
            items.map((item, index) => (
              <div
                key={item.id}
                className={styles.card}
                onClick={() => setLightboxIndex(index)}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setLightboxIndex(index);
                  }
                }}
              >
                <div className={styles.visual}>
                  {item.featured_image_url || item.featured_image ? (
                    <img
                      src={mediaUrl(item.featured_image_url || item.featured_image) || ''}
                      alt={item.title}
                      className={styles.img}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className={styles.placeholder} />
                  )}
                  {item.category_name && (
                    <span className={styles.badgeCat}>{item.category_name}</span>
                  )}
                  <div className={styles.overlay}>
                    <span className={styles.cta}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.3-4.3"/>
                        <path d="M11 8v6M8 11h6"/>
                      </svg>
                      View Full Screen
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.empty}>
              <p>No projects found.</p>
            </div>
          )}
        </div>

        {portfolios.length > 0 && (
          <div className={styles.viewAllWrap}>
            <Link href="/portfolio" className={styles.viewAllBtn}>
              <span>View All Projects</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onPrev={() =>
            setLightboxIndex((prev) =>
              prev !== null && prev > 0 ? prev - 1 : lightboxImages.length - 1
            )
          }
          onNext={() =>
            setLightboxIndex((prev) =>
              prev !== null && prev < lightboxImages.length - 1 ? prev + 1 : 0
            )
          }
        />
      )}
    </section>
  );
}
