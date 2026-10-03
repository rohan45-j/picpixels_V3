import type { Metadata } from 'next';
import NotificationsClient from './NotificationsClient';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View real-time updates on orders, messages, and production statuses.',
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
