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

  // Statistics from Admin Panel
  let statValue = '';
  if (Array.isArray(item.statistics) && item.statistics.length > 0) {
    const firstStat = item.statistics[0];
    if (typeof firstStat === 'object' && firstStat !== null && 'value' in firstStat) {
      statValue = String((firstStat as any).value || '');
    } else if (typeof firstStat === 'string') {
      statValue = firstStat;
    }
  }

  // Dynamic Content from Admin Panel
  const titleText = item.title;
  const descriptionText = item.excerpt || item.short_description || '';
  const categoryTag = item.category_name || 'CASE STUDY';

  return (
    <section className={styles.section} aria-labelledby="featured-case-study-heading">
      <div className={styles.container}>
        <Reveal variant="fadeUp" duration={700}>
          <div className={styles.header}>
            <SectionHeading
              tag="Client Success Story"
              text="Featured Case Study"
              subtitle="Real results from real clients — see how we transform challenges into success stories"
            />
          </div>
        </Reveal>

        <Reveal variant="fadeUp" delay={150} duration={700}>
          <div className={styles.cardWrapper}>
            <div className={styles.grid}>
              {/* Left Column: Metrics & Story */}
              <div className={styles.content}>
                <div className={styles.tag}>{categoryTag}</div>

                {statValue && <div className={styles.statNumber}>{statValue}</div>}

                <h3 className={styles.title}>{titleText}</h3>

                <p className={styles.description}>{descriptionText}</p>

                <Link
                  href={detailHref}
                  className={styles.ctaButton}
                  aria-label={`Read the full case study: ${item.title}`}
                >
                  <span>Read The Full Case Study</span>
                  <ArrowRight size={17} className={styles.ctaArrow} />
                </Link>
              </div>

              {/* Right Column: Visual Image Frame */}
              <div className={styles.visualWrapper}>
                <Link
                  href={detailHref}
                  className={styles.imageFrame}
                  aria-label={`View case study: ${item.title}`}
                >
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={imageAlt}
                      fill
                      className={styles.image}
                      loading="lazy"
                      sizes="(max-width: 1024px) 100vw, 50vw"
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
