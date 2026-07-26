'use client';
import { Award, Zap, ScrollText, ShieldCheck } from 'lucide-react';
import { ServiceEEAT } from '@/services/public-api';
import Reveal from '@/components/animations/Reveal';
import styles from './ServiceEEATSection.module.css';

const eeatItems = [
  { key: 'Experience', icon: Award, field: 'experience' as const },
  { key: 'Expertise', icon: Zap, field: 'expertise' as const },
  { key: 'Authoritativeness', icon: ScrollText, field: 'authoritativeness' as const },
  { key: 'Trustworthiness', icon: ShieldCheck, field: 'trustworthiness' as const },
];

interface Props {
  data: ServiceEEAT | null;
  serviceTitle?: string;
}

export default function ServiceEEATSection({ data, serviceTitle }: Props) {
  if (!data) return null;

  const hasContent = eeatItems.some(item => data[item.field]?.trim());
  if (!hasContent) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <Reveal variant="fadeUp">
          <div className={styles.header}>
            <span className={styles.tag}>Expertise & Trust</span>
            <h2 className={styles.title}>Why Trust {serviceTitle || 'Our'} Expertise</h2>
            <div className={styles.accentLine} />
          </div>
        </Reveal>

        <div className={styles.grid}>
          {eeatItems.map(({ key, icon: Icon, field }, index) => {
            const value = data[field]?.trim();
            if (!value) return null;
            return (
              <Reveal key={key} variant="fadeUp" delay={index * 100}>
                <article className={styles.card}>
                  <div className={styles.iconWrap}>
                    <Icon size={22} />
                  </div>
                  <h3 className={styles.cardTitle}>{key}</h3>
                  <p className={styles.cardDesc}>{value}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
