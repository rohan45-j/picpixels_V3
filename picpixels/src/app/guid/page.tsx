import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { GuideItem, GuideCategory } from '@/services/public-api';
import GuideListClient from './GuideListClient';
import { buildPageMetadata, buildCollectionSchema, buildBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = buildPageMetadata({
  title: 'Guides & Step-by-Step Resources',
  description: 'Comprehensive guides and resources for professional photo editing, e-commerce imagery, clipping paths, and visual content optimization.',
  path: '/guid',
  keywords: ['photo editing guides', 'clipping path tutorial', 'ecommerce photo standards', 'retouching techniques'],
});

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';

export const revalidate = 60;

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const resp = await fetch(url, { next: { revalidate: 60 } });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

export default async function GuidePage() {
  const currentCategory = '';
  const currentSearch = '';

  const [itemsRes, categories] = await Promise.all([
    fetchJson<{ results: GuideItem[] }>(`${API_BASE}/api/v1/guides/api/items/`),
    fetchJson<GuideCategory[]>(`${API_BASE}/api/v1/guides/api/categories/`),
  ]);

  const initialItems = itemsRes?.results ?? [];

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guid' },
  ];

  const collectionSchema = buildCollectionSchema({
    name: 'PicPicxels Editing Guides & Tutorials',
    description: 'Comprehensive guides and tutorials for high-volume photo editing and retouching.',
    path: '/guid',
    items: initialItems.map((g) => ({
      name: g.title,
      url: `/guid/${g.slug}`,
      description: g.short_description || g.meta_description,
      image: g.og_image_url || g.featured_image_url || g.featured_image || undefined,
    })),
  });

  return (
    <>
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbs)} />
      <JsonLd schema={collectionSchema} />
      <Header />
      <GuideListClient
        initialItems={initialItems}
        categories={categories ?? []}
        initialCategory={currentCategory}
        initialSearch={currentSearch}
      />
      <Footer />
    </>
  );
}

