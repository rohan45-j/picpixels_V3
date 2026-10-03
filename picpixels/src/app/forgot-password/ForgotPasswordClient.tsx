'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSiteSettings } from '@/store/SiteSettingsContext';
import styles from '@/styles/modules/login.module.css';
import BotProtection from '@/components/ui/BotProtection';

export default function ForgotPasswordClient() {
  const { siteSettings } = useSiteSettings();
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';
      const resp = await fetch(`${baseUrl}/api/v1/users/password-reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          cf_turnstile_response: captchaToken,
          website_hp: honeypot,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        setErrorMsg(
          errData?.detail ||
          (errData?.email ? String(errData.email[0]) : null) ||
          'Failed to process password recovery. Please try again.'
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setErrorMsg('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* Brand Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span>{siteSettings?.site_name || 'PicPicxels'}</span>
        </Link>

        <h1 className={styles.title}>Recover Password</h1>
        <p className={styles.subtitle}>
          Enter your registered work email to receive password recovery instructions.
        </p>

        {errorMsg && (
          <div
            style={{
              color: '#ef4444',
              background: 'rgba(239,68,68,0.1)',
              padding: '0.8rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              textAlign: 'center',
            }}
          >
            {errorMsg}
          </div>
        )}

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

            <BotProtection
              onTokenChange={setCaptchaToken}
              honeypotValue={honeypot}
              onHoneypotChange={setHoneypot}
            />

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
