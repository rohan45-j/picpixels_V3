import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cache } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { CaseStudyItem } from '@/services/public-api';
import CaseStudiesDetailClient from './CaseStudiesDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';

export const revalidate = 300;
const isDev = process.env.NODE_ENV === 'development';

const fetchCaseStudy = cache(async (slug: string): Promise<CaseStudyItem | null> => {
  try {
    const resp = await fetch(`${API_BASE}/api/v1/case-studies/api/items/${slug}/`, { next: { revalidate: 60 } });
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
    const resp = await fetch(`${API_BASE}/api/v1/case-studies/api/items/`, { next: { revalidate: 300 } });
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.picpicxels.com';
  const canonical = item.canonical_url || `${siteUrl}/case-studies/${slug}`;
  const keywords = item.meta_keywords
    ? item.meta_keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : [item.title, 'photo editing case study', 'ecommerce retouching case study'];
  const shareImage = item.og_image || item.featured_image_url || undefined;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      publishedTime: item.publish_date || undefined,
      images: shareImage ? [{ url: shareImage, alt: item.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: shareImage ? [shareImage] : undefined,
    },
    alternates: {
      canonical,
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.picpicxels.com';
  const canonical = item.canonical_url || `${siteUrl}/case-studies/${slug}`;

  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Case Studies', item: `${siteUrl}/case-studies` },
      { '@type': 'ListItem', position: 3, name: item.title, item: canonical },
    ],
  };

  const schemaType = item.schema_type && item.schema_type !== 'custom' ? item.schema_type : 'Article';
  const defaultCaseStudyJsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': `${canonical}#casestudy`,
    url: canonical,
    headline: item.title,
    description: (item.meta_description || item.excerpt || item.short_description || '').replace(/<[^>]*>/g, '').slice(0, 300),
    image: item.featured_image_url || item.og_image || undefined,
    datePublished: item.publish_date || item.created_at || undefined,
    dateModified: item.updated_at || undefined,
    author: {
      '@type': 'Organization',
      name: 'PicPixels',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PicPixels',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
  };

  let customJsonLdString: string | null = null;
  if (item.custom_schema && item.custom_schema.trim()) {
    try {
      const parsed = JSON.parse(item.custom_schema.trim());
      customJsonLdString = JSON.stringify(parsed);
    } catch {
      customJsonLdString = item.custom_schema.trim();
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      {customJsonLdString ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: customJsonLdString }}
        />
      ) : (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(defaultCaseStudyJsonLd) }}
        />
      )}
      <Header />
      <CaseStudiesDetailClient item={item} />
      <Footer />
    </>
  );
}

