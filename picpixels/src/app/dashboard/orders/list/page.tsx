import type { Metadata } from 'next';
import OrdersListClient from './OrdersListClient';

export const metadata: Metadata = {
  title: 'My Orders',
  description: 'Track turnaround progress and download high-resolution completed assets.',
};

export default function OrdersListPage() {
  return <OrdersListClient />;
}
