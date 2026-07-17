import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import AboutClient from './AboutClient';
import type { Testimonial } from '../../services/public-api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

export const dynamic = 'force-dynamic';

export default async function About() {
  let testimonials: Testimonial[] = [];
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/cms/testimonials/`, { cache: 'no-store' });
    if (resp.ok) {
      const data = await resp.json();
      testimonials = data.results || [];
    }
  } catch {}

  return (
    <>
      <Header />
      <AboutClient testimonials={testimonials} />
      <Footer />
    </>
  );
}
