import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PricingClient from './PricingClient';
import { fetchPricingServices, type FAQ, type PricingPromotion, type PricingService } from '@/services/public-api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Transparent pricing for professional photo editing services. Starting from $0.25 per image. Bulk discounts up to 40% available. No hidden fees.',
  openGraph: {
    title: 'Pricing | PicPicxels Photo Editing Services',
    description: 'Affordable photo editing pricing starting from $0.25/image. Volume discounts available. Get your free quote today.',
    type: 'website',
  },
};

export default async function Pricing() {
  let faqs: FAQ[] = [];
  let promotions: PricingPromotion[] = [];
  let services: PricingService[] = [];

  try {
    const [faqsResp, promoResp] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com'}/api/v1/cms/faqs/`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com'}/api/v1/cms/pricing-promotions/`, { cache: 'no-store' }),
    ]);
    if (faqsResp.ok) {
      const data = await faqsResp.json();
      faqs = data.results || data;
    }
    if (promoResp.ok) {
      const data = await promoResp.json();
      promotions = data.results || data || [];
    }
    services = await fetchPricingServices();
  } catch {}

  return (
    <>
      <Header />
      <main id="main-content">
        <PricingClient faqs={faqs} promotions={promotions} services={services} />
      </main>
      <Footer />
    </>
  );
}
