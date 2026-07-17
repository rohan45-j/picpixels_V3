'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { mediaUrl, type CaseStudyItem, type CaseStudyCategory } from '../../services/public-api';
import styles from '../../shared/styles/modules/case-studies.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';
const PER_PAGE = 12;

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function CaseStudiesListClient({
  initialItems,
  categories,
  totalInitial,
}: {
  initialItems: CaseStudyItem[];
  categories: CaseStudyCategory[];
  totalInitial: number;
}) {
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(totalInitial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  const hasActiveFilters = activeCategory || debouncedSearch || sort !== 'newest';
  const featured = items.find(item => item.featured === true) ?? null;
  const gridItems = featured ? items.filter(item => item.id !== featured.id) : items;

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const fetchItems = useCallback(async (pageNum: number, cat: string, q: string, sortBy: string) => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (cat) params.set('category', cat);
      if (q) params.set('search', q);
      if (sortBy !== 'newest') params.set('ordering', sortBy);
      params.set('page', String(pageNum));
      const resp = await fetch(`${API_BASE}/api/v1/case-studies/api/items/?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!resp.ok) {
        setError(true);
        return;
      }
      const data = await resp.json();
      setItems(data.results);
      setTotalCount(data.count ?? data.results.length);
      setPage(pageNum);
    } catch {
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems(1, activeCategory, debouncedSearch, sort);
  }, [activeCategory, debouncedSearch, sort, fetchItems]);

  const handleCategoryFilter = (slug: string) => {
    setActiveCategory(slug);
    setSearch('');
    setDebouncedSearch('');
  };

  const handleReset = () => {
    setActiveCategory('');
    setSearch('');
    setDebouncedSearch('');
    setSort('newest');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchItems(newPage, activeCategory, debouncedSearch, sort);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPageNumbers = () => {
    const pages: React.ReactNode[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    pages.push(
      <button
        key="prev"
        className={`${styles.pageBtn} ${page <= 1 ? styles.pageBtnDisabled : ''}`}
        onClick={() => handlePageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <span className={styles.pageArrow}>‹</span>
      </button>
    );

    if (start > 1) {
      pages.push(
        <button key={1} className={styles.pageBtn} onClick={() => handlePageChange(1)}>1</button>
      );
      if (start > 2) {
        pages.push(<span key="dots1" className={styles.pageDots}>…</span>);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.pageBtn} ${i === page ? styles.pageBtnActive : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(<span key="dots2" className={styles.pageDots}>…</span>);
      }
      pages.push(
        <button key={totalPages} className={styles.pageBtn} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        className={`${styles.pageBtn} ${page >= totalPages ? styles.pageBtnDisabled : ''}`}
        onClick={() => handlePageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <span className={styles.pageArrow}>›</span>
      </button>
    );

    return pages;
  };

  return (
    <>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroBgVisual} />
        <div className={styles.heroContent}>
          <div className={styles.container}>
            <h1 className={styles.heroTitle}>
              Product CGI <span className={styles.heroAccent}>Case Studies</span>
            </h1>
            <p className={styles.heroSubtitle}>
              See how successful product brands use 3D modeling and rendering to elevate their visual content and drive business growth.
            </p>
            <p className={styles.heroIntro}>
              Explore our portfolio of real-world CGI projects across furniture, automotive, lighting, and more. Each case study details the challenges, process, and results.
            </p>
            <div className={styles.heroActions}>
              <Link href="/contact" className={styles.heroCta}>
                Start Your Project
                <svg className={styles.heroCtaArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
              <Link href="/services" className={styles.heroCtaSecondary}>
                View Our Services
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search, Filter & Sort */}
      <nav className={styles.controlsBar}>
        <div className={styles.container}>
          <div className={styles.controlsInner}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search case studies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.filterWrap}>
              <button
                className={`${styles.filterBtn} ${activeCategory === '' ? styles.filterBtnActive : ''}`}
                onClick={() => handleCategoryFilter('')}
              >
                All
              </button>
              {categories.filter((c) => (c.case_study_count ?? 0) > 0).map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.filterBtn} ${activeCategory === cat.slug ? styles.filterBtnActive : ''}`}
                  onClick={() => handleCategoryFilter(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className={styles.controlsRight}>
              <div className={styles.sortWrap}>
                <svg className={styles.sortIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5h10"/><path d="M11 9h7"/><path d="M11 13h4"/><path d="m3 17 3 3 3-3"/><path d="M6 20V4"/>
                </svg>
                <select
                  className={styles.sortSelect}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="featured">Featured</option>
                </select>
              </div>
              {hasActiveFilters && (
                <button className={styles.resetBtn} onClick={handleReset}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Featured Card */}
      {featured && !debouncedSearch && !activeCategory && !error && (
        <section className={styles.featured}>
          <div className={styles.container}>
            <Link href={`/case-studies/${featured.slug}`} className={styles.featuredCard}>
              <div className={styles.featuredVisual}>
                {featured.featured_image_url ? (
                  <img
                    src={mediaUrl(featured.featured_image_url) || ''}
                    alt={featured.featured_image_alt || featured.title}
                    className={styles.featuredImg}
                  />
                ) : (
                  <div className={styles.cardPlaceholder} />
                )}
                <span className={styles.featuredLabel}>Featured Project</span>
              </div>
              <div className={styles.featuredBody}>
                {featured.category_name && (
                  <span className={styles.featuredCategory}>{featured.category_name}</span>
                )}
                <h2 className={styles.featuredCardTitle}>{featured.title}</h2>
                {(featured.excerpt || featured.short_description) && (
                  <p className={styles.featuredExcerpt}>
                    {featured.excerpt || featured.short_description}
                  </p>
                )}
                <div className={styles.featuredMeta}>
                  {featured.client_name && (
                    <span className={styles.featuredMetaItem}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      {featured.client_name}
                    </span>
                  )}
                  {featured.publish_date && (
                    <span className={styles.featuredMetaItem}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>
                      </svg>
                      {formatDate(featured.publish_date)}
                    </span>
                  )}
                </div>
                <span className={styles.featuredCta}>
                  View Case Study
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className={styles.gridArea}>
        <div className={styles.container}>
          <div className={styles.gridHeader}>
            <h2 className={styles.gridTitle}>
              {debouncedSearch ? `Results for "${debouncedSearch}"` : 'All Projects'}
            </h2>
            <span className={styles.gridCount}>{totalCount} case studies</span>
          </div>

          {loading ? (
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonVisual} />
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonLine} style={{ width: '30%' }} />
                    <div className={styles.skeletonLine} style={{ width: '80%' }} />
                    <div className={styles.skeletonLine} style={{ width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-muted)' }}>
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
              </svg>
              <h3>Failed to load case studies</h3>
              <p>Something went wrong. Please try again later.</p>
              <button
                className={styles.retryBtn}
                onClick={() => fetchItems(1, activeCategory, debouncedSearch, sort)}
              >
                Retry
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {gridItems.length > 0 ? (
                gridItems.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/case-studies/${item.slug}`}
                    className={styles.card}
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
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
                    </div>
                    <div className={styles.cardBody}>
                      {item.category_name && (
                        <span className={styles.cardCategory}>{item.category_name}</span>
                      )}
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                      {(item.excerpt || item.short_description) && (
                        <p className={styles.cardDesc}>
                          {item.excerpt || item.short_description}
                        </p>
                      )}
                      <div className={styles.cardMeta}>
                        {item.client_name && (
                          <span className={styles.cardMetaItem}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                            </svg>
                            {item.client_name}
                          </span>
                        )}
                        {item.publish_date && (
                          <span className={styles.cardMetaItem}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>
                            </svg>
                            {formatDate(item.publish_date)}
                          </span>
                        )}
                        {item.reading_time > 0 && (
                          <span className={styles.cardMetaItem}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                            </svg>
                            {item.reading_time} min
                          </span>
                        )}
                      </div>
                      <span className={styles.cardCta}>
                        Read More
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className={styles.empty}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-muted)' }}>
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
                  </svg>
                  <h3>No case studies found</h3>
                  <p>Try a different search or category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      {!error && totalPages > 1 && (
        <nav className={styles.pagination}>
          {renderPageNumbers()}
        </nav>
      )}

      {/* Bottom CTA */}
      <section className={styles.bottomCta}>
        <div className={styles.bottomCtaBg} />
        <div className={styles.bottomCtaInner}>
          <h2 className={styles.bottomCtaTitle}>Ready to Start Your Project?</h2>
          <p className={styles.bottomCtaDesc}>
            Let&apos;s discuss how we can help bring your vision to life with stunning product visuals.
          </p>
          <div className={styles.bottomCtaActions}>
            <Link href="/contact" className={styles.bottomCtaPrimary}>
              Get in Touch
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/services" className={styles.bottomCtaSecondary}>
              View Our Services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
