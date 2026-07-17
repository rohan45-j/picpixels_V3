'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchHeroData, mediaUrl, type HeroSection } from '../../services/public-api';
import styles from './Hero.module.css';

function slideUrl(slide: { image: string }): string | undefined {
  if (slide.image) return mediaUrl(slide.image);
  return undefined;
}

export default function Hero() {
  const [hero, setHero] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchHeroData().then((data) => {
      if (cancelled) return;
      setHero(data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const slideCount = hero?.slides?.length ?? 0;

  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slideCount);
    }, 4000);
    return () => clearInterval(timer);
  }, [slideCount]);

  if (loading) {
    return (
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <div style={{ height: 28, width: 240, background: 'var(--color-border)', borderRadius: 100, marginBottom: '1.6rem' }} />
            <div style={{ height: 48, width: '80%', background: 'var(--color-border)', borderRadius: 8, marginBottom: '1.2rem' }} />
            <div style={{ height: 16, width: '90%', background: 'var(--color-border)', borderRadius: 4, marginBottom: '0.5rem' }} />
            <div style={{ height: 16, width: '60%', background: 'var(--color-border)', borderRadius: 4 }} />
          </div>
          <div className={styles.heroSlider}>
            <div className={styles.sliderWindow} style={{ background: 'var(--color-border)' }} />
          </div>
        </div>
      </section>
    );
  }

  if (!hero) return null;

  const slides = hero.slides;

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={`${styles.heroText} animate-fade-in`}>
          <span className={styles.tagline}>{hero.tagline}</span>
          <h1 className={`${styles.title} gradient-text`}>
            {hero.title}
          </h1>
          <p className={styles.description}>
            {hero.description}
          </p>
          <div className={styles.ctaGroup}>
            <Link href={hero.cta_primary_link} className="btn btn-primary btn-lg">
              {hero.cta_primary_text} <span>➔</span>
            </Link>
            <Link href={hero.cta_secondary_link} className="btn btn-secondary btn-lg">
              {hero.cta_secondary_text}
            </Link>
          </div>

          {hero.stats.length > 0 && (
            <div className={styles.heroStats}>
              {hero.stats.map((stat) => (
                <div key={stat.id} className={styles.heroStat}>
                  <span className={styles.heroStatNum}>{stat.value}</span>
                  <span className={styles.heroStatLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.heroSlider}>
          <div className={styles.sliderWindow}>
            {slides.map((slide, i) => (
              <div
                key={slide.id || i}
                className={`${styles.slide} ${i === current ? styles.slideActive : ''}`}
              >
                <img
                  src={slideUrl(slide)}
                  alt={slide.alt_text}
                  className={styles.slideImg}
                  width={800}
                  height={600}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : undefined}
                  decoding={i === 0 ? 'auto' : 'async'}
                />
              </div>
            ))}
          </div>

          {slides.length > 1 && (
            <div className={styles.sliderDots}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
