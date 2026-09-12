'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mediaUrl, type HeroSection } from '@/services/public-api';
import styles from './Hero.module.css';

function slideUrl(slide: { image: string }): string | undefined {
  if (slide.image) return mediaUrl(slide.image);
  return undefined;
}

function parseEmbedUrl(input?: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(/src=["']([^"']+)["']/i);
  if (match) return match[1];
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return null;
}

const DEFAULT_ORBE3D_SKETCHFAB = 'https://sketchfab.com/models/714944efd70947259004ac9d93d02405/embed?autostart=1&transparent=1&ui_infos=0';

export default function Hero({ hero }: { hero: HeroSection | null }) {
  const [current, setCurrent] = useState(0);

  const is3D = hero?.visual_type === '3d';
  const slideCount = hero?.slides?.length ?? 0;

  useEffect(() => {
    if (is3D || slideCount <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slideCount);
    }, 4000);
    return () => clearInterval(timer);
  }, [is3D, slideCount]);

  useEffect(() => {
    if (is3D && hero?.model_3d_file) {
      const scriptId = 'google-model-viewer-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'module';
        script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
        document.head.appendChild(script);
      }
    }
  }, [is3D, hero?.model_3d_file]);

  if (!hero) return null;

  const slides = hero.slides;
  const rawEmbed = parseEmbedUrl(hero.model_3d_embed_url);
  const embedUrl = hero.model_3d_file ? null : (rawEmbed || DEFAULT_ORBE3D_SKETCHFAB);
  const glbUrl = hero.model_3d_file ? mediaUrl(hero.model_3d_file) : null;

  const prevSlide = () => {
    if (slideCount <= 1) return;
    setCurrent((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const nextSlide = () => {
    if (slideCount <= 1) return;
    setCurrent((prev) => (prev + 1) % slideCount);
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={`${styles.heroText} animate-fade-in`}>
          <span className={styles.tagline}>{hero.tagline}</span>
          <h1 className={styles.title} style={{ color: hero.title_color || '#000000' }}>
            {hero.title}
          </h1>
          <p className={styles.description}>
            {hero.description}
          </p>
          <div className={styles.ctaGroup}>
            {hero.cta_primary_link && (
              <Link href={hero.cta_primary_link} className="btn btn-primary btn-lg">
                {hero.cta_primary_text} <span>➔</span>
              </Link>
            )}
            {hero.cta_secondary_link && (
              <Link href={hero.cta_secondary_link} className="btn btn-secondary btn-lg">
                {hero.cta_secondary_text}
              </Link>
            )}
          </div>

          {hero.stats?.length > 0 && (
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

        {/* Right side: Mutually exclusive 3D Model Viewer OR Image Slider */}
        <div className={styles.heroSlider}>
          {is3D ? (
            <div className={`${styles.sliderWindow} ${styles.model3dWindow}`}>
              {/* 3D Model Display: Embed iframe or Google model-viewer */}
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={hero.model_3d_title || "3D Interactive Model"}
                  className={styles.model3dIframe}
                  allow="autoplay; fullscreen; xr-spatial-tracking; execution-while-out-of-viewport; execution-while-not-rendered; web-share"
                  allowFullScreen
                />
              ) : (
                /* @ts-expect-error custom web component */
                <model-viewer
                  src={glbUrl}
                  alt={hero.model_3d_title || "Interactive 3D Model"}
                  auto-rotate
                  camera-controls
                  touch-action="pan-y"
                  shadow-intensity="1.2"
                  shadow-softness="0.8"
                  environment-image="neutral"
                  exposure="1.0"
                  ar
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '420px',
                    backgroundColor: '#f8fafc',
                    display: 'block',
                  }}
                />
              )}
            </div>
          ) : (
            <div className={styles.sliderWindow}>
              {slides?.map((slide, i) => (
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

              {slides && slides.length > 1 && (
                <>
                  <button
                    type="button"
                    className={`${styles.navBtn} ${styles.prevBtn}`}
                    onClick={prevSlide}
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.navBtn} ${styles.nextBtn}`}
                    onClick={nextSlide}
                    aria-label="Next slide"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className={styles.sliderDots}>
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                        onClick={() => setCurrent(i)}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
