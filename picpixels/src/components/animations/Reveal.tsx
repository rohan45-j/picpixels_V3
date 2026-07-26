'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type Variant = 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'fadeIn' | 'scaleIn' | 'flipUp';

interface RevealProps {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  threshold?: number;
  as?: 'div' | 'section' | 'article' | 'span' | 'li';
}

export default function Reveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 600,
  className = '',
  once = true,
  threshold = 0.1,
  as: Tag = 'div',
}: RevealProps) {
  const TagComponent: React.ElementType = Tag;
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  return (
    <TagComponent
      ref={ref as any}
      className={`reveal reveal-${variant}${visible ? ' reveal-visible' : ''}${className ? ' ' + className : ''}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </TagComponent>
  );
}
