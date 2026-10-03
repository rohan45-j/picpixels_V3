import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutClient from './AboutClient';
import type { Testimonial, BrandLogo, SiteSetting, AboutPageData } from '@/services/public-api';
import { fetchBrandLogos, fetchSiteSettings, fetchAboutPageData } from '@/services/public-api';

import { buildPageMetadata, buildBreadcrumbSchema, SITE_URL } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: 'About Us | PicPicxels Virtual Photo Editing Studio',
  description: 'Learn about PicPicxels, a global photo editing studio with 10+ years experience, 500+ brand clients, and 5M+ images edited with perfection.',
  path: '/about',
  keywords: ['about PicPicxels', 'photo editing team', 'commercial retouching agency', 'virtual image studio'],
});

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

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE_URL}/about#about`,
    url: `${SITE_URL}/about`,
    name: 'About PicPicxels',
    description: 'Learn about PicPicxels, a global photo editing studio with 10+ years experience, 500+ brand clients, and 5M+ images edited.',
    mainEntity: {
      '@type': 'Organization',
      name: 'PicPicxels',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
    },
  };

  const breadcrumbsSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
  ]);

  return (
    <>
      <JsonLd data={[aboutSchema, breadcrumbsSchema]} />
      <Header />
      <main id="main-content">
        <AboutClient testimonials={testimonials} brandLogos={brandLogos} aboutData={aboutData} />
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}

