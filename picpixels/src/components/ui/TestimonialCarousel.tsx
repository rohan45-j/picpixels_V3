'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { User } from 'lucide-react';
import { mediaUrl, type Testimonial } from '@/services/public-api';
import styles from './TestimonialCarousel.module.css';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill={i <= rating ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function sanitizeText(text: string): string {
  return text.replace(/,(\S)/g, ', $1');
}

function Avatar({ src, alt, name }: { src?: string | null; alt?: string; name: string }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = mediaUrl(src);
  const showImg = Boolean(imgSrc) && !imgError;

  return (
    <div className={styles.avatarContainer} aria-label={name}>
      {showImg ? (
        <img
          src={imgSrc}
          alt={alt || name}
          className={styles.avatarImg}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={styles.avatarFallback}>
          <User size={36} />
        </div>
      )}
    </div>
  );
}

function TestimonialCard({ t, show }: { t: Testimonial; show: boolean }) {
  const roleParts = [t.client_role, t.company].filter(Boolean);
  const roleLine = roleParts.join(' \u2022 ');
  return (
    <div className={`${styles.card} ${show ? styles.cardVisible : ''}`}>
      <div className={styles.cardInner}>
        <div className={styles.headerRow}>
          <Avatar src={t.avatar} alt={t.avatar_alt} name={t.client_name} />
          <div className={styles.infoCol}>
            <strong className={styles.name}>{t.client_name}</strong>
            {roleLine && <span className={styles.role}>{roleLine}</span>}
          </div>
        </div>
        <p className={styles.text}>{sanitizeText(t.text)}</p>
        <StarRating rating={t.rating} />
      </div>
    </div>
  );
}

function useVisibleCount(): number {
  const [count, setCount] = useState(3);
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 600) setCount(1);
      else if (w < 968) setCount(2);
      else setCount(3);
    }
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);
  return count;
}

export default function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const visibleCount = useVisibleCount();
  const totalSlides = Math.max(1, testimonials.length - visibleCount + 1);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => {
    setCurrent(Math.max(0, Math.min(i, totalSlides - 1)));
  }, [totalSlides]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [totalSlides, isPaused]);

  if (!testimonials.length) return null;

  return (
    <div
      ref={sectionRef}
      className={`${styles.wrapper} ${visible ? styles.visible : ''}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.trackWrap}>
        <div className={styles.track} style={{ transform: `translateX(-${current * (100 / visibleCount)}%)` }}>
          {testimonials.map((t, i) => (
            <div key={t.id || i} className={styles.slide} style={{ flex: `0 0 ${100 / visibleCount}%` }}>
              <TestimonialCard t={t} show={visible} />
            </div>
          ))}
        </div>
      </div>

      {totalSlides > 1 && (
        <>
          <button className={`${styles.arrow} ${styles.arrowPrev}`} onClick={prev} aria-label="Previous testimonial" disabled={current === 0}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button className={`${styles.arrow} ${styles.arrowNext}`} onClick={next} aria-label="Next testimonial" disabled={current >= totalSlides - 1}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </>
      )}

      {totalSlides > 1 && (
        <div className={styles.dots}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button key={i} className={`${styles.dot} ${i === current ? styles.dotActive : ''}`} onClick={() => goTo(i)} aria-label={`Go to testimonial group ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}
