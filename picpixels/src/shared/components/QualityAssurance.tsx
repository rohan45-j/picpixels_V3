'use client';

import { ShieldCheck, Layers, Palette, CopyCheck, Shield, Headphones } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import styles from './QualityAssurance.module.css';

const items = [
  {
    icon: ShieldCheck,
    title: 'Pixel-Perfect Quality',
    desc: 'Every image is carefully reviewed to ensure flawless editing and professional results.',
  },
  {
    icon: Layers,
    title: 'Multi-Level Quality Check',
    desc: 'Each project goes through multiple quality inspection stages before final delivery.',
  },
  {
    icon: Palette,
    title: 'Color & Detail Accuracy',
    desc: 'We maintain accurate colors, sharp details, and natural-looking edits across every image.',
  },
  {
    icon: CopyCheck,
    title: 'Consistency Across All Images',
    desc: 'Large batches are edited with consistent style, tone, lighting, and quality standards.',
  },
  {
    icon: Shield,
    title: 'Secure File Handling',
    desc: 'Your files remain safe and confidential throughout our entire editing workflow.',
  },
  {
    icon: Headphones,
    title: '24/7 Quality Support',
    desc: 'Our team is always available to resolve quality concerns and ensure complete client satisfaction.',
  },
];

export default function QualityAssurance() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <Reveal variant="fadeUp">
          <div className={styles.header}>
            <SectionHeading
              tag="Quality Assurance"
              text="Quality Assurance"
              subtitle="Our quality assurance process ensures every image is carefully checked before delivery, maintaining consistency, accuracy, and professional standards."
            />
          </div>
        </Reveal>

        <div className={styles.grid}>
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={index} variant="fadeUp" delay={index * 100}>
                <article className={styles.card}>
                  <div className={styles.iconWrap}>
                    <Icon size={22} />
                  </div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDesc}>{item.desc}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
