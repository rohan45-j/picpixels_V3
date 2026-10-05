'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { mediaUrl, type GuideItem, type GuideCategory } from '@/services/public-api';
import gridStyles from '@/styles/modules/portfolio-grid.module.css';
import styles from '@/styles/modules/guides.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function Skeleton() {
  return (
    <div className={gridStyles.skeletonGrid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={gridStyles.skeletonCard}>
          <div className={styles.skeletonVisual} />
          <div className={styles.skeletonBody}>
            <div className={styles.skeletonLine} style={{ width: '40%' }} />
            <div className={styles.skeletonLine} style={{ width: '90%' }} />
            <div className={styles.skeletonLine} style={{ width: '70%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GuideListClient({
  initialItems,
  categories,
  initialCategory = '',
  initialSearch = '',
}: {
  initialItems: GuideItem[];
  categories: GuideCategory[];
  initialCategory?: string;
  initialSearch?: string;
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(initialItems.length);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const catCache = useRef<Record<string, { items: GuideItem[]; totalCount: number; hasNext: boolean }>>({});

  useEffect(() => {
    setItems(initialItems);
    setActiveCategory(initialCategory);
    setSearchQuery(initialSearch);
    setTotalCount(initialItems.length);
    if (!initialCategory && !initialSearch && initialItems.length > 0) {
      catCache.current['all'] = {
        items: initialItems,
        totalCount: initialItems.length,
        hasNext: false,
      };
    }
  }, [initialItems, initialCategory, initialSearch]);

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
      
      const endpoint = `/api/v1/guides/api/items/?${params.toString()}`;
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
      console.error('[Guides] Failed to fetch items:', err);
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
      <header className={gridStyles.hero}>
        <div className={gridStyles.heroBg} />
        <div className={gridStyles.heroInner}>
          <span className={gridStyles.heroLabel}>GUIDES</span>
          <h1 className={gridStyles.heroTitle}>Guides &amp; Tutorials</h1>
          <p className={gridStyles.heroDesc}>Step-by-step guides and tutorials to help you get the most out of our services.</p>
          <div className={gridStyles.searchWrap}>
            <svg className={gridStyles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              className={gridStyles.searchInput}
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </header>

      <nav className={gridStyles.filterBar}>
        <div className={gridStyles.filterContainer}>
          <div className={gridStyles.filterInner}>
            <Link
              href="/guid"
              className={`${gridStyles.filterBtn} ${activeCategory === '' && !searchQuery ? gridStyles.filterActive : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleCategoryFilter('');
              }}
            >
              All
              <span className={gridStyles.filterCount}>{totalCount}</span>
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/guid?category=${encodeURIComponent(cat.slug)}`}
                className={`${gridStyles.filterBtn} ${activeCategory === cat.slug ? gridStyles.filterActive : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryFilter(cat.slug);
                }}
              >
                {cat.name}
                <span className={gridStyles.filterCount}>{cat.guide_count ?? 0}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <section className={gridStyles.gridArea}>
        <div className={gridStyles.container}>
          {initialLoading ? (
            <Skeleton />
          ) : (
            <div className={styles.grid}>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <Link key={item.id} href={`/guid/${item.slug}`} className={`${gridStyles.card} ${styles.card}`} style={{ animationDelay: `${index * 0.06}s` }}>
                    <div className={styles.cardVisual}>
                      {item.featured_image_url ? (
                        <img
                          src={mediaUrl(item.featured_image_url) || ''}
                          alt={item.featured_image_alt || item.title}
                          className={styles.cardImg}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className={styles.cardPlaceholder} />
                      )}
                      {item.category_name && (
                        <span className={gridStyles.badgeCat}>{item.category_name}</span>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                      {item.short_description && (
                        <p className={styles.cardDesc}>{item.short_description}</p>
                      )}
                      <span className={styles.cardCta}>
                        Read Guide
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className={gridStyles.empty}>
                  <p>No guides found. Try a different search or filter.</p>
                </div>
              )}
            </div>
          )}

          {!initialLoading && hasNext && (
            <div className={gridStyles.controls}>
              <button className={gridStyles.loadMore} onClick={handleLoadMore} disabled={loading}>
                <span>{loading ? 'Loading...' : 'Load More Guides'}</span>
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
