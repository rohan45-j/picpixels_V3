import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogClient from './BlogClient';
import type { BlogPost, BlogCategory } from '@/services/public-api';

import { buildPageMetadata, buildBlogIndexSchema, buildBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: 'Blog | Professional Photo Editing Guides, Trends & Strategies',
  description: 'Expert insights, step-by-step tutorials, and industry case studies for e-commerce brands, photographers, and studio managers.',
  path: '/blog',
  keywords: ['photo editing blog', 'ecommerce retouching tutorials', 'clipping path guides', 'product photography tips'],
});

export default async function Blog() {
  let posts: BlogPost[] = [];
  let categories: BlogCategory[] = [];
  let featured: BlogPost[] = [];
  let trending: BlogPost[] = [];

  try {
    const [postsResp, catsResp, featuredResp, trendingResp] = await Promise.all([
      fetch(`${BASE_URL}/api/v1/cms/blog/posts/`, { next: { revalidate: 60 } }),
      fetch(`${BASE_URL}/api/v1/cms/blog/categories/`, { next: { revalidate: 60 } }),
      fetch(`${BASE_URL}/api/v1/cms/blog/posts/?is_featured=true`, { next: { revalidate: 60 } }),
      fetch(`${BASE_URL}/api/v1/cms/blog/posts/?is_trending=true`, { next: { revalidate: 60 } }),
    ]);

    if (postsResp.ok) { const d = await postsResp.json(); posts = d.results || d; }
    if (catsResp.ok) { const d = await catsResp.json(); categories = d.results || d; }
    if (featuredResp.ok) { const d = await featuredResp.json(); featured = d.results || d; }
    if (trendingResp.ok) { const d = await trendingResp.json(); trending = d.results || d; }
  } catch {}

  const blogSchema = buildBlogIndexSchema(
    posts.map((p) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.short_description || p.excerpt,
      published_at: p.published_at || undefined,
      featured_image: p.featured_image || undefined,
    }))
  );

  const breadcrumbsSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
  ]);

  return (
    <>
      <JsonLd data={[blogSchema, breadcrumbsSchema]} />
      <Header />
      <main id="main-content">
        <BlogClient posts={posts} categories={categories} featured={featured} trending={trending} />
      </main>
      <Footer />
    </>
  );
}
