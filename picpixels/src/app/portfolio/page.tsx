import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { PortfolioItem, PortfolioCategory, HomepageCTASection as HomepageCTAType, FAQ } from '@/services/public-api';
import PortfolioListClient from './PortfolioListClient';
import PortfolioFAQSection from '@/components/ui/PortfolioFAQSection';
import { buildPageMetadata, buildCollectionSchema, buildBreadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: 'Portfolio | Professional Photo Editing Case Studies & Examples',
  description: 'Explore our comprehensive portfolio of 30+ photo editing projects across fashion, jewelry, footwear, beauty, furniture, and industrial products. See pixel-perfect before & after examples.',
  path: '/portfolio',
  keywords: ['photo editing portfolio', 'clipping path examples', 'jewelry retouching before after', 'ghost mannequin samples', 'ecommerce photo editing'],
});

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const resp = await fetch(url, { next: { revalidate: 60 } });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

export default async function PortfolioPage() {
  const currentCategory = '';
  const currentSearch = '';
  const currentPage = '1';

  const params = new URLSearchParams();
  params.set('page_size', '36');

  const [portfoliosRes, categories, faqsRes, ctaRes] = await Promise.all([
    fetchJson<{ results: PortfolioItem[]; count?: number }>(`${API_BASE}/api/v1/portfolio/api/items/?${params.toString()}`),
    fetchJson<PortfolioCategory[]>(`${API_BASE}/api/v1/portfolio/api/categories/`),
    fetchJson<{ results: FAQ[] }>(`${API_BASE}/api/v1/cms/faqs/?is_portfolio_faq=true`),
    fetchJson<{ results: HomepageCTAType[] }>(`${API_BASE}/api/v1/cms/homepage-cta/`),
  ]);

  const initialPortfolios = portfoliosRes?.results ?? [];
  const initialTotalCount = portfoliosRes?.count ?? initialPortfolios.length;
  const faqs = faqsRes?.results ?? [];
  const homepageCTA = ctaRes?.results?.[0] ?? null;

  const collectionSchema = buildCollectionSchema({
    name: 'PicPicxels Portfolio Showcase',
    description: 'Extensive gallery of professional photo editing, clipping path, retouching, and color correction projects.',
    path: '/portfolio',
    items: initialPortfolios.map((item) => ({
      name: item.title,
      url: `/portfolio/${item.slug}`,
      description: item.short_description,
      image: item.featured_image || item.after_image,
    })),
  });

  const breadcrumbsSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Portfolio', path: '/portfolio' },
  ]);

  return (
    <>
      <JsonLd data={[collectionSchema, breadcrumbsSchema]} />
      <Header />
      <main id="main-content">
        <PortfolioListClient
          initialPortfolios={initialPortfolios}
          categories={categories ?? []}
          initialCategory={currentCategory}
          initialTotalCount={initialTotalCount}
          initialSearch={currentSearch}
        />
        <PortfolioFAQSection faqs={faqs} />
      </main>
      <Footer homepageCTA={homepageCTA} />
    </>
  );
}



