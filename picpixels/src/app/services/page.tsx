import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServicesClient from './ServicesClient';
import type { Service } from '@/services/public-api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Services',
  description: 'Professional photo editing services including clipping path, background removal, ghost mannequin, retouching, color correction, and more.',
  openGraph: {
    title: 'Photo Editing Services | PicPicxels',
    description: 'Professional photo editing services. Clipping path, background removal, ghost mannequin, retouching & more.',
    type: 'website',
  },
};

export default async function Services({
  searchParams,
}: {
  searchParams?: Promise<{ location?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const activeLocation = resolvedParams.location ? String(resolvedParams.location).trim() : '';

  let services: Service[] = [];
  try {
    const url = activeLocation
      ? `${BASE_URL}/api/v1/cms/services/?brief=1&location=${encodeURIComponent(activeLocation)}`
      : `${BASE_URL}/api/v1/cms/services/?brief=1`;
    const resp = await fetch(url, { next: { revalidate: 60 } });
    if (resp.ok) {
      const data = await resp.json();
      services = data.results || data;
    }
  } catch {}

  return (
    <>
      <Header />
      <main id="main-content">
        <ServicesClient services={services} initialLocation={activeLocation} />
      </main>
      <Footer />
    </>
  );
}
