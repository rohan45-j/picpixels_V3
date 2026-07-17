import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import PricingClient from './PricingClient';
import type { FAQ, PricingPromotion } from '../../services/public-api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

export const dynamic = 'force-dynamic';

export default async function Pricing() {
  let faqs: FAQ[] = [];
  let promotions: PricingPromotion[] = [];

  try {
    const [faqsResp, promoResp] = await Promise.all([
      fetch(`${BASE_URL}/api/v1/cms/faqs/`, { cache: 'no-store' }),
      fetch(`${BASE_URL}/api/v1/cms/pricing-promotions/`, { cache: 'no-store' }),
    ]);
    if (faqsResp.ok) {
      const data = await faqsResp.json();
      faqs = data.results || data;
    }
    if (promoResp.ok) {
      const data = await promoResp.json();
      promotions = data.results || data || [];
    }
  } catch {}

  return (
    <>
      <Header />
      <PricingClient faqs={faqs} promotions={promotions} />
      <Footer />
    </>
  );
}
