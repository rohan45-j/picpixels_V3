'use client';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import AnimatedStatCard from './AnimatedStatCard';
import styles from '../styles/modules/homepage.module.css';

export default function HighEndQualitySection() {
  return (
    <section className={`${styles.section} ${styles.calcSection}`}>
      <div className="container">
        <Reveal variant="fadeUp" once={false}>
          <SectionHeading
            tag="Unbeatable rates"
            text="Excellent High-End Quality Editing"
            subtitle="We provide 100% handmade image editing services using Photoshop. We always strive to deliver your order within 24 hours or less."
          />
        </Reveal>
        <div className={styles.statsRow}>
          <AnimatedStatCard value="500+" label="Projects Completed" index={0} />
          <AnimatedStatCard value="98%" label="Client Satisfaction" index={1} />
          <AnimatedStatCard value="50+" label="Business Partners" index={2} />
          <AnimatedStatCard value="24/7" label="Support Available" index={3} />
        </div>
      </div>
    </section>
  );
}
