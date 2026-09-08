'use client';
import { useState, useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Reveal from '@/components/animations/Reveal';
import styles from '@/styles/modules/homepage.module.css';
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
    answer: 'Delivery time depends on project complexity. Small projects are delivered quickly, while larger projects follow an agreed production timeline.',
    order: 2,
    is_active: true,
  },
  {
    id: 3,
    question: 'Can I test your 3D rendering services before committing to a larger project?',
    answer: 'Yes. Clients can start with a small trial project before moving forward with larger production work.',
    order: 3,
    is_active: true,
  },
];

interface FAQSectionProps {
  faqs?: FAQ[] | null;
  title?: string;
  subtitle?: string;
}

export default function FAQSection({ faqs, title = 'Frequently Asked Questions', subtitle = "We've got all your answers." }: FAQSectionProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = useCallback((id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const displayFaqs = faqs && faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container max-w-3xl mx-auto px-6">
        <Reveal variant="fadeUp" once={false}>
          <SectionHeading text={title} subtitle={subtitle} />
        </Reveal>

        <div className={styles.faqGrid}>
          {displayFaqs.map((faq, i) => {
            const isOpen = openId === faq.id;
            const panelId = `faq-panel-${faq.id}`;
            const buttonId = `faq-button-${faq.id}`;

            return (
              <Reveal key={faq.id || i} variant="fadeUp" delay={i * 100}>
                <div className={`${styles.faqCard} ${isOpen ? styles.faqCardOpen : ''}`}>
                  <button
                    id={buttonId}
                    onClick={() => toggle(faq.id)}
                    className={styles.faqTrigger}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span className={styles.faqQuestion}>
                      {faq.question}
                    </span>
                    <span className={`${styles.faqIconBox} ${isOpen ? styles.faqIconBoxActive : ''}`}>
                      {isOpen ? (
                        <Minus className="w-4 h-4 text-[#FF8A50]" strokeWidth={2.5} />
                      ) : (
                        <Plus className="w-4 h-4 text-gray-500" strokeWidth={2.5} />
                      )}
                    </span>
                  </button>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`${styles.faqPanel} ${isOpen ? styles.faqPanelOpen : styles.faqPanelClosed}`}
                  >
                    <div className={styles.faqAnswer}>
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

