'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Check, ArrowRight } from 'lucide-react';
import { mediaUrl, storeOrderSummary, fetchCoreServices, type PricingConfigSectionData, type PricingConfigCardPrice, type Service } from '@/services/public-api';
import SectionHeading from '@/components/ui/SectionHeading';
import PricingBanner from '@/components/ui/PricingBanner';
import Reveal from '@/components/animations/Reveal';
import styles from '@/styles/modules/pricing-configurator.module.css';

export interface ServiceDropdownItem {
  id: number;
  title: string;
  is_active?: boolean;
}

const DEFAULT_SERVICES: ServiceDropdownItem[] = [
  { id: 1, title: 'Clipping Path Service', is_active: true },
  { id: 2, title: 'Background Removal Service', is_active: true },
  { id: 3, title: 'Image Masking Service', is_active: true },
  { id: 4, title: 'Shadow Creation Service', is_active: true },
  { id: 5, title: 'Ghost Mannequin Service', is_active: true },
  { id: 6, title: 'Image Retouching Service', is_active: true },
  { id: 7, title: 'Color Correction Service', is_active: true },
  { id: 8, title: 'Ecommerce Image Editing', is_active: true },
  { id: 9, title: 'Jewelry Image Editing', is_active: true },
  { id: 10, title: 'Car Image Editing', is_active: true },
];

function getPriceForUnitRange(prices: PricingConfigCardPrice[], unitRangeId: number): { price: string; oldPrice: string } {
  const match = prices.find((p) => p.unit_range === unitRangeId);
  return match
    ? { price: match.price, oldPrice: match.old_price }
    : { price: '', oldPrice: '' };
}

interface PricingConfiguratorProps {
  pricingData: PricingConfigSectionData | null;
  services?: ServiceDropdownItem[];
}

export default function PricingConfigurator({ pricingData: initialData, services: initialServices = [] }: PricingConfiguratorProps) {
  const router = useRouter();
  const [data, setData] = useState<PricingConfigSectionData | null>(initialData);
  const [servicesList, setServicesList] = useState<ServiceDropdownItem[]>(
    initialServices && initialServices.length > 0 ? initialServices.filter((s) => s.is_active !== false) : DEFAULT_SERVICES
  );
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    (initialServices && initialServices.length > 0 ? initialServices[0].id : DEFAULT_SERVICES[0].id)
  );
  const [selectedDropdown, setSelectedDropdown] = useState<number | null>(
    initialData?.dropdown_options?.[0]?.id ?? null
  );
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);

  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const unitRangeDropdownRef = useRef<HTMLDivElement>(null);

  // Load all active services from backend
  useEffect(() => {
    fetchCoreServices().then((svcs) => {
      if (svcs && Array.isArray(svcs) && svcs.length > 0) {
        const activeOnly = svcs.filter((s) => s.is_active !== false);
        if (activeOnly.length > 0) {
          setServicesList(activeOnly);
          setSelectedServiceId((prev) => (prev !== null && activeOnly.some((s) => s.id === prev) ? prev : activeOnly[0].id));
        }
      }
    }).catch(() => {});
  }, []);

  // Sync initialServices prop if passed
  useEffect(() => {
    if (initialServices && initialServices.length > 0) {
      const activeOnly = initialServices.filter((s) => s.is_active !== false);
      if (activeOnly.length > 0) {
        setServicesList(activeOnly);
        setSelectedServiceId((prev) => (prev !== null && activeOnly.some((s) => s.id === prev) ? prev : activeOnly[0].id));
      }
    }
  }, [initialServices]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setServiceDropdownOpen(false);
      }
      if (unitRangeDropdownRef.current && !unitRangeDropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeServices = useMemo(() => {
    const list = (servicesList && servicesList.length > 0) ? servicesList : DEFAULT_SERVICES;
    return list.filter((s) => s.is_active !== false);
  }, [servicesList]);

  const selectedService = useMemo(
    () => activeServices.find((s) => s.id === selectedServiceId) ?? activeServices[0] ?? null,
    [activeServices, selectedServiceId]
  );

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
    const servicePrefix = selectedService ? `${selectedService.title} - ` : '';
    const orderData = {
      source: 'configurator' as const,
      title: `${servicePrefix}${selectedCard.title}`,
      description: selectedCard.description || '',
      image: selectedCard.image || '',
      price: displayPrice,
      features: selectedCard.description ? [selectedCard.description] : [],
      unitRange: unitRange || '',
      service: selectedService?.title || '',
    };
    storeOrderSummary(orderData);
    fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) }).catch(() => { });
    router.push('/order-summary');
  }, [selectedCard, data, selectedDropdown, activeOptions, selectedService, router]);

  const handleSelectCard = useCallback((card: typeof activeCards[number]) => {
    if (!data) return;
    const unitRange = activeOptions.find((o) => o.id === selectedDropdown)?.label;
    let displayPrice = '';
    if (selectedDropdown != null) {
      const p = getPriceForUnitRange(card.prices, selectedDropdown);
      displayPrice = p.price;
    }
    const servicePrefix = selectedService ? `${selectedService.title} - ` : '';
    const orderData = {
      source: 'configurator' as const,
      title: `${servicePrefix}${card.title}`,
      description: card.description || '',
      image: card.image || '',
      price: displayPrice,
      features: card.description ? [card.description] : [],
      unitRange: unitRange || '',
      service: selectedService?.title || '',
    };
    storeOrderSummary(orderData);
    fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) }).catch(() => { });
    router.push('/order-summary');
  }, [data, selectedDropdown, activeOptions, selectedService, router]);

  if (!data || !data.is_active) return null;

  const selectedOptionLabel = activeOptions.find((o) => o.id === selectedDropdown)?.label || '';
  const selectedServiceTitle = selectedService?.title || '';
  const isAnyDropdownOpen = dropdownOpen || serviceDropdownOpen;
  const cta = data.cta;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Reveal variant="fadeUp" once={false} className={isAnyDropdownOpen ? styles.dropdownRevealOpen : ''}>
          <span className={styles.mainSubtitle}>{data.subtitle}</span>
        </Reveal>
        <SectionHeading text={data.title} />
        <Reveal variant="fadeUp" once={false} className={isAnyDropdownOpen ? styles.dropdownRevealOpen : ''}>
          <div className={styles.topRow}>
            <div className={styles.textGroup}>
              <p className={styles.description}>{data.description}</p>
            </div>
            <div className={styles.dropdownGroup}>
              {/* Service Dropdown - ALWAYS VISIBLE */}
              <div className={styles.dropdownWrap} ref={serviceDropdownRef}>
                <span className={styles.dropdownLabel}>Services</span>
                <button
                  type="button"
                  className={styles.dropdownTrigger}
                  onClick={() => {
                    setServiceDropdownOpen((prev) => !prev);
                    setDropdownOpen(false);
                  }}
                >
                  <span className={styles.dropdownText}>{selectedServiceTitle || 'Select Service'}</span>
                  <ChevronDown size={18} className={`${styles.dropdownChevron} ${serviceDropdownOpen ? styles.dropdownChevronOpen : ''}`} />
                </button>
                {serviceDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    {activeServices.map((svc) => (
                      <button
                        key={svc.id}
                        type="button"
                        className={`${styles.dropdownItem} ${selectedService?.id === svc.id ? styles.dropdownItemActive : ''}`}
                        onClick={() => {
                          setSelectedServiceId(svc.id);
                          setServiceDropdownOpen(false);
                        }}
                      >
                        {svc.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Unit Range Dropdown */}
              <div className={styles.dropdownWrap} ref={unitRangeDropdownRef}>
                <span className={styles.dropdownLabel}>Unit Range</span>
                <button
                  type="button"
                  className={styles.dropdownTrigger}
                  onClick={() => {
                    setDropdownOpen((prev) => !prev);
                    setServiceDropdownOpen(false);
                  }}
                >
                  <span className={styles.dropdownText}>{selectedOptionLabel || 'Select volume'}</span>
                  <ChevronDown size={18} className={`${styles.dropdownChevron} ${dropdownOpen ? styles.dropdownChevronOpen : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    {activeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`${styles.dropdownItem} ${selectedDropdown === opt.id ? styles.dropdownItemActive : ''}`}
                        onClick={() => {
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
