import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.picpicxels.com';

async function fetchAllPages(endpoint: string): Promise<any[]> {
  try {
    const resp = await fetch(`${BASE_URL}${endpoint}`, {
      next: { revalidate: 3600 },
    });
    if (resp.ok) {
      const data = await resp.json();
      return data.results || data || [];
    }
  } catch {}
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/case-studies`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/portfolio`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/guid`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/free-trial`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/book-demo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/careers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/press`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/support`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  const [blogPosts, caseStudies, portfolioItems, guides] = await Promise.all([
    fetchAllPages('/api/v1/cms/blog/posts/'),
    fetchAllPages('/api/v1/case-studies/api/items/'),
    fetchAllPages('/api/v1/portfolio/api/items/'),
    fetchAllPages('/api/v1/guides/api/items/'),
  ]);

  const blogEntries: MetadataRoute.Sitemap = blogPosts
    .filter((p: any) => p.is_published !== false)
    .map((post: any) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  const caseStudyEntries: MetadataRoute.Sitemap = caseStudies
    .filter((cs: any) => cs.is_published !== false)
    .map((cs: any) => ({
      url: `${SITE_URL}/case-studies/${cs.slug}`,
      lastModified: new Date(cs.updated_at || cs.publish_date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  const portfolioEntries: MetadataRoute.Sitemap = portfolioItems
    .filter((p: any) => p.is_published !== false)
    .map((item: any) => ({
      url: `${SITE_URL}/portfolio/${item.slug}`,
      lastModified: new Date(item.updated_at || item.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  const guideEntries: MetadataRoute.Sitemap = guides
    .filter((g: any) => g.is_published !== false)
    .map((guide: any) => ({
      url: `${SITE_URL}/guid/${guide.slug}`,
      lastModified: new Date(guide.updated_at || guide.publish_date || guide.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  return [
    ...staticPages,
    ...blogEntries,
    ...caseStudyEntries,
    ...portfolioEntries,
    ...guideEntries,
  ];
}
