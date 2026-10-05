import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cache } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { GuideItem } from '@/services/public-api';
import GuideDetailClient from './GuideDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

const fetchGuide = cache(async (slug: string): Promise<GuideItem | null> => {
  try {
    const resp = await fetch(`${API_BASE}/api/v1/guides/api/items/${slug}/`, { next: { revalidate: 300 } });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
});

export async function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') {
    return [];
  }
  try {
    const resp = await fetch(`${API_BASE}/api/v1/guides/api/items/`, { next: { revalidate: 300 } });
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.results || data).map((item: { slug: string }) => ({ slug: item.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await fetchGuide(slug);
  if (item) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.picpicxels.com';
    const canonical = item.canonical_url || `${siteUrl}/guid/${slug}`;
    const title = item.meta_title || `${item.title} | Guides & Tutorials | PicPicxels`;
    const description = item.meta_description || item.short_description || 'Read our detailed step-by-step editing guide.';

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        type: 'article',
        images: item.og_image_url || item.featured_image_url || item.featured_image || undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: item.og_image_url || item.featured_image_url || item.featured_image || undefined,
      },
    };
  }
  return { title: 'Guide Not Found' };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await fetchGuide(slug);
  if (!item) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.picpicxels.com';
  const pageUrl = `${siteUrl}/guid/${slug}`;

  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${siteUrl}/guid` },
      { '@type': 'ListItem', position: 3, name: item.title, item: pageUrl },
    ],
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: item.title,
    description: item.short_description,
    url: pageUrl,
    image: item.featured_image_url || item.featured_image || undefined,
    author: {
      '@type': 'Organization',
      name: 'PicPicxels',
    },
    publisher: {
      '@type': 'Organization',
      name: 'PicPicxels',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Header />
      <GuideDetailClient item={item} />
      <Footer />
    </>
  );
}

