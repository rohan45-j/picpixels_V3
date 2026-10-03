import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PricingClient from './PricingClient';
import { fetchPricingServices, type FAQ, type PricingPromotion, type PricingService } from '@/services/public-api';
import { buildPageMetadata, buildPricingSchema, buildFaqSchema, buildBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: 'Pricing Plans & Volume Rates',
  description: 'Transparent pricing for professional photo editing services starting from $0.25/image. Volume discounts up to 40% available. No hidden fees.',
  path: '/pricing',
  keywords: ['photo editing pricing', 'clipping path price', 'bulk photo editing rates', 'retouching cost'],
});

export default async function Pricing({
  searchParams,
}: {
  searchParams?: Promise<{ service?: string; unit_range?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const initialServiceId = resolvedParams?.service ? Number(resolvedParams.service) : undefined;
  const initialUnitRangeId = resolvedParams?.unit_range ? Number(resolvedParams.unit_range) : undefined;

  let faqs: FAQ[] = [];
  let promotions: PricingPromotion[] = [];
  let services: PricingService[] = [];

  try {
    const [faqsResp, promoResp, fetchedServices] = await Promise.all([
      fetch(`${BASE_URL}/api/v1/cms/faqs/?is_pricing_faq=true`, { next: { revalidate: 60 } }),
      fetch(`${BASE_URL}/api/v1/cms/pricing-promotions/`, { next: { revalidate: 60 } }),
      fetchPricingServices(),
    ]);
    if (faqsResp.ok) {
      const data = await faqsResp.json();
      const list = data.results || data || [];
      faqs = Array.isArray(list) ? list.filter((f: FAQ) => f.is_active !== false) : [];
    }
    if (promoResp.ok) {
      const data = await promoResp.json();
      promotions = data.results || data || [];
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
          initialServiceId={initialServiceId}
          initialUnitRangeId={initialUnitRangeId}
        />
      </main>
      <Footer />
    </>
  );
}

