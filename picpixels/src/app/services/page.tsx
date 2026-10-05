import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServicesClient from './ServicesClient';
import { cachedJsonFetch, type Service } from '@/services/public-api';

import { buildPageMetadata, buildCollectionSchema, buildBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: 'Professional Photo Editing Services | Clipping Path, Retouching & Masking',
  description: 'Full suite of commercial photo editing services: clipping path, ghost mannequin, jewelry retouching, model editing, color correction, and shadow creation.',
  path: '/services',
  keywords: ['photo editing services', 'clipping path service', 'product image retouching', 'ghost mannequin service', 'color correction service'],
});

export default async function Services() {
  let services: Service[] = [];
  try {
    const url = `${API_URL}/api/v1/cms/services/?brief=1`;
    const data = await cachedJsonFetch<any>(url, 120);
    if (data) {
      services = data.results || data || [];
    }
  } catch {}

  const collectionSchema = buildCollectionSchema({
    name: 'Professional Photo Editing Services',
    description: 'Explore all commercial photo editing services offered by PicPicxels with custom turnaround times and bulk discounts.',
    path: '/services',
    items: services.map((s) => ({
      name: s.title,
      url: `/services/${s.slug}`,
      description: s.short_description || s.description,
      image: s.image,
    })),
  });

  const breadcrumbsSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
  ]);

  return (
    <>
      <JsonLd data={[collectionSchema, breadcrumbsSchema]} />
      <Header />
      <main id="main-content">
        <ServicesClient services={services} initialLocation="" />
      </main>
      <Footer footerServices={services} />
    </>
  );
}
