'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { mediaUrl, type PortfolioItem, type PortfolioCategory } from '@/services/public-api';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/animations/Reveal';
import styles from '@/styles/modules/portfolio-grid.module.css';

export default function PortfolioGrid({
  portfolios,
  categories,
}: {
  portfolios: PortfolioItem[];
  categories: PortfolioCategory[];
}) {
  const [activeCategory, setActiveCategory] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () =>
      activeCategory === ''
        ? portfolios
        : portfolios.filter((item) => item.category_slug === activeCategory),
    [activeCategory, portfolios]
  );

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
            <span className={styles.tag}>Our Work</span>
            <SectionHeading text="Our Latest Work" className={styles.title} />
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
            items.map((item) => (
              <Link key={item.id} href={`/portfolio/${item.slug}`} className={styles.card}>
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
                  <div className={styles.overlay}>
                    <span className={styles.cta}>View Project</span>
                  </div>
                  <div className={styles.titleOverlay}>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <span className={styles.cat}>{item.category_name}</span>
                  </div>
                </div>
              </Link>
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
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
