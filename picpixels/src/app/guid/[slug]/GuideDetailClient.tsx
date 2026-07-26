'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { mediaUrl, type GuideItem } from '@/services/public-api';
import styles from '@/styles/modules/guides.module.css';

function readingTime(html: string | undefined | null): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]+>/g, '').trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function parseToc(html: string | undefined | null): { level: number; id: string; text: string }[] {
  if (!html) return [];
  const items: { level: number; id: string; text: string }[] = [];
  const headingRe = /<h([23])(?:\s+[^>]*)?>([\s\S]*?)<\/h[23]>/gi;
  let match: RegExpExecArray | null;
  const seen = new Map<string, number>();
  while ((match = headingRe.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const raw = match[2].replace(/<[^>]+>/g, '').trim();
    if (!raw) continue;
    let id = raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const count = seen.get(id) || 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;
    items.push({ level, id, text: raw });
  }
  return items;
}

function addHeadingIds(html: string | undefined | null): string {
  if (!html) return '';
  const seen = new Map<string, number>();
  return html.replace(
    /<h([23])(\s+[^>]*)?>([\s\S]*?)<\/h[23]>/gi,
    (_match, level, attrs, content) => {
      const raw = content.replace(/<[^>]+>/g, '').trim();
      if (!raw) return _match;
      let id = raw
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const count = seen.get(id) || 0;
      seen.set(id, count + 1);
      if (count > 0) id = `${id}-${count}`;
      return `<h${level}${attrs || ''} id="${id}">${content}</h${level}>`;
    },
  );
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatDateShort(dateStr: string | null | undefined): string {
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

export default function GuideDetailClient({
  item,
}: {
  item: GuideItem;
}) {
  const [activeId, setActiveId] = useState('');
  const [copied, setCopied] = useState(false);

  const tocItems = useMemo(() => parseToc(item.full_content), [item.full_content]);
  const contentHtml = useMemo(() => addHeadingIds(item.full_content), [item.full_content]);
  const readTime = useMemo(
    () => item.reading_time ?? readingTime(item.full_content),
    [item.reading_time, item.full_content],
  );

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, url });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* clipboard denied */ }
    }
  }, [item.title]);

  useEffect(() => {
    if (tocItems.length === 0) return;
    const ids = tocItems.map((t) => t.id);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [tocItems]);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          const siteHeader = document.querySelector('header:first-of-type') as HTMLElement | null;
          const headerH = siteHeader?.offsetHeight ?? 96;
          const top = el.getBoundingClientRect().top + window.scrollY - headerH - 16;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    }
  }, [tocItems]);

  return (
    <>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroInner}>
            {item.hero_badge_text && (
              <span className={styles.heroBadge}>{item.hero_badge_text}</span>
            )}
            <h1 className={styles.heroTitle}>{item.title}</h1>
            {item.hero_subtitle && (
              <p className={styles.heroDesc}>{item.hero_subtitle}</p>
            )}
            {!item.hero_subtitle && item.short_description && (
              <p className={styles.heroDesc}>{item.short_description}</p>
            )}
            <div className={styles.heroMeta}>
              {item.author && (
                <span className={styles.heroMetaItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  {item.author}
                </span>
              )}
              {item.publish_date && (
                <span className={styles.heroMetaItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>
                  </svg>
                  {formatDateShort(item.publish_date)}
                </span>
              )}
              <span className={styles.heroMetaItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                {readTime} min read
              </span>
              {item.updated_at && (
                <span className={styles.heroMetaItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/>
                  </svg>
                  Updated {formatDateShort(item.updated_at)}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Article + TOC */}
      <div className={styles.articleWrap}>
        <div className={styles.articleContainer}>
          {tocItems.length > 0 && (
            <aside className={styles.toc}>
              <div className={styles.tocInner}>
                <span className={styles.tocLabel}>On this page</span>
                <nav className={styles.tocNav}>
                  {tocItems.map((t) => (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className={`${styles.tocLink} ${t.level === 3 ? styles.tocLinkH3 : ''} ${activeId === t.id ? styles.tocLinkActive : ''}`}
                    >
                      {t.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
          <article className={styles.article}>
            {contentHtml && (
              <div
                className={styles.fullContent}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            )}

            {/* Share + updated */}
            <div className={styles.articleFooter}>
              <div className={styles.articleFooterLeft}>
                {item.updated_at && (
                  <span className={styles.lastUpdated}>
                    Last updated {formatDate(item.updated_at)}
                  </span>
                )}
              </div>
              <div className={styles.articleFooterRight}>
                <button className={styles.shareBtn} onClick={handleShare} type="button">
                  {copied ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98"/><path d="M15.41 6.51l-6.82 3.98"/>
                      </svg>
                      Share
                    </>
                  )}
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Prev / Next */}
      {(item.prev_guide || item.next_guide) && (
        <nav className={styles.projectNav}>
          <div className={styles.container}>
            <div className={styles.projectNavInner}>
              {item.prev_guide ? (
                <Link
                  href={`/guid/${item.prev_guide.slug}`}
                  className={styles.navLinkPrev}
                >
                  <span className={styles.navArrow}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                  </span>
                  <div className={styles.navInfo}>
                    <span className={styles.navLabel}>Previous Guide</span>
                    <span className={styles.navTitle}>{item.prev_guide.title}</span>
                  </div>
                </Link>
              ) : (
                <div className={styles.navPlaceholder} />
              )}
              {item.next_guide ? (
                <Link
                  href={`/guid/${item.next_guide.slug}`}
                  className={styles.navLinkNext}
                >
                  <div className={styles.navInfoAlignRight}>
                    <span className={styles.navLabel}>Next Guide</span>
                    <span className={styles.navTitle}>{item.next_guide.title}</span>
                  </div>
                  <span className={styles.navArrow}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </span>
                </Link>
              ) : (
                <div className={styles.navPlaceholder} />
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Related */}
      {item.related_guides && item.related_guides.length > 0 && (
        <section className={styles.related}>
          <div className={styles.container}>
            <h2 className={styles.relatedTitle}>Related Guides</h2>
            <div className={styles.relatedGrid}>
              {item.related_guides.map((related) => (
                <Link
                  key={related.id}
                  href={`/guid/${related.slug}`}
                  className={styles.relatedCard}
                >
                  {related.featured_image_url && (
                    <div className={styles.relatedCardVisual}>
                      <img
                        src={mediaUrl(related.featured_image_url) || ''}
                        alt={related.featured_image_alt || related.title}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className={styles.relatedCardBody}>
                    {related.category_name && (
                      <span className={styles.relatedCardCategory}>{related.category_name}</span>
                    )}
                    <h3 className={styles.relatedCardTitle}>{related.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Need more help?</h2>
          <p className={styles.ctaDesc}>
            Our team is here to assist you with any questions.
          </p>
          <Link href="/contact" className={styles.ctaBtn}>
            Contact Us
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
