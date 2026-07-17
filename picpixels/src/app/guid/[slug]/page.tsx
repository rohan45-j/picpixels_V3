import { notFound } from 'next/navigation';
import Header from '../../../layouts/Header';
import Footer from '../../../layouts/Footer';
import type { GuideItem } from '../../../services/public-api';
import GuideDetailClient from './GuideDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

async function fetchGuide(slug: string): Promise<GuideItem | null> {
  try {
    const resp = await fetch(`${API_BASE}/api/v1/guides/api/items/${slug}/`);
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const resp = await fetch(`${API_BASE}/api/v1/guides/api/items/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.results || data).map((item: { slug: string }) => ({ slug: item.slug }));
  } catch {
    return [];
  }
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await fetchGuide(slug);
  if (!item) notFound();

  return (
    <>
      <Header />
      <GuideDetailClient item={item} />
      <Footer />
    </>
  );
}
