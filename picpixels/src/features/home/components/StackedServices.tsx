'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { mediaUrl, type Service } from '@/services/public-api';
import SectionHeading from '@/components/ui/SectionHeading';
import '@/components/ui/StackedServices.css';

gsap.registerPlugin(ScrollTrigger);

interface StackedServicesProps {
  services: Service[];
}

export default function StackedServices({ services }: StackedServicesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const featured = services.filter((s) => s.is_featured);
  const total = featured.length;
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isDesktop || total === 0) return;

    const wrapper = wrapperRef.current;
    const section = sectionRef.current;
    const container = cardsContainerRef.current;
    if (!wrapper || !section || !container) return;

    const cards = container.querySelectorAll<HTMLElement>('.stack-card');
    if (!cards.length) return;
    const maxIndex = total - 1;

    const step = window.innerHeight * 0.5;
    const scrollDistance = step * maxIndex;
    const vh = window.innerHeight;
    wrapper.style.minHeight = vh + scrollDistance + 'px';

    function showCard(i: number) {
      gsap.set(cards[i], { opacity: 1, scale: 1, y: 0, zIndex: 200 + i });
    }

    function hideCard(i: number) {
      gsap.set(cards[i], { opacity: 0, scale: 0.88, y: 80, zIndex: 100 - i });
    }

    function bgCard(i: number) {
      gsap.set(cards[i], { opacity: 0.35, scale: 0.82, y: -60, zIndex: i + 1 });
    }

    function syncState(activeIdx: number) {
      for (let i = 0; i < total; i++) {
        if (i < activeIdx) bgCard(i);
        else if (i === activeIdx) showCard(i);
        else hideCard(i);
      }
    }

    function animateForward(fromIdx: number, toIdx: number) {
      gsap.to(cards[fromIdx], {
        opacity: 0.35, scale: 0.82, y: -60, zIndex: fromIdx + 1,
        duration: 0.5, ease: 'power2.inOut',
      });
      gsap.set(cards[toIdx], { zIndex: 200 + toIdx });
      gsap.fromTo(cards[toIdx],
        { opacity: 0, scale: 0.88, y: 80 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      );
    }

    function animateBackward(fromIdx: number, toIdx: number) {
      gsap.to(cards[fromIdx], {
        opacity: 0, scale: 0.88, y: 80, zIndex: 100 - fromIdx,
        duration: 0.5, ease: 'power2.inOut',
      });
      gsap.set(cards[toIdx], { zIndex: 200 + toIdx });
      gsap.to(cards[toIdx], {
        opacity: 1, scale: 1, y: 0,
        duration: 0.6, ease: 'power2.out',
      });
      for (let j = 0; j < toIdx; j++) {
        gsap.to(cards[j], {
          opacity: 0.35, scale: 0.82, y: -60, zIndex: j + 1,
          duration: 0.4, ease: 'power2.inOut',
        });
      }
    }

    let currentIndex = 0;
    let lastProgress = 0;
    let isReady = false;

    syncState(0);

    const st = ScrollTrigger.create({
      trigger: wrapper,
      pin: section,
      start: 'top top',
      end: `+=${scrollDistance}`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (!isReady) {
          isReady = true;
          lastProgress = self.progress;
          const idx = Math.min(maxIndex, Math.round(self.progress * maxIndex));
          if (idx !== currentIndex) {
            currentIndex = idx;
            syncState(idx);
          }
          return;
        }

        const progress = self.progress;
        const goingDown = progress > lastProgress;
        lastProgress = progress;

        if (goingDown && currentIndex < maxIndex) {
          const threshold = (currentIndex + 1) / maxIndex;
          if (progress >= threshold) {
            animateForward(currentIndex, currentIndex + 1);
            currentIndex++;
          }
        } else if (!goingDown && currentIndex > 0) {
          const threshold = currentIndex / maxIndex;
          if (progress <= threshold) {
            animateBackward(currentIndex, currentIndex - 1);
            currentIndex--;
          }
        }
      },
      onEnter: () => {
        currentIndex = 0;
        syncState(0);
      },
      onLeave: () => gsap.set(section, { clearProps: 'position' }),
      onLeaveBack: () => {
        gsap.set(section, { clearProps: 'position' });
        currentIndex = 0;
        syncState(0);
      },
    });

    return () => {
      st.kill();
      gsap.killTweensOf(cards);
      gsap.killTweensOf(section);
      gsap.killTweensOf(wrapper);
      gsap.killTweensOf(container);
      ScrollTrigger.getAll().forEach(t => t.vars.id === undefined && t.kill());
    };
  }, [isDesktop, total]);

  const FALLBACK_TAGS = ['High Quality Output', 'Fast Delivery', 'Professional Editing'];

  const getFeatures = (service: Service) => {
    const all = service.features ?? [];
    const count = all.length;
    const showCount = count >= 6 ? 4 : count >= 4 ? 3 : count;
    const display = all.slice(0, showCount);
    const fillCount = count < 3 ? 3 - count : 0;
    const fill = fillCount > 0 ? FALLBACK_TAGS.slice(0, fillCount) : [];
    return { features: display, fill };
  };

  const getImageUrl = (service: Service) =>
    mediaUrl(service.image || service.hero_images?.[0]?.image) || '';

  if (total === 0) return null;

  return (
    <div ref={wrapperRef} className="stacked-wrapper">
      <section ref={sectionRef} className="stacked-section">
        <div className="stacked-header">
          <span className="stacked-badge">Our Most Popular Photo Editing Services</span>
          <SectionHeading text="Premium Photo Editing Services" />
          <p className="stacked-desc">
            Professional image editing solutions tailored to your needs
          </p>
        </div>

        <div ref={cardsContainerRef} className="stacked-cards-container">
          {featured.map((service, index) => {
            const isImageLeft = index % 2 === 0;
            const { features, fill } = getFeatures(service);
            return (
              <div key={service.id || index} className="stack-card">
                <Link
                  href={`/services/${service.slug}`}
                  className={`stack-card-inner ${isImageLeft ? 'image-left' : 'image-right'}`}
                  aria-label={`Read more about ${service.title}`}
                >
                  <div className="stack-card-image">
                    {getImageUrl(service) ? (
                      <img
                        src={getImageUrl(service)}
                        alt={service.title}
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                    ) : (
                      <div className="stack-card-image-fallback">
                        {service.icon ? (
                          <span dangerouslySetInnerHTML={{ __html: service.icon }} />
                        ) : (
                          <span>PicPixels</span>
                        )}
                      </div>
                    )}
                    {service.price && parseFloat(service.price) > 0 && (
                      <div className="stack-card-price-badge">
                        From ${parseFloat(service.price).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className="stack-card-body">
                    <span className="stack-card-index">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="stack-card-title">{service.title}</h3>
                    <p className="stack-card-desc">
                      {service.short_description || service.description}
                    </p>
                    <ul className="stack-card-features">
                      {features.map((feature, fi) => (
                        <li key={fi}>
                          <Check size={13} strokeWidth={3} />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {fill.map((tag, fi) => (
                        <li key={`fill-${fi}`} className="stack-card-feature-fill">
                          <Check size={13} strokeWidth={3} />
                          <span>{tag}</span>
                        </li>
                      ))}
                    </ul>
                    <span className="stack-card-cta">
                      View Details <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
