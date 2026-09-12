import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutClient from './AboutClient';
import type { Testimonial, BrandLogo, SiteSetting, AboutPageData } from '@/services/public-api';
import { fetchBrandLogos, fetchSiteSettings, fetchAboutPageData } from '@/services/public-api';

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
  let aboutData: AboutPageData | null = null;

  try {
    const [testiResp, brands, settings, about] = await Promise.all([
      fetch(`${BASE_URL}/api/v1/cms/testimonials/`, { next: { revalidate: 60 } })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetchBrandLogos(),
      fetchSiteSettings(),
      fetchAboutPageData(),
    ]);
    testimonials = testiResp?.results || [];
    brandLogos = brands;
    siteSettings = settings;
    aboutData = about;
  } catch {}

  return (
    <>
      <Header />
      <main id="main-content">
        <AboutClient testimonials={testimonials} brandLogos={brandLogos} aboutData={aboutData} />
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}

