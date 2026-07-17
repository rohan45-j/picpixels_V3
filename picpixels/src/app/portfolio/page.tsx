import { Suspense } from 'react';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import type { PortfolioItem, PortfolioCategory } from '../../services/public-api';
import PortfolioListClient from './PortfolioListClient';

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
      <Suspense fallback={<div style={{ padding: '5rem', textAlign: 'center' }}>Loading portfolio...</div>}>
        <PortfolioListClient
          initialPortfolios={initialPortfolios}
          categories={categories ?? []}
        />
      </Suspense>
      <Footer />
    </>
  );
}
