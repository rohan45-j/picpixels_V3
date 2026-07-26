import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { GuideItem, GuideCategory } from '@/services/public-api';
import GuideListClient from './GuideListClient';

export const metadata: Metadata = {
  title: 'Guides & Resources',
  description: 'Comprehensive guides and resources for professional photo editing, e-commerce imagery, and visual content optimization.',
  openGraph: {
    title: 'Guides & Resources | PicPicxels',
    description: 'Expert guides for photo editing, e-commerce imagery, and visual content optimization.',
    type: 'website',
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

export default async function GuidePage() {
  const [itemsRes, categories] = await Promise.all([
    fetchJson<{ results: GuideItem[] }>(`${API_BASE}/api/v1/guides/api/items/`),
    fetchJson<GuideCategory[]>(`${API_BASE}/api/v1/guides/api/categories/`),
  ]);

  const initialItems = itemsRes?.results ?? [];

  return (
    <>
      <Header />
      <GuideListClient
        initialItems={initialItems}
        categories={categories ?? []}
      />
      <Footer />
    </>
  );
}
