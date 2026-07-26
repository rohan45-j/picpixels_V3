import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { CaseStudyItem } from '@/services/public-api';
import CaseStudiesDetailClient from './CaseStudiesDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';

async function fetchCaseStudy(slug: string): Promise<CaseStudyItem | null> {
  try {
    const resp = await fetch(`${API_BASE}/api/v1/case-studies/api/items/${slug}/`);
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const resp = await fetch(`${API_BASE}/api/v1/case-studies/api/items/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.results || data).map((item: { slug: string }) => ({ slug: item.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await fetchCaseStudy(slug);
  if (!item) return { title: 'Case Study Not Found' };

  const title = item.meta_title || `${item.title} | Case Study | PicPixels`;
  const description = item.meta_description || item.excerpt || item.short_description || 'Read our detailed case study.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: item.publish_date || undefined,
      images: item.og_image || item.featured_image_url || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: item.og_image || item.featured_image_url || undefined,
    },
    alternates: {
      canonical: item.canonical_url || undefined,
    },
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await fetchCaseStudy(slug);
  if (!item) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: item.title,
    description: item.excerpt || item.short_description,
    image: item.featured_image_url || undefined,
    datePublished: item.publish_date || undefined,
    author: {
      '@type': 'Organization',
      name: 'PicPixels',
    },
    publisher: {
      '@type': 'Organization',
      name: 'PicPixels',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://picpixels.com'}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://picpixels.com'}/case-studies/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <CaseStudiesDetailClient item={item} />
      <Footer />
    </>
  );
}
