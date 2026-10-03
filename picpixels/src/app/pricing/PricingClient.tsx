'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/animations/Reveal';
import { mediaUrl, storeOrderSummary, type PricingService } from '@/services/public-api';
import PricingBanner from '@/components/ui/PricingBanner';
import PromotionSection from '@/components/ui/PromotionSection';
import FAQSection from '@/components/ui/FAQSection';
import styles from '@/styles/modules/pricing.module.css';
import type { FAQ, PricingPromotion } from '@/services/public-api';

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
  name,
}: {
  label: string;
  placeholder: string;
  options: { id: number; label: string }[];
  value: number | null;
  onChange: (id: number) => void;
  name: string;
}) {
  return (
    <div className={styles.dropdownWrap}>
      <label htmlFor={`pricing-${name}`} className={styles.dropdownLabel}>
        {label}
      </label>
      <div className={styles.dropdownSelectContainer}>
        <select
          id={`pricing-${name}`}
          name={name}
          className={styles.dropdownSelect}
          value={value ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
        >
          {placeholder && !value && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className={styles.dropdownSelectChevron} />
      </div>
    </div>
  );
}

export default function PricingClient({
  faqs,
  promotions,
  services: serverServices,
  initialServiceId,
  initialUnitRangeId,
}: {
  faqs: FAQ[];
  promotions: PricingPromotion[];
  services: PricingService[];
  initialServiceId?: number;
  initialUnitRangeId?: number;
}) {
  const router = useRouter();
  const [services, setServices] = useState<PricingService[]>(serverServices);
  const activeServices = useMemo(() => services.filter((s) => s.is_active), [services]);

  const defaultService =
    (initialServiceId && activeServices.find((s) => s.id === initialServiceId)) ||
    activeServices[0] ||
    null;

  const defaultUnitRanges = defaultService?.unit_ranges || [];
  const defaultUnitRange =
    (initialUnitRangeId && defaultUnitRanges.find((u) => u.id === initialUnitRangeId)) ||
    defaultUnitRanges[0] ||
    null;

  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(() => defaultService?.id ?? null);
  const [selectedUnitRangeId, setSelectedUnitRangeId] = useState<number | null>(() => defaultUnitRange?.id ?? null);

  useEffect(() => {
    if (serverServices.length > 0 && selectedServiceId === null) {
      setSelectedServiceId(serverServices[0].id);
      const firstSvc = serverServices[0];
      if (firstSvc.unit_ranges.length > 0) {
        setSelectedUnitRangeId(firstSvc.unit_ranges[0].id);
      }
    }
  }, [serverServices, selectedServiceId]);

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

  useEffect(() => {
    router.prefetch('/order-summary');
  }, [router]);

  const handleContinueToOrder = useCallback(
    (card: typeof cards[number], e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const unitRange = unitRanges.find((u) => u.id === selectedUnitRangeId);
      const priceData = card.prices.find((p) => p.unit_range === selectedUnitRangeId);
      const data = {
        source: 'pricing' as const,
        title: `${selectedService?.name || ''} - ${card.name}`,
        description: card.description || '',
        image: card.image || '',
        price: priceData ? `$${priceData.price}` : '',
        features: card.features || [],
        unitRange: unitRange?.label || '',
      };
      storeOrderSummary(data);
      router.push('/order-summary');
    },
    [selectedService, selectedUnitRangeId, unitRanges, router],
  );



  const handleServiceChange = (id: number) => {
    setSelectedServiceId(id);
    const svc = activeServices.find((s) => s.id === id);
    if (svc && svc.unit_ranges.length > 0) {
      setSelectedUnitRangeId(svc.unit_ranges[0].id);
    } else {
      setSelectedUnitRangeId(null);
    }
  };

  return (
    <>
      <StructuredData services={activeServices} />
      <main>
        <Reveal variant="fadeDown">
          <section className={styles.headerSection}>
            <div className={styles.floatingBlob} style={{ width: 200, height: 200, background: 'rgba(255,138,80,0.08)', top: -60, right: -40 }} />
            <div className={styles.floatingBlob} style={{ width: 160, height: 160, background: 'rgba(255,138,80,0.06)', bottom: 20, left: -30 }} />
            <div className={styles.headerContent}>
              <h1 className={styles.title} style={{ color: '#000000' }}>Pricing Plans</h1>
              <p className={styles.subtitle}>Pay only for what you need. Transparent per-image pricing for every plan.</p>
            </div>
          </section>
        </Reveal>

        {activePromotion && <PromotionSection data={activePromotion} />}

        <section className={`${styles.pricingSection} ${styles.pricingSectionTop}`} aria-label="Pricing filters">
          <div className={styles.pricingInner}>
            {activeServices.length > 0 && (
              <form method="GET" action="/pricing" className={styles.filterRow}>
                <Dropdown
                  label="Service"
                  name="service"
                  placeholder="Select Service"
                  options={activeServices.map((s) => ({ id: s.id, label: s.name }))}
                  value={selectedServiceId}
                  onChange={handleServiceChange}
                />
                <Dropdown
                  label="Unit Range"
                  name="unit_range"
                  placeholder="Select Unit Range"
                  options={unitRanges.map((u) => ({ id: u.id, label: u.label }))}
                  value={selectedUnitRangeId}
                  onChange={setSelectedUnitRangeId}
                />
                <noscript>
                  <button type="submit" className={styles.noJsFilterBtn}>
                    Update Pricing
                  </button>
                </noscript>
              </form>
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

                        <form
                          action="/api/order"
                          method="POST"
                          onSubmit={(e) => { handleContinueToOrder(card, e); }}
                          style={{ display: 'contents' }}
                        >
                          <input type="hidden" name="source" value="pricing" />
                          <input type="hidden" name="title" value={`${selectedService?.name || ''} - ${card.name}`} />
                          <input type="hidden" name="description" value={card.description || ''} />
                          <input type="hidden" name="image" value={card.image || ''} />
                          <input type="hidden" name="price" value={priceData ? `$${priceData.price}` : ''} />
                          <input type="hidden" name="features" value={JSON.stringify(card.features || [])} />
                          <input type="hidden" name="unitRange" value={unitRange?.label || ''} />
                          <button
                            type="submit"
                            disabled={!priceData}
                            className={`${styles.cardBtn} ${i === 1 ? styles.cardBtnPrimary : styles.cardBtnSecondary}`}
                          >
                            {card.button_text || 'Continue to Order'} <ArrowRight size={16} />
                          </button>
                        </form>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <FAQSection faqs={faqs} />
      </main>
    </>
  );
}
