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

  const [blogPosts, caseStudies, portfolioItems, guides, services, cmsPages] = await Promise.all([
    fetchAllPages('/api/v1/cms/blog/posts/'),
    fetchAllPages('/api/v1/case-studies/api/items/'),
    fetchAllPages('/api/v1/portfolio/api/items/'),
    fetchAllPages('/api/v1/guides/api/items/'),
    fetchAllPages('/api/v1/cms/services/'),
    fetchAllPages('/api/v1/cms/pages/'),
  ]);

  const blogEntries: MetadataRoute.Sitemap = blogPosts
    .filter((p: any) => p.is_published !== false && p.slug)
    .map((post: any) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  const serviceEntries: MetadataRoute.Sitemap = services
    .filter((s: any) => s.is_active !== false && s.slug)
    .map((s: any) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      lastModified: new Date(s.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));

  // Filter out any pages that match existing static page routes to avoid duplicate URLs
  const staticPaths = new Set(staticPages.map(p => p.url.replace(SITE_URL, '').replace(/^\//, '')));
  const pageEntries: MetadataRoute.Sitemap = cmsPages
    .filter((p: any) => p.is_active !== false && p.slug && !staticPaths.has(p.slug))
    .map((p: any) => ({
      url: `${SITE_URL}/${p.slug}`,
      lastModified: new Date(p.updated_at || p.created_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  const caseStudyEntries: MetadataRoute.Sitemap = caseStudies
    .filter((cs: any) => cs.is_published !== false && cs.slug)
    .map((cs: any) => ({
      url: `${SITE_URL}/case-studies/${cs.slug}`,
      lastModified: new Date(cs.updated_at || cs.publish_date || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  const portfolioEntries: MetadataRoute.Sitemap = portfolioItems
    .filter((p: any) => p.is_published !== false && p.slug)
    .map((item: any) => ({
      url: `${SITE_URL}/portfolio/${item.slug}`,
      lastModified: new Date(item.updated_at || item.created_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  const guideEntries: MetadataRoute.Sitemap = guides
    .filter((g: any) => g.is_published !== false && g.slug)
    .map((guide: any) => ({
      url: `${SITE_URL}/guid/${guide.slug}`,
      lastModified: new Date(guide.updated_at || guide.publish_date || guide.created_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  return [
    ...staticPages,
    ...serviceEntries,
    ...blogEntries,
    ...pageEntries,
    ...caseStudyEntries,
    ...portfolioEntries,
    ...guideEntries,
  ];
}
