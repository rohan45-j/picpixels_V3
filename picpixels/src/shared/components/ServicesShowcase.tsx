'use client';

import { useEffect, useRef, useState } from 'react';
import { type Service } from '../../services/public-api';
import ServiceCard from './ServiceCard';

interface ServicesShowcaseProps {
  services: Service[];
}

import './ServicesShowcase.css';
export default function ServicesShowcase({ services }: ServicesShowcaseProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update view state based on intersection
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px',
      }
    );


    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (services.length === 0) return null;

  return (
    <section className="services-section">
      <div className="services-container">
        {/* Section Header */}
        <div className="section-header">
          <span className="badge-tag">
            Our Most Popular Photo Editing Services
          </span>
          <h2 className="section-title">
            Tap into the power of high-end visual experiences.
          </h2>
          <p className="mt-4 text-base text-gray-500 md:text-lg leading-relaxed max-w-2xl mx-auto">
            Any product, setting, or volume. Recreated with premium quality, pixel-perfect accuracy, and seamless 24/7 delivery.
          </p>
        </div>

        {/* Card Grid */}
        <div
          ref={containerRef}
          className="services-grid"
        >
          {services.map((service, index) => (
            <div
              key={service.id || index}
              className={`service-card ${isInView ? 'visible' : ''}`}
              style={{
                '--delay': isInView ? `${index * 120}ms` : `${(services.length - index - 1) * 120}ms`,
                zIndex: index + 1,
              } as React.CSSProperties}
            >
              <ServiceCard service={service} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
