'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Reveal from '@/components/animations/Reveal';
import styles from './LatestBlogs.module.css';
import { mediaUrl } from '@/services/public-api';
import type { BlogPost } from '@/services/public-api';

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function calculateReadTime(post: BlogPost): string {
  if (post.reading_time) return `${post.reading_time} min read`;
  const text = (post.content || post.excerpt || post.short_description || post.title || '');
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(2, Math.ceil(words / 60));
  return `${minutes} min read`;
}

export default function LatestBlogs({ posts }: { posts: BlogPost[] }) {
  if (!posts || posts.length === 0) return null;

  // Strictly keep exactly 3 cards visible
  const latestThree = posts.slice(0, 3);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <Reveal variant="fadeUp" once={false}>
          <div className={styles.headerWrap}>
            <SectionHeading
              tag="From The Journal"
              text="Latest Blogs & Insights"
              subtitle="Expert tips, retouching techniques, and eCommerce photography trends from our studio."
            />
          </div>
        </Reveal>

        <div className={styles.grid}>
          {latestThree.map((post, i) => {
            const readTime = calculateReadTime(post);
            const authorName = post.author_profile_data?.name || 'PicPixels Editorial';
            const authorAvatar = post.author_profile_data?.avatar || post.author_image;
            const category = post.category_name || 'Photography';

            return (
              <Reveal key={post.id} variant="fadeUp" delay={i * 120} once={false}>
                <Link href={`/blog/${post.slug}`} className={styles.card}>
                  {/* Card Image Wrap with Overlays & Badges */}
                  <div className={styles.imageWrap}>
                    {post.featured_image ? (
                      <img
                        src={mediaUrl(post.featured_image) || ''}
                        alt={post.featured_image_alt || post.title}
                        className={styles.image}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        No Image Available
                      </div>
                    )}
                    <div className={styles.imageOverlay} />

                    {/* Floating Glass Badges */}
                    <span className={styles.categoryBadge}>{category}</span>
                    <span className={styles.readTimeBadge}>
                      <Clock size={11} />
                      {readTime}
                    </span>
                  </div>

                  {/* Card Content Body */}
                  <div className={styles.body}>
                    <div className={styles.metaRow}>
                      {post.published_at && (
                        <span className={styles.metaItem}>
                          <Calendar size={13} />
                          {formatDate(post.published_at)}
                        </span>
                      )}
                    </div>

                    <h3 className={styles.title} title={post.title}>
                      {post.title}
                    </h3>

                    <p className={styles.excerpt}>
                      {post.excerpt || post.short_description || 'Learn how professional image editing can boost your sales, brand perception, and workflow efficiency.'}
                    </p>

                    {/* Card Footer with Author & Action */}
                    <div className={styles.footer}>
                      <div className={styles.author}>
                        {authorAvatar ? (
                          <img
                            src={mediaUrl(authorAvatar) || ''}
                            alt={authorName}
                            className={styles.authorAvatar}
                          />
                        ) : (
                          <div className={styles.authorFallback}>
                            {authorName.charAt(0)}
                          </div>
                        )}
                        <span className={styles.authorName}>{authorName}</span>
                      </div>

                      <span className={styles.readMore}>
                        Read Story
                        <ArrowRight className={styles.readMoreArrow} />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* View All CTA */}
        <Reveal variant="fadeUp" delay={250} once={false}>
          <div className={styles.viewAllWrap}>
            <Link href="/blog" className={styles.viewAllBtn}>
              View All Blogs
              <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
