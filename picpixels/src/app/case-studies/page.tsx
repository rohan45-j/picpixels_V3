import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { CaseStudyItem, CaseStudyCategory } from '@/services/public-api';
import CaseStudiesListClient from './CaseStudiesListClient';
import { buildPageMetadata, buildCollectionSchema, buildBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const metadata: Metadata = buildPageMetadata({
  title: 'Client Case Studies & Visual Transformation Stories',
  description: 'Explore our portfolio of real-world photo editing and CGI projects. See how leading e-commerce and product brands scale visual content with PicPicxels.',
  path: '/case-studies',
  keywords: ['photo editing case studies', 'ecommerce visual case study', 'product image retouching results'],
});

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

export default async function CaseStudiesPage() {
  const currentCategory = '';
  const currentSearch = '';

  const [itemsRes, categories] = await Promise.all([
    fetchJson<{ results: CaseStudyItem[]; count: number }>(`${API_BASE}/api/v1/case-studies/api/items/`),
    fetchJson<CaseStudyCategory[]>(`${API_BASE}/api/v1/case-studies/api/categories/`),
  ]);

  const initialItems = itemsRes?.results ?? [];
  const totalInitial = itemsRes?.count ?? initialItems.length;

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Case Studies', path: '/case-studies' },
  ];

  const collectionSchema = buildCollectionSchema({
    name: 'PicPicxels Client Case Studies',
    description: 'Real-world visual transformation stories and client success cases.',
    path: '/case-studies',
    items: initialItems.map((cs) => ({
      name: cs.title,
      url: `/case-studies/${cs.slug}`,
      description: cs.excerpt || cs.short_description || cs.client_name,
      image: cs.featured_image || cs.hero_banner || cs.og_image || undefined,
    })),
  });

  return (
    <>
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbs)} />
      <JsonLd schema={collectionSchema} />
      <Header />
      <CaseStudiesListClient
        initialItems={initialItems}
        categories={categories ?? []}
        totalInitial={totalInitial}
        initialCategory={currentCategory}
        initialSearch={currentSearch}
      />
      <Footer />
    </>
  );
}

