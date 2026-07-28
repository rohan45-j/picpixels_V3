'use client';
import { useState, useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Reveal from '@/components/animations/Reveal';
import styles from '@/styles/modules/homepage.module.css';

const faqs = [
  {
    id: 1,
    question: 'How can 3D modeling services benefit my business?',
    answer: 'Professional 3D modeling improves product visualization, increases customer confidence, reduces photography costs, and helps businesses create high-quality marketing assets.',
  },
  {
    id: 2,
    question: 'What is the turnaround time for your 3D rendering services?',
    answer: 'Delivery time depends on project complexity. Small projects are delivered quickly, while larger projects follow an agreed production timeline.',
  },
  {
    id: 3,
    question: 'Can I test your 3D rendering services before committing to a larger project?',
    answer: 'Yes. Clients can start with a small trial project before moving forward with larger production work.',
  },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = useCallback((id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <section className={styles.sectionAlt}>
      <div className="container max-w-3xl mx-auto px-6">
        <Reveal variant="fadeUp" once={false}>
          <SectionHeading text="Frequently Asked Questions" subtitle="We've got all your answers." />
        </Reveal>

        <div className={styles.faqGrid}>
          {faqs.map((faq, i) => {
            const isOpen = openId === faq.id;
            const panelId = `faq-panel-${faq.id}`;
            const buttonId = `faq-button-${faq.id}`;

            return (
              <Reveal key={faq.id} variant="fadeUp" delay={i * 100}>
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
