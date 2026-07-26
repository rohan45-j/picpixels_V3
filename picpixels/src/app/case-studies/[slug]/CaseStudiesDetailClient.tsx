'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle, Lightbulb, Award, Layers, ChevronRight, Search, CheckCircle, Quote } from 'lucide-react';
import { mediaUrl, type CaseStudyItem } from '@/services/public-api';
import listStyles from '@/styles/modules/case-studies.module.css';
import detailStyles from '@/styles/modules/case-studies-detail.module.css';
import Reveal from '@/components/animations/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimatedStatCard from '@/components/ui/AnimatedStatCard';
import GalleryLightbox from '@/components/media/GalleryLightbox';

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

function splitIntoItems(text: string | undefined | null): string[] {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
}

const iconMap: Record<string, React.ReactNode> = {
  rendering: <Layers size={22} />,
  product: <Award size={22} />,
  lifestyle: <Lightbulb size={22} />,
  '360': <Search size={22} />,
  animation: <AlertTriangle size={22} />,
  marketing: <Award size={22} />,
  web: <Layers size={22} />,
  social: <CheckCircle size={22} />,
  modeling: <Award size={22} />,
  texturing: <Layers size={22} />,
  lighting: <Lightbulb size={22} />,
  post: <CheckCircle size={22} />,
};

function getScopeIcon(title: string | null | undefined): React.ReactNode {
  if (!title) return <CheckCircle size={22} />;
  const lower = title.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lower.includes(key)) return icon;
  }
  return <CheckCircle size={22} />;
}

function getScopeDesc(title: string | null | undefined): string {
  if (!title) return 'Professional CGI deliverable.';
  const descriptions: Record<string, string> = {
    'Product Rendering': 'High-quality product visuals with precise detail.',
    'Lifestyle Rendering': 'Contextual scenes that showcase products in use.',
    '360 Views': 'Interactive rotating product presentations.',
    'Animation': 'Dynamic motion visuals for digital platforms.',
    'Marketing Assets': 'Campaign-ready creative materials.',
    'Web Images': 'Optimized visuals for website integration.',
    'Social Media Assets': 'Platform-specific content for social channels.',
    'Modeling': 'Accurate 3D geometry and surface creation.',
    'Texturing': 'Realistic material and surface application.',
    'Lighting': 'Cinematic lighting setups for impact.',
    'Post Processing': 'Final polish and color grading.',
  };
  return descriptions[title] || 'Professional CGI deliverable.';
}

export default function CaseStudiesDetailClient({
  item,
}: {
  item: CaseStudyItem;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allGallery = useMemo(() => {
    const list: { url: string; alt: string; caption?: string }[] = [];
    if (item.featured_image_url) {
      list.push({
        url: mediaUrl(item.featured_image_url) || '',
        alt: item.featured_image_alt || item.title,
        caption: item.title,
      });
    }
    if (item.gallery_images) {
      for (const g of item.gallery_images) {
        if (g.image_url) {
          list.push({
            url: mediaUrl(g.image_url!) || '',
            alt: g.alt_text || item.title,
            caption: g.caption || undefined,
          });
        }
      }
    }
    return list;
  }, [item]);

  const lightboxImages = useMemo(
    () => allGallery.map((g) => ({ src: g.url, alt: g.alt, label: g.caption })),
    [allGallery],
  );

  const servicesList = item.services_provided
    ? item.services_provided.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const challengeItems = useMemo(() => splitIntoItems(item.challenges), [item.challenges]);
  const solutionBlocks = useMemo(() => splitIntoItems(item.solution), [item.solution]);
  const processSteps = useMemo(() => splitIntoItems(item.process_workflow), [item.process_workflow]);
  const scopeItems = item.scope_of_work || [];
  const stats = item.statistics || [];

  const container = listStyles.container;
  const sectionInner = detailStyles.sectionInner;

  const heroImg = item.hero_banner_url || item.featured_image_url;
  const heroImgAlt = item.hero_banner_alt || item.featured_image_alt || item.title;

  return (
    <>
      {/* ─── Breadcrumb ─── */}
      <nav className={detailStyles.breadcrumb}>
        <div className={container}>
          <div className={detailStyles.breadcrumbInner}>
            <Link href="/">Home</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
            <Link href="/case-studies">Case Studies</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
            <span>{item.title}</span>
          </div>
        </div>
      </nav>

      {/* ═══ SECTION 1: Hero ═══ */}
      {heroImg && (
        <section className={detailStyles.hero}>
          <img src={mediaUrl(heroImg) || ''} alt={heroImgAlt} className={detailStyles.heroBg} />
          <div className={detailStyles.heroOverlay} />
          <div className={detailStyles.heroBgAccent} />
          <div className={detailStyles.heroContent}>
            <div className={container}>
              <Reveal variant="fadeUp">
                {item.category_name && (
                  <span className={detailStyles.heroBadge}>{item.category_name}</span>
                )}
              </Reveal>
              <Reveal variant="fadeUp" delay={100}>
                <h1 className={detailStyles.heroTitle}>{item.title}</h1>
              </Reveal>
              <Reveal variant="fadeUp" delay={200}>
                <p className={detailStyles.heroSummary}>
                  {item.excerpt || item.short_description}
                </p>
              </Reveal>
              <Reveal variant="fadeUp" delay={300}>
                <div className={detailStyles.heroMeta}>
                  {item.client_name && (
                    <span className={detailStyles.heroMetaItem}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      {item.client_name}
                    </span>
                  )}
                  {item.industry && (
                    <span className={detailStyles.heroMetaItem}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                      {item.industry}
                    </span>
                  )}
                  {item.publish_date && (
                    <span className={detailStyles.heroMetaItem}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>
                      </svg>
                      {formatDate(item.publish_date)}
                    </span>
                  )}
                  {item.reading_time > 0 && (
                    <span className={detailStyles.heroMetaItem}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                      </svg>
                      {item.reading_time} min read
                    </span>
                  )}
                </div>
              </Reveal>
              <Reveal variant="fadeUp" delay={400}>
                <div className={detailStyles.heroActions}>
                  <Link href="/contact" className={detailStyles.heroCta}>
                    Start a Similar Project
                    <ChevronRight size={16} />
                  </Link>
                  <Link href="/services" className={detailStyles.heroCtaSecondary}>
                    View Our Services
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
          <div className={detailStyles.heroScrollHint}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
            </svg>
            Scroll
          </div>
        </section>
      )}

      {/* ═══ SECTION 2: Client Overview ═══ */}
      {(item.client_name || item.client_logo || item.country || item.brand_values || item.project_goals) && (
        <section className={detailStyles.section}>
          <div className={sectionInner}>
            <Reveal variant="fadeUp">
              <SectionHeading
                tag="Client"
                text="Client Overview"
                subtitle="About the brand and project objectives"
              />
            </Reveal>
            <Reveal variant="fadeUp" delay={100}>
              <div className={detailStyles.clientGrid}>
                <div className={detailStyles.clientInfoLeft}>
                  {item.client_logo && (
                    <div className={detailStyles.clientLogoWrap}>
                      <img
                        src={mediaUrl(item.client_logo) || ''}
                        alt={`${item.client_name} logo`}
                        className={detailStyles.clientLogo}
                      />
                    </div>
                  )}
                  {item.brand_values && (
                    <p className={detailStyles.clientDesc}>{item.brand_values}</p>
                  )}
                  {item.project_goals && (
                    <p className={detailStyles.clientDesc}>
                      <strong>Project Goals:</strong> {item.project_goals}
                    </p>
                  )}
                </div>
                <div className={detailStyles.clientInfoGrid}>
                  {item.client_name && (
                    <div className={detailStyles.clientInfoItem}>
                      <span className={detailStyles.clientInfoLabel}>Client</span>
                      <span className={detailStyles.clientInfoValue}>{item.client_name}</span>
                    </div>
                  )}
                  {item.industry && (
                    <div className={detailStyles.clientInfoItem}>
                      <span className={detailStyles.clientInfoLabel}>Industry</span>
                      <span className={detailStyles.clientInfoValue}>{item.industry}</span>
                    </div>
                  )}
                  {item.country && (
                    <div className={detailStyles.clientInfoItem}>
                      <span className={detailStyles.clientInfoLabel}>Country</span>
                      <span className={detailStyles.clientInfoValue}>{item.country}</span>
                    </div>
                  )}
                  {item.project_duration && (
                    <div className={detailStyles.clientInfoItem}>
                      <span className={detailStyles.clientInfoLabel}>Duration</span>
                      <span className={detailStyles.clientInfoValue}>{item.project_duration}</span>
                    </div>
                  )}
                  {item.completion_date && (
                    <div className={detailStyles.clientInfoItem}>
                      <span className={detailStyles.clientInfoLabel}>Completed</span>
                      <span className={detailStyles.clientInfoValue}>{formatDate(item.completion_date)}</span>
                    </div>
                  )}
                  {servicesList.length > 0 && (
                    <div className={detailStyles.clientInfoItem}>
                      <span className={detailStyles.clientInfoLabel}>Services</span>
                      <span className={detailStyles.clientInfoValue}>
                        {servicesList.slice(0, 3).join(', ')}
                        {servicesList.length > 3 && ` +${servicesList.length - 3} more`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══ SECTION 3: Challenges ═══ */}
      {challengeItems.length > 0 && (
        <section className={detailStyles.sectionAlt}>
          <div className={sectionInner}>
            <Reveal variant="fadeUp">
              <SectionHeading
                tag="Challenges"
                text="Project Challenges"
                subtitle="Understanding the obstacles we needed to overcome"
              />
            </Reveal>
            <div className={detailStyles.challengesGrid}>
              {challengeItems.map((challenge, i) => (
                <Reveal key={i} variant="fadeUp" delay={i * 80}>
                  <div className={detailStyles.challengeCard}>
                    <div className={detailStyles.challengeIcon}>
                      <AlertTriangle size={20} />
                    </div>
                    <h3 className={detailStyles.challengeCardTitle}>Challenge {i + 1}</h3>
                    <p className={detailStyles.challengeCardDesc}>{challenge}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ SECTION 4: Solution ═══ */}
      {solutionBlocks.length > 0 && (
        <section className={detailStyles.section}>
          <div className={sectionInner}>
            <Reveal variant="fadeUp">
              <SectionHeading
                tag="Solution"
                text="Our Approach"
                subtitle="How we addressed each challenge with precision and creativity"
              />
            </Reveal>
            <div className={detailStyles.solutionBlocks}>
              {solutionBlocks.map((block, i) => {
                const hasImage = allGallery[i + 1];
                const stepTitle = block.split('.')[0] || `Solution ${i + 1}`;
                const stepDesc = block.includes('.') ? block.substring(block.indexOf('.') + 1).trim() : '';
                return (
                  <Reveal key={i} variant={i % 2 === 0 ? 'fadeLeft' : 'fadeRight'} delay={i * 80}>
                    <div
                      className={`${detailStyles.solutionBlock} ${i % 2 === 1 ? detailStyles.solutionBlockReverse : ''}`}
                    >
                      {hasImage && (
                        <div className={detailStyles.solutionBlockImage}>
                          <img
                            src={hasImage.url}
                            alt={hasImage.alt}
                            className={detailStyles.solutionBlockImg}
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className={detailStyles.solutionBlockContent}>
                        <span className={detailStyles.solutionStepNumber}>Step {i + 1}</span>
                        <h3 className={detailStyles.solutionBlockHeading}>{stepTitle}</h3>
                        {stepDesc && (
                          <p className={detailStyles.solutionBlockDesc}>{stepDesc}</p>
                        )}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ SECTION 5: Scope of Work ═══ */}
      {scopeItems.length > 0 && (
        <section className={detailStyles.sectionAlt}>
          <div className={sectionInner}>
            <Reveal variant="fadeUp">
              <SectionHeading
                tag="Scope"
                text="Scope of Work"
                subtitle="Everything we delivered for this project"
              />
            </Reveal>
            <div className={detailStyles.scopeGrid}>
              {scopeItems.map((item, i) => (
                <Reveal key={i} variant="fadeUp" delay={i * 60}>
                  <div className={detailStyles.scopeCard}>
                    <div className={detailStyles.scopeIcon}>
                      {getScopeIcon(item)}
                    </div>
                    <span className={detailStyles.scopeTitle}>{item}</span>
                    <span className={detailStyles.scopeDesc}>{getScopeDesc(item)}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ SECTION 6: Production Workflow ═══ */}
      {processSteps.length > 0 && (
        <section className={detailStyles.section}>
          <div className={sectionInner}>
            <Reveal variant="fadeUp">
              <SectionHeading
                tag="Process"
                text="Production Workflow"
                subtitle="Our step-by-step workflow from discovery to delivery"
              />
            </Reveal>
            <div className={detailStyles.timeline}>
              <div className={detailStyles.timelineLine} />
              {processSteps.map((step, i) => {
                const stepImage = allGallery[i % allGallery.length];
                const stepTitle = step.split('.')[0] || `Step ${i + 1}`;
                const stepDesc = step.includes('.') ? step.substring(step.indexOf('.') + 1).trim() : step;
                return (
                  <Reveal key={i} variant="fadeUp" delay={i * 80}>
                    <div className={detailStyles.timelineStep}>
                      <div className={detailStyles.timelineDot}>{i + 1}</div>
                      <div className={detailStyles.timelineContent}>
                        {stepImage && (
                          <div className={detailStyles.timelineImage}>
                            <img
                              src={stepImage.url}
                              alt={stepImage.alt}
                              className={detailStyles.timelineImg}
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className={detailStyles.timelineTitle}>{stepTitle}</h3>
                          <p className={detailStyles.timelineDesc}>{stepDesc}</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ SECTION 7: Gallery ═══ */}
      {allGallery.length > 1 && (
        <section className={detailStyles.sectionAlt}>
          <div className={sectionInner}>
            <Reveal variant="fadeUp">
              <SectionHeading
                tag="Gallery"
                text="Project Gallery"
                subtitle="Visual highlights from the project"
              />
            </Reveal>
            <div className={detailStyles.gallery}>
              {allGallery.slice(0, 7).map((img, i) => (
                <Reveal key={i} variant="scaleIn" delay={i * 60}>
                  <div
                    className={`${detailStyles.galleryItem} ${i === 0 ? detailStyles.galleryItemWide : ''}`}
                    onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                  >
                    <img src={img.url} alt={img.alt} loading="lazy" />
                    <div className={detailStyles.galleryOverlay}>
                      <div className={detailStyles.galleryOverlayIcon}>
                        <Search size={20} />
                      </div>
                    </div>
                    {img.caption && (
                      <span className={detailStyles.galleryCaption}>{img.caption}</span>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ SECTION 8: Results ═══ */}
      {stats.length > 0 && (
        <section className={detailStyles.section}>
          <div className={sectionInner}>
            <Reveal variant="fadeUp">
              <SectionHeading
                tag="Results"
                text="Project Results"
                subtitle="Measurable outcomes and key achievements"
              />
            </Reveal>
            <div className={detailStyles.statsGrid}>
              {stats.filter((s) => s.value).map((stat, i) => (
                <Reveal key={i} variant="fadeUp" delay={i * 80}>
                  <AnimatedStatCard value={stat.value} label={stat.label} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Results text fallback */}
      {item.results && stats.length === 0 && (
        <section className={detailStyles.section}>
          <div className={sectionInner}>
            <Reveal variant="fadeUp">
              <SectionHeading
                tag="Results"
                text="The Outcome"
                subtitle="What we achieved together"
              />
              <p className={detailStyles.resultsText}>{item.results}</p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══ SECTION 9: Testimonial ═══ */}
      {item.testimonials && item.testimonials.length > 0 && (() => {
        const t = item.testimonials[0];
        return (
          <section className={detailStyles.sectionAlt}>
            <div className={sectionInner}>
              <Reveal variant="fadeUp">
                <div className={detailStyles.testimonial}>
                  <div className={detailStyles.testimonialQuoteIcon}>
                    <Quote size={48} />
                  </div>
                  <blockquote className={detailStyles.testimonialQuote}>
                    {t.quote}
                  </blockquote>
                  <div className={detailStyles.testimonialAuthor}>
                    {t.photo_url && (
                      <img
                        src={mediaUrl(t.photo_url) || ''}
                        alt={t.author_name}
                        className={detailStyles.testimonialAvatar}
                      />
                    )}
                    <div className={detailStyles.testimonialAuthorInfo}>
                      <div className={detailStyles.testimonialAuthorName}>{t.author_name}</div>
                      <div className={detailStyles.testimonialAuthorRole}>
                        {t.author_role}{t.author_role && t.company ? ', ' : ''}{t.company}
                      </div>
                      {t.rating > 0 && (
                        <div className={detailStyles.testimonialStars}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < t.rating ? 'var(--color-primary)' : 'none'} stroke="var(--color-primary)" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        );
      })()}

      {/* ═══ SECTION 10: Related Case Studies ═══ */}
      {item.related_case_studies && item.related_case_studies.length > 0 && (
        <section className={detailStyles.related}>
          <div className={container}>
            <Reveal variant="fadeUp">
              <div className={detailStyles.relatedHeader}>
                <SectionHeading text="Related Case Studies" />
                <p className={detailStyles.sectionSubtitle}>
                  Explore more projects similar to this one
                </p>
              </div>
            </Reveal>
            <div className={detailStyles.relatedGrid}>
              {(item.related_case_studies || []).slice(0, 6).map((related, i) => (
                <Reveal key={related.id} variant="fadeUp" delay={i * 80}>
                  <Link
                    href={`/case-studies/${related.slug}`}
                    className={detailStyles.relatedCard}
                  >
                    <div className={detailStyles.relatedCardVisual}>
                      {related.featured_image_url ? (
                        <img
                          src={mediaUrl(related.featured_image_url) || ''}
                          alt={related.featured_image_alt || related.title}
                          loading="lazy"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#f0f0f0' }} />
                      )}
                    </div>
                    <div className={detailStyles.relatedCardBody}>
                      {related.category_name && (
                        <span className={detailStyles.relatedCardCategory}>{related.category_name}</span>
                      )}
                      <h3 className={detailStyles.relatedCardTitle}>{related.title}</h3>
                      {(related.excerpt || related.short_description) && (
                        <p className={detailStyles.relatedCardDesc}>
                          {related.excerpt || related.short_description}
                        </p>
                      )}
                      <span className={detailStyles.relatedCardCta}>
                        Read Case Study
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Prev / Next Navigation ═══ */}
      {(item.prev_case_study || item.next_case_study) && (
        <nav className={detailStyles.projectNav}>
          <div className={container}>
            <div className={detailStyles.projectNavInner}>
              {item.prev_case_study ? (
                <Link
                  href={`/case-studies/${item.prev_case_study.slug}`}
                  className={detailStyles.navLink}
                >
                  <div className={detailStyles.navArrow}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                  </div>
                  <div className={detailStyles.navInfo}>
                    <span className={detailStyles.navLabel}>Previous Case Study</span>
                    <span className={detailStyles.navTitle}>{item.prev_case_study.title}</span>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {item.next_case_study ? (
                <Link
                  href={`/case-studies/${item.next_case_study.slug}`}
                  className={`${detailStyles.navLink} ${detailStyles.navLinkNext}`}
                >
                  <div className={detailStyles.navInfoAlignRight}>
                    <span className={detailStyles.navLabel}>Next Case Study</span>
                    <span className={detailStyles.navTitle}>{item.next_case_study.title}</span>
                  </div>
                  <div className={detailStyles.navArrow}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </nav>
      )}

      {/* ═══ SECTION 11: Final CTA ═══ */}
      <section className={detailStyles.finalCta}>
        <div className={detailStyles.finalCtaBg} />
        <div className={detailStyles.finalCtaInner}>
          <h2 className={detailStyles.finalCtaTitle}>Ready to Start Your Project?</h2>
          <p className={detailStyles.finalCtaDesc}>
            Let&apos;s discuss how we can help bring your vision to life with stunning product visuals.
          </p>
          <div className={detailStyles.finalCtaActions}>
            <Link href="/contact" className={detailStyles.finalCtaPrimary}>
              Get in Touch
              <ChevronRight size={16} />
            </Link>
            <Link href="/services" className={detailStyles.finalCtaSecondary}>
              View Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Lightbox ═══ */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <GalleryLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          title={item.title}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % lightboxImages.length)}
        />
      )}
    </>
  );
}
