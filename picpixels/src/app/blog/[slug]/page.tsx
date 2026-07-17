'use client';

import { useState, useEffect, useMemo } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Clock, ChevronRight, ArrowLeft, ArrowRight, Calendar, User, Share2, FileText, Download } from 'lucide-react';
import Header from '../../../layouts/Header';
import Footer from '../../../layouts/Footer';
import Reveal from '../../../shared/components/Reveal';
import BlockRenderer from '../../../features/blog/BlockRenderer';
import styles from '../../../shared/styles/modules/blog.module.css';
import {
  fetchBlogPostBySlug, fetchBlogPosts, fetchBlogCategories,
  mediaUrl, type BlogPost, type BlogCategory, type ContentBlock, type BlogContentSection,
} from '../../../services/public-api';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function extractHeadings(blocks: ContentBlock[]) {
  const headings: { id: string; label: string; level: number }[] = [];
  const seen = new Set<string>();

  const addHeading = (label: string, level: number) => {
    const text = label.replace(/<[^>]*>/g, '').trim();
    if (!text) return;
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (seen.has(id)) return;
    seen.add(id);
    headings.push({ id, label: text, level });
  };

  blocks.forEach((b) => {
    // Explicit heading blocks
    if (b.type === 'heading' && b.content) {
      addHeading(b.content, b.level || 2);
    }

    // Rich HTML text blocks — extract h2 through h6
    else if (b.type === 'text' && b.content) {
      const regex = /<(h[2-6])([^>]*)>([\s\S]*?)<\/\1>/gi;
      let match;
      while ((match = regex.exec(b.content)) !== null) {
        const tag = match[1].toLowerCase(); // h2, h3, h4, h5, h6
        const raw = match[3];
        const levelMap: Record<string, number> = { h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };
        addHeading(raw, levelMap[tag] ?? 2);
      }
    }

    // Callout blocks with a title — show as level 3
    else if (b.type === 'callout' && b.title) {
      addHeading(b.title, 3);
    }

    // Step blocks with titles
    else if (b.type === 'step' && b.title) {
      addHeading(b.title, 3);
    }

    // Stats blocks
    else if (b.type === 'stats' && b.stat_label) {
      addHeading(b.stat_label, 3);
    }

    // Quote blocks with author
    else if (b.type === 'quote' && b.quote_author) {
      addHeading(b.quote_author, 3);
    }

    // Table blocks with title
    else if (b.type === 'table' && b.title) {
      addHeading(b.title, 3);
    }

    // CTA blocks
    else if (b.type === 'cta' && b.cta_description) {
      addHeading(b.cta_description, 3);
    }

    // FAQ blocks
    else if (b.type === 'faq' && b.question) {
      addHeading(b.question, 3);
    }

    // Image with text blocks
    else if (b.type === 'image_with_text' && b.text) {
      const regex = /<(h[2-6])([^>]*)>([\s\S]*?)<\/\1>/gi;
      let match;
      while ((match = regex.exec(b.text)) !== null) {
        const tag = match[1].toLowerCase();
        const raw = match[3];
        const levelMap: Record<string, number> = { h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };
        addHeading(raw, levelMap[tag] ?? 2);
      }
    }
  });

  return headings;
}

function SocialShare({ url, title }: { url: string; title: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: 'f' },
    { name: 'X', href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, icon: '𝕏' },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, icon: 'in' },
  ];

  return (
    <div className={styles.shareBlock}>
      <div className={styles.shareRow}>
        {shareLinks.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.shareBtn} ${styles[`shareBtn_${s.name.toLowerCase()}`] || ''}`}
            aria-label={`Share on ${s.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              {s.icon === 'f' && <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />}
              {s.icon === '𝕏' && <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633z" />}
              {s.icon === 'in' && <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.483 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.71-.52-1.248-1.342-1.248-.822 0-1.359.538-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />}
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}

function TOC({ blocks, postSlug }: { blocks: ContentBlock[]; postSlug: string }) {
  const items = useMemo(() => extractHeadings(blocks), [blocks]);
  const [activeId, setActiveId] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(`toc:${postSlug}`);
    if (saved !== null) setIsOpen(saved === 'open');
  }, [postSlug]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`toc:${postSlug}`, isOpen ? 'open' : 'closed');
    }
  }, [isOpen, postSlug]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: 0.1 },
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  if (items.length === 0) return null;

  const l2Items = items.filter((i) => i.level === 2);

  return (
    <nav className={styles.toc}>
      <div className={styles.tocProgress}>
        <div className={styles.tocProgressBar} style={{ width: `${scrollProgress * 100}%` }} />
      </div>
      <button className={styles.tocHeader} onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
        <div className={styles.tocHeaderLeft}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span>On this page</span>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className={`${styles.tocChevron} ${isOpen ? styles.tocChevronOpen : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className={`${styles.tocCollapseWrap} ${isOpen ? styles.tocOpen : ''}`}>
        <ul className={styles.tocList}>
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`${styles.tocLink} ${item.level === 2 ? styles.tocLinkH2 : ''} ${item.level === 3 ? styles.tocLinkH3 : ''} ${item.level === 4 ? styles.tocLinkH4 : ''} ${item.level >= 5 ? styles.tocLinkH5 : ''} ${activeId === item.id ? styles.tocLinkActive : ''}`}
                onClick={(e) => handleClick(e, item.id)}
              >
                <span className={styles.tocLinkDot} />
                <span className={styles.tocLinkLabel}>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
        {l2Items.length >= 4 && (
          <div className={styles.tocSummary}>
            <span className={styles.tocSummaryText}>{l2Items.length} sections</span>
            <span className={styles.tocSummaryDot}>·</span>
            <span className={styles.tocSummaryText}>{items.length} headings</span>
          </div>
        )}
      </div>
    </nav>
  );
}

function StructuredData({ post }: { post: BlogPost }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = post.canonical_url || (typeof window !== 'undefined' ? window.location.href : '');

  const wordCount = (() => {
    let count = (post.content || '').split(/\s+/).filter(Boolean).length;
    for (const b of (post.content_blocks || []) as ContentBlock[]) {
      if (b.content) count += b.content.split(/\s+/).filter(Boolean).length;
      if (b.text) count += b.text.split(/\s+/).filter(Boolean).length;
      if (b.title) count += b.title.split(/\s+/).filter(Boolean).length;
      if (b.stat_value) count += b.stat_value.split(/\s+/).filter(Boolean).length;
      if (b.stat_label) count += b.stat_label.split(/\s+/).filter(Boolean).length;
      if (b.stat_description) count += b.stat_description.split(/\s+/).filter(Boolean).length;
      if (b.cta_description) count += b.cta_description.split(/\s+/).filter(Boolean).length;
      if (b.button_text) count += b.button_text.split(/\s+/).filter(Boolean).length;
      if (b.quote_author) count += b.quote_author.split(/\s+/).filter(Boolean).length;
      if (b.quote_role) count += b.quote_role.split(/\s+/).filter(Boolean).length;
      if (b.caption) count += b.caption.split(/\s+/).filter(Boolean).length;
      if (b.question) count += b.question.split(/\s+/).filter(Boolean).length;
      if (b.answer) count += b.answer.split(/\s+/).filter(Boolean).length;
      if (b.items) {
        const itemsArr: string[] = Array.isArray(b.items) ? b.items : (b.items as string).split(',').map((x: string) => x.trim()).filter(Boolean);
        count += itemsArr.reduce((s, it) => s + it.split(/\s+/).filter(Boolean).length, 0);
      }
      if (b.headers) {
        const hArr: string[] = Array.isArray(b.headers) ? b.headers : (b.headers as string).split(',').map((x: string) => x.trim()).filter(Boolean);
        count += hArr.reduce((s, h) => s + h.split(/\s+/).filter(Boolean).length, 0);
      }
      if (b.rows) {
        const rowsArr: string[][] = Array.isArray(b.rows) ? b.rows : [];
        count += rowsArr.reduce((s, r) => s + r.reduce((s2, c) => s2 + c.split(/\s+/).filter(Boolean).length, 0), 0);
      }
    }
    return count;
  })();

  const allKeywords = [
    ...(post.tag_names || []),
    ...(post.secondary_keywords || []),
    post.focus_keyword,
  ].filter(Boolean).join(', ');

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: post.meta_title || post.title,
        description: post.meta_description || post.short_description || post.excerpt,
        inLanguage: 'en',
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        author: post.author_profile_data?.name ? { '@type': 'Person', name: post.author_profile_data.name } : undefined,
        publisher: { '@type': 'Organization', name: 'PicPicxels', url: origin },
        datePublished: post.published_at || undefined,
        dateModified: post.updated_at || post.published_at || undefined,
        image: post.featured_image || post.og_image ? { '@type': 'ImageObject', url: post.featured_image || post.og_image || '' } : undefined,
        articleSection: post.category_name || undefined,
        keywords: allKeywords || undefined,
        wordCount: wordCount,
        isAccessibleForFree: true,
      },
      post.faq_schema && post.faq_schema.length > 0 ? {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: post.faq_schema.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      } : null,
      (post.content_blocks || []).filter((b: ContentBlock) => b.type === 'faq').length > 0 ? {
        '@type': 'FAQPage',
        '@id': `${url}#faq-blocks`,
        mainEntity: (post.content_blocks || []).filter((b: ContentBlock) => b.type === 'faq').map((faq) => ({
          '@type': 'Question',
          name: faq.question || '',
          acceptedAnswer: { '@type': 'Answer', text: faq.answer || '' },
        })),
      } : null,
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${origin}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title },
        ],
      },
    ].filter(Boolean),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }} />;
}

function DummyImage({ title, slug }: { title: string; slug: string }) {
  const colors = ['FF8A50', '4A90D9', '50C878', '9B59B6', 'E74C3C', '2ECC71', 'F39C12', '1ABC9C'];
  const idx = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  return (
    <svg viewBox="0 0 1200 630" className={styles.heroImage} role="img" aria-label={title}>
      <rect width="1200" height="630" fill={`#${colors[idx]}`} />
      <text x="600" y="300" textAnchor="middle" fill="white" fontSize="32" fontWeight="700" fontFamily="sans-serif">
        {(title.length > 50 ? title.slice(0, 50) + '...' : title)}
      </text>
    </svg>
  );
}

export default function BlogPostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    console.log('Fetching blog post for slug:', resolvedParams.slug);
    Promise.all([fetchBlogPostBySlug(resolvedParams.slug), fetchBlogPosts()])
      .then(([result, all]) => {
        console.log('Blog post fetched:', result);
        console.log('All posts fetched:', all?.length);
        setPost(result);
        setAllPosts(all);
      })
      .catch((e) => {
        console.error('Error fetching blog post:', e);
      })
      .finally(() => {
        console.log('Setting loading to false');
        setLoading(false);
      });
    window.scrollTo(0, 0);
  }, [resolvedParams.slug]);

  const blocks = (() => {
    let raw: ContentBlock[] = [...(post?.content_blocks || [])];

    if (post?.content) {
      const alreadyPrepended = raw.length > 0 && raw[0].type === 'text' && raw[0].content === post.content;
      if (!alreadyPrepended) {
        raw = [{ type: 'text' as const, content: post.content }, ...raw];
      }
    }

    const sections = post?.content_sections || [];
    if (sections.length > 0) {
      const sectionBlocks: ContentBlock[] = [];
      for (const s of sections) {
        if (s.heading) {
          sectionBlocks.push({ type: 'heading', content: s.heading, level: 2 });
        }
        if (s.content) {
          sectionBlocks.push({ type: 'text', content: s.content });
        }
        if (s.image && s.template !== 'text_only') {
          sectionBlocks.push({ type: 'image', src: s.image, alt: s.image_alt || s.heading || '' });
        }
      }
      const hasSectionContent = sectionBlocks.length > 0;
      const hasRawContent = raw.length > 0;
      if (hasSectionContent && !hasRawContent) {
        raw = sectionBlocks;
      } else if (hasSectionContent) {
        raw = [...raw, { type: 'divider' as const }, ...sectionBlocks];
      }
    }

    return raw;
  })();
  const hasToc = useMemo(() => extractHeadings(blocks).length > 0, [blocks]);
  const hasFaqBlocks = blocks.some((b) => b.type === 'faq');

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    const slugs = new Set(post.related_post_slugs || []);
    return allPosts
      .filter((p) => p.slug !== post.slug && (slugs.has(p.slug) || p.category === post.category))
      .slice(0, 3);
  }, [post, allPosts]);

  if (loading) {
    return (
      <>
        <Header />
        <main><div className={styles.loadingWrap}><div className={styles.loadingSpinner} /></div></main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <main>
          <div className={styles.notFound}>
            <h1>Article not found</h1>
            <p className={styles.notFoundSub}>This article does not exist or has been removed.</p>
            <Link href="/blog" className={styles.ctaBtn}>Back to Blog</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <StructuredData post={post} />
      <Header />
      <main>

        <article className={`${styles.detailLayout} ${!hasToc ? styles.detailLayoutCentered : ''}`}>
          {/* LEFT: Sticky Sidebar — Social Share + TOC */}
          {hasToc && (
            <aside className={styles.detailSidebar}>
              <div className={styles.socialContainer}>
                <SocialShare url={typeof window !== 'undefined' ? window.location.href : post.canonical_url || ''} title={post.title} />
              </div>
              <div className={styles.tocContainer}>
                <TOC blocks={blocks} postSlug={post.slug} />
              </div>
            </aside>
          )}

          {/* RIGHT: Content */}
          <div className={styles.detailMain}>
            {/* Hero */}
            <Reveal variant="fadeUp">
              <header className={styles.hero}>
                {post.category_name && <span className={styles.heroCategory}>{post.category_name}</span>}
                <h1 className={styles.heroTitle}>{post.title}</h1>
                <div className={styles.heroMeta}>
              <div className={styles.heroAuthor}>
                {post.author_image ? (
                  <img src={mediaUrl(post.author_image)} alt={post.author_image_alt || post.author_profile_data?.name || 'Author'} className={styles.heroAvatarImg} />
                ) : (
                  <span className={styles.heroAvatar}>{(post.author_profile_data?.name || 'A').charAt(0)}</span>
                )}
                    <div>
                      <span className={styles.heroAuthorName}>{post.author_profile_data?.name || 'PicPicxels'}</span>
                      {post.author_profile_data?.designation && (
                        <span className={styles.heroAuthorDesignation}>{post.author_profile_data.designation}</span>
                      )}
                      <span className={styles.heroMetaSub}>
                        {post.published_at && formatDate(post.published_at)}
                        {post.reading_time && post.reading_time > 0 && ` · ${post.reading_time} min read`}
                      </span>
                    </div>
                  </div>
                </div>
              </header>
            </Reveal>

            {/* Featured Image */}
            <Reveal variant="scaleIn" delay={100}>
              {(post.featured_image || post.hero_image) ? (
                <div className={styles.heroImageWrap}>
                  <img src={mediaUrl(post.hero_image || post.featured_image)} alt={post.title} className={styles.heroImage} />
                </div>
              ) : (
                <div className={styles.heroImageWrap}>
                  <DummyImage title={post.title} slug={post.slug} />
                </div>
              )}
            </Reveal>

            {/* Key Takeaways */}
            {post.key_takeaways && post.key_takeaways.length > 0 && (
              <div className={styles.takeaways}>
                <h3 className={styles.takeawaysTitle}>Key Takeaways</h3>
                <ul className={styles.takeawaysList}>
                  {post.key_takeaways.map((item, i) => (
                    <li key={i} className={styles.takeawaysItem}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Blog Content */}
            <div className={styles.contentArea}>
              <BlockRenderer blocks={blocks} />
            </div>

            {/* Document Blocks */}
            {post.document_blocks && post.document_blocks.length > 0 && (
              <Reveal variant="fadeUp" delay={50}>
                <div className={styles.docSection}>
                  <h3 className={styles.docTitle}>Resources & Downloads</h3>
                  <div className={styles.docList}>
                    {post.document_blocks.filter(d => d.is_active).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((doc) => (
                      <a key={doc.id} href={mediaUrl(doc.file)} target="_blank" rel="noopener noreferrer" className={styles.docItem}>
                        <FileText size={22} className={styles.docIcon} />
                        <div className={styles.docInfo}>
                          <span className={styles.docItemTitle}>{doc.title}</span>
                          {doc.description && <span className={styles.docDesc}>{doc.description}</span>}
                        </div>
                        <span className={styles.docDownload}>
                          <Download size={14} /> {doc.download_text || 'Download'}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* FAQ Section */}
            {hasFaqBlocks && (
              <div className={styles.faqSection}>
                <h2 className={styles.faqSectionTitle}>Frequently Asked Questions</h2>
                <div className={styles.faqList}>
                  {blocks.filter((b) => b.type === 'faq').map((faq, i) => (
                    <details key={i} className={styles.faqItem}>
                      <summary className={styles.faqQuestion}>
                        <ChevronRight size={14} className={styles.faqChevron} />
                        {faq.question}
                      </summary>
                      <p className={styles.faqAnswer}>{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {post.tag_names && post.tag_names.length > 0 && (
              <div className={styles.tagList}>
                {post.tag_names.map((tag) => (
                  <Link key={tag} href={`/blog?tag=${tag}`} className={styles.tagPill}>{tag}</Link>
                ))}
              </div>
            )}

            {/* Author Bio */}
            {post.author_profile_data && (
              <Reveal variant="fadeUp" delay={100}>
                <div className={styles.authorCard}>
                  {post.author_image ? (
                    <img src={mediaUrl(post.author_image)} alt={post.author_image_alt || post.author_profile_data.name || 'Author'} className={styles.authorCardAvatarImg} />
                  ) : (
                    <span className={styles.authorCardAvatar}>{(post.author_profile_data.name || 'A').charAt(0)}</span>
                  )}
                  <div className={styles.authorCardBody}>
                    <strong className={styles.authorCardName}>{post.author_profile_data.name}</strong>
                    {post.author_profile_data.designation && (
                      <span className={styles.authorCardDesignation}>{post.author_profile_data.designation}</span>
                    )}
                    {post.author_profile_data.bio && <p className={styles.authorCardBio}>{post.author_profile_data.bio}</p>}
                    {post.author_profile_data && (
                      <div className={styles.authorCardSocial}>
                        {post.author_profile_data.linkedin_url && (
                          <a href={post.author_profile_data.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          </a>
                        )}
                        {post.author_profile_data.twitter_url && (
                          <a href={post.author_profile_data.twitter_url} target="_blank" rel="noopener noreferrer" title="Twitter">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                          </a>
                        )}
                        {post.author_profile_data.facebook_url && (
                          <a href={post.author_profile_data.facebook_url} target="_blank" rel="noopener noreferrer" title="Facebook">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          </a>
                        )}
                        {post.author_profile_data.instagram_url && (
                          <a href={post.author_profile_data.instagram_url} target="_blank" rel="noopener noreferrer" title="Instagram">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"/></svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            )}

            {/* Back link */}
            <div className={styles.articleFooter}>
              <Link href="/blog" className={styles.footerLink}>
                <ArrowLeft size={16} /> Back to Blog
              </Link>
            </div>
          </div>
        </article>

        {/* Related */}
        {relatedPosts.length > 0 && (
          <Reveal variant="fadeUp">
            <section className={styles.relatedSection}>
              <div className={styles.relatedInner}>
                <h2 className={styles.relatedTitle}>Related Articles</h2>
                <div className={styles.relatedGrid}>
                  {relatedPosts.map((rp) => (
                    <Link key={rp.id} href={`/blog/${rp.slug}`} className={styles.relatedCard}>
                      {rp.featured_image ? (
                        <div className={styles.relatedCardImg}>
                          <img src={mediaUrl(rp.featured_image) || ''} alt={rp.title} loading="lazy" />
                        </div>
                      ) : (
                        <div className={styles.relatedCardImg}>
                          <DummyImage title={rp.title} slug={rp.slug} />
                        </div>
                      )}
                      <div className={styles.relatedCardBody}>
                        {rp.category_name && <span className={styles.relatedCardCat}>{rp.category_name}</span>}
                        <h4>{rp.title}</h4>
                        <span className={styles.relatedCardLink}>Read Article <ArrowRight size={14} /></span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </Reveal>
        )}

        {/* CTA */}
        <Reveal variant="fadeUp">
          <section className={styles.ctaSection}>
            <div className={styles.ctaInner}>
              <div className={styles.ctaCard}>
                <h2>Ready to Transform Your Images?</h2>
                <p>Get 3-5 images edited for free. No credit card required.</p>
                <div className={styles.ctaGroup}>
                  <Link href="/free-trial" className={styles.ctaBtn}>Start Free Trial <ArrowRight size={16} /></Link>
                  <Link href="/pricing" className={styles.ctaBtnOutline}>View Pricing</Link>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
