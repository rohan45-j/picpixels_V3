'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';
import SectionHeading from '../../shared/components/SectionHeading';
import Reveal from '../../shared/components/Reveal';
import { mediaUrl, fetchPricingServices, storeOrderSummary, type PricingService } from '../../services/public-api';
import PricingBanner from '../../shared/components/PricingBanner';
import PromotionSection from '../../shared/components/PromotionSection';
import styles from '../../shared/styles/modules/pricing.module.css';
import type { FAQ, PricingPromotion } from '../../services/public-api';

function StructuredData({ services }: { services: PricingService[] }) {
  const offers = services.flatMap((svc) =>
    svc.cards.map((card) => {
      const firstPrice = card.prices[0];
      return firstPrice
        ? {
            '@type': 'Offer',
            name: `${svc.name} - ${card.name}`,
            price: parseFloat(firstPrice.price).toFixed(2),
            priceCurrency: 'USD',
            itemCondition: 'https://schema.org/NewCondition',
            availability: 'https://schema.org/InStock',
          }
        : null;
    }).filter(Boolean),
  );

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'PicPicxels Pricing',
    description: 'Professional photo editing services pricing',
    offers,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />;
}

function Dropdown({
  label,
  placeholder,
  options,
  value,
  onChange,
  open,
  onToggle,
}: {
  label: string;
  placeholder: string;
  options: { id: number; label: string }[];
  value: number | null;
  onChange: (id: number) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const selected = options.find((o) => o.id === value);
  return (
    <div className={styles.dropdownWrap}>
      <span className={styles.dropdownLabel}>{label}</span>
      <button
        type="button"
        className={`${styles.dropdownTrigger} ${!selected ? styles.dropdownTriggerPlaceholder : ''}`}
        onClick={onToggle}
        onBlur={() => setTimeout(onToggle, 150)}
      >
        <span>{selected?.label || placeholder}</span>
        <ChevronDown size={18} className={`${styles.dropdownChevron} ${open ? styles.dropdownChevronOpen : ''}`} />
      </button>
      {open && (
        <div className={styles.dropdownMenu}>
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`${styles.dropdownItem} ${value === opt.id ? styles.dropdownItemActive : ''}`}
              onMouseDown={() => {
                onChange(opt.id);
                onToggle();
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PricingClient({
  faqs,
  promotions,
}: {
  faqs: FAQ[];
  promotions: PricingPromotion[];
}) {
  const router = useRouter();
  const [services, setServices] = useState<PricingService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedUnitRangeId, setSelectedUnitRangeId] = useState<number | null>(null);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [unitRangeDropdownOpen, setUnitRangeDropdownOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetchPricingServices().then((result) => {
      setServices(result);
      if (result.length > 0) {
        setSelectedServiceId(result[0].id);
        const firstSvc = result[0];
        if (firstSvc.unit_ranges.length > 0) {
          setSelectedUnitRangeId(firstSvc.unit_ranges[0].id);
        }
      }
      setLoadingServices(false);
    });
  }, []);

  const activeServices = useMemo(() => services.filter((s) => s.is_active), [services]);

  const selectedService = useMemo(
    () => activeServices.find((s) => s.id === selectedServiceId) ?? null,
    [activeServices, selectedServiceId],
  );

  const unitRanges = useMemo(
    () => selectedService?.unit_ranges ?? [],
    [selectedService],
  );

  useEffect(() => {
    if (selectedService && unitRanges.length > 0 && !unitRanges.find((u) => u.id === selectedUnitRangeId)) {
      setSelectedUnitRangeId(unitRanges[0].id);
    }
  }, [selectedService, unitRanges, selectedUnitRangeId]);

  const cards = useMemo(
    () => (selectedService?.cards ?? []).filter((c) => c.is_active),
    [selectedService],
  );

  const activePromotion = useMemo(() => {
    const now = new Date();
    return (promotions || []).find((p) => {
      if (!p.is_active) return false;
      if (p.start_date && new Date(p.start_date) > now) return false;
      if (p.end_date && new Date(p.end_date) < now) return false;
      return true;
    }) || null;
  }, [promotions]);

  const handleContinueToOrder = useCallback(
    (card: typeof cards[number]) => {
      const unitRange = unitRanges.find((u) => u.id === selectedUnitRangeId);
      const priceData = card.prices.find((p) => p.unit_range === selectedUnitRangeId);
      storeOrderSummary({
        source: 'pricing',
        title: `${selectedService?.name} - ${card.name}`,
        description: card.description,
        image: card.image,
        price: priceData ? `$${priceData.price}` : '',
        features: card.features,
        unitRange: unitRange?.label,
      });
      window.location.href = '/order-summary';
    },
    [selectedService, selectedUnitRangeId, unitRanges, router],
  );

  if (loadingServices) {
    return (
      <main>
        <div className={styles.headerSection}>
          <div className={styles.headerContent}>
            <h1 className={`${styles.title} gradient-text`}>Pricing Plans</h1>
            <p className={styles.subtitle}>Pay only for what you need.</p>
          </div>
        </div>
        <div className={styles.loadingWrap}>
          <div className={styles.loadingSpinner} />
        </div>
      </main>
    );
  }

  return (
    <>
      <StructuredData services={activeServices} />
      <main>
        <Reveal variant="fadeDown">
          <section className={styles.headerSection}>
            <div className={styles.floatingBlob} style={{ width: 200, height: 200, background: 'rgba(255,138,80,0.08)', top: -60, right: -40 }} />
            <div className={styles.floatingBlob} style={{ width: 160, height: 160, background: 'rgba(255,138,80,0.06)', bottom: 20, left: -30 }} />
            <div className={styles.headerContent}>
              <h1 className={`${styles.title} gradient-text`}>Pricing Plans</h1>
              <p className={styles.subtitle}>Pay only for what you need. Transparent per-image pricing for every plan.</p>
            </div>
          </section>
        </Reveal>

        {activePromotion && <PromotionSection data={activePromotion} />}

        <section className={`${styles.pricingSection} ${styles.pricingSectionTop}`} aria-label="Pricing filters">
          <div className={styles.pricingInner}>
            {activeServices.length > 0 && (
              <div className={`${styles.filterRow} ${serviceDropdownOpen || unitRangeDropdownOpen ? styles.filterRowOpen : ''}`}>
                <Dropdown
                  label="Service"
                  placeholder="Select Service"
                  options={activeServices.map((s) => ({ id: s.id, label: s.name }))}
                  value={selectedServiceId}
                  onChange={setSelectedServiceId}
                  open={serviceDropdownOpen}
                  onToggle={() => {
                    setServiceDropdownOpen(!serviceDropdownOpen);
                    setUnitRangeDropdownOpen(false);
                  }}
                />
                <Dropdown
                  label="Unit Range"
                  placeholder="Select Unit Range"
                  options={unitRanges.map((u) => ({ id: u.id, label: u.label }))}
                  value={selectedUnitRangeId}
                  onChange={setSelectedUnitRangeId}
                  open={unitRangeDropdownOpen}
                  onToggle={() => {
                    setUnitRangeDropdownOpen(!unitRangeDropdownOpen);
                    setServiceDropdownOpen(false);
                  }}
                />
              </div>
            )}

            {cards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
                <p>No pricing cards available for the selected service. Please check back later.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {cards.map((card, i) => {
                  const priceData = card.prices.find((p) => p.unit_range === selectedUnitRangeId);
                  const unitRange = unitRanges.find((u) => u.id === selectedUnitRangeId);
                  return (
                    <Reveal key={card.id} variant="fadeUp" delay={i * 120}>
                      <div className={`${styles.card} ${i === 1 ? styles.cardPopular : ''}`}>
                        {card.badge_text && (
                          <span className={styles.badge} style={{ background: card.badge_color || 'var(--primary)' }}>
                            {card.badge_text}
                          </span>
                        )}

                        <div className={styles.cardPricing}>
                          {priceData ? (
                            <div className={styles.planPriceRow}>
                              <span className={styles.planCurrency}>$</span>
                              <span className={styles.planPrice}>{priceData.price}</span>
                              {priceData.original_price && (
                                <span className={styles.planOldPrice}>${priceData.original_price}</span>
                              )}
                            </div>
                          ) : (
                            <span className={styles.planPrice} style={{ fontSize: '1.1rem', color: 'var(--color-muted)' }}>Select unit range</span>
                          )}
                        </div>

                        {card.image && (
                          <div className={styles.cardImageWrapper}>
                            <img src={mediaUrl(card.image) || ''} alt={card.image_alt || card.name} className={styles.cardImage} loading="lazy" />
                          </div>
                        )}

                        <div className={styles.cardHeader}>
                          <h2 className={styles.planName}>{card.name}</h2>
                          {card.description && <p className={styles.planDesc}>{card.description}</p>}
                          {unitRange && <span className={styles.unitRangeBadge}>{selectedService?.name} &middot; {unitRange.label}</span>}
                        </div>

                        {card.features.length > 0 && (
                          <>
                            <hr className={styles.divider} />
                            <ul className={styles.featuresList}>
                              {card.features.map((f, j) => (
                                <li key={j}>
                                  <span className={styles.checkIcon}><Check size={11} strokeWidth={3} /></span>
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => handleContinueToOrder(card)}
                          disabled={!priceData}
                          className={`${styles.cardBtn} ${i === 1 ? styles.cardBtnPrimary : styles.cardBtnSecondary}`}
                        >
                          {card.button_text || 'Continue to Order'} <ArrowRight size={16} />
                        </button>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {faqs.length > 0 && (
          <section className={styles.faqSection} aria-labelledby="faq-title">
            <div className={styles.faqInner}>
              <Reveal variant="fadeUp">
                <SectionHeading
                  tag="FAQ"
                  text="Frequently Asked Questions"
                />
              </Reveal>
              <div className={styles.faqList}>
                {faqs.map((faqItem, i) => (
                  <Reveal variant="fadeUp" delay={i * 60} key={i}>
                    <div className={styles.faqItem}>
                      <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className={styles.faqQuestion} aria-expanded={openFaq === i}>
                        {faqItem.question}
                        <span className={`${styles.faqIcon} ${openFaq === i ? styles.faqIconOpen : ''}`}>▼</span>
                      </button>
                      {openFaq === i && <div className={styles.faqAnswer}>{faqItem.answer}</div>}
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        <Reveal variant="fadeUp">
          <section className={styles.ctaSection} aria-label="Get started">
            <div className="container">
              <div className={styles.ctaBanner}>
                <div className={styles.ctaBannerContent}>
                  <HelpCircle size={28} style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
                  <h2 className={styles.ctaBannerTitle}>Not Sure Which Plan Fits?</h2>
                  <p className={styles.ctaBannerDesc}>Try our free trial with 3–5 images. No credit card required.</p>
                  <div className={styles.ctaBannerGroup}>
                    <Link href="/free-trial" className="btn btn-primary">Start Free Trial <ArrowRight size={16} /></Link>
                    <Link href="/contact" className="btn btn-secondary">Talk to Sales</Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      </main>
    </>
  );
}
