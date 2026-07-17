'use client';

import { useState, useEffect } from 'react';
import styles from './InteractiveCalc.module.css';

export default function InteractiveCalc() {
  const [service, setService] = useState('background_removal');
  const [images, setImages] = useState(50);
  const [turnaround, setTurnaround] = useState(48);
  const [plan, setPlan] = useState('Solo');
  const [priceData, setPriceData] = useState({
    unitPrice: 0,
    totalPrice: 0,
    bulkDiscount: 0,
    subDiscount: 0,
    savings: 0
  });

  useEffect(() => {
    // Client-side pricing calculation matching the backend service calculations
    const basePrices: Record<string, number> = {
      background_removal: 1.50,
      ghost_mannequin: 2.50,
      photo_retouching: 3.00,
      cgi_3d: 45.00,
      ai_models: 15.00,
    };

    const basePrice = basePrices[service] || 1.50;
    
    // Turnaround factor
    let turnaroundFactor = 1.00;
    if (turnaround <= 3) turnaroundFactor = 2.00;
    else if (turnaround <= 24) turnaroundFactor = 1.30;

    // Sub plan discounts
    const subDiscounts: Record<string, number> = {
      Solo: 0.00,
      Professional: 0.15,
      Enterprise: 0.30
    };
    const subDiscount = subDiscounts[plan] || 0.00;

    // Bulk discount based on image quantity
    let bulkDiscount = 0.00;
    if (images >= 200) bulkDiscount = 0.20;
    else if (images >= 50) bulkDiscount = 0.10;

    // Calculate
    const rawTotal = basePrice * images * turnaroundFactor;
    const finalTotal = rawTotal * (1 - subDiscount) * (1 - bulkDiscount);
    const unit = images > 0 ? finalTotal / images : 0;
    const savings = rawTotal - finalTotal;

    setPriceData({
      unitPrice: Number(unit.toFixed(2)),
      totalPrice: Number(finalTotal.toFixed(2)),
      bulkDiscount: bulkDiscount * 100,
      subDiscount: subDiscount * 100,
      savings: Number(savings.toFixed(2))
    });
  }, [service, images, turnaround, plan]);

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Estimate Your Savings</h3>
      
      <div className={styles.grid}>
        {/* Left Control Panel */}
        <div className={styles.controls}>
          {/* Plan select */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Platform Membership</label>
            <div className={styles.planSelector}>
              {['Solo', 'Professional', 'Enterprise'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.planBtn} ${plan === p ? styles.planActive : ''}`}
                  onClick={() => setPlan(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Service Select */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Editing Service</label>
            <select 
              value={service} 
              onChange={(e) => setService(e.target.value)}
              className={styles.select}
            >
              <option value="background_removal">Background Removal ($1.50/img)</option>
              <option value="ghost_mannequin">Ghost Mannequin / Invisible ($2.50/img)</option>
              <option value="photo_retouching">Jewelry & Complex Retouching ($3.00/img)</option>
              <option value="cgi_3d">3D & CGI Product Render ($45.00/model)</option>
              <option value="ai_models">AI Fashion Model Generator ($15.00/gen)</option>
            </select>
          </div>

          {/* Quantity Slider */}
          <div className={styles.formGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Monthly Volume (Assets)</label>
              <span className={styles.badge}>{images} images</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="500" 
              value={images} 
              onChange={(e) => setImages(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          {/* Turnaround Select */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Turnaround Speed</label>
            <div className={styles.speedSelector}>
              {[
                { hours: 48, label: '48 Hours (Standard)' },
                { hours: 24, label: '24 Hours (1.3x)' },
                { hours: 3, label: '3 Hours (2.0x Rush)' }
              ].map((item) => (
                <button
                  key={item.hours}
                  type="button"
                  className={`${styles.speedBtn} ${turnaround === item.hours ? styles.speedActive : ''}`}
                  onClick={() => setTurnaround(item.hours)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output Card */}
        <div className={styles.outputCard}>
          <div className={styles.estimateLabel}>ESTIMATED PRICE</div>
          
          <div className={styles.priceRow}>
            <span className={styles.currency}>$</span>
            <span className={styles.price}>{priceData.totalPrice}</span>
            <span className={styles.period}>/ order</span>
          </div>

          <div className={styles.breakdown}>
            <div className={styles.breakdownItem}>
              <span>Unit Price</span>
              <strong>${priceData.unitPrice}</strong>
            </div>
            {priceData.bulkDiscount > 0 && (
              <div className={styles.breakdownItem}>
                <span>Volume Discount</span>
                <span className={styles.discountText}>-{priceData.bulkDiscount}%</span>
              </div>
            )}
            {priceData.subDiscount > 0 && (
              <div className={styles.breakdownItem}>
                <span>Membership Discount</span>
                <span className={styles.discountText}>-{priceData.subDiscount}%</span>
              </div>
            )}
            {priceData.savings > 0 && (
              <div className={`${styles.breakdownItem} ${styles.savings}`}>
                <span>Total Saved</span>
                <strong className={styles.savedAmount}>${priceData.savings}</strong>
              </div>
            )}
          </div>

          <button 
            type="button" 
            onClick={() => window.location.href = '/free-trial'} 
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem' }}
          >
            Claim Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}
