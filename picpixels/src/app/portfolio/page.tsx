import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { PortfolioItem, PortfolioCategory } from '@/services/public-api';
import PortfolioListClient from './PortfolioListClient';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Browse our portfolio of professional photo editing projects. See before and after examples of clipping path, retouching, ghost mannequin, and more.',
  openGraph: {
    title: 'Portfolio | PicPicxels Photo Editing',
    description: 'See our portfolio of professional photo editing projects. Before and after examples across multiple categories.',
    type: 'website',
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

export const dynamic = 'force-dynamic';

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

export default async function PortfolioPage() {
  const [portfoliosRes, categories] = await Promise.all([
    fetchJson<{ results: PortfolioItem[] }>(`${API_BASE}/api/v1/portfolio/api/items/`),
    fetchJson<PortfolioCategory[]>(`${API_BASE}/api/v1/portfolio/api/categories/`),
  ]);

  const initialPortfolios = portfoliosRes?.results ?? [];

  return (
    <>
      <Header />
      <PortfolioListClient
        initialPortfolios={initialPortfolios}
        categories={categories ?? []}
      />
      <Footer />
    </>
  );
}
