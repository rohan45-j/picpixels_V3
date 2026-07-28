'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Clock, ArrowRight, TrendingUp, Star, Mail } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';
import styles from '@/styles/modules/blog.module.css';
import type { BlogPost, BlogCategory } from '@/services/public-api';
import OptimizedImage from '@/components/media/OptimizedImage';

const POSTS_PER_PAGE = 9;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <Reveal variant="fadeUp" delay={index * 80}>
      <Link href={`/blog/${post.slug}`} className={styles.card}>
        <div className={styles.cardImageWrap}>
          {post.featured_image ? (
            <OptimizedImage src={post.featured_image} alt={post.title} className={styles.cardImg} width={400} height={260} />
          ) : (
            <div className={styles.cardImgPlaceholder}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            </div>
          )}
          {post.is_featured && <span className={styles.featuredBadge}><Star size={10} /> Featured</span>}
        </div>
        <div className={styles.cardBody}>
          <div className={styles.cardMeta}>
            {post.category_name && <span className={styles.cardCategory}>{post.category_name}</span>}
            {post.reading_time && post.reading_time > 0 && (
              <span className={styles.cardReadingTime}><Clock size={12} /> {post.reading_time} min read</span>
            )}
          </div>
          <h3 className={styles.cardTitle}>{post.title}</h3>
          <p className={styles.cardExcerpt}>{post.short_description || post.excerpt}</p>
          <div className={styles.cardFooter}>
            {post.author_profile_data?.name && <span className={styles.cardAuthor}>By {post.author_profile_data.name}</span>}
            <span className={styles.cardLink}>Read More <ArrowRight size={14} /></span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default function BlogClient({
  posts, categories, featured, trending,
}: {
  posts: BlogPost[];
  categories: BlogCategory[];
  featured: BlogPost[];
  trending: BlogPost[];
}) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let result = posts.filter((p) => {
      const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.short_description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === null || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
    return result;
  }, [posts, search, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = filtered.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE);

  return (
    <main>
      <Reveal variant="fadeDown">
        <section className={styles.heroSection}>
          <div className="container">
            <h1 className={styles.listingHeroTitle}>Our Blog</h1>
            <p className={styles.heroSub}>Expert insights, industry trends, and actionable strategies for professional photo editing and e-commerce visual content</p>
          </div>
        </section>
      </Reveal>

      {featured.length > 0 && (
        <section className={styles.featuredSection}>
          <div className="container">
            <Reveal variant="fadeUp">
              <div className={styles.featuredHeader}><TrendingUp size={18} /><span>Featured Articles</span></div>
            </Reveal>
            <div className={styles.featuredGrid}>
              {featured.slice(0, 2).map((post, i) => (
                <Reveal key={post.id} variant="fadeUp" delay={i * 120}>
                  <Link href={`/blog/${post.slug}`} className={styles.featuredCard}>
                    <div className={styles.featuredCardImg}>
                      {post.featured_image ? <OptimizedImage src={post.featured_image} alt={post.title} width={600} height={400} /> : <div className={styles.cardImgPlaceholder} />}
                    </div>
                    <div className={styles.featuredCardBody}>
                      {post.category_name && <span className={styles.cardCategory}>{post.category_name}</span>}
                      <h3>{post.title}</h3>
                      <p>{post.short_description || post.excerpt}</p>
                      <div className={styles.featuredCardMeta}>
                        {post.author_profile_data?.name && <span>By {post.author_profile_data.name}</span>}
                        {post.published_at && <span>{formatDate(post.published_at)}</span>}
                        {post.reading_time && post.reading_time > 0 && <span><Clock size={12} /> {post.reading_time} min read</span>}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {trending.length > 1 && (
        <section className={styles.trendingBar}>
          <div className="container">
            <div className={styles.trendingInner}>
              <TrendingUp size={14} />
              <span className={styles.trendingLabel}>Trending</span>
              <div className={styles.trendingScroll}>
                {trending.map((t) => (
                  <Link key={t.id} href={`/blog/${t.slug}`} className={styles.trendingItem}>{t.title}</Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className={styles.filterSection}>
        <div className="container">
          <div className={styles.filterBar}>
            <div className={styles.searchWrap}>
              <Search size={16} />
              <input type="text" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className={styles.searchInput} />
            </div>
            <div className={styles.categoryFilters}>
              <button className={`${styles.categoryBtn} ${activeCategory === null ? styles.categoryBtnActive : ''}`} onClick={() => { setActiveCategory(null); setCurrentPage(1); }}>All</button>
              {categories.map((cat) => (
                <button key={cat.id} className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.categoryBtnActive : ''}`} onClick={() => { setActiveCategory(cat.id); setCurrentPage(1); }}>{cat.name}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.listSection}>
        <div className="container">
          {filtered.length === 0 ? (
            <div className={styles.emptyState}><h3>No articles found</h3><p>Try adjusting your search or category filter.</p></div>
          ) : (
            <>
              <div className={styles.grid}>
                {paginatedPosts.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i} />
                ))}
              </div>
              {totalPages > 1 && (
                <Reveal variant="fadeIn" delay={200}>
                  <div className={styles.pagination}>
                    <button className={styles.pageBtn} disabled={safePage <= 1} onClick={() => setCurrentPage(safePage - 1)}>Previous</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} className={`${styles.pageBtn} ${p === safePage ? styles.pageBtnActive : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
                    ))}
                    <button className={styles.pageBtn} disabled={safePage >= totalPages} onClick={() => setCurrentPage(safePage + 1)}>Next</button>
                  </div>
                </Reveal>
              )}
              <Reveal variant="fadeUp" delay={100}>
                <div className={styles.newsletterSection}>
                  <div className={styles.newsletterCard}>
                    <Mail size={28} />
                    <h3>Stay Updated</h3>
                    <p>Get the latest photo editing tips and industry insights delivered to your inbox.</p>
                    <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
                      <input type="email" placeholder="Enter your email" className={styles.newsletterInput} />
                      <button type="submit" className={styles.newsletterBtn}>Subscribe</button>
                    </form>
                  </div>
                </div>
              </Reveal>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
