import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { PortfolioItem } from '@/services/public-api';
import PortfolioDetailClient from './PortfolioDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchJson<PortfolioItem>(`${API_BASE}/api/v1/portfolio/api/items/${slug}/`);
  if (!project) return { title: 'Project Not Found' };
  return {
    title: project.meta_title || project.title,
    description: project.meta_description || project.short_description,
    openGraph: {
      title: project.meta_title || `${project.title} | Portfolio | PicPixels`,
      description: project.meta_description || project.short_description || 'View our portfolio project.',
      type: 'article',
      images: project.featured_image || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.meta_title || project.title,
      description: project.meta_description || project.short_description,
      images: project.featured_image || undefined,
    },
  };
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await fetchJson<PortfolioItem>(`${API_BASE}/api/v1/portfolio/api/items/${slug}/`);

  if (!project) notFound();

  return (
    <>
      <Header />
      <PortfolioDetailClient project={project} />
      <Footer />
    </>
  );
}
