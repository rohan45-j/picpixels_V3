'use client';

import { Flame, Star, Crown, Zap, Gift, Tag } from 'lucide-react';
import type { PricingBanner as PricingBannerType } from '../../services/public-api';
import styles from '../styles/modules/pricing-banner.module.css';

const iconMap: Record<string, React.ReactNode> = {
  fire: <Flame size={14} />,
  star: <Star size={14} />,
  crown: <Crown size={14} />,
  bolt: <Zap size={14} />,
  card_giftcard: <Gift size={14} />,
  local_offer: <Tag size={14} />,
};

const defaultBgMap: Record<string, string> = {
  discount: '#EF4444',
  popular: '#FF8A50',
  recommended: '#10B981',
  new: '#6366F1',
};

export default function PricingBanner({ data }: { data: PricingBannerType }) {
  if (!data.show_banner) return null;

  if (data.banner_expiry) {
    const expiry = new Date(data.banner_expiry);
    if (expiry <= new Date()) return null;
  }

  const bgColor = data.banner_bg_color || defaultBgMap[data.banner_type] || '#FF8A50';
  const textColor = data.banner_text_color || '#FFFFFF';

  return (
    <div
      className={styles.banner}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {data.banner_icon && iconMap[data.banner_icon] && (
        <span className={styles.icon}>{iconMap[data.banner_icon]}</span>
      )}
      <span className={styles.text}>{data.banner_text}</span>
    </div>
  );
}
