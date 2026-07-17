'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSiteSettings } from '../../shared/contexts/SiteSettingsContext';
import styles from '../../shared/styles/modules/login.module.css';

export default function ForgotPassword() {
  const { siteSettings } = useSiteSettings();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* Brand Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span>{siteSettings?.site_name || 'Photo Editor'}</span>
        </Link>

        <h1 className={styles.title}>Recover Password</h1>
        <p className={styles.subtitle}>
          Enter your registered work email to receive password recovery instructions.
        </p>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>✉️</span>
            <p style={{ fontSize: '0.95rem', color: 'var(--primary-light)', fontWeight: 600 }}>Recovery Link Transmitted!</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted-dark)', marginTop: '0.5rem', lineHeight: '1.5' }}>
              Please check your inbox at <strong>{email}</strong> for instructions to finalize your password reset.
            </p>
            <Link href="/login" className="btn btn-secondary btn-sm" style={{ marginTop: '2rem', display: 'inline-block' }}>
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                className={styles.input}
                required
                placeholder="john@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', height: '48px', marginBottom: '2rem' }}
            >
              {loading ? 'Transmitting Link...' : 'Send Recovery Link ➔'}
            </button>

            <p className={styles.footerText} style={{ textAlign: 'center' }}>
              Remembered your password?{' '}
              <Link href="/login" className={styles.footerLink}>
                Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
