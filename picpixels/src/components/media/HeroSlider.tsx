// src/components/HeroSlider.tsx
'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './HeroSlider.module.css';

/**
 * Expected `data` shape:
 * {
 *   slides: [{ image: string, title: string, subtitle?: string, cta?: { text: string, link: string } }]
 * }
 */
export default function HeroSlider({ data }: { data: any }) {
  const [index, setIndex] = React.useState(0);
  const slides = data?.slides || [];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const current = slides[index];

  return (
    <div className={styles.sliderWrapper}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.image}
          className={styles.slide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <div
            className={styles.background}
            style={{ backgroundImage: `url(${current.image})` }}
          />
          <div className={styles.content}>
            <h1 className={styles.title}>{current.title}</h1>
            {current.subtitle && <p className={styles.subtitle}>{current.subtitle}</p>}
            {current.cta && (
              <a href={current.cta.link} className={styles.ctaButton}>
                {current.cta.text}
              </a>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
