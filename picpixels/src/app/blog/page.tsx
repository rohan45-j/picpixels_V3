import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogClient from './BlogClient';
import type { BlogPost, BlogCategory } from '@/services/public-api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Expert insights, industry trends, and actionable strategies for professional photo editing and e-commerce visual content.',
  openGraph: {
    title: 'PicPicxels Blog | Photo Editing Insights & Tips',
    description: 'Expert insights and strategies for professional photo editing and e-commerce visual content.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PicPicxels Blog | Photo Editing Insights & Tips',
    description: 'Expert insights and strategies for professional photo editing and e-commerce visual content.',
  },
};

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

  return (
    <>
      <Header />
      <main id="main-content">
        <BlogClient posts={posts} categories={categories} featured={featured} trending={trending} />
      </main>
      <Footer />
    </>
  );
}
