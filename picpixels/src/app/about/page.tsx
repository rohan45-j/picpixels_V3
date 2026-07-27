import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutClient from './AboutClient';
import type { Testimonial, BrandLogo, SiteSetting } from '@/services/public-api';
import { fetchBrandLogos, fetchSiteSettings } from '@/services/public-api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'About Us',
  description: 'PicPicxels is a trusted virtual photo editing studio. 5M+ images edited for brands, retailers, and agencies worldwide. 10+ years of experience.',
  openGraph: {
    title: 'About PicPicxels | Professional Photo Editing Studio',
    description: 'Your trusted virtual photo editing solution. 5M+ images edited. 500+ active clients. 10+ years experience.',
    type: 'website',
  },
};

export default async function About() {
  let testimonials: Testimonial[] = [];
  let brandLogos: BrandLogo[] = [];
  let siteSettings: SiteSetting | null = null;
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/cms/testimonials/`, { next: { revalidate: 60 } });
    if (resp.ok) {
      const data = await resp.json();
      testimonials = data.results || [];
    }
    brandLogos = await fetchBrandLogos();
    siteSettings = await fetchSiteSettings();
  } catch {}

  return (
    <>
      <Header />
      <main id="main-content">
        <AboutClient testimonials={testimonials} brandLogos={brandLogos} />
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
