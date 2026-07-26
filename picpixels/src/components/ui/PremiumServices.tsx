// src/shared/components/PremiumServices.tsx
'use client';

import { useEffect, useRef } from 'react';
import { type Service } from '@/services/public-api';
import ServiceCard from './ServiceCard';
import './PremiumServices.css';

interface PremiumServicesProps {
  services: Service[];
}

export default function PremiumServices({ services }: PremiumServicesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cards = container.querySelectorAll<HTMLElement>('.service-card');
    cards.forEach((card, i) => {
      // set stagger delay
      card.style.setProperty('--delay', `${i * 100}ms`);
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // optional: unobserve if you want trigger only once
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="premium-services-section" ref={containerRef}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="badge-tag">Our Most Popular Photo Editing Services</span>
          <h2 className="section-title">Tap into the power of high-end visual experiences.</h2>
        </div>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={service.id || index} className="service-card">
              <ServiceCard service={service} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
