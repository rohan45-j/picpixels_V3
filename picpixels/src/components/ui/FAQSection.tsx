'use client';

import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';
import { useSiteSettings } from '@/store/SiteSettingsContext';
import styles from '@/styles/modules/portfolio-faq.module.css';
import type { FAQ } from '@/services/public-api';

const defaultFaqs: FAQ[] = [
  {
    id: 1,
    question: 'How can 3D modeling services benefit my business?',
    answer: 'Professional 3D modeling improves product visualization, increases customer confidence, reduces photography costs, and helps businesses create high-quality marketing assets.',
    order: 1,
    is_active: true,
  },
  {
    id: 2,
    question: 'What is the turnaround time for your 3D rendering services?',
    answer: 'Our aim is for a swift turnaround, usually delivering standard projects within 24-48 hours. Larger volumes or complex tasks follow an agreed production schedule.',
    order: 2,
    is_active: true,
  },
  {
    id: 3,
    question: 'Can I test your services before committing to a larger project?',
    answer: 'Yes, absolutely! You can start with a test image or small trial project to evaluate our quality, speed, and precision before committing to larger production work.',
    order: 3,
    is_active: true,
  },
  {
    id: 4,
    question: 'What file formats do you deliver?',
    answer: 'We deliver in all industry-standard formats including high-resolution JPG, PNG, PSD with preserved layers, TIFF, and vector formats according to your exact specifications.',
    order: 4,
    is_active: true,
  },
  {
    id: 5,
    question: "What if I don't have CAD files?",
    answer: 'No problem at all! You can provide standard photographs, hand sketches, dimension sheets, or product reference links, and our team can build accurate models from scratch.',
    order: 5,
    is_active: true,
  },
  {
    id: 6,
    question: 'What is the largest file size I can upload?',
    answer: 'File sizes should be kept under 64 MB per image for smooth processing. JPG format is preferred. Contact us for larger files or specific requirements.',
    order: 6,
    is_active: true,
  },
  {
    id: 7,
    question: 'How long does it take to deliver an image?',
    answer: 'Our aim is for a swift turnaround, usually delivering edited images within 12-24 hours for standard projects. Larger volumes or complex tasks may take longer.',
    order: 7,
    is_active: true,
  },
  {
    id: 8,
    question: 'Can I test your work quality?',
    answer: 'Absolutely! Send us your raw files (up to 3 images), and let us process your image according to your requirements. Contact us to discuss your needs.',
    order: 8,
    is_active: true,
  },
];

interface FAQSectionProps {
  faqs?: FAQ[] | null;
  titlePrefix?: string;
  title?: string;
  brandOrSubject?: string;
  subtitle?: string;
  titleColor?: string;
  idPrefix?: string;
}

export default function FAQSection({
  faqs,
  titlePrefix = 'Queries about',
  title,
  brandOrSubject,
  subtitle = "We've got all your answers.",
  titleColor,
  idPrefix = 'faq',
}: FAQSectionProps) {
  const { siteSettings } = useSiteSettings();
  const brandName = siteSettings?.site_name || 'PicPicxels';
  const subject = brandOrSubject || brandName;

  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = useCallback((id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const headingPrefix = titlePrefix || (title && title !== 'Frequently Asked Questions' ? title : 'Queries about');

  const activeFaqs = Array.isArray(faqs)
    ? faqs.filter((f) => f.is_active !== false)
    : [];

  const displayFaqs = activeFaqs.length > 0
    ? activeFaqs
    : (faqs === undefined || faqs === null ? defaultFaqs : []);

  if (displayFaqs.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left Column */}
          <div className={styles.leftCol}>
            <Reveal variant="fadeRight" once={false}>
              <h2 className={styles.title} style={titleColor ? { color: titleColor } : undefined}>
                {headingPrefix}
                <span className={styles.titleBrand}>{subject}</span>
              </h2>
              <p className={styles.subtitle}>{subtitle}</p>
            </Reveal>
          </div>

          {/* Right Column */}
          <div className={styles.accordionList}>
            {displayFaqs.map((faq, index) => {
              const isOpen = openId === faq.id;
              const num = String(index + 1).padStart(2, '0');
              const panelId = `${idPrefix}-panel-${faq.id || index}`;
              const buttonId = `${idPrefix}-button-${faq.id || index}`;

              return (
                <div
                  key={faq.id || index}
                  className={styles.item}
                  itemScope
                  itemType="https://schema.org/Question"
                >
                  <button
                    id={buttonId}
                    type="button"
                    className={styles.trigger}
                    onClick={() => toggle(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span className={styles.number}>{num}</span>
                    <span className={styles.question} itemProp="name">
                      {faq.question}
                    </span>
                    <span className={`${styles.iconWrap} ${isOpen ? styles.iconWrapOpen : ''}`}>
                      <ChevronDown size={18} strokeWidth={2.2} />
                    </span>
                  </button>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
                    itemScope
                    itemType="https://schema.org/Answer"
                  >
                    <div className={styles.panelInner}>
                      <p className={styles.answer} itemProp="text">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
