import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.picpicxels.com';
export const SITE_NAME = 'PicPicxels';

export interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  keywords?: string[];
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

/**
 * Builds standard Next.js metadata with canonical URL and OpenGraph/Twitter tags.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  ogImage,
  keywords,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
}: PageMetadataOptions): Metadata {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const canonical = `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const defaultImage = `${SITE_URL}/og-default.jpg`;
  const image = ogImage || defaultImage;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(authors ? { authors } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    ...(keywords && keywords.length > 0 ? { keywords } : {}),
  };
}

/**
 * BreadcrumbList Schema Generator
 */
export function buildBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const cleanPath = item.path.startsWith('/') ? item.path : `/${item.path}`;
      const url = `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: url,
      };
    }),
  };
}

/**
 * WebSite & Organization Schema Generator (Home Page)
 */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: 'Professional photo editing, clipping path, retouching & image manipulation services.',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/portfolio?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.png`,
          caption: SITE_NAME,
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+1-409-419-3704',
            contactType: 'customer support',
            areaServed: 'US',
            availableLanguage: ['English'],
          },
        ],
        sameAs: [
          'https://www.linkedin.com/company/picpixels',
          'https://www.facebook.com/picpixels',
          'https://www.instagram.com/picpixels',
        ],
      },
    ],
  };
}

/**
 * CollectionPage Schema (Services, Portfolio, Case Studies, Guides)
 */
export function buildCollectionSchema({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description: string;
  path: string;
  items?: { name: string; url: string; description?: string; image?: string }[];
}) {
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    url,
    name,
    description,
    mainEntity: items && items.length > 0 ? {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
        description: item.description,
        image: item.image,
      })),
    } : undefined,
  };
}

/**
 * FAQPage Schema
 */
export function buildFaqSchema(faqs: { question: string; answer: string }[], path = '/faq') {
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    url,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer.replace(/<[^>]*>/g, ''),
      },
    })),
  };
}

/**
 * ContactPage Schema
 */
export function buildContactSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE_URL}/contact#contact`,
    url: `${SITE_URL}/contact`,
    name: 'Contact PicPicxels',
    description: 'Get in touch with PicPicxels for custom photo editing quotes, free trial requests, and consultations.',
    mainEntity: {
      '@type': 'LocalBusiness',
      name: SITE_NAME,
      url: SITE_URL,
      telephone: '+1-409-419-3704',
      email: 'info@picpixels.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '3150 Roswell Rd. NW #1004',
        addressLocality: 'Atlanta',
        addressRegion: 'GA',
        postalCode: '30305',
        addressCountry: 'US',
      },
    },
  };
}

/**
 * Blog Index Schema
 */
export function buildBlogIndexSchema(posts: { title: string; slug: string; excerpt?: string; published_at?: string; featured_image?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog#blog`,
    url: `${SITE_URL}/blog`,
    name: 'PicPicxels Blog',
    description: 'Expert insights, tutorials, and strategies for professional photo editing and e-commerce visual content.',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      description: p.excerpt,
      datePublished: p.published_at,
      image: p.featured_image,
    })),
  };
}

/**
 * Pricing Page Schema (AggregateOffer / Service)
 */
export function buildPricingSchema(services: { name: string; starting_price?: number | string; description?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemPage',
    '@id': `${SITE_URL}/pricing#webpage`,
    url: `${SITE_URL}/pricing`,
    name: 'Pricing Plans - PicPicxels',
    description: 'Transparent pricing for professional photo editing services starting from $0.25/image.',
    mainEntity: {
      '@type': 'Service',
      name: 'PicPicxels Photo Editing Services',
      provider: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
      offers: services.map((s) => ({
        '@type': 'Offer',
        name: s.name,
        description: s.description,
        price: typeof s.starting_price === 'number' ? s.starting_price.toFixed(2) : (s.starting_price || '0.25'),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      })),
    },
  };
}

/**
 * Generic WebPage Schema
 */
export function buildWebPageSchema({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

