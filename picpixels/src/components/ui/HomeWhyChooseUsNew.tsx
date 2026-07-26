import Image from 'next/image';
import SectionHeading from './SectionHeading';
import Reveal from '@/components/animations/Reveal';
import styles from './HomeWhyChooseUsNew.module.css';
import { mediaUrl } from '@/services/public-api';
import type { WhyChooseFeatureSection } from '@/services/public-api';

export default function HomeWhyChooseUsNew({ data }: { data: WhyChooseFeatureSection | null }) {
  if (!data || !data.is_active) return null;

  const activeItems = data.items
    .filter((item) => item.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  if (activeItems.length === 0) return null;

  const title = data.title || 'Why Choose Us?';
  const featuredImage = mediaUrl(data.featured_image);
  const featuredAlt = data.featured_image_alt || 'Why choose us';

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <Reveal variant="fadeUp" once={false}>
          <div className={styles.header}>
            <SectionHeading tag="Why Choose Us" text={title} subtitle={data.subtitle || undefined} />
          </div>
        </Reveal>

        <div className={styles.grid}>
          <div className={styles.cardsCol}>
            {activeItems.map((item, index) => (
              <Reveal key={item.id} variant="fadeUp" delay={index * 100}>
                <article className={styles.card}>
                  <div className={styles.iconWrap}>
                    {item.icon ? (
                      <Image
                        src={mediaUrl(item.icon) || ''}
                        alt={item.title}
                        width={28}
                        height={28}
                        className={styles.iconImg}
                        loading="lazy"
                      />
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF8A50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardDesc}>{item.description}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal variant="fadeRight" delay={200}>
            <div className={styles.imageCol}>
              <div className={styles.imageWrap}>
                {featuredImage ? (
                  <Image
                    src={featuredImage}
                    alt={featuredAlt}
                    width={600}
                    height={450}
                    className={styles.image}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    Featured Image
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
