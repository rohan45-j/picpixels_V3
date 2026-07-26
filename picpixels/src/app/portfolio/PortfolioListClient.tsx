'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { mediaUrl, type PortfolioItem, type PortfolioCategory } from '@/services/public-api';
import styles from '@/styles/modules/portfolio-grid.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

function Skeleton() {
  return (
    <div className={styles.skeletonGrid}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonVisual} />
        </div>
      ))}
    </div>
  );
}

export default function PortfolioListClient({
  initialPortfolios,
  categories,
  initialCategory,
}: {
  initialPortfolios: PortfolioItem[];
  categories: PortfolioCategory[];
  initialCategory?: string;
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory ?? '');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(initialPortfolios);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(initialPortfolios.length === 0);
  const [totalCount, setTotalCount] = useState(initialPortfolios.length);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (initialPortfolios.length > 0) {
      setInitialLoading(false);
    }
  }, [initialPortfolios]);

  useEffect(() => {
  }, [items]);

  const fetchItems = useCallback(async (pageNum: number, append: boolean, cat: string, search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat) params.set('category', cat);
      if (search) params.set('search', search);
      params.set('page', String(pageNum));

      const resp = await fetch(`${API_BASE}/api/v1/portfolio/api/items/?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!resp.ok) return;
      const data = await resp.json();
      if (append) {
        setItems((prev) => [...prev, ...data.results]);
      } else {
        setItems(data.results);
      }
      setTotalCount(data.count ?? data.results.length);
      setPage(pageNum);
      setHasNext(!!data.next);
    } catch { /* ignore */ }
    setLoading(false);
    setInitialLoading(false);
  }, []);

  const handleCategoryFilter = (slug: string) => {
    setActiveCategory(slug);
    setSearchQuery('');
    setInitialLoading(true);
    fetchItems(1, false, slug, '');
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setActiveCategory('');
      setInitialLoading(true);
      fetchItems(1, false, '', value);
    }, 350);
  };

  const handleLoadMore = () => {
    if (!hasNext || loading) return;
    fetchItems(page + 1, true, activeCategory, searchQuery);
  };

  return (
    <>
      <header className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <span className={styles.heroLabel}>OUR PORTFOLIO</span>
          <h1 className={styles.heroTitle}>Portfolio</h1>
          <p className={styles.heroDesc}>Browse our latest projects and creative work.</p>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search projects instantly..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </header>

      <nav className={styles.filterBar}>
        <div className={styles.filterContainer}>
        <div className={styles.filterInner}>
          <button
            className={`${styles.filterBtn} ${activeCategory === '' && !searchQuery ? styles.filterActive : ''}`}
            onClick={() => handleCategoryFilter('')}
          >
            All
            <span className={styles.filterCount}>{totalCount}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.filterBtn} ${activeCategory === cat.slug ? styles.filterActive : ''}`}
              onClick={() => handleCategoryFilter(cat.slug)}
            >
              {cat.name}
              <span className={styles.filterCount}>{cat.portfolio_count ?? 0}</span>
            </button>
          ))}
        </div>
        </div>
      </nav>

      <section className={styles.gridArea}>
        <div className={styles.container}>
          {initialLoading ? (
            <Skeleton />
          ) : (
            <div className={styles.grid}>
                  {items.length > 0 ? (
                items.map((item, index) => (
                  <Link key={item.id} href={`/portfolio/${item.slug}`} className={styles.card} style={{ animationDelay: `${index * 0.06}s` }}>
                    <div className={styles.visual}>
                      {item.featured_image_url || item.featured_image ? (
                        <img
                          src={mediaUrl(item.featured_image_url || item.featured_image) || ''}
                          alt={item.featured_image_alt || item.title}
                          className={styles.img}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className={styles.placeholder} />
                      )}
                      <span className={styles.badgeCat}>{item.category_name}</span>
                      <div className={styles.overlay}>
                        <span className={styles.overlayTitle}>{item.title}</span>
                        <span className={styles.cta}>View Project</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className={styles.empty}>
                  <p>No projects found. Try a different search or filter.</p>
                </div>
              )}
            </div>
          )}

          {!initialLoading && hasNext && (
            <div className={styles.controls}>
              <button
                className={styles.loadMore}
                onClick={handleLoadMore}
                disabled={loading}
              >
                <span>{loading ? 'Loading...' : 'Load More Projects'}</span>
                {!loading && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
