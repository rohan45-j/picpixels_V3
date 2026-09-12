import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactClient from './ContactClient';
import { fetchSiteSettings, type FAQ, type SiteSetting } from '@/services/public-api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Us | PicPicxels',
  description: 'Get in touch with PicPicxels. Send us your images via Wetransfer or Dropbox and get a free trial.',
};

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

  return (
    <>
      <Header />
      <main id="main-content">
        <ContactClient faqs={faqs} initialSiteSettings={siteSettings} />
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
