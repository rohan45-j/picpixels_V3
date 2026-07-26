import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Reveal from '@/components/animations/Reveal';
import styles from '@/styles/modules/homepage.module.css';
import blogStyles from '@/styles/modules/blog.module.css';
import portfolioStyles from '@/styles/modules/portfolio-grid.module.css';
import { mediaUrl } from '@/services/public-api';
import type { CaseStudyItem } from '@/services/public-api';

export default function CaseStudySection({ items }: { items: CaseStudyItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container max-w-7xl mx-auto px-6">
        <Reveal variant="fadeUp" once={false}>
          <SectionHeading tag="Success Stories" text="Case Study" />
        </Reveal>

        {items.length === 1 ? (
          <FeaturedLayout item={items[0]} />
        ) : (
          <GridLayout items={items.slice(0, 3)} />
        )}

        {items.length > 1 && (
          <Reveal variant="fadeUp" delay={400}>
            <div className={portfolioStyles.viewAllWrap}>
              <Link href="/case-studies" className={portfolioStyles.viewAllBtn}>
                View All Case Studies
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function FeaturedLayout({ item }: { item: CaseStudyItem }) {
  return (
    <Reveal variant="fadeIn" delay={200}>
      <div className="flex flex-col lg:flex-row items-center gap-14 max-w-5xl mx-auto">
        <div className="flex-1 lg:pr-4">
          <h3 className="text-[2rem] lg:text-[2.25rem] font-bold text-gray-900 leading-tight mb-5">
            {item.title}
          </h3>
          <p className="text-gray-500 text-[1rem] leading-relaxed mb-9">
            {item.excerpt || item.short_description}
          </p>
          <Link
            href={`/case-studies/${item.slug}`}
            className="btn btn-primary inline-flex items-center gap-2.5 px-7 py-[0.8rem] rounded-xl text-[0.9rem]"
          >
            Read Full Case Study
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex-1 w-full">
          {item.featured_image_url || item.featured_image ? (
            <div className="rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.1)]">
              <img
                src={mediaUrl(item.featured_image) || item.featured_image_url || ''}
                alt={item.featured_image_alt || item.title}
                className="w-full aspect-[4/3] object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-full aspect-[4/3] rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function GridLayout({ items }: { items: CaseStudyItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item, i) => (
        <Reveal key={item.id} variant="fadeUp" delay={i * 120}>
          <Link
            href={`/case-studies/${item.slug}`}
            className={`${blogStyles.card} group h-full flex flex-col`}
          >
            <div className={blogStyles.cardImageWrap}>
              {item.featured_image_url || item.featured_image ? (
                <img
                  src={mediaUrl(item.featured_image) || item.featured_image_url || ''}
                  alt={item.featured_image_alt || item.title}
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
              {item.category_name && (
                <div className={blogStyles.cardMeta}>
                  <span className={blogStyles.cardCategory}>{item.category_name}</span>
                </div>
              )}
              <h3 className={blogStyles.cardTitle}>
                {item.title}
              </h3>
              <p className={blogStyles.cardExcerpt}>
                {item.excerpt || item.short_description}
              </p>
              <span className={`${blogStyles.cardLink} mt-auto self-start`}>
                Read More
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
