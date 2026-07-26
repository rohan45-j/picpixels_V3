import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { GuideItem } from '@/services/public-api';
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';
  try {
    const resp = await fetch(`${API_BASE}/api/v1/guides/api/items/${slug}/`);
    if (resp.ok) {
      const item: GuideItem = await resp.json();
      return {
        title: item.meta_title || item.title,
        description: item.meta_description || item.short_description,
        alternates: { canonical: item.canonical_url || undefined },
        openGraph: {
          title: item.meta_title || item.title,
          description: item.meta_description || item.short_description,
          type: 'article',
          images: item.og_image_url || item.featured_image_url || item.featured_image || undefined,
        },
        twitter: {
          card: 'summary_large_image',
          title: item.meta_title || item.title,
          description: item.meta_description || item.short_description,
          images: item.og_image_url || item.featured_image_url || item.featured_image || undefined,
        },
      };
    }
  } catch {}
  return { title: 'Guide' };
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
