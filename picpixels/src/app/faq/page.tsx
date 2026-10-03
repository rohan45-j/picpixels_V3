import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FAQClient from './FAQClient';
import type { FAQ, FAQCategory } from '@/services/public-api';
import { buildPageMetadata, buildFaqSchema, buildBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: 'Frequently Asked Questions (FAQ)',
  description: 'Find answers to common questions about PicPicxels photo editing services, turnaround times, pricing, file formats, revisions, and security.',
  path: '/faq',
  keywords: ['photo editing faq', 'turnaround time', 'revisions policy', 'file formats accepted', 'bulk orders'],
});

export default async function FAQPage() {
  let faqs: FAQ[] = [];
  let categories: FAQCategory[] = [];

  try {
    const [faqResp, catResp] = await Promise.all([
      fetch(`${BASE_URL}/api/v1/cms/faqs/`, { next: { revalidate: 60 } }),
      fetch(`${BASE_URL}/api/v1/cms/faq/categories/`, { next: { revalidate: 60 } }),
    ]);
    if (faqResp.ok) { const d = await faqResp.json(); faqs = d.results || d; }
    if (catResp.ok) { const d = await catResp.json(); categories = d.results || d; }
  } catch {}

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <>
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbs)} />
      {faqs.length > 0 && <JsonLd schema={buildFaqSchema(faqs, '/faq')} />}
      <Header />
      <main id="main-content">
        <FAQClient initialFAQs={faqs} initialCategories={categories} />
      </main>
      <Footer />
    </>
  );
}

