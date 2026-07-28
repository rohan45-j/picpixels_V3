import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Reveal from '@/components/animations/Reveal';
import { mediaUrl } from '@/services/public-api';
import type { CaseStudyItem } from '@/services/public-api';
import styles from './HomeFeaturedCaseStudy.module.css';

interface FeaturedCaseStudyData {
  slug: string;
  title: string;
  description: string;
  image: string | null;
  imageAlt: string;
  buttonText: string;
  buttonLink: string;
}

function buildFeaturedData(item: CaseStudyItem): FeaturedCaseStudyData {
  const paragraphs: string[] = [];
  if (item.challenges) paragraphs.push(item.challenges);
  if (item.solution) paragraphs.push(item.solution);
  if (item.results) paragraphs.push(item.results);
  if (paragraphs.length === 0 && item.excerpt) paragraphs.push(item.excerpt);
  if (paragraphs.length === 0 && item.short_description) paragraphs.push(item.short_description);

  return {
    slug: item.slug,
    title: item.title,
    description: paragraphs.join('\n\n'),
    image: item.featured_image_url || mediaUrl(item.featured_image) || null,
    imageAlt: item.featured_image_alt || item.title,
    buttonText: 'Read The Full Case Study',
    buttonLink: `/case-studies/${item.slug}`,
  };
}

export default function HomeFeaturedCaseStudy({ item }: { item: CaseStudyItem | null }) {
  if (!item) return null;

  const data = buildFeaturedData(item);
  const detailHref = `/case-studies/${data.slug}`;

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

        <div className={styles.grid}>
          <Reveal variant="fadeUp" delay={150} duration={700}>
            <div className={styles.content}>
              <h3 className={styles.title}>{data.title}</h3>
              <div className={styles.description}>
                {data.description.split('\n\n').filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              <Link
                href={detailHref}
                className={styles.cta}
                aria-label={`Read the full case study: ${data.title}`}
              >
                {data.buttonText}
                <ArrowRight className={styles.ctaArrow} size={18} />
              </Link>
            </div>
          </Reveal>

          <Reveal variant="fadeIn" delay={300} duration={800}>
            <div className={styles.visual}>
              <Link
                href={detailHref}
                className={styles.imageLink}
                aria-label={`View case study: ${data.title}`}
                tabIndex={-1}
              >
                {data.image ? (
                  <Image
                    src={data.image}
                    alt={data.imageAlt}
                    width={640}
                    height={480}
                    className={styles.image}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>No image available</div>
                )}
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
