'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Check, ArrowRight } from 'lucide-react';
import { mediaUrl, storeOrderSummary, type PricingConfigSectionData, type PricingConfigCardPrice } from '@/services/public-api';
import SectionHeading from '@/components/ui/SectionHeading';
import PricingBanner from '@/components/ui/PricingBanner';
import Reveal from '@/components/animations/Reveal';
import styles from '@/styles/modules/pricing-configurator.module.css';

function getPriceForUnitRange(prices: PricingConfigCardPrice[], unitRangeId: number): { price: string; oldPrice: string } {
  const match = prices.find((p) => p.unit_range === unitRangeId);
  return match
    ? { price: match.price, oldPrice: match.old_price }
    : { price: '', oldPrice: '' };
}

export default function PricingConfigurator({ pricingData: initialData }: { pricingData: PricingConfigSectionData | null }) {
  const router = useRouter();
  const [data, setData] = useState<PricingConfigSectionData | null>(initialData);
  const [selectedDropdown, setSelectedDropdown] = useState<number | null>(
    initialData?.dropdown_options?.[0]?.id ?? null
  );
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeCards = useMemo(
    () => (data?.cards ?? []).filter((c) => c.is_active),
    [data?.cards]
  );
  const activeOptions = useMemo(
    () => (data?.dropdown_options ?? []).filter((o) => o.is_active),
    [data?.dropdown_options]
  );

  const selectedCard = useMemo(
    () => activeCards.find((c) => c.id === selectedCardId) ?? null,
    [activeCards, selectedCardId]
  );

  const handleContinueToOrder = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedCard || !data) return;
    const unitRange = activeOptions.find((o) => o.id === selectedDropdown)?.label;
    let displayPrice = '';
    if (selectedDropdown != null) {
      const p = getPriceForUnitRange(selectedCard.prices, selectedDropdown);
      displayPrice = p.price;
    }
    const orderData = {
      source: 'configurator' as const,
      title: selectedCard.title,
      description: selectedCard.description || '',
      image: selectedCard.image || '',
      price: displayPrice,
      features: selectedCard.description ? [selectedCard.description] : [],
      unitRange: unitRange || '',
    };
    storeOrderSummary(orderData);
    fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) }).catch(() => { });
    router.push('/order-summary');
  }, [selectedCard, data, selectedDropdown, activeOptions, router]);

  const handleSelectCard = useCallback((card: typeof activeCards[number]) => {
    if (!data) return;
    const unitRange = activeOptions.find((o) => o.id === selectedDropdown)?.label;
    let displayPrice = '';
    if (selectedDropdown != null) {
      const p = getPriceForUnitRange(card.prices, selectedDropdown);
      displayPrice = p.price;
    }
    const orderData = {
      source: 'configurator' as const,
      title: card.title,
      description: card.description || '',
      image: card.image || '',
      price: displayPrice,
      features: card.description ? [card.description] : [],
      unitRange: unitRange || '',
    };
    storeOrderSummary(orderData);
    fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) }).catch(() => { });
    router.push('/order-summary');
  }, [data, selectedDropdown, activeOptions, router]);

  if (!data || !data.is_active) return null;

  const selectedOptionLabel = activeOptions.find((o) => o.id === selectedDropdown)?.label || '';
  const cta = data.cta;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Reveal variant="fadeUp" once={false} className={dropdownOpen ? styles.dropdownRevealOpen : ''}>
          <span className={styles.mainSubtitle}>{data.subtitle}</span>
        </Reveal>
        <SectionHeading text={data.title} />
        <Reveal variant="fadeUp" once={false} className={dropdownOpen ? styles.dropdownRevealOpen : ''}>
          <div className={styles.topRow}>
            <div className={styles.textGroup}>
              <p className={styles.description}>{data.description}</p>
            </div>
            <div className={styles.dropdownWrap}>
              <span className={styles.dropdownLabel}>Unit Range</span>
              <button
                type="button"
                className={styles.dropdownTrigger}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
              >
                <span>{selectedOptionLabel || 'Select volume'}</span>
                <ChevronDown size={18} className={`${styles.dropdownChevron} ${dropdownOpen ? styles.dropdownChevronOpen : ''}`} />
              </button>
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  {activeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`${styles.dropdownItem} ${selectedDropdown === opt.id ? styles.dropdownItemActive : ''}`}
                      onMouseDown={() => {
                        setSelectedDropdown(opt.id);
                        setDropdownOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Reveal>

        <div className={styles.cardGrid}>
          {activeCards.map((card) => {
            const isSelected = selectedCardId === card.id;
            const { price, oldPrice } = selectedDropdown != null
              ? getPriceForUnitRange(card.prices, selectedDropdown)
              : { price: '', oldPrice: '' };
            return (
              <button
                key={card.id}
                type="button"
                className={`${styles.card} ${isSelected ? styles.cardSelected : ''} ${card.show_banner && card.banner_type === 'popular' ? styles.cardPopular : ''}`}
                onClick={() => setSelectedCardId(isSelected ? null : card.id)}
              >
                <PricingBanner data={card} />
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <div className={styles.cardPriceRow}>
                    <span key={`${selectedDropdown}-${card.id}-price`} className={styles.cardPrice}>{price}</span>
                    {oldPrice && <span key={`${selectedDropdown}-${card.id}-old`} className={styles.cardOldPrice}>{oldPrice}</span>}
                  </div>
                </div>
                <div className={styles.cardImageWrap}>
                  {card.image ? (
                    <img src={mediaUrl(card.image) || ''} alt={card.image_alt || card.title} className={styles.cardImage} loading="lazy" />
                  ) : (
                    <div className={styles.cardImageFallback}>
                      <span className={styles.cardImagePlaceholder}>{card.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  {card.description && <p className={styles.cardDesc}>{card.description}</p>}
                </div>
                <div className={styles.cardFooter}>
                  <span
                    className={styles.cardBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCard(card);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectCard(card); } }}
                  >{card.button_text}</span>
                  {isSelected && (
                    <span className={styles.cardCheck}>
                      <Check size={14} />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className={styles.ctaWrap}>
          <form action="/api/order" method="POST" onSubmit={handleContinueToOrder} style={{ display: 'contents' }}>
            <input type="hidden" name="source" value="configurator" />
            <input type="hidden" name="title" value={selectedCard?.title || ''} />
            <input type="hidden" name="description" value={selectedCard?.description || ''} />
            <input type="hidden" name="image" value={selectedCard?.image || ''} />
            <input type="hidden" name="price" value={(() => { if (!selectedCard || selectedDropdown == null) return ''; const p = getPriceForUnitRange(selectedCard.prices, selectedDropdown); return p.price; })()} />
            <input type="hidden" name="features" value={selectedCard?.description ? JSON.stringify([selectedCard.description]) : '[]'} />
            <input type="hidden" name="unitRange" value={activeOptions.find((o) => o.id === selectedDropdown)?.label || ''} />
            {/* <button
              type="submit"
              disabled={!selectedCard}
              className={`${styles.ctaBtn} ${selectedCard ? styles.ctaBtnActive : ''}`}
            >
              {cta?.button_text || 'Continue to Order'} <ArrowRight size={18} />
            </button> */}
          </form>
        </div>
      </div>
    </section>
  );
}
