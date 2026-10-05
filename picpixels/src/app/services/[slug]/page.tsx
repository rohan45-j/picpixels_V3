import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServiceDetailClient from './ServiceDetailClient';
import { fetchBrandLogos, fetchSiteSettings, fetchFooterServices } from '@/services/public-api';
import type { Service, Technology, Testimonial, BrandLogo, SiteSetting } from '@/services/public-api';

import { cache } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';
export const revalidate = 300;
const isDev = process.env.NODE_ENV === 'development';

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const resp = await fetch(url, { next: { revalidate: 60 } });
    if (resp.ok) return await resp.json();
  } catch (e) {
    console.error(`Fetch failed for ${url}:`, e);
  }
  return null;
}

const fetchService = cache(async (slug: string): Promise<Service | null> => {
  return fetchJson<Service>(`${API_BASE}/api/v1/cms/services/${slug}/`);
});

const fetchCoreServices = cache(async (): Promise<Service[]> => {
  const data = await fetchJson<{ results: Service[] }>(`${API_BASE}/api/v1/cms/services/`);
  return data?.results || [];
});

const fetchTechnologies = cache(async (): Promise<Technology[]> => {
  const data = await fetchJson<{ results: Technology[] }>(`${API_BASE}/api/v1/cms/technologies/`);
  return data?.results || [];
});

const fetchTestimonials = cache(async (): Promise<Testimonial[]> => {
  const data = await fetchJson<{ results: Testimonial[] }>(`${API_BASE}/api/v1/cms/testimonials/`);
  return data?.results || [];
});

export async function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') {
    return [];
  }
  const services = await fetchCoreServices();
  return services.filter((s) => s.slug).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await fetchService(slug);
  if (!service) return { title: 'Service Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.picpicxels.com';
  const canonical = service.canonical_url || `${siteUrl}/services/${slug}`;

  const title = service.seo_title || `${service.title} | Photo Editing Service | PicPixels`;
  const description = service.seo_description || service.short_description || `Professional ${service.title.toLowerCase()} service by PicPixels.`;

  const keywords = service.meta_keywords
    ? service.meta_keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : [service.title, 'photo editing service', 'professional photo retouching'];
  const shareImage = service.og_image_url || service.og_image || service.image || undefined;

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      images: shareImage ? [{ url: shareImage, alt: service.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: shareImage ? [shareImage] : undefined,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [service, relatedServices, technologies, testimonials, brandLogos, siteSettings, footerServicesData] = await Promise.all([
    fetchService(slug),
    fetchCoreServices(),
    fetchTechnologies(),
    fetchTestimonials(),
    fetchBrandLogos(),
    fetchSiteSettings(),
    fetchFooterServices(),
  ]);

  if (!service) notFound();

  const allFooterServices = footerServicesData && footerServicesData.length > 0
    ? (footerServicesData.some((s) => s.slug === service.slug) ? footerServicesData : [service, ...footerServicesData])
    : [service, ...(relatedServices || [])];

  const related = relatedServices
    .filter((s) => s.slug !== slug && s.show_in_related !== false)
    .slice(0, 4);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.picpicxels.com';
  const canonical = service.canonical_url || `${siteUrl}/services/${slug}`;

  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${siteUrl}/services` },
      { '@type': 'ListItem', position: 3, name: service.title, item: canonical },
    ],
  };

  const schemaType = service.schema_type && service.schema_type !== 'custom' ? service.schema_type : 'Service';
  const defaultServiceJsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': `${canonical}#service`,
    url: canonical,
    name: service.title,
    description: (service.short_description || service.description || '').replace(/<[^>]*>/g, '').slice(0, 300),
    provider: {
      '@type': 'Organization',
      name: 'PicPicxels',
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
    },
    offers: service.price ? {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: 'USD',
    } : undefined,
    image: service.og_image_url || service.og_image || service.image || undefined,
  };

  let customJsonLdString: string | null = null;
  if (service.custom_schema && service.custom_schema.trim()) {
    try {
      const parsed = JSON.parse(service.custom_schema.trim());
      customJsonLdString = JSON.stringify(parsed);
    } catch {
      customJsonLdString = service.custom_schema.trim();
    }
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      {customJsonLdString ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: customJsonLdString }} />
      ) : (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(defaultServiceJsonLd) }} />
      )}
      <Header />
      <ServiceDetailClient
        service={service}
        related={related}
        technologies={technologies}
        testimonials={testimonials}
        brandLogos={brandLogos}
        location=""
      />
      <Footer siteSettings={siteSettings} footerServices={allFooterServices} />
    </>
  );
}

