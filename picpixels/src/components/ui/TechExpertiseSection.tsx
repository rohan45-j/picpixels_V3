import { Image } from 'lucide-react';
import { mediaUrl, type Technology } from '@/services/public-api';
import SectionHeading from './SectionHeading';
import Reveal from '@/components/animations/Reveal';
import styles from './TechExpertiseSection.module.css';

export default function TechExpertiseSection({ technologies }: { technologies: Technology[] }) {
  const items = (technologies || []).filter(
    (item, index, self) => index === self.findIndex(t => t.id === item.id)
  );

  if (items.length === 0) {
    return (
      <section className={styles.section}>
      <div className={styles.container}>
        <Reveal variant="fadeUp" once={false}>
        <SectionHeading
          tag="Expertise"
          text="Our Technology Expertise in Photo Editing"
          subtitle="No technologies available. Add them in the Django Admin."
        />
        </Reveal>
      </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <Reveal variant="fadeUp" once={false}>
        <SectionHeading
          tag="Expertise"
          text="Our Technology Expertise in Photo Editing"
          subtitle="Every image is processed using professional-grade tools trusted by industry leaders worldwide."
        />
        </Reveal>
        <div className={styles.slider}>
          <div className={styles.track}>
            {[...items, ...items].map((tech, idx) => (
              <div key={`${tech.id}-${idx}`} className={styles.circle}>
                {tech.icon ? (
                  <img
                    src={mediaUrl(tech.icon)}
                    alt={tech.title}
                    className={styles.logo}
                    loading="lazy"
                  />
                ) : (
                  <Image size={28} className={styles.fallbackIcon} aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
