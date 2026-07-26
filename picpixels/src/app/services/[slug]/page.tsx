import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServiceDetailClient from './ServiceDetailClient';
import { fetchBrandLogos, fetchSiteSettings } from '@/services/public-api';
import type { Service, Technology, Testimonial, BrandLogo, SiteSetting } from '@/services/public-api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const resp = await fetch(url, { next: { revalidate: 300 } });
    if (resp.ok) return await resp.json();
  } catch {}
  return null;
}

async function fetchService(slug: string): Promise<Service | null> {
  return fetchJson<Service>(`${API_BASE}/api/v1/cms/services/${slug}/`);
}

async function fetchCoreServices(): Promise<Service[]> {
  const data = await fetchJson<{ results: Service[] }>(`${API_BASE}/api/v1/cms/services/`);
  return data?.results || [];
}

async function fetchTechnologies(): Promise<Technology[]> {
  const data = await fetchJson<{ results: Technology[] }>(`${API_BASE}/api/v1/cms/technologies/`);
  return data?.results || [];
}

async function fetchTestimonials(): Promise<Testimonial[]> {
  const data = await fetchJson<{ results: Testimonial[] }>(`${API_BASE}/api/v1/cms/testimonials/`);
  return data?.results || [];
}

export async function generateStaticParams() {
  const services = await fetchCoreServices();
  return services.filter((s) => s.slug).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await fetchService(slug);
  if (!service) return { title: 'Service Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.picpicxels.com';
  const title = service.seo_title || `${service.title} | Photo Editing Service | PicPixels`;
  const description = service.seo_description || service.short_description || `Professional ${service.title.toLowerCase()} service by PicPixels.`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/services/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      images: service.image || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: service.image || undefined,
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [service, relatedServices, technologies, testimonials, brandLogos, siteSettings] = await Promise.all([
    fetchService(slug),
    fetchCoreServices(),
    fetchTechnologies(),
    fetchTestimonials(),
    fetchBrandLogos(),
    fetchSiteSettings(),
  ]);

  if (!service) notFound();

  const related = relatedServices
    .filter((s) => s.slug !== slug && s.show_in_related !== false)
    .slice(0, 4);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.picpicxels.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.short_description || service.description,
    provider: { '@type': 'Organization', name: 'PicPixels', url: siteUrl },
    offers: service.price ? {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: 'USD',
    } : undefined,
    image: service.image || undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <ServiceDetailClient service={service} related={related} technologies={technologies} testimonials={testimonials} brandLogos={brandLogos} />
      <Footer siteSettings={siteSettings} />
    </>
  );
}
