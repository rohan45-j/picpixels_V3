import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Reveal from '@/components/animations/Reveal';
import styles from '@/styles/modules/homepage.module.css';
import blogStyles from '@/styles/modules/blog.module.css';
import portfolioStyles from '@/styles/modules/portfolio-grid.module.css';
import { mediaUrl } from '@/services/public-api';
import type { BlogPost } from '@/services/public-api';

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function LatestBlogs({ posts }: { posts: BlogPost[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className={styles.sectionAlt}>
      <div className="container max-w-7xl mx-auto px-6">
        <Reveal variant="fadeUp" once={false}>
          <SectionHeading text="Latest Blogs" />
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post, i) => (
            <Reveal key={post.id} variant="fadeUp" delay={i * 100}>
              <Link
                href={`/blog/${post.slug}`}
                className={`${blogStyles.card} group h-full flex flex-col`}
              >
                <div className={blogStyles.cardImageWrap}>
                  {post.featured_image ? (
                    <img
                      src={mediaUrl(post.featured_image) || ''}
                      alt={post.featured_image_alt || post.title}
                      className={blogStyles.cardImg}
                      loading="lazy"
                    />
                  ) : (
                    <div className={blogStyles.cardImgPlaceholder}>
                      No image
                    </div>
                  )}
                </div>
                <div className={blogStyles.cardBody}>
                  {post.category_name && (
                    <div className={blogStyles.cardMeta}>
                      <span className={blogStyles.cardCategory}>{post.category_name}</span>
                    </div>
                  )}
                  <h3 className={blogStyles.cardTitle}>
                    {post.title}
                  </h3>
                  <p className={blogStyles.cardExcerpt}>
                    {post.excerpt || post.short_description}
                  </p>
                  <div className={blogStyles.cardFooter}>
                    {post.published_at && (
                      <span className={blogStyles.cardAuthor}>{formatDate(post.published_at)}</span>
                    )}
                    <span className={blogStyles.cardLink}>
                      Read More
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal variant="fadeUp" delay={300}>
          <div className={portfolioStyles.viewAllWrap}>
            <Link href="/blog" className={portfolioStyles.viewAllBtn}>
              View All Blogs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
