import type { Metadata } from 'next';
import ForgotPasswordClient from './ForgotPasswordClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: 'Forgot Password | PicPicxels',
    description: 'Reset your PicPicxels client portal password.',
    path: '/forgot-password',
    keywords: ['forgot password', 'picpixels password reset'],
  }),
  robots: {
    index: false,
    follow: true,
  },
};

export default function ForgotPasswordPage() {
  return (
    <main id="main-content">
      <ForgotPasswordClient />
    </main>
  );
}
