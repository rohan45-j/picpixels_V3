import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import OrderSummaryClient from './OrderSummaryClient';
import { buildPageMetadata } from '@/lib/seo';
import type { OrderSummaryData } from '@/services/public-api';

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: 'Order Summary & Project Specifications',
    description: 'Review your selected photo editing package, upload project assets, and configure delivery instructions.',
    path: '/order-summary',
    keywords: ['photo editing order', 'order summary', 'upload assets'],
  }),
  robots: {
    index: false,
    follow: false,
  },
};

// Must be dynamic — reads the order_summary cookie set by /api/order POST redirect
export const dynamic = 'force-dynamic';

export default async function OrderSummaryPage() {
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get('order_summary')?.value;

  let initialData: OrderSummaryData | null = null;
  if (cookieVal) {
    try {
      initialData = JSON.parse(decodeURIComponent(cookieVal));
    } catch {
      try {
        initialData = JSON.parse(cookieVal);
      } catch {
        initialData = null;
      }
    }
  }

  // Pass cookie data as initial data; client also reads localStorage for JS flow
  return <OrderSummaryClient initialData={initialData} />;
}



