'use client';
import { useState, useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';
import styles from '../styles/modules/faq-accordion.module.css';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  className?: string;
}

export default function FAQAccordion({ faqs, className }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = useCallback((id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className={`${styles.faqGrid} ${className || ''}`}>
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        const panelId = `faq-panel-${faq.id}`;
        const buttonId = `faq-button-${faq.id}`;

        return (
          <div
            key={faq.id}
            className={`${styles.faqCard} ${isOpen ? styles.faqCardOpen : ''}`}
            itemScope
            itemType="https://schema.org/Question"
          >
            <button
              id={buttonId}
              onClick={() => toggle(faq.id)}
              className={styles.faqTrigger}
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <span className={styles.faqQuestion} itemProp="name">
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
              className={`${styles.faqPanel} ${isOpen ? styles.faqPanelOpen : ''}`}
              itemScope
              itemType="https://schema.org/Answer"
            >
              <div className={styles.faqAnswer} itemProp="text">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
