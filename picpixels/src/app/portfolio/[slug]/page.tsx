import { notFound } from 'next/navigation';
import Header from '../../../layouts/Header';
import Footer from '../../../layouts/Footer';
import type { PortfolioItem } from '../../../services/public-api';
import PortfolioDetailClient from './PortfolioDetailClient';

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
