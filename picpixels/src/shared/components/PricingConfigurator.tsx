'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Check, ArrowRight } from 'lucide-react';
import { fetchPricingConfig, mediaUrl, storeOrderSummary, type PricingConfigSectionData, type PricingConfigCardPrice } from '../../services/public-api';
import SectionHeading from './SectionHeading';
import PricingBanner from './PricingBanner';
import Reveal from './Reveal';
import styles from '../styles/modules/pricing-configurator.module.css';

function getPriceForUnitRange(prices: PricingConfigCardPrice[], unitRangeId: number): { price: string; oldPrice: string } {
  const match = prices.find((p) => p.unit_range === unitRangeId);
  return match
    ? { price: match.price, oldPrice: match.old_price }
    : { price: '', oldPrice: '' };
}

export default function PricingConfigurator() {
  const router = useRouter();
  const [data, setData] = useState<PricingConfigSectionData | null>(null);
  const [selectedDropdown, setSelectedDropdown] = useState<number | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchPricingConfig().then((result) => {
      if (result) {
        setData(result);
        if (result.dropdown_options.length > 0) {
          setSelectedDropdown(result.dropdown_options[0].id);
        }
      }
    });
  }, []);

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

  const handleContinueToOrder = useCallback(() => {
    if (!selectedCard || !data) return;
    const unitRange = activeOptions.find((o) => o.id === selectedDropdown)?.label;
    let displayPrice = '';
    if (selectedDropdown != null) {
      const p = getPriceForUnitRange(selectedCard.prices, selectedDropdown);
      displayPrice = p.price;
    }
    storeOrderSummary({
      source: 'configurator',
      title: selectedCard.title,
      description: selectedCard.description,
      image: selectedCard.image,
      price: displayPrice,
      features: selectedCard.description ? [selectedCard.description] : [],
      unitRange,
    });
    window.location.href = '/order-summary';
  }, [selectedCard, data, selectedDropdown, activeOptions, router]);

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
                  <span className={styles.cardBtn}>{card.button_text}</span>
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
          <button
            type="button"
            onClick={handleContinueToOrder}
            disabled={!selectedCard}
            className={`${styles.ctaBtn} ${selectedCard ? styles.ctaBtnActive : ''}`}
          >
            {cta?.button_text || 'Continue to Order'} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
