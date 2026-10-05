import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { cachedJsonFetch, type PortfolioItem } from '@/services/public-api';
import PortfolioDetailClient from './PortfolioDetailClient';
import { SITE_URL, buildBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';

export const revalidate = 60;
const isDev = process.env.NODE_ENV === 'development';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await cachedJsonFetch<PortfolioItem>(`${API_BASE}/api/v1/portfolio/api/items/${slug}/`, 300);
  if (!project) return { title: 'Project Not Found' };

  const canonical = project.canonical_url || `${SITE_URL}/portfolio/${slug}`;
  const title = project.meta_title || `${project.title} | Photo Editing Portfolio | PicPicxels`;
  const description = (project.meta_description || project.short_description || project.full_description || 'Explore our professional photo editing portfolio project.')
    .replace(/<[^>]*>/g, '')
    .slice(0, 160);

  const keywords = project.meta_keywords
    ? project.meta_keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : [project.category_name, 'photo editing portfolio', 'clipping path sample', 'retouching example'].filter(Boolean);

  const shareImage = project.og_image_url || project.og_image || project.featured_image_url || project.featured_image;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      images: shareImage ? [{ url: shareImage, alt: project.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: shareImage ? [shareImage] : undefined,
    },
  };
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await cachedJsonFetch<PortfolioItem>(`${API_BASE}/api/v1/portfolio/api/items/${slug}/`, 300);

  if (!project) notFound();

  const canonical = project.canonical_url || `${SITE_URL}/portfolio/${slug}`;
  const cleanDescription = (project.short_description || project.full_description || project.meta_description || '')
    .replace(/<[^>]*>/g, '');

  const portfolioSchema = {
    '@context': 'https://schema.org',
    '@type': project.schema_type || 'CreativeWork',
    '@id': `${canonical}#work`,
    url: canonical,
    name: project.title,
    headline: project.title,
    description: cleanDescription,
    image: project.featured_image_url || project.featured_image || project.after_image_url || undefined,
    datePublished: project.created_at,
    dateModified: project.updated_at,
    creator: {
      '@type': 'Organization',
      name: 'PicPicxels',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PicPicxels',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
  };

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Portfolio', path: '/portfolio' },
  ];

  if (project.category_name && project.category_slug) {
    breadcrumbs.push({
      name: project.category_name,
      path: `/portfolio?category=${project.category_slug}`,
    });
  }

  breadcrumbs.push({ name: project.title, path: `/portfolio/${slug}` });

  const breadcrumbsSchema = buildBreadcrumbSchema(breadcrumbs);

  return (
    <>
      <JsonLd data={[portfolioSchema, breadcrumbsSchema]} />
      <Header />
      <PortfolioDetailClient project={project} />
      <Footer />
    </>
  );
}


