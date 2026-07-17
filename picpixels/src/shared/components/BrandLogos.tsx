import React from 'react';
import styles from './BrandLogos.module.css';

const brands = [
  { name: 'Amazon', svg: <svg viewBox="0 0 140 40" fill="currentColor"><text x="0" y="28" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="700">amazon</text></svg> },
  { name: 'eBay', svg: <svg viewBox="0 0 100 40" fill="currentColor"><text x="0" y="28" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="700" letterSpacing="2">eBay</text></svg> },
  { name: 'Etsy', svg: <svg viewBox="0 0 100 40" fill="currentColor"><text x="0" y="28" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="700" letterSpacing="2">Etsy</text></svg> },
  { name: 'Shopify', svg: <svg viewBox="0 0 140 40" fill="currentColor"><text x="0" y="28" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="700">Shopify</text></svg> },
  { name: 'Walmart', svg: <svg viewBox="0 0 160 40" fill="currentColor"><text x="0" y="28" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="700" letterSpacing="1">Walmart</text></svg> },
  { name: 'Alibaba', svg: <svg viewBox="0 0 140 40" fill="currentColor"><text x="0" y="28" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="700" letterSpacing="1">Alibaba</text></svg> },
  { name: 'AliExpress', svg: <svg viewBox="0 0 180 40" fill="currentColor"><text x="0" y="28" fontFamily="Arial,sans-serif" fontSize="20" fontWeight="700">AliExpress</text></svg> },
  { name: 'Target', svg: <svg viewBox="0 0 140 40" fill="currentColor"><text x="0" y="28" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="700" letterSpacing="1">Target</text></svg> },
];

export default function BrandLogos() {
  return (
    <>
      {brands.map((brand, idx) => (
        <div key={idx} className={styles.logoCell} title={brand.name}>
          {brand.svg}
        </div>
      ))}
    </>
  );
}
