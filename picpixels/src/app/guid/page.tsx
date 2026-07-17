import { Suspense } from 'react';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import type { GuideItem, GuideCategory } from '../../services/public-api';
import GuideListClient from './GuideListClient';

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
      <Suspense fallback={<div style={{ padding: '5rem', textAlign: 'center' }}>Loading guides...</div>}>
        <GuideListClient
          initialItems={initialItems}
          categories={categories ?? []}
        />
      </Suspense>
      <Footer />
    </>
  );
}
