import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { CaseStudyItem, CaseStudyCategory } from '@/services/public-api';
import CaseStudiesListClient from './CaseStudiesListClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';

export const metadata: Metadata = {
  title: 'Product CGI Case Studies | PicPixels',
  description:
    'Explore our portfolio of real-world CGI projects across furniture, automotive, lighting, and more. See how successful product brands use 3D modeling and rendering.',
  openGraph: {
    title: 'Product CGI Case Studies | PicPixels',
    description:
      'Explore our portfolio of real-world CGI projects across furniture, automotive, lighting, and more.',
    type: 'website',
  },
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

export default async function CaseStudiesPage() {
  const [itemsRes, categories] = await Promise.all([
    fetchJson<{ results: CaseStudyItem[]; count: number }>(`${API_BASE}/api/v1/case-studies/api/items/`),
    fetchJson<CaseStudyCategory[]>(`${API_BASE}/api/v1/case-studies/api/categories/`),
  ]);

  const initialItems = itemsRes?.results ?? [];
  const totalInitial = itemsRes?.count ?? initialItems.length;

  return (
    <>
      <Header />
      <CaseStudiesListClient
        initialItems={initialItems}
        categories={categories ?? []}
        totalInitial={totalInitial}
      />
      <Footer />
    </>
  );
}
