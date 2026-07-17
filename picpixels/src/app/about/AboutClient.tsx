'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import SectionHeading from '../../shared/components/SectionHeading';
import AnimatedStatCard from '../../shared/components/AnimatedStatCard';
import Reveal from '../../shared/components/Reveal';
import styles from '../../shared/styles/modules/about.module.css';
import {
  Target, Eye, Star, Zap, Sparkles, Shield, Globe, DollarSign,
  FileText, Mail, ClipboardCheck, Image, TrendingUp, CheckCircle,
} from 'lucide-react';
import type { Testimonial } from '../../services/public-api';

const TrustBar = dynamic(() => import('../../shared/components/TrustBar'), { ssr: false });
const TestimonialCarousel = dynamic(() => import('../../shared/components/TestimonialCarousel'), { ssr: false });

const values = [
  { icon: Star, title: 'Quality First', desc: 'We never compromise on quality. Every image goes through rigorous 3-stage quality assurance.' },
  { icon: Zap, title: 'Speed', desc: 'We deliver most orders within 12-24 hours with express options available when you need it faster.' },
  { icon: Sparkles, title: 'Pixel-Perfect', desc: '100% hand-drawn clipping paths and manual retouching for precise, flawless results every time.' },
  { icon: Shield, title: 'Secure', desc: 'We use secure FTP, Wetransfer, Dropbox, and Google Drive to safely handle files up to 500 GB.' },
  { icon: Globe, title: 'Global Reach', desc: 'Serving brands, retailers, media agencies, and commercial photographers across the world.' },
  { icon: DollarSign, title: 'Affordable', desc: 'Competitive pricing starting from $0.25 per image with bulk discounts up to 40% available.' },
];

const processSteps = [
  { step: '01', title: 'Request a Quote', desc: 'Send us a quote request for the photographs you need edited.', icon: FileText },
  { step: '02', title: 'Get Your Quote', desc: 'Receive an email within 30 minutes regarding cost and delivery time.', icon: Mail },
  { step: '03', title: 'Order Confirmation', desc: 'Give us the green light. We begin working within your deadline.', icon: ClipboardCheck },
  { step: '04', title: 'Image Editing', desc: 'Our expert editors process your images with precision and care.', icon: Image },
  { step: '05', title: 'Quality Check', desc: 'A 3-stage quality assurance process ensures pixel-perfect results.', icon: CheckCircle },
  { step: '06', title: 'Increase Sales', desc: 'Receive your edited images and sell more with high-quality visuals.', icon: TrendingUp },
];

export default function AboutClient({ testimonials }: { testimonials: Testimonial[] }) {

  return (
    <>
      <Reveal variant="fadeDown">
        <section className={styles.hero}>
          <span className={styles.heroBadge}>About PicPicxels</span>
          <h1 className={styles.heroTitle}>Your Trusted Virtual Photo<br />Editing Solution &amp; Design Studio</h1>
          <p className={styles.heroSub}>
            PicPicxels offers top-quality services that enhance revenue, increase profit margins,
            reduce operational costs, and save valuable time. We have edited over 5 million images
            for brands, retailers, media agencies, and commercial photographers worldwide.
          </p>
          <div className={styles.heroCta}>
            <Link href="/free-trial" className="btn btn-primary">Start Free Trial</Link>
            <Link href="/contact" className="btn btn-secondary">Get a Quote</Link>
          </div>
        </section>
      </Reveal>

      <Reveal variant="fadeIn"><TrustBar /></Reveal>

      <section className={styles.sectionAlt}>
        <div className={styles.statsRow}>
          <AnimatedStatCard value="5M+" label="Images Processed" index={0} />
          <AnimatedStatCard value="500+" label="Active Clients" index={1} />
          <AnimatedStatCard value="10+" label="Years Experience" index={2} />
          <AnimatedStatCard value="24/7" label="Client Support" index={3} />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <Reveal variant="fadeUp">
            <SectionHeading
              tag="Who We Are"
              text="More Than a Photo Editing Company"
              subtitle="We are a team of passionate photo editors, retouchers, and creative professionals dedicated to helping businesses present their products in the best possible light."
            />
          </Reveal>
          <Reveal variant="fadeUp" delay={100}>
            <div className={styles.twoCol}>
              <div className={styles.twoColContent}>
                <p>Founded with a vision to democratize professional photo editing, PicPicxels has grown from a small team of skilled retouchers into a global studio serving hundreds of clients across multiple industries.</p>
                <p>Our team combines technical expertise with artistic sensibility. Every image that passes through our hands receives the same meticulous attention — whether it is a simple background removal or a complex ghost mannequin composite.</p>
                <p>We believe that great imagery is not a luxury — it is a necessity for brands that want to stand out. That is why we have built our entire workflow around quality, speed, and reliability.</p>
              </div>
              <div className={styles.twoColImage}>
                <Target size={80} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <Reveal variant="fadeUp">
            <SectionHeading
              tag="Our Purpose"
              text="Mission &amp; Vision"
            />
          </Reveal>
          <div className={styles.missionGrid}>
            <Reveal variant="fadeUp" delay={100}>
              <div className={styles.missionCard}>
                <div className={styles.missionIcon}><Target size={24} /></div>
                <h3 className={styles.missionTitle}>Our Mission</h3>
                <p className={styles.missionDesc}>Deliver flawless, high-quality photo edits that help businesses grow, sell more, and present their products with confidence.</p>
              </div>
            </Reveal>
            <Reveal variant="fadeUp" delay={200}>
              <div className={styles.missionCard}>
                <div className={styles.missionIcon}><Eye size={24} /></div>
                <h3 className={styles.missionTitle}>Our Vision</h3>
                <p className={styles.missionDesc}>A world where every brand has access to professional, affordable photo editing that elevates their visual identity and drives business results.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <Reveal variant="fadeUp">
            <SectionHeading
              tag="Why Choose Us"
              text="Our Core Values"
            />
          </Reveal>
          <div className={styles.valuesGrid}>
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <Reveal key={v.title} variant="fadeUp" delay={i * 80}>
                  <div className={styles.valueCard}>
                    <div className={styles.valueIcon}><Icon size={20} /></div>
                    <h3 className={styles.valueTitle}>{v.title}</h3>
                    <p className={styles.valueDesc}>{v.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.processSection}>
        <div className={styles.processInner}>
          <Reveal variant="fadeUp">
            <SectionHeading
              tag="How It Works"
              text="Our Simple 6-Step Process"
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

      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <Reveal variant="fadeUp">
            <SectionHeading
              tag="Client Feedback"
              text="What Our Clients Say"
            />
          </Reveal>
          <Reveal variant="fadeIn" delay={200}>
            {testimonials.length > 0 && <TestimonialCarousel testimonials={testimonials} />}
          </Reveal>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <Reveal variant="fadeUp">
            <h2>Ready to Get Started?</h2>
            <p>Try our service with 3-5 free images. No credit card required. No commitment.</p>
            <div className={styles.ctaGroup}>
              <Link href="/free-trial" className="btn btn-primary">Start Free Trial</Link>
              <Link href="/pricing" className="btn btn-secondary">View Pricing</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
