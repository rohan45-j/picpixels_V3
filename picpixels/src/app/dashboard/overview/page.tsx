import type { Metadata } from 'next';
import OverviewClient from './OverviewClient';

export const metadata: Metadata = {
  title: 'Overview',
  description: 'View active orders, production metrics, and turnaround times in your PicPicxels dashboard.',
};

export default function DashboardOverviewPage() {
  return <OverviewClient />;
}
