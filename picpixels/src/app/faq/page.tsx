'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import styles from '../../shared/styles/modules/legal.module.css';
import { Search, ChevronRight, HelpCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { fetchFAQs, fetchFAQCategories, type FAQ, type FAQCategory } from '../../services/public-api';
import SectionHeading from '../../shared/components/SectionHeading';
import Reveal from '../../shared/components/Reveal';

function groupFAQs(faqs: FAQ[], categories: FAQCategory[]): { catId: number | null; catName: string; items: FAQ[] }[] {
  if (categories.length > 0) {
    return categories.map((cat) => ({
      catId: cat.id,
      catName: cat.name,
      items: faqs.filter((f) => f.category === cat.id && f.is_active !== false),
    })).filter((g) => g.items.length > 0);
  }
  if (faqs.length > 0) {
    return [{ catId: null, catName: 'All Questions', items: faqs.filter((f) => f.is_active !== false) }];
  }
  return [];
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([fetchFAQs(), fetchFAQCategories()])
      .then(([faqData, catData]) => {
        setFaqs(faqData);
        setCategories(catData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const allGroups = groupFAQs(faqs, categories);
    return allGroups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (f) =>
            f.question.toLowerCase().includes(search.toLowerCase()) ||
            f.answer.toLowerCase().includes(search.toLowerCase()),
        ),
      }))
      .filter((g) => g.items.length > 0)
      .filter((g) => activeCategory === null || g.catId === activeCategory);
  }, [faqs, categories, search, activeCategory]);

  const toggleFaq = (id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalCount = faqs.filter((f) => f.is_active !== false).length;

  if (loading) {
    return (
      <>
        <Header />
        <main><div className={styles.loadingWrap}><div className={styles.loadingSpinner} /></div></main>
        <Footer />
      </>
    );
  }

  return (
    <>
      {/* FAQPage structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.filter((f) => f.is_active !== false).map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }),
        }}
      />

      <Header />
      <main>
        {/* Hero */}
        <Reveal variant="fadeDown">
          <section className={styles.hero}>
            <span className={styles.heroBadge}>Help Center</span>
            <h1 className={styles.heroTitle}>Frequently Asked Questions</h1>
            <p className={styles.heroSub}>
              Find answers to common questions about PicPicxels photo editing services, pricing, turnaround times, and more.
            </p>
          </section>
        </Reveal>

        {/* Search + Categories + FAQ List */}
        <section className={styles.contentSection}>
          <div className={styles.contentCard}>
            {/* Search */}
            <Reveal variant="fadeIn" delay={100}>
              <div className={styles.faqSearch}>
                <Search size={16} className={styles.faqSearchIcon} />
                <input
                  type="text"
                  placeholder={`Search ${totalCount} questions...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={styles.faqSearchInput}
                />
              </div>
            </Reveal>

            {/* Category Pills */}
            <Reveal variant="fadeIn" delay={150}>
              {categories.length > 0 && (
                <div className={styles.faqCategories}>
                  <button
                    className={`${styles.faqCatBtn} ${activeCategory === null ? styles.faqCatBtnActive : ''}`}
                    onClick={() => setActiveCategory(null)}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`${styles.faqCatBtn} ${activeCategory === cat.id ? styles.faqCatBtnActive : ''}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </Reveal>

            {/* FAQ Groups */}
            <Reveal variant="fadeUp" delay={200}>
              {groups.length === 0 ? (
                <div className={styles.faqEmpty}>
                  <HelpCircle size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <h3>No questions found</h3>
                  <p>Try adjusting your search or filter to find what you&apos;re looking for.</p>
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group.catId ?? 'uncategorized'}>
                    {group.catName && (
                      <SectionHeading text={group.catName} center={false} />
                    )}
                    <div className={styles.faqList}>
                      {group.items.map((faq) => {
                        const isOpen = openIds.has(faq.id);
                        return (
                          <div
                            key={faq.id}
                            className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
                          >
                            <button
                              className={styles.faqTrigger}
                              onClick={() => toggleFaq(faq.id)}
                              aria-expanded={isOpen}
                            >
                              <span>{faq.question}</span>
                              <ChevronRight
                                size={16}
                                className={`${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ''}`}
                              />
                            </button>
                            <div
                              className={`${styles.faqContent} ${isOpen ? styles.faqContentOpen : ''}`}
                            >
                              <p className={styles.faqAnswer}>{faq.answer}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <Reveal variant="fadeUp">
          <section className={styles.ctaSection}>
            <div className={styles.ctaInner}>
              <div className={styles.ctaCard}>
                <MessageCircle size={28} style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
                <h2>Still Have Questions?</h2>
                <p>Our support team is ready to help you with anything you need.</p>
                <div className={styles.ctaGroup}>
                  <Link href="/support" className="btn btn-primary">Contact Support</Link>
                  <Link href="/" className="btn btn-secondary">Back to Home</Link>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
