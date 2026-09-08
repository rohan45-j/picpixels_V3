import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Reveal from '@/components/animations/Reveal';
import { mediaUrl } from '@/services/public-api';
import type { CaseStudyItem } from '@/services/public-api';
import styles from './HomeFeaturedCaseStudy.module.css';

export default function HomeFeaturedCaseStudy({ item }: { item: CaseStudyItem | null }) {
  if (!item) return null;

  const detailHref = `/case-studies/${item.slug}`;
  const imageSrc = item.featured_image_url || (item.featured_image ? mediaUrl(item.featured_image) : null);
  const imageAlt = item.featured_image_alt || item.title;

  // Dynamic statistics from admin panel
  const statisticsList = Array.isArray(item.statistics)
    ? item.statistics.filter((s) => s && typeof s === 'object' && s.value)
    : [];

  // Dynamic text directly from admin panel fields
  const mainTitle = item.title;
  const descriptionText = item.excerpt || item.short_description || item.introduction || item.challenges || '';
  const categoryName = item.category_name || 'Case Study';

  return (
    <section className={styles.section} aria-labelledby="featured-case-study-heading">
      <div className={styles.container}>
        <Reveal variant="fadeUp" duration={700}>
          <div className={styles.header}>
            <SectionHeading
              text="Case Study"
              subtitle="Real results from real clients — see how we transform challenges into success stories"
            />
          </div>
        </Reveal>

        <Reveal variant="fadeUp" delay={150} duration={700}>
          <div className={styles.cardWrapper}>
            <div className={styles.grid}>
              <div className={styles.content}>
                {categoryName && (
                  <div className={styles.tag}>
                    <span className={styles.tagLine} />
                    <span>{categoryName}</span>
                  </div>
                )}

                {statisticsList.length > 0 && (
                  <div className={styles.statsContainer}>
                    {statisticsList.slice(0, 2).map((stat, idx) => (
                      <div key={idx} className={styles.statBox}>
                        <div className={styles.statNumber}>
                          {stat.value}{stat.suffix || ''}
                        </div>
                        {stat.label && (
                          <div className={styles.statLabel}>{stat.label}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <h3 className={styles.title}>{mainTitle}</h3>

                {descriptionText && (
                  <p className={styles.description}>{descriptionText}</p>
                )}

                <Link
                  href={detailHref}
                  className={styles.ctaButton}
                  aria-label={`Read the full case study: ${item.title}`}
                >
                  <span>Read The Full Case Study</span>
                  <ArrowRight size={18} className={styles.ctaArrow} />
                </Link>
              </div>

              <div className={styles.visual}>
                <Link
                  href={detailHref}
                  className={styles.imageFrame}
                  aria-label={`View case study: ${item.title}`}
                >
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={imageAlt}
                      width={680}
                      height={500}
                      className={styles.image}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>{item.title}</span>
                    </div>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

