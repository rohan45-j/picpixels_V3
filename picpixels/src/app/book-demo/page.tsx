import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookDemoClient from './BookDemoClient';
import { buildPageMetadata, buildWebPageSchema, buildFaqSchema, buildBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = buildPageMetadata({
  title: 'Book a Free Consultation & Demo',
  description: 'Schedule a free 30-minute demo consultation with PicPicxels. Discover professional photo editing solutions tailored to your business.',
  path: '/book-demo',
  keywords: ['book photo editing demo', 'free retouching consultation', 'ecommerce image workflow demo'],
});

const demoFaqs = [
  {
    question: 'What happens during the consultation?',
    answer: "We discuss your business goals, current challenges, and how our digital solutions can help. We'll review examples and provide a tailored recommendation.",
  },
  {
    question: 'How long is the demo session?',
    answer: 'Typical demo sessions last 30–45 minutes. We cover your specific needs and walk through how our platform and services work.',
  },
  {
    question: 'Is there any cost for the demo?',
    answer: 'No. The demo is completely free with no obligation. We believe in showing value before any commitment.',
  },
  {
    question: 'What do I need to prepare?',
    answer: "Just bring your ideas and any sample images or reference materials. We'll handle the rest.",
  },
  {
    question: 'Can I bring my team?',
    answer: 'Absolutely. We encourage including stakeholders, designers, and decision-makers to get the most out of the session.',
  },
];

export default function BookDemoPage() {
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Book a Demo', path: '/book-demo' },
  ];

  return (
    <>
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbs)} />
      <JsonLd
        schema={buildWebPageSchema({
          title: 'Book a Free Consultation - PicPicxels',
          description: 'Schedule a free 30-minute consultation with our photo editing and retouching experts.',
          path: '/book-demo',
        })}
      />
      <JsonLd schema={buildFaqSchema(demoFaqs, '/book-demo')} />
      <Header />
      <main>
        <BookDemoClient />
      </main>
      <Footer />
    </>
  );
}
