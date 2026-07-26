import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FAQClient from './FAQClient';
import type { FAQ, FAQCategory } from '@/services/public-api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

export const dynamic = 'force-dynamic';

export default async function FAQPage() {
  let faqs: FAQ[] = [];
  let categories: FAQCategory[] = [];

  try {
    const [faqResp, catResp] = await Promise.all([
      fetch(`${BASE_URL}/api/v1/cms/faqs/`, { cache: 'no-store' }),
      fetch(`${BASE_URL}/api/v1/cms/faq/categories/`, { cache: 'no-store' }),
    ]);
    if (faqResp.ok) { const d = await faqResp.json(); faqs = d.results || d; }
    if (catResp.ok) { const d = await catResp.json(); categories = d.results || d; }
  } catch {}

  return (
    <>
      <Header />
      <main id="main-content">
        <FAQClient initialFAQs={faqs} initialCategories={categories} />
      </main>
      <Footer />
    </>
  );
}
