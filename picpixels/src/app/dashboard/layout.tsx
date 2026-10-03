import type { Metadata } from 'next';
import DashboardShell from './DashboardShell';

export const metadata: Metadata = {
  title: {
    template: '%s | PicPicxels Dashboard',
    default: 'Dashboard | PicPicxels',
  },
  description: 'Manage your photo editing orders, track turnaround progress, and download high-resolution deliverables.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
