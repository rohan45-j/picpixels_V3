import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import BlogClient from './BlogClient';
import type { BlogPost, BlogCategory } from '../../services/public-api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

export const dynamic = 'force-dynamic';

export default async function Blog() {
  let posts: BlogPost[] = [];
  let categories: BlogCategory[] = [];
  let featured: BlogPost[] = [];
  let trending: BlogPost[] = [];

  try {
    const [postsResp, catsResp, featuredResp, trendingResp] = await Promise.all([
      fetch(`${BASE_URL}/api/v1/cms/blog/posts/`, { cache: 'no-store' }),
      fetch(`${BASE_URL}/api/v1/cms/blog/categories/`, { cache: 'no-store' }),
      fetch(`${BASE_URL}/api/v1/cms/blog/posts/?is_featured=true`, { cache: 'no-store' }),
      fetch(`${BASE_URL}/api/v1/cms/blog/posts/?is_trending=true`, { cache: 'no-store' }),
    ]);

    if (postsResp.ok) { const d = await postsResp.json(); posts = d.results || d; }
    if (catsResp.ok) { const d = await catsResp.json(); categories = d.results || d; }
    if (featuredResp.ok) { const d = await featuredResp.json(); featured = d.results || d; }
    if (trendingResp.ok) { const d = await trendingResp.json(); trending = d.results || d; }
  } catch {}

  return (
    <>
      <Header />
      <BlogClient posts={posts} categories={categories} featured={featured} trending={trending} />
      <Footer />
    </>
  );
}
