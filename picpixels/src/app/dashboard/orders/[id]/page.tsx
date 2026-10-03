import type { Metadata } from 'next';
import OrderDetailsClient from './OrderDetailsClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order #${id || ''}`,
    description: `Review asset status and annotations for order #${id || ''}.`,
  };
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailsClient id={id} />;
}
