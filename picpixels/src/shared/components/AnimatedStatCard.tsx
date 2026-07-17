'use client';
import { useState, useEffect, useRef } from 'react';
import styles from '../styles/modules/homepage.module.css';

function parseStatValue(raw: string): { num: number; suffix: string; isStatic: boolean } {
  if (raw === '24/7') return { num: 0, suffix: '24/7', isStatic: true };
  const m = raw.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (m) return { num: parseFloat(m[1]), suffix: m[2] || '', isStatic: false };
  return { num: 0, suffix: raw, isStatic: true };
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function AnimatedStatCard({ value, label, index }: { value: string; label: string; index: number }) {
  const [display, setDisplay] = useState<string>('');
  const [phase, setPhase] = useState<'hidden' | 'entering' | 'counting' | 'done'>('hidden');
  const ref = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  const { num, suffix, isStatic } = parseStatValue(value);

  useEffect(() => {
    if (startedRef.current) return;
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          obs.unobserve(el);

          const delay = 400 + index * 150;

          setPhase('entering');
          setTimeout(() => {
            if (isStatic) {
              setDisplay(suffix);
              setPhase('done');
              return;
            }

            setPhase('counting');
            setDisplay('0');

            const duration = 2000;
            const start = performance.now();

            function tick(now: number) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = easeOutCubic(progress);
              const current = Math.round(eased * num);
              const next = current + suffix;
              if (progress < 1) {
                setDisplay(next);
                requestAnimationFrame(tick);
              } else {
                setDisplay(next);
                setPhase('done');
              }
            }
            requestAnimationFrame(tick);
          }, delay);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    obs.observe(el);
    return () => {
      obs.disconnect();
    };
  }, [num, suffix, isStatic, index]);

  return (
    <div
      ref={ref}
      className={`${styles.statCard} ${phase !== 'hidden' ? styles.statCardVisible : ''}`}
      style={{ transitionDelay: phase === 'entering' ? `${index * 120}ms` : '0ms' }}
    >
      <span className={`${styles.statNum} ${phase === 'counting' ? styles.statNumCounting : ''} ${phase === 'done' ? styles.statNumDone : ''}`}>
        {display || '0'}
        <span className={styles.blinkCursor} />
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
