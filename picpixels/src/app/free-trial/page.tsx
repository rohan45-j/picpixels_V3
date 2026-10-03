import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FreeTrialClient from './FreeTrialClient';
import { fetchSiteSettings } from '@/services/public-api';
import { buildPageMetadata, buildBreadcrumbSchema, SITE_URL } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: 'Free Trial | Get 3–5 Images Edited Free with No Obligation',
  description: 'Test our pixel-perfect photo editing quality risk-free. Upload 3 to 5 product images, and receive professionally edited results in 24–48 hours.',
  path: '/free-trial',
  keywords: ['free photo editing trial', 'free clipping path sample', 'test ecommerce retouching', 'free image editing sample'],
});

export default async function FreeTrialPage() {
  const siteSettings = await fetchSiteSettings().catch(() => null);

  const trialSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}/free-trial#webpage`,
    url: `${SITE_URL}/free-trial`,
    name: 'Free Photo Editing Trial',
    description: 'Get your first 3-5 images edited for free with zero obligation from PicPicxels professional photo editing studio.',
    potentialAction: {
      '@type': 'Action',
      name: 'Claim Free Trial',
      target: `${SITE_URL}/free-trial`,
    },
  };

  const breadcrumbsSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Free Trial', path: '/free-trial' },
  ]);

  return (
    <>
      <JsonLd data={[trialSchema, breadcrumbsSchema]} />
      <Header />
      <FreeTrialClient recaptchaSiteKey={siteSettings?.recaptcha_site_key} />
      <Footer siteSettings={siteSettings} />
    </>
  );
}
