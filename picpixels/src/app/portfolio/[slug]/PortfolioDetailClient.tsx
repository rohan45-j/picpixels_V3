'use client';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { mediaUrl, type PortfolioItem } from '@/services/public-api';
import BeforeAfter from '@/components/ui/BeforeAfter';
import GalleryLightbox from '@/components/media/GalleryLightbox';
import detailStyles from '@/styles/modules/portfolio-detail.module.css';

interface FlatGalleryImage {
  src: string;
  alt: string;
  label?: string;
}

type GridItem =
  | { type: 'comparison'; before: string; after: string; beforeAlt: string; afterAlt: string; label?: string }
  | { type: 'image'; src: string; alt: string };

function formatRichText(raw: string): string {
  if (!raw) return '';
  // Convert markdown links [text](url)
  let formatted = raw.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // If plain text (no HTML tags), wrap paragraphs
  if (!/<[a-z][\s\S]*>/i.test(formatted)) {
    formatted = formatted
      .split(/\n\n+/)
      .map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`)
      .join('');
  } else {
    // Ensure all <a> tags have rel="noopener noreferrer" and target="_blank"
    formatted = formatted.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"([^>]*)>/gi, (match, href, rest) => {
      if (!rest.includes('rel=')) {
        rest += ' rel="noopener noreferrer"';
      }
      if (!rest.includes('target=')) {
        rest += ' target="_blank"';
      }
      return `<a href="${href}"${rest}>`;
    });
  }
  return formatted;
}

export default function PortfolioDetailClient({
  project,
}: {
  project: PortfolioItem;
  related?: never;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(() => new Set(Array.from({ length: 50 }, (_, i) => i)));
  const gridRef = useRef<HTMLDivElement>(null);

  const hasPrimaryComparison =
    (project.before_image_url || project.before_image) &&
    (project.after_image_url || project.after_image);

  const gridItems = useMemo(() => {
    const items: GridItem[] = [];

    if (hasPrimaryComparison) {
      items.push({
        type: 'comparison',
        before: mediaUrl(project.before_image_url || project.before_image) || '',
        after: mediaUrl(project.after_image_url || project.after_image) || '',
        beforeAlt: project.before_image_alt || `${project.title} - Before`,
        afterAlt: project.after_image_alt || `${project.title} - After`,
      });
    }

    if (project.comparisons) {
      project.comparisons.forEach((pair) => {
        const beforeSrc = mediaUrl(pair.before_image_url || pair.before_image);
        const afterSrc = mediaUrl(pair.after_image_url || pair.after_image);
        if (beforeSrc && afterSrc) {
          items.push({
            type: 'comparison',
            before: beforeSrc,
            after: afterSrc,
            beforeAlt: pair.before_image_alt || `${project.title} - Before`,
            afterAlt: pair.after_image_alt || `${project.title} - After`,
            label: pair.label || undefined,
          });
        }
      });
    }

    if (project.gallery) {
      project.gallery.forEach((img) => {
        const src = mediaUrl(img.image_url || img.image);
        if (src) {
          items.push({
            type: 'image',
            src,
            alt: img.alt_text || project.title,
          });
        }
      });
    }

    // Also include featured_image if not already present
    const featSrc = mediaUrl(project.featured_image_url || project.featured_image);
    if (featSrc) {
      const alreadyIncluded =
        items.some((it) => (it.type === 'image' && it.src === featSrc) || (it.type === 'comparison' && (it.before === featSrc || it.after === featSrc))) ||
        project.gallery?.some((g) => mediaUrl(g.image_url || g.image) === featSrc);
      if (!alreadyIncluded && !hasPrimaryComparison) {
        items.unshift({
          type: 'image',
          src: featSrc,
          alt: project.featured_image_alt || project.title,
        });
      }
    }

    return items;
  }, [project, hasPrimaryComparison]);

  const allImages = useMemo(() => {
    const images: FlatGalleryImage[] = [];

    gridItems.forEach((item) => {
      if (item.type === 'comparison') {
        images.push({ src: item.before, alt: item.beforeAlt, label: item.label ? `${item.label} — Before` : 'Before' });
        images.push({ src: item.after, alt: item.afterAlt, label: item.label ? `${item.label} — After` : 'After' });
      } else {
        images.push({ src: item.src, alt: item.alt });
      }
    });

    return images;
  }, [gridItems]);

  useEffect(() => {
    if (!gridRef.current) return;
    const cells = gridRef.current.querySelectorAll<HTMLDivElement>(`.${detailStyles.gridCell}`);
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-idx'));
            if (!isNaN(idx)) {
              setVisibleCards((prev) => new Set(prev).add(idx));
            }
          }
        }
      },
      { rootMargin: '0px 0px 80px 0px', threshold: 0.1 }
    );
    cells.forEach((cell) => obs.observe(cell));
    return () => obs.disconnect();
  }, [gridItems.length]);

  const imgIndexBefore = useCallback((gridIdx: number) => {
    return gridItems.slice(0, gridIdx).reduce((acc, item) => acc + (item.type === 'comparison' ? 2 : 1), 0);
  }, [gridItems]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const prevLightbox = useCallback(() => {
    setLightboxIndex((prev) =>
      prev > 0 ? prev - 1 : allImages.length - 1
    );
  }, [allImages.length]);

  const nextLightbox = useCallback(() => {
    setLightboxIndex((prev) =>
      prev < allImages.length - 1 ? prev + 1 : 0
    );
  }, [allImages.length]);

  return (
    <>
      <nav className={detailStyles.breadcrumb}>
        <div className={detailStyles.container}>
          <Link href="/">Home</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          <Link href="/portfolio">Portfolio</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          <span>{project.title}</span>
        </div>
      </nav>

      <header className={detailStyles.pageHeader}>
        <div className={detailStyles.container}>
          <h1 className={detailStyles.pageTitle}>{project.title}</h1>
        </div>
      </header>

      <section className={detailStyles.mainSection}>
        <div className={detailStyles.container}>


          {gridItems.length > 0 ? (
            <div className={detailStyles.grid} ref={gridRef}>
              {gridItems.map((item, idx) => (
                <div
                  key={idx}
                  data-idx={idx}
                  className={`${detailStyles.gridCell} ${item.type === 'comparison' ? detailStyles.gridCellComparison : detailStyles.gridCellImage} ${visibleCards.has(idx) ? detailStyles.gridCellVisible : ''}`}
                  style={{ transitionDelay: `${idx * 60}ms` }}
                  onClick={() => openLightbox(imgIndexBefore(idx))}
                >
                  {item.type === 'comparison' ? (
                    <div className={detailStyles.comparisonInGrid}>
                      <BeforeAfter
                        beforeImage={item.before}
                        afterImage={item.after}
                        beforeLabel={item.beforeAlt}
                        afterLabel={item.afterAlt}
                        showLabels={false}
                      />
                    </div>
                  ) : (
                    <>
                      <div className={detailStyles.gridZoomIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>
                        </svg>
                      </div>
                      <img
                        src={item.src}
                        alt={item.alt}
                        loading={idx < 4 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#6B7280' }}>
              <p style={{ fontSize: '0.85rem' }}>No images available for this project.</p>
            </div>
          )}

          <GalleryLightbox
            images={allImages}
            currentIndex={lightboxIndex}
            isOpen={lightboxOpen}
            title={project.title}
            onClose={closeLightbox}
            onPrev={prevLightbox}
            onNext={nextLightbox}
          />
        </div>
      </section>

      {(project.prev_project || project.next_project) && (
        <nav className={detailStyles.projectNav}>
          <div className={detailStyles.container}>
            <div className={detailStyles.projectNavInner}>
              {project.prev_project ? (
                <Link href={`/portfolio/${project.prev_project.slug}`} className={detailStyles.navLinkPrev}>
                  <span className={detailStyles.navArrow}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                  </span>
                  <div className={detailStyles.navInfo}>
                    <span className={detailStyles.navLabel}>Previous Project</span>
                    <span className={detailStyles.navTitle}>{project.prev_project.title}</span>
                  </div>
                </Link>
              ) : (
                <div className={detailStyles.navPlaceholder} />
              )}

              {project.next_project ? (
                <Link href={`/portfolio/${project.next_project.slug}`} className={detailStyles.navLinkNext}>
                  <div className={detailStyles.navInfoAlignRight}>
                    <span className={detailStyles.navLabel}>Next Project</span>
                    <span className={detailStyles.navTitle}>{project.next_project.title}</span>
                  </div>
                  <span className={detailStyles.navArrow}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </span>
                </Link>
              ) : (
                <div className={detailStyles.navPlaceholder} />
              )}
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
