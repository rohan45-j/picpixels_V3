import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactClient from './ContactClient';
import type { FAQ } from '@/services/public-api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Us | PicPicxels',
  description: 'Get in touch with PicPicxels. Send us your images via Wetransfer or Dropbox and get a free trial.',
};

export default async function Contact() {
  let faqs: FAQ[] = [];
  try {
    const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com'}/api/v1/cms/faqs/contact/`, { cache: 'no-store' });
    if (resp.ok) { const d = await resp.json(); faqs = d.results || d; }
  } catch {}

  return (
    <>
      <Header />
      <main id="main-content">
        <ContactClient faqs={faqs} />
      </main>
      <Footer />
    </>
  );
}
