'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Script from 'next/script';
import { ShieldCheck } from 'lucide-react';

export interface BotProtectionPayload {
  website_hp: string;
  hp_company_url?: string;
  form_loaded_at: number;
  captcha_token?: string;
}

interface BotProtectionProps {
  siteKey?: string;
  onTokenChange?: (token: string) => void;
  onChange?: (payload: BotProtectionPayload) => void;
  honeypotValue?: string;
  onHoneypotChange?: (val: string) => void;
  theme?: 'auto' | 'light' | 'dark';
  showBadge?: boolean;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'auto' | 'light' | 'dark';
          size?: 'normal' | 'compact' | 'flexible';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export default function BotProtection({
  siteKey,
  onTokenChange,
  onChange,
  honeypotValue = '',
  onHoneypotChange,
  theme = 'auto',
  showBadge = true,
}: BotProtectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [timestamp] = useState(() => (Date.now() / 1000).toString());
  const [internalHoneypot, setInternalHoneypot] = useState(honeypotValue);
  const [token, setToken] = useState('');
  const [isReady, setIsReady] = useState(false);

  // Cloudflare Turnstile public site key
  const activeSiteKey =
    siteKey ||
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ||
    '1x00000000000000000000AA'; // Cloudflare official testing site key (always passes)

  const handleTokenReceived = useCallback(
    (newToken: string) => {
      setToken(newToken);
      if (onTokenChange) onTokenChange(newToken);
      if (onChange) {
        onChange({
          website_hp: internalHoneypot,
          form_loaded_at: parseFloat(timestamp) * 1000,
          captcha_token: newToken,
        });
      }
    },
    [internalHoneypot, timestamp, onTokenChange, onChange]
  );

  const handleHoneypotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalHoneypot(val);
    if (onHoneypotChange) onHoneypotChange(val);
    if (onChange) {
      onChange({
        website_hp: val,
        form_loaded_at: parseFloat(timestamp) * 1000,
        captcha_token: token,
      });
    }
  };

  const renderWidget = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      window.turnstile &&
      containerRef.current &&
      activeSiteKey
    ) {
      // Remove previous widget if already rendered
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: activeSiteKey,
          callback: (newToken: string) => {
            handleTokenReceived(newToken);
          },
          'error-callback': () => {
            handleTokenReceived('');
          },
          'expired-callback': () => {
            handleTokenReceived('');
          },
          theme,
          size: 'normal',
        });
        widgetIdRef.current = id;
      } catch (err) {
        console.warn('[BotProtection] Turnstile render notice:', err);
      }
    }
  }, [activeSiteKey, theme, handleTokenReceived]);

  useEffect(() => {
    if (isReady) {
      renderWidget();
    }
    return () => {
      if (widgetIdRef.current && typeof window !== 'undefined' && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
      }
    };
  }, [isReady, renderWidget]);

  return (
    <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
      {/* 1. Honeypot Anti-Bot Field (Hidden from humans, filled by automated bot spiders) */}
      <div
        style={{
          display: 'none',
          position: 'absolute',
          left: '-9999px',
          opacity: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <label htmlFor="website_hp_input">Please leave this field blank</label>
        <input
          type="text"
          id="website_hp_input"
          name="website_hp"
          value={honeypotValue || internalHoneypot}
          onChange={handleHoneypotChange}
          tabIndex={-1}
          autoComplete="off"
        />
        <input type="hidden" name="form_loaded_at" value={timestamp} />
      </div>

      {/* 2. Cloudflare Turnstile script loader */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      {/* 3. Turnstile container widget */}
      <div
        ref={containerRef}
        style={{
          minHeight: '65px',
          display: 'flex',
          justifyContent: 'flex-start',
        }}
      />

      {/* 4. Sleek Trust & Security Badge */}
      {showBadge && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            color: '#6b7280',
            marginTop: '0.35rem',
          }}
        >
          <ShieldCheck size={14} style={{ color: '#10b981' }} />
          <span>Protected by Cloudflare Turnstile</span>
        </div>
      )}
    </div>
  );
}
