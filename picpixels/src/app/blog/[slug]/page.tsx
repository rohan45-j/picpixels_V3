import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogDetailClient from './BlogDetailClient';
import type { BlogPost } from '@/services/public-api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/cms/blog/posts/${slug}/`, { next: { revalidate: 300 } });
    if (resp.ok) return await resp.json();
  } catch {}
  return null;
}

async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/cms/blog/posts/`, { next: { revalidate: 300 } });
    if (resp.ok) {
      const data = await resp.json();
      return data.results || data || [];
    }
  } catch {}
  return [];
}

export async function generateStaticParams() {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/cms/blog/posts/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    const posts = data.results || data || [];
    return posts.filter((p: any) => p.slug).map((p: any) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return { title: 'Post Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.picpicxels.com';
  const canonical = post.canonical_url || `${siteUrl}/blog/${slug}`;

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.short_description || post.excerpt || '',
    alternates: { canonical },
    openGraph: {
      title: post.og_title || post.meta_title || post.title,
      description: post.og_description || post.meta_description || post.short_description || '',
      type: 'article',
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
      images: post.og_image || post.featured_image || post.hero_image || undefined,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.twitter_title || post.og_title || post.meta_title || post.title,
      description: post.twitter_description || post.og_description || post.meta_description || post.short_description || '',
      images: post.twitter_image || post.og_image || post.featured_image || undefined,
    },
    keywords: [...(post.tag_names || []), post.focus_keyword].filter(Boolean).join(', ') || undefined,
    authors: post.author_profile_data?.name ? [{ name: post.author_profile_data.name }] : undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([fetchBlogPost(slug), fetchBlogPosts()]);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.picpicxels.com';
  const url = post.canonical_url || `${siteUrl}/blog/${slug}`;

  const wordCount = (() => {
    let count = (post.content || '').split(/\s+/).filter(Boolean).length;
    for (const b of (post.content_blocks || []) as any[]) {
      if (b.content) count += b.content.split(/\s+/).filter(Boolean).length;
      if (b.text) count += b.text.split(/\s+/).filter(Boolean).length;
      if (b.title) count += b.title.split(/\s+/).filter(Boolean).length;
    }
    return count;
  })();

  const allKeywords = [...(post.tag_names || []), ...(post.secondary_keywords || []), post.focus_keyword].filter(Boolean).join(', ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: post.meta_title || post.title,
        description: post.meta_description || post.short_description || post.excerpt,
        inLanguage: 'en',
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        author: post.author_profile_data?.name ? { '@type': 'Person', name: post.author_profile_data.name } : undefined,
        publisher: { '@type': 'Organization', name: 'PicPicxels', url: siteUrl },
        datePublished: post.published_at || undefined,
        dateModified: post.updated_at || post.published_at || undefined,
        image: post.featured_image || post.og_image || undefined,
        articleSection: post.category_name || undefined,
        keywords: allKeywords || undefined,
        wordCount: wordCount,
        isAccessibleForFree: true,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title },
        ],
      },
    ].filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <BlogDetailClient post={post} allPosts={allPosts} />
      <Footer />
    </>
  );
}
