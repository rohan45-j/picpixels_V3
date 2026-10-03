import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactClient from './ContactClient';
import { fetchSiteSettings, type FAQ, type SiteSetting } from '@/services/public-api';
import { buildPageMetadata, buildContactSchema, buildBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Us | PicPicxels Photo Editing Studio',
  description: 'Get in touch with PicPicxels. Send your project requirements, request a custom volume discount, or speak with our photo editing production directors.',
  path: '/contact',
  keywords: ['contact PicPicxels', 'photo editing studio contact', 'custom quote image editing', 'ecommerce photo editing support'],
});

export default async function Contact() {
  let faqs: FAQ[] = [];
  let siteSettings: SiteSetting | null = null;

  try {
    const [faqResp, settings] = await Promise.all([
      fetch(`${BASE_URL}/api/v1/cms/faqs/contact/`, { next: { revalidate: 60 } }).catch(() => null),
      fetchSiteSettings().catch(() => null),
    ]);
    if (faqResp && faqResp.ok) {
      const d = await faqResp.json();
      faqs = d.results || d;
    }
    siteSettings = settings;
  } catch {}

  const contactSchema = buildContactSchema();
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Contact Us', path: '/contact' },
  ]);

  return (
    <>
      <JsonLd data={[contactSchema, breadcrumbSchema]} />
      <Header />
      <main id="main-content">
        <ContactClient faqs={faqs} initialSiteSettings={siteSettings} />
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
