'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { mediaUrl, type PortfolioItem, type PortfolioCategory } from '@/services/public-api';
import styles from '@/styles/modules/portfolio-grid.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

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
  initialCategory = '',
  initialTotalCount,
  initialSearch = '',
}: {
  initialPortfolios: PortfolioItem[];
  categories: PortfolioCategory[];
  initialCategory?: string;
  initialTotalCount?: number;
  initialSearch?: string;
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [items, setItems] = useState(initialPortfolios);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(initialTotalCount ?? initialPortfolios.length);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const catCache = useRef<Record<string, { items: PortfolioItem[]; totalCount: number; hasNext: boolean }>>({});

  useEffect(() => {
    setItems(initialPortfolios);
    setActiveCategory(initialCategory);
    setSearchQuery(initialSearch);
    setTotalCount(initialTotalCount ?? initialPortfolios.length);
    if (!initialCategory && !initialSearch && initialPortfolios.length > 0) {
      catCache.current['all'] = {
        items: initialPortfolios,
        totalCount: initialTotalCount ?? initialPortfolios.length,
        hasNext: false,
      };
    }
  }, [initialPortfolios, initialCategory, initialTotalCount, initialSearch]);

  const getRequestUrl = (endpoint: string) => {
    if (typeof window !== 'undefined') {
      return endpoint;
    }
    return `${API_BASE}${endpoint}`;
  };

  const fetchItems = useCallback(async (pageNum: number, append: boolean, cat: string, search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat) params.set('category', cat);
      if (search) params.set('search', search);
      params.set('page', String(pageNum));
      params.set('page_size', '18');

      const endpoint = `/api/v1/portfolio/api/items/?${params.toString()}`;
      const resp = await fetch(getRequestUrl(endpoint));
      if (!resp.ok) return;
      const data = await resp.json();
      const results = data.results || [];
      if (append) {
        setItems((prev) => [...prev, ...results]);
      } else {
        setItems(results);
        if (!search) {
          catCache.current[cat || 'all'] = {
            items: results,
            totalCount: data.count ?? results.length,
            hasNext: !!data.next,
          };
        }
      }
      setTotalCount(data.count ?? results.length);
      setPage(pageNum);
      setHasNext(!!data.next);
    } catch (err) {
      console.error('[Portfolio] Failed to fetch items:', err);
    }
    setLoading(false);
    setInitialLoading(false);
  }, []);

  const handleCategoryFilter = (slug: string) => {
    setActiveCategory(slug);
    setSearchQuery('');

    // Update browser URL query string without reloading page
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (slug) {
        url.searchParams.set('category', slug);
      } else {
        url.searchParams.delete('category');
      }
      url.searchParams.delete('search');
      window.history.pushState({}, '', url.toString());
    }

    const cacheKey = slug || 'all';
    if (catCache.current[cacheKey]) {
      setItems(catCache.current[cacheKey].items);
      setTotalCount(catCache.current[cacheKey].totalCount);
      setHasNext(catCache.current[cacheKey].hasNext);
      setPage(1);
      return;
    }

    // Instant local filter if we already have the full list in 'all'
    if (catCache.current['all'] && !catCache.current['all'].hasNext) {
      const allList = catCache.current['all'].items;
      const matched = slug
        ? allList.filter((item) => item.category_slug === slug || String(item.category) === slug)
        : allList;
      setItems(matched);
      setTotalCount(matched.length);
      setHasNext(false);
      setPage(1);
      catCache.current[cacheKey] = {
        items: matched,
        totalCount: matched.length,
        hasNext: false,
      };
      return;
    }

    setInitialLoading(true);
    fetchItems(1, false, slug, '');
  };

  // Sync state if user clicks browser Back / Forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category') || '';
      const search = params.get('search') || '';
      setActiveCategory(cat);
      setSearchQuery(search);
      fetchItems(1, false, cat, search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [fetchItems]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setActiveCategory('');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('category');
        if (value) url.searchParams.set('search', value);
        else url.searchParams.delete('search');
        window.history.pushState({}, '', url.toString());
      }
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
          <h1 className={styles.heroTitle}>Portfolio</h1>
          <p className={styles.heroDesc}>Browse our latest projects and creative work.</p>
          <form
            method="GET"
            action="/portfolio"
            className={styles.searchWrap}
            onSubmit={(e) => {
              if (searchQuery) {
                clearTimeout(searchTimer.current);
                handleCategoryFilter('');
                fetchItems(1, false, '', searchQuery);
              }
            }}
          >
            {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              name="search"
              className={styles.searchInput}
              placeholder="Search projects instantly..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoComplete="off"
            />
          </form>
        </div>
      </header>

      <nav className={styles.filterBar}>
        <div className={styles.filterContainer}>
        <div className={styles.filterInner}>
          <Link
            href="/portfolio"
            className={`${styles.filterBtn} ${activeCategory === '' && !searchQuery ? styles.filterActive : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleCategoryFilter('');
            }}
          >
            All
            <span className={styles.filterCount}>{totalCount}</span>
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/portfolio?category=${encodeURIComponent(cat.slug)}`}
              className={`${styles.filterBtn} ${activeCategory === cat.slug ? styles.filterActive : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleCategoryFilter(cat.slug);
              }}
            >
              {cat.name}
              <span className={styles.filterCount}>{cat.portfolio_count ?? 0}</span>
            </Link>
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
                  <Link
                    key={item.id}
                    href={`/portfolio/${item.slug || item.id}`}
                    className={styles.card}
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
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
                      {item.category_name && (
                        <span className={styles.badgeCat}>{item.category_name}</span>
                      )}
                      <div className={styles.overlay}>
                        <span className={styles.cta}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"/>
                            <path d="m12 5 7 7-7 7"/>
                          </svg>
                          View Details
                        </span>
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
