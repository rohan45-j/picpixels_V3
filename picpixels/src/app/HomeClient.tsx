'use client';
import dynamic from 'next/dynamic';
import SectionHeading from '@/components/ui/SectionHeading';

import Link from 'next/link';
import Reveal from '@/components/animations/Reveal';
import styles from '@/styles/modules/homepage.module.css';
import type { Service, Testimonial, Technology, PortfolioItem, PortfolioCategory, BlogPost, CaseStudyItem, WhyChooseSection, WhyChooseFeatureSection, HeroSection, BrandLogo, PricingConfigSectionData } from '@/services/public-api';
import { FileText, Mail, ClipboardCheck, Image, TrendingUp, Star } from 'lucide-react';

import TrustBar from '@/components/ui/TrustBar';
import StackedServices from '@/features/home/components/StackedServices';
import TestimonialCarousel from '@/components/ui/TestimonialCarousel';
import TechExpertiseSection from '@/components/ui/TechExpertiseSection';
import ContactSection from '@/components/ui/ContactSection';
import LatestBlogs from '@/components/ui/LatestBlogs';
import HomeFeaturedCaseStudy from '@/components/ui/HomeFeaturedCaseStudy';
import FAQSection from '@/components/ui/FAQSection';
import QualityAssurance from '@/components/ui/QualityAssurance';

// Lazy load heavy components that are below the fold
const HighEndQualitySection = dynamic(() => import('@/components/ui/HighEndQualitySection'), {
  ssr: false,
  loading: () => <div className={styles.skeletonSection} />,
});
const PortfolioGrid = dynamic(() => import('@/features/portfolio/components/PortfolioGrid'), {
  ssr: false,
  loading: () => <div className={styles.skeletonSection} />,
});
const PricingConfigurator = dynamic(() => import('@/features/pricing/components/PricingConfigurator'), {
  ssr: false,
  loading: () => <div className={styles.skeletonSection} />,
});
const HomeWhyChooseUsNew = dynamic(() => import('@/components/ui/HomeWhyChooseUsNew'), {
  ssr: false,
  loading: () => <div className={styles.skeletonSection} />,
});

const processSteps = [
  { step: '01', title: 'Request a quote', desc: 'Use our quotation/free trial to send us a quote request for the photographs you need to edit.', icon: FileText },
  { step: '02', title: 'Get your quote', desc: 'Receive an email within 30 minutes regarding cost and delivery time with your quote.', icon: Mail },
  { step: '03', title: 'Order confirmation', desc: 'Let us know the green light for your order. We will get work on it to deliver within your deadline.', icon: ClipboardCheck },
  { step: '04', title: 'Get the desired image', desc: 'Get your image done with free revisions if needed. Quality is our first priority.', icon: Image },
  { step: '05', title: 'Increase your sell', desc: 'Sell more and make your clients satisfied with high-quality edited images.', icon: TrendingUp },
  { step: '06', title: 'Give us review', desc: 'Your review is important to us. Help us improve and serve you better.', icon: Star },
];

export default function HomeClient({ services, testimonials, technologies, portfolios, portfolioCategories, whyChooseUs, latestBlogs, caseStudies, whyChooseFeatures, heroData, brandLogos, pricingConfig }: {
  services: Service[]; testimonials: Testimonial[]; technologies: Technology[]; portfolios: PortfolioItem[]; portfolioCategories: PortfolioCategory[]; whyChooseUs: WhyChooseSection | null; latestBlogs: BlogPost[]; caseStudies: CaseStudyItem[]; whyChooseFeatures: WhyChooseFeatureSection | null; heroData: HeroSection | null; brandLogos: BrandLogo[]; pricingConfig: PricingConfigSectionData | null;
}) {

  return (
    <>
      <Reveal variant="fadeIn"><TrustBar brands={brandLogos} /></Reveal>

      <HighEndQualitySection />

      <Reveal variant="fadeUp"><TechExpertiseSection technologies={technologies} /></Reveal>


      <StackedServices services={services} />

      <Reveal variant="fadeUp"><PricingConfigurator pricingData={pricingConfig} /></Reveal>

      <HomeWhyChooseUsNew data={whyChooseFeatures} />

      <QualityAssurance />

      <section className={`${styles.processSection} ${styles.section}`}>
        <div className="container">
          <Reveal variant="fadeUp" once={false}>
            <SectionHeading
              tag="How It Works"
              text="Simple 6-Step Process"
              subtitle="From request to delivery — a seamless workflow designed for your convenience"
            />
          </Reveal>
          <div className={styles.processGrid}>
            {processSteps.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={i} variant="fadeUp" delay={i * 100}>
                  <div className={styles.processCard}>
                    <div className={styles.processConnector}>
                      {i < processSteps.length - 1 && <div className={styles.processLine} />}
                    </div>
                    <div className={styles.processStepNum}>{p.step}</div>
                    <div className={styles.processIconWrap}><Icon size={22} /></div>
                    <h3 className={styles.processTitle}>{p.title}</h3>
                    <p className={styles.processDesc}>{p.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Reveal variant="fadeUp" once={false}><PortfolioGrid portfolios={portfolios} categories={portfolioCategories} /></Reveal>

      <section className={`${styles.section} ${styles.sectionAlt} ${styles.testimonialSection}`}>
        <div className="container">
          <Reveal variant="fadeUp" once={false}>
            <SectionHeading
              tag="Clients Feedback"
              text="Our Clients &amp; Reviews"
            />
          </Reveal>
          <Reveal variant="fadeIn" delay={200}>
            {testimonials.length > 0 && <TestimonialCarousel testimonials={testimonials} />}
          </Reveal>
        </div>
      </section>

      <LatestBlogs posts={latestBlogs} />

      <HomeFeaturedCaseStudy item={caseStudies?.[0] ?? null} />

      <ContactSection />

      <FAQSection />

      <section className={`${styles.section} ${styles.sectionCTA} ${styles.freeTrialSection}`}>
        <div className="container">
          <Reveal variant="fadeUp" once={false}>
            <SectionHeading
              text="Free Trial Available"
              subtitle="Get your quote within 45 minutes. Upload your images via Wetransfer or Dropbox. Your first (3-5) images are free. No credit card required."
            />
            <div className={styles.ctaGroup}>
              <Link href="/free-trial" className="btn btn-primary btn-lg">Start Free Trial →</Link>
              <Link href="/contact" className="btn btn-secondary btn-lg">Contact Us</Link>
            </div>
          </Reveal>
        </div>
      </section>
      
    </>
  );
}
