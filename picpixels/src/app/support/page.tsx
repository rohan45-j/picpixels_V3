import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SupportClient from './SupportClient';
import styles from '@/styles/modules/company.module.css';
import { buildPageMetadata, buildFaqSchema, buildBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = buildPageMetadata({
  title: 'Customer Support & Help Center (24/7)',
  description: 'Reach PicPicxels support 24/7/365. Fast answers, order assistance, technical help, and live chat with photo editing specialists.',
  path: '/support',
  keywords: ['photo editing support', 'picpixels customer service', 'help center', 'order tracking support'],
});

const supportFaqs = [
  { question: "What is the typical turnaround time?", answer: "Most orders are completed within 4–24 hours depending on volume and complexity." },
  { question: "What file formats do you support?", answer: "We accept JPEG, PNG, TIFF, PSD, RAW, and most common image formats. Output is delivered in your preferred format." },
  { question: "How do I submit images for editing?", answer: "Upload directly via our dashboard, FTP, or API. You can also use our Dropbox and Google Drive integrations." },
  { question: "Is there a free trial available?", answer: "Yes! Submit up to 3 images completely free with no credit card required to test our quality." },
  { question: "Do you offer SLA guarantees?", answer: "Yes, enterprise clients receive dedicated SLA agreements with guaranteed turnaround times and 24/7 support." },
  { question: "How is pricing calculated?", answer: "Pricing is per image, based on complexity. Volume discounts apply for monthly plans. See our pricing page for details." },
];

export default function SupportPage() {
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Support', path: '/support' },
  ];

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'PicPicxels 24/7 Support Center',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.picpicxels.com'}/support`,
    description: '24/7 customer support for photo editing, order status, and technical assistance.',
    mainEntity: {
      '@type': 'ContactPoint',
      telephone: '+1-409-419-3704',
      email: 'info@picpicxels.com',
      contactType: 'customer support',
      availableLanguage: ['English', 'Bengali', 'Spanish', 'French'],
    },
  };

  return (
    <div className={styles.page}>
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbs)} />
      <JsonLd schema={contactSchema} />
      <JsonLd schema={buildFaqSchema(supportFaqs, '/support')} />
      <Header />
      <main>
        <SupportClient />
      </main>
      <Footer />
    </div>
  );
}
