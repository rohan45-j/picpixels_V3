'use client';

import Link from 'next/link';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimatedStatCard from '@/components/ui/AnimatedStatCard';
import Reveal from '@/components/animations/Reveal';
import styles from '@/styles/modules/about.module.css';
import {
  Target, Eye, Star, Zap, Sparkles, Shield, Globe, DollarSign,
  FileText, Mail, ClipboardCheck, Image as ImageIcon, TrendingUp, CheckCircle,
  Award, Heart, Users, Clock, Compass, Layers, Palette, Cpu, Rocket, ThumbsUp, Smile, Check, ArrowRight,
  Flag, Lightbulb, type LucideIcon
} from 'lucide-react';
import type { Testimonial, BrandLogo, AboutPageData } from '@/services/public-api';

import TrustBar from '@/components/ui/TrustBar';
import TestimonialCarousel from '@/components/ui/TestimonialCarousel';

const ICON_MAP: Record<string, LucideIcon> = {
  target: Target,
  eye: Eye,
  star: Star,
  zap: Zap,
  sparkles: Sparkles,
  shield: Shield,
  globe: Globe,
  dollarsign: DollarSign,
  dollar: DollarSign,
  filetext: FileText,
  mail: Mail,
  clipboardcheck: ClipboardCheck,
  image: ImageIcon,
  trendingup: TrendingUp,
  checkcircle: CheckCircle,
  award: Award,
  heart: Heart,
  users: Users,
  clock: Clock,
  compass: Compass,
  layers: Layers,
  palette: Palette,
  cpu: Cpu,
  rocket: Rocket,
  thumbsup: ThumbsUp,
  smile: Smile,
  check: Check,
  arrowright: ArrowRight,
  flag: Flag,
  lightbulb: Lightbulb,
};

function DynamicAboutIcon({
  iconName,
  iconImage,
  fallback: FallbackIcon,
  size = 22,
}: {
  iconName?: string;
  iconImage?: string | null;
  fallback: LucideIcon;
  size?: number;
}) {
  if (iconImage) {
    const src = iconImage.startsWith('http')
      ? iconImage
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com'}${iconImage}`;
    return (
      <img
        src={src}
        alt=""
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    );
  }
  const cleanKey = (iconName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const IconComponent = ICON_MAP[cleanKey] || FallbackIcon;
  return <IconComponent size={size} />;
}

const defaultMissionVision = [
  { id: 1, title: 'Our Mission', description: 'Deliver flawless, high-quality photo edits that help businesses grow, sell more, and present their products with confidence.', icon_name: 'Target', icon_image: null },
  { id: 2, title: 'Our Vision', description: 'A world where every brand has access to professional, affordable photo editing that elevates their visual identity and drives business results.', icon_name: 'Eye', icon_image: null },
];

const defaultValues = [
  { id: 1, icon_name: 'Star', title: 'Quality First', description: 'We never compromise on quality. Every image goes through rigorous 3-stage quality assurance.', icon_image: null },
  { id: 2, icon_name: 'Zap', title: 'Speed', description: 'We deliver most orders within 12-24 hours with express options available when you need it faster.', icon_image: null },
  { id: 3, icon_name: 'Sparkles', title: 'Pixel-Perfect', description: '100% hand-drawn clipping paths and manual retouching for precise, flawless results every time.', icon_image: null },
  { id: 4, icon_name: 'Shield', title: 'Secure', description: 'We use secure FTP, Wetransfer, Dropbox, and Google Drive to safely handle files up to 500 GB.', icon_image: null },
  { id: 5, icon_name: 'Globe', title: 'Global Reach', description: 'Serving brands, retailers, media agencies, and commercial photographers across the world.', icon_image: null },
  { id: 6, icon_name: 'DollarSign', title: 'Affordable', description: 'Competitive pricing starting from $0.25 per image with bulk discounts up to 40% available.', icon_image: null },
];

const defaultProcessSteps = [
  { id: 1, step_number: '01', title: 'Request a Quote', description: 'Send us a quote request for the photographs you need edited.', icon_name: 'FileText', icon_image: null },
  { id: 2, step_number: '02', title: 'Get Your Quote', description: 'Receive an email within 30 minutes regarding cost and delivery time.', icon_name: 'Mail', icon_image: null },
  { id: 3, step_number: '03', title: 'Order Confirmation', description: 'Give us the green light. We begin working within your deadline.', icon_name: 'ClipboardCheck', icon_image: null },
  { id: 4, step_number: '04', title: 'Image Editing', description: 'Our expert editors process your images with precision and care.', icon_name: 'Image', icon_image: null },
  { id: 5, step_number: '05', title: 'Quality Check', description: 'A 3-stage quality assurance process ensures pixel-perfect results.', icon_name: 'CheckCircle', icon_image: null },
  { id: 6, step_number: '06', title: 'Increase Sales', description: 'Receive your edited images and sell more with high-quality visuals.', icon_name: 'TrendingUp', icon_image: null },
];

export default function AboutClient({
  testimonials,
  brandLogos,
  aboutData,
}: {
  testimonials: Testimonial[];
  brandLogos: BrandLogo[];
  aboutData?: AboutPageData | null;
}) {
  const missionItems = (aboutData?.mission_vision && aboutData.mission_vision.length > 0)
    ? aboutData.mission_vision
    : defaultMissionVision;

  const coreValuesItems = (aboutData?.core_values && aboutData.core_values.length > 0)
    ? aboutData.core_values
    : defaultValues;

  const processStepsItems = (aboutData?.process_steps && aboutData.process_steps.length > 0)
    ? aboutData.process_steps
    : defaultProcessSteps;

  const missionSectionTitle = aboutData?.settings?.mission_section_title || 'Mission & Vision';
  const missionSectionSubtitle = aboutData?.settings?.mission_section_subtitle || '';

  const valuesSectionTitle = aboutData?.settings?.values_section_title || 'Our Core Values';
  const valuesSectionSubtitle = aboutData?.settings?.values_section_subtitle || '';

  const processSectionTitle = aboutData?.settings?.process_section_title || 'Our Simple 6-Step Process';
  const processSectionSubtitle = aboutData?.settings?.process_section_subtitle || '';

  const story = aboutData?.story;
  const storyTitle = story?.title || 'More Than a Photo Editing Company';
  const storySubtitle = story?.subtitle || 'We are a team of passionate photo editors, retouchers, and creative professionals dedicated to helping businesses present their products in the best possible light.';
  const storyP1 = story?.paragraph_1 || 'Founded with a vision to democratize professional photo editing, PicPicxels has grown from a small team of skilled retouchers into a global studio serving hundreds of clients across multiple industries.';
  const storyP2 = story?.paragraph_2 || 'Our team combines technical expertise with artistic sensibility. Every image that passes through our hands receives the same meticulous attention — whether it is a simple background removal or a complex ghost mannequin composite.';
  const storyP3 = story?.paragraph_3 || 'We believe that great imagery is not a luxury — it is a necessity for brands that want to stand out. That is why we have built our entire workflow around quality, speed, and reliability.';

  return (
    <>
      <Reveal variant="fadeDown">
        <section className={styles.hero}>
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

      <Reveal variant="fadeIn"><TrustBar brands={brandLogos} /></Reveal>

      <section className={styles.sectionAlt}>
        <div className={styles.statsRow}>
          <AnimatedStatCard value="8,000+" label="Photos Edited" index={0} />
          <AnimatedStatCard value="5M+" label="Images Processed" index={1} />
          <AnimatedStatCard value="500+" label="Active Clients" index={2} />
          <AnimatedStatCard value="10+" label="Years Experience" index={3} />
          <AnimatedStatCard value="24/7" label="Client Support" index={4} />
        </div>
      </section>

      {story?.is_active !== false && (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <Reveal variant="fadeUp">
              <SectionHeading
                text={storyTitle}
                subtitle={storySubtitle || undefined}
              />
            </Reveal>
            <Reveal variant="fadeUp" delay={100}>
              <div className={styles.twoCol}>
                <div className={styles.twoColContent}>
                  {storyP1 && <p>{storyP1}</p>}
                  {storyP2 && <p>{storyP2}</p>}
                  {storyP3 && <p>{storyP3}</p>}
                </div>
                <div className={styles.twoColImage}>
                  {story?.featured_image ? (
                    <img
                      src={story.featured_image.startsWith('http') ? story.featured_image : `${process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com'}${story.featured_image}`}
                      alt={story.featured_image_alt || storyTitle}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <DynamicAboutIcon
                      iconName={story?.icon_name || 'Target'}
                      fallback={Target}
                      size={80}
                    />
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* 1. Mission & Vision */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <Reveal variant="fadeUp">
            <SectionHeading
              text={missionSectionTitle}
              subtitle={missionSectionSubtitle || undefined}
            />
          </Reveal>
          <div className={styles.missionGrid}>
            {missionItems.map((m, idx) => (
              <Reveal key={m.id || m.title} variant="fadeUp" delay={(idx + 1) * 100}>
                <div className={styles.missionCard}>
                  <div className={styles.missionIcon}>
                    <DynamicAboutIcon
                      iconName={m.icon_name}
                      iconImage={m.icon_image}
                      fallback={idx === 0 ? Target : Eye}
                      size={24}
                    />
                  </div>
                  <h3 className={styles.missionTitle}>{m.title}</h3>
                  <p className={styles.missionDesc}>{m.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Our Core Values */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <Reveal variant="fadeUp">
            <SectionHeading
              text={valuesSectionTitle}
              subtitle={valuesSectionSubtitle || undefined}
            />
          </Reveal>
          <div className={styles.valuesGrid}>
            {coreValuesItems.map((v, i) => (
              <Reveal key={v.id || v.title} variant="fadeUp" delay={i * 80}>
                <div className={styles.valueCard}>
                  <div className={styles.valueIcon}>
                    <DynamicAboutIcon
                      iconName={v.icon_name}
                      iconImage={v.icon_image}
                      fallback={Star}
                      size={20}
                    />
                  </div>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueDesc}>{v.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Our Process */}
      <section className={styles.processSection}>
        <div className={styles.processInner}>
          <Reveal variant="fadeUp">
            <SectionHeading
              text={processSectionTitle}
              subtitle={processSectionSubtitle || undefined}
            />
          </Reveal>
          <div className={styles.processGrid}>
            {processStepsItems.map((p, i) => (
              <Reveal key={p.id || i} variant="fadeUp" delay={i * 100} className={styles.processReveal}>
                <div className={styles.processCard}>
                  <div className={styles.processConnector}>
                    {i < processStepsItems.length - 1 && <div className={styles.processLine} />}
                  </div>
                  <div className={styles.processStepNum}>{p.step_number || `0${i + 1}`}</div>
                  <div className={styles.processIconWrap}>
                    <DynamicAboutIcon
                      iconName={p.icon_name}
                      iconImage={p.icon_image}
                      fallback={FileText}
                      size={22}
                    />
                  </div>
                  <h3 className={styles.processTitle}>{p.title}</h3>
                  <p className={styles.processDesc}>{p.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <Reveal variant="fadeUp">
            <SectionHeading
              text="What Our Clients Say"
            />
          </Reveal>
          <Reveal variant="fadeIn" delay={200}>
            {testimonials.length > 0 && <TestimonialCarousel testimonials={testimonials} />}
          </Reveal>
        </div>
      </section>
    </>
  );
}
