import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PricingClient from './PricingClient';
import { cachedJsonFetch, fetchPricingServices, type FAQ, type PricingPromotion, type PricingService } from '@/services/public-api';
import { buildPageMetadata, buildPricingSchema, buildFaqSchema, buildBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: 'Pricing Plans & Volume Rates',
  description: 'Transparent pricing for professional photo editing services starting from $0.25/image. Volume discounts up to 40% available. No hidden fees.',
  path: '/pricing',
  keywords: ['photo editing pricing', 'clipping path price', 'bulk photo editing rates', 'retouching cost'],
});

export default async function Pricing() {
  let faqs: FAQ[] = [];
  let promotions: PricingPromotion[] = [];
  let services: PricingService[] = [];

  try {
    const [faqsData, promoData, fetchedServices] = await Promise.all([
      cachedJsonFetch<any>(`${BASE_URL}/api/v1/cms/faqs/?is_pricing_faq=true`, 120),
      cachedJsonFetch<any>(`${BASE_URL}/api/v1/cms/pricing-promotions/`, 120),
      fetchPricingServices(),
    ]);
    if (faqsData) {
      const list = faqsData.results || faqsData || [];
      faqs = Array.isArray(list) ? list.filter((f: FAQ) => f.is_active !== false) : [];
    }
    if (promoData) {
      promotions = promoData.results || promoData || [];
    }
    services = fetchedServices || [];
  } catch {}

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Pricing', path: '/pricing' },
  ];

  return (
    <>
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbs)} />
      <JsonLd schema={buildPricingSchema(services)} />
      {faqs.length > 0 && <JsonLd schema={buildFaqSchema(faqs, '/pricing')} />}
      <Header />
      <main id="main-content">
        <PricingClient
          faqs={faqs}
          promotions={promotions}
          services={services}
        />
      </main>
      <Footer />
    </>
  );
}

