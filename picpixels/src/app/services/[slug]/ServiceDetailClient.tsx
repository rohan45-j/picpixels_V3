'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';
import HeroCarousel from '@/components/media/HeroCarousel';
import SectionHeading from '@/components/ui/SectionHeading';
import '@/components/media/gallery.css';
import styles from '@/styles/modules/services.module.css';
import faqStyles from '@/styles/modules/faq-accordion.module.css';
import type { BrandLogo } from '@/services/public-api';
import ServiceGallery from '@/components/media/ServiceGallery';
import FAQAccordion from '@/components/ui/FAQAccordion';
import HighEndQualitySection from '@/components/ui/HighEndQualitySection';
import ServiceEEATSection from '@/features/services/components/ServiceEEATSection';
import TrustBar from '@/components/ui/TrustBar';
import ServiceWhyNeedSection from '@/features/services/components/ServiceWhyNeedSection';
import ServiceProcessSection from '@/features/services/components/ServiceProcessSection';
import ServiceWhyChooseSection from '@/features/services/components/ServiceWhyChooseSection';
import TechExpertiseSection from '@/components/ui/TechExpertiseSection';
import ServicePricingSection from '@/features/services/components/ServicePricingSection';
import TestimonialCarousel from '@/components/ui/TestimonialCarousel';
import { mediaUrl, type Service, type ServiceContentSection, type ContentBlock, type Technology, type Testimonial } from '@/services/public-api';

function ContentSectionBlock({ section, index }: { section: ServiceContentSection; index: number }) {
  const isTextLeft = section.layout === 'text_left';
  const isFull = section.layout === 'full_width';
  const isImageTop = section.layout === 'image_top';
  const isTextOnly = section.layout === 'text_only';
  const wrapperClass = index % 2 === 0 ? styles.sectionWhite : styles.sectionTint;

  if (isFull) {
    return (
      <section className={`${styles.contentSectionWrapper} ${wrapperClass}`}>
        <div className="container">
          <div className={styles.fullWidthContent}>
            {section.heading && <h2 className={`${styles.contentHeading} gradient-text`}>{section.heading}</h2>}
            {section.content && <div className={styles.contentBody}>{section.content}</div>}
            {section.image && (
              <div className={styles.contentImageBlock}>
                <img
                  src={mediaUrl(section.image)}
                  alt={section.image_alt || section.heading || ''}
                  className={styles.contentImg}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (isImageTop) {
    return (
      <section className={`${styles.contentSectionWrapper} ${wrapperClass}`}>
        <div className="container">
          <div className={styles.imageTopLayout}>
            {section.image && (
              <div className={styles.imageTopImageWrap}>
                <img
                  src={mediaUrl(section.image)}
                  alt={section.image_alt || section.heading || ''}
                  className={styles.contentImg}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}
            <div className={styles.imageTopContent}>
              {section.heading && <h2 className={`${styles.contentHeading} gradient-text`}>{section.heading}</h2>}
              {section.content && <div className={styles.contentBody}>{section.content}</div>}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isTextOnly) {
    return (
      <section className={`${styles.contentSectionWrapper} ${wrapperClass}`}>
        <div className="container">
          <div className={styles.fullWidthContent}>
            {section.heading && <h2 className={`${styles.contentHeading} gradient-text`}>{section.heading}</h2>}
            {section.content && <div className={styles.contentBody}>{section.content}</div>}
          </div>
        </div>
      </section>
    );
  }

  const textOrder = isTextLeft ? 1 : 2;
  const imageOrder = isTextLeft ? 2 : 1;

  return (
    <section className={`${styles.contentSectionWrapper} ${wrapperClass}`}>
      <div className={`container ${styles.contentBlockGrid}`}>
        <div className={styles.contentText} style={{ order: textOrder }}>
          {section.heading && <h2 className={`${styles.contentHeading} gradient-text`}>{section.heading}</h2>}
          {section.content && <div className={styles.contentBody}>{section.content}</div>}
        </div>
        {section.image && (
          <div className={styles.contentImageBlock} style={{ order: imageOrder }}>
            <img
              src={mediaUrl(section.image)}
              alt={section.image_alt || section.heading || ''}
              className={styles.contentImg}
              loading="lazy"
              decoding="async"
            />
          </div>
        )}
      </div>
    </section>
  );
}

function ServiceBlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            if (block.level === 3) {
              return <h3 key={i} className={styles.contentH3}>{block.content}</h3>;
            }
            return <h2 key={i} className={styles.contentH2}>{block.content}</h2>;

          case 'text':
            return <p key={i} className={styles.contentBody} dangerouslySetInnerHTML={{ __html: block.content || '' }} />;

          case 'image':
            return (
              <figure key={i} className={styles.contentFigure} style={{ margin: '1.5rem 0' }}>
                <img src={mediaUrl(block.src || '')} alt={block.alt || ''} className={styles.contentImage} loading="lazy" />
                {block.caption && <figcaption className={styles.imageCaption}>{block.caption}</figcaption>}
              </figure>
            );

          case 'image_with_text':
            return (
              <div key={i} className={styles.imageWithTextBlock} style={{ margin: '1.5rem 0' }}>
                <figure className={styles.contentFigure}>
                  <img src={mediaUrl(block.src || '')} alt={block.alt || ''} className={styles.contentImage} loading="lazy" />
                  {block.caption && <figcaption className={styles.imageCaption}>{block.caption}</figcaption>}
                </figure>
                {block.text && <div className={styles.imageWithTextContent} dangerouslySetInnerHTML={{ __html: block.text }} />}
              </div>
            );

          case 'gallery':
            return (
              <div key={i} style={{ margin: '1.5rem 0' }}>
                <div className={styles.contentGalleryGrid}>
                  {(block.images || []).map((img, j) => (
                    <figure key={j} className={styles.contentFigure}>
                      <img src={mediaUrl(img.src || '')} alt={img.alt || ''} className={styles.contentImage} loading="lazy" />
                      {img.caption && <figcaption className={styles.imageCaption}>{img.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              </div>
            );

          case 'divider':
            return <hr key={i} className={styles.contentDivider} />;

          case 'callout':
            return (
              <div key={i} className={styles.calloutBlock} style={{ margin: '1.5rem 0' }}>
                {block.content && <p>{block.content}</p>}
              </div>
            );

          default:
            return null;
        }
      })}
    </>
  );
}

function HeroSection({ service }: { service: Service }) {
  const heroImages = service.hero_images && service.hero_images.length > 0
    ? service.hero_images
    : (service.image ? [{ id: 0, image: service.image, alt_text: service.title, order: 0 }] : []);

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroSplit}>
        <div className={styles.heroLeft}>
          {parseFloat(service.price || '0') > 0 && (
            <span className={styles.serviceBadge}>${parseFloat(service.price).toFixed(2)} Per Image</span>
          )}
          {service.icon && (
            <div className={styles.heroIcon}>{service.icon}</div>
          )}
          <h1 className={`${styles.title} gradient-text`}>{service.title}</h1>
          {(service.hero_subtitle || service.short_description) && (
            <p className={styles.heroSubtitle}>{service.hero_subtitle || service.short_description}</p>
          )}
          <div className={styles.heroCta}>
            <Link href={service.hero_cta_link || '/free-trial'} className={styles.heroCtaBtn}>
              {service.hero_cta_text || 'Start Free Trial'}
              <span className={styles.heroCtaArrow}>→</span>
            </Link>
            <Link href="/pricing" className={styles.heroCtaSecondary}>
              View Pricing
            </Link>
          </div>
        </div>
        <div className={styles.heroRight}>
          {heroImages.length > 0 && <HeroCarousel images={heroImages} />}
        </div>
      </div>
    </section>
  );
}

function AboutFeaturesSection({ service }: { service: Service }) {
  return (
    <section className={styles.aboutFeaturesSection}>
      <div className="container">
        <SectionHeading
          tag="About This Service"
          text={`Overview of ${service.title}`}
          subtitle={`Learn how our professional ${service.title.toLowerCase()} service can transform your product photography`}
        />
        <div className={styles.aboutFeaturesGrid}>
          <div className={styles.aboutColumn}>
            <div className={styles.aboutContent}>{service.description}</div>
          </div>
          {service.features && service.features.length > 0 && (
            <div className={styles.featuresColumn}>
              <h3 className={styles.featuresColumnTitle}>Key Features</h3>
              {service.features.map((feat: string, i: number) => (
                <div key={i} className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <CheckCircle size={18} />
                  </div>
                  <div className={styles.featureText}>{feat}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ServiceDetailClient({
  service, related, technologies, testimonials, brandLogos,
}: {
  service: Service;
  related: Service[];
  technologies: Technology[];
  testimonials: Testimonial[];
  brandLogos: BrandLogo[];
}) {
  return (
    <main>
      <HeroSection service={service} />
      <AboutFeaturesSection service={service} />
      <HighEndQualitySection />
      <ServiceEEATSection data={service.eeat ?? null} serviceTitle={service.title} />
      <TrustBar brands={brandLogos} />
      <ServiceWhyNeedSection
        features={service.why_need_features ?? []}
        title={service.why_need_section_title}
        description={service.why_need_section_description}
      />
      <ServiceProcessSection steps={service.process_steps ?? []} title={service.process_section_title} />
      <ServiceWhyChooseSection cards={service.why_choose_cards ?? []} title={service.why_choose_title} />
      <TechExpertiseSection technologies={technologies} />
      <ServicePricingSection
        cards={service.pricing_tier_cards ?? []}
        badgeText={service.pricing_title}
        heading={service.pricing_heading}
        description={service.pricing_description}
        startingPrice={service.pricing_starting_price}
        unit={service.pricing_unit}
        notes={service.pricing_notes}
        features={service.pricing_features}
        ctaText={service.pricing_cta_text}
        ctaLink={service.pricing_cta_link}
        cta2Text={service.pricing_cta2_text}
        cta2Link={service.pricing_cta2_link}
      />
      <section className={styles.sectionPaddingLg} style={{ background: 'var(--color-bg, #f8f9fa)' }}>
        <div className="container">
          <Reveal variant="fadeUp" once={false}>
            <SectionHeading tag="Clients Feedback" text="Our Clients &amp; Reviews" />
          </Reveal>
          <Reveal variant="fadeIn" delay={200}>
            <TestimonialCarousel testimonials={testimonials} />
          </Reveal>
        </div>
      </section>
      {service.content_blocks && service.content_blocks.length > 0 && (
        <section className={styles.contentBlocksSection}>
          <div className="container">
            <ServiceBlockRenderer blocks={service.content_blocks} />
          </div>
        </section>
      )}
      {service.gallery_images && service.gallery_images.length > 0 && (
        <section className={styles.sectionTint}>
          <ServiceGallery images={service.gallery_images} serviceTitle={service.title} />
        </section>
      )}
      {service.content_sections && service.content_sections.length > 0 && (
        service.content_sections.map((section, i) => (
          <ContentSectionBlock key={section.id || i} section={section} index={i} />
        ))
      )}
      {service.faqs && service.faqs.length > 0 && (
        <section className={faqStyles.faqSection}>
          <div className={faqStyles.faqInner}>
            <SectionHeading
              tag="FAQ"
              text={`${service.title} - FAQs`}
              subtitle={`Frequently asked questions about our ${service.title.toLowerCase()} service.`}
            />
            <FAQAccordion faqs={service.faqs} />
          </div>
        </section>
      )}
      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <div className="container">
            <SectionHeading tag="More Services" text="Related Services" subtitle="Explore more of our professional photo editing services" />
            <div className={styles.serviceIndexGrid}>
              {related.map((svc) => (
                <Link key={svc.id} href={`/services/${svc.slug}`} className={styles.serviceIndexCard}>
                  {svc.icon && <span className={styles.serviceIndexIcon}>{svc.icon}</span>}
                  <h3 className={styles.serviceIndexTitle}>{svc.title}</h3>
                  <p className={styles.serviceIndexDesc}>{svc.short_description || svc.description}</p>
                  {svc.price && parseFloat(svc.price) > 0 && (
                    <span className={styles.serviceIndexPrice}>From ${parseFloat(svc.price).toFixed(2)}/image</span>
                  )}
                  <span className={styles.serviceIndexLink}>Learn More →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Start with a Free Trial</h2>
            <p className={styles.ctaDesc}>Get 3-5 images edited for free. No credit card required.</p>
            <div className={styles.ctaGroup}>
              <Link href="/free-trial" className={styles.ctaBtnPrimary}>Free Trial →</Link>
              <Link href="/pricing" className={styles.ctaBtnSecondary}>View Pricing</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
