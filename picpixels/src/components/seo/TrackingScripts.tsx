import React from 'react';
import type { SiteSetting } from '@/services/public-api';

interface TrackingScriptsProps {
  settings: SiteSetting | null;
}

export function GTMHead({ settings }: TrackingScriptsProps) {
  const gtmId = settings?.google_tag_manager_id?.trim();
  if (!gtmId) return null;

  return (
    <script
      id="gtm-script"
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
      }}
    />
  );
}

export function GTMBody({ settings }: TrackingScriptsProps) {
  const gtmId = settings?.google_tag_manager_id?.trim();
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}

export function GA4Head({ settings }: TrackingScriptsProps) {
  const gaId = settings?.google_analytics_id?.trim();
  if (!gaId) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      <script
        id="ga4-script"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

export function GSCMeta({ settings }: TrackingScriptsProps) {
  const rawCode = settings?.google_search_console_code?.trim();
  if (!rawCode) return null;

  // Extract content attribute if user pasted full meta tag: <meta name="google-site-verification" content="..." />
  let token = rawCode;
  if (rawCode.includes('content=')) {
    const match = rawCode.match(/content=["']([^"']+)["']/i);
    if (match && match[1]) {
      token = match[1];
    }
  } else {
    token = rawCode.replace(/<[^>]*>/g, '').trim();
  }

  if (!token) return null;
  return <meta name="google-site-verification" content={token} />;
}

export function FacebookPixelHead({ settings }: TrackingScriptsProps) {
  const pixelId = settings?.facebook_pixel_id?.trim();
  if (!pixelId) return null;

  return (
    <script
      id="meta-pixel-script"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `,
      }}
    />
  );
}

export function OrganizationSchema({ settings }: TrackingScriptsProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.picpicxels.com';

  let schemaObj: any = null;
  if (settings?.organization_schema && settings.organization_schema.trim()) {
    try {
      schemaObj = JSON.parse(settings.organization_schema.trim());
    } catch {
      // If parsing fails, schemaObj remains null
    }
  }

  if (!schemaObj) {
    const socialLinks = settings?.social_links ? Object.values(settings.social_links).filter(Boolean) : [];
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: settings?.site_name || 'PicPicxels',
      url: siteUrl,
      logo: settings?.logo || `${siteUrl}/logo.png`,
      description: settings?.tagline || 'Professional photo editing services',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: settings?.support_phone || '+1 (123) 456-7890',
        contactType: 'customer service',
        email: settings?.support_email || 'support@picpicxels.com',
      },
      sameAs: socialLinks,
    };
  }

  return (
    <script
      type="application/ld+json"
      id="organization-schema"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaObj) }}
    />
  );
}

export function CustomBodyStartScripts({ settings }: TrackingScriptsProps) {
  const scripts = settings?.custom_body_start_scripts?.trim();
  if (!scripts) return null;

  return (
    <div
      id="custom-body-start"
      style={{ display: 'contents' }}
      dangerouslySetInnerHTML={{ __html: scripts }}
    />
  );
}

export function CustomBodyEndScripts({ settings }: TrackingScriptsProps) {
  const scripts = settings?.custom_body_end_scripts?.trim();
  if (!scripts) return null;

  return (
    <div
      id="custom-body-end"
      style={{ display: 'contents' }}
      dangerouslySetInnerHTML={{ __html: scripts }}
    />
  );
}
