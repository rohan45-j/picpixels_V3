'use client';

import { useState } from 'react';
import Link from 'next/link';
import FileUploadZone from '../../../shared/components/FileUploadZone';
import styles from '../../../shared/styles/modules/dashboard.module.css';

export default function NewOrder() {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [projectName, setProjectName] = useState('');
  const [template, setTemplate] = useState('transparent-png');
  const [speed, setSpeed] = useState(24); // hours

  const handleFilesSelected = (selected: File[]) => {
    setFiles(selected);
  };

  const calculateEstimate = () => {
    const qty = files.length || 1;
    let base = 1.50; // background removal
    if (template === 'shopify-psd') base = 3.00; // complex ghost mannequin
    
    let speedFactor = 1.00;
    if (speed === 3) speedFactor = 2.00;
    else if (speed === 24) speedFactor = 1.30;

    const subDiscount = 0.15; // 15% discount for pro plan
    const rawTotal = base * qty * speedFactor;
    const finalTotal = rawTotal * (1 - subDiscount);

    return {
      unitPrice: (finalTotal / qty).toFixed(2),
      total: finalTotal.toFixed(2),
      discount: (rawTotal * subDiscount).toFixed(2)
    };
  };

  const priceDetails = calculateEstimate();

  const handleNextStep = () => {
    if (step === 1 && files.length === 0) {
      alert('Please upload at least 1 image to proceed.');
      return;
    }
    if (step === 1 && !projectName.trim()) {
      alert('Please enter a project name.');
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmitOrder = () => {
    alert('Order successfully submitted to retoucher team! Redirecting...');
    window.location.href = '/dashboard/overview';
  };

  return (
    <div>
      {/* Step Progress Indicators */}
      <div className={styles.wizardHeader}>
        {[
          { num: 1, label: 'Upload' },
          { num: 2, label: 'Specifications' },
          { num: 3, label: 'Delivery Speed' },
          { num: 4, label: 'Payment' }
        ].map((s) => (
          <div 
            key={s.num} 
            className={`${styles.wizardStep} ${step >= s.num ? styles.wizardStepActive : ''}`}
          >
            <div className={styles.stepBubble}>{s.num}</div>
            <span className={styles.stepLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Main Wizard Form Container */}
      <div className={styles.wizardCard}>
        {/* Step 1: Upload Raw Files */}
        {step === 1 && (
          <div>
            <h2 className={styles.wizardTitle}>1. Project Name & Asset Upload</h2>
            <p className={styles.wizardSubtitle}>Create a reference name for this batch of product imagery, and drop your captures.</p>

            <div className={styles.formGroup} style={{ marginBottom: '2.5rem' }}>
              <label className={styles.label} style={{ fontSize: '1rem', marginBottom: '0.6rem' }}>Project Name / Batch Reference *</label>
              <input 
                type="text" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className={styles.input}
                placeholder="e.g. Nike Sneakers Summer Drop"
                style={{ background: 'var(--bg-dark-elevated)' }}
              />
            </div>

            <FileUploadZone onFilesChange={handleFilesSelected} maxFiles={10} />

            <div className={styles.wizardActions}>
              <div></div>
              <button onClick={handleNextStep} className="btn btn-primary">
                Next: Configure Specifications ➔
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Template */}
        {step === 2 && (
          <div>
            <h2 className={styles.wizardTitle}>2. Choose Workflow Specification Preset</h2>
            <p className={styles.wizardSubtitle}>Select the output formatting guidelines. These presets guarantee exact, repeatable color spaces and ratios.</p>

            <div className={styles.templateGrid}>
              {[
                { id: 'transparent-png', name: 'Transparent PNG Preset', specs: 'Transparent background, original margin 10%, sRGB color space, cropped to fit 1000x1000px.' },
                { id: 'amazon-white', name: 'Amazon Pure White', specs: 'Solid #FFFFFF background, sRGB color, 15% margins, sharp shadows, ready for Seller Central.' },
                { id: 'shopify-psd', name: 'Shopify Master PSD', specs: 'Multi-layer PSD format, color-matched layers, high-end ghost mannequin, transparent backing.' }
              ].map((t) => (
                <div 
                  key={t.id} 
                  className={`${styles.templateCard} ${template === t.id ? styles.templateActive : ''}`}
                  onClick={() => setTemplate(t.id)}
                >
                  <h4 className={styles.templateName}>{t.name}</h4>
                  <p className={styles.templateSpecs}>{t.specs}</p>
                </div>
              ))}
            </div>

            <div className={styles.wizardActions}>
              <button onClick={handlePrevStep} className="btn btn-secondary">
                ◀ Back to Upload
              </button>
              <button onClick={handleNextStep} className="btn btn-primary">
                Next: Select Turnaround Speed ➔
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Turnaround speed */}
        {step === 3 && (
          <div>
            <h2 className={styles.wizardTitle}>3. Select Turnaround SLA</h2>
            <p className={styles.wizardSubtitle}>Choose the guaranteed deadline. Turnaround speeds are backed by automatic SLA credit refunds.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px', margin: '0 auto' }}>
              {[
                { hours: 48, label: '48 Hours (Standard)', mult: '1.0x factor', desc: 'Perfect for standard replenishment batches.' },
                { hours: 24, label: '24 Hours (Express)', mult: '1.3x speed premium', desc: 'Our standard Pro plan SLA choice.' },
                { hours: 3, label: '3 Hours (Rush Delivery)', mult: '2.0x emergency premium', desc: 'Emergency post-production on active campaign drops.' }
              ].map((item) => (
                <div 
                  key={item.hours}
                  onClick={() => setSpeed(item.hours)}
                  style={{
                    border: speed === item.hours ? '1.5px solid var(--primary-light)' : '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    background: speed === item.hours ? 'rgba(16,185,129,0.03)' : 'var(--bg-dark-elevated)',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontWeight: 700 }}>
                    <span>{item.label}</span>
                    <span style={{ color: 'var(--primary-light)', fontSize: '0.85rem' }}>{item.mult}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted-dark)' }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <div className={styles.wizardActions}>
              <button onClick={handlePrevStep} className="btn btn-secondary">
                ◀ Back to Specs
              </button>
              <button onClick={handleNextStep} className="btn btn-primary">
                Next: Review and Payment ➔
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Summary checkout */}
        {step === 4 && (
          <div>
            <h2 className={styles.wizardTitle}>4. Confirm Production Invoice</h2>
            <p className={styles.wizardSubtitle}>Review the image volumes and payment specifications before submitting to our Specialist teams.</p>

            <div style={{ background: 'var(--bg-dark-elevated)', borderRadius: '12px', padding: '2rem', border: '1px solid var(--glass-border)', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                <span>Project:</span>
                <strong>{projectName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                <span>Total Assets:</span>
                <strong>{files.length} images</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                <span>Preset Guide:</span>
                <strong style={{ textTransform: 'uppercase' }}>{template.replace('-', ' ')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                <span>Turnaround Time:</span>
                <strong>{speed} Hours SLA</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                <span>Membership Discount (PRO):</span>
                <span style={{ color: 'var(--primary-light)' }}>-15% discount (-${priceDetails.discount})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', fontSize: '1.2rem' }}>
                <span>Estimated Deduction:</span>
                <strong style={{ color: 'var(--primary-light)', fontSize: '1.5rem' }}>${priceDetails.total} USD</strong>
              </div>
            </div>

            <div className={styles.wizardActions}>
              <button onClick={handlePrevStep} className="btn btn-secondary">
                ◀ Back to Speed
              </button>
              <button onClick={handleSubmitOrder} className="btn btn-primary" style={{ boxShadow: 'var(--glow-shadow)' }}>
                Confirm & Submit Order 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
