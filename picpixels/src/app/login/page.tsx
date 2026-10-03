import type { Metadata } from 'next';
import LoginClient from './LoginClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: 'Sign In | Client Portal | PicPicxels',
    description: 'Sign in to access your PicPicxels client portal to track orders, upload photos, and download finished deliverables.',
    path: '/login',
    keywords: ['picpixels login', 'client portal', 'sign in photo editing'],
  }),
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <main id="main-content">
      <LoginClient />
    </main>
  );
}
