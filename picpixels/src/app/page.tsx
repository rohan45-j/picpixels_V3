import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/features/home/components/Hero';
import HomeClient from './HomeClient';
import type {
  Service, Testimonial, Technology, PortfolioItem, PortfolioCategory, BlogPost, CaseStudyItem,
  WhyChooseSection, WhyChooseFeatureSection, HeroSection, BrandLogo, PricingConfigSectionData, SiteSetting,
  HomepageCTASection, FAQ,
} from '@/services/public-api';
import { fetchHomepageData, fetchSiteSettings } from '@/services/public-api';
import { fetchCriticalJSON, fetchBackgroundJSON } from '@/lib/fetch';
import { buildPageMetadata, buildWebSiteSchema } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';

export const revalidate = 60;

export const metadata = buildPageMetadata({
  title: 'PicPicxels | Professional Photo Editing Services | 5M+ Images Edited',
  description: 'Pixel-perfect clipping path, background removal, photo retouching, ghost mannequin & color correction services. 500+ active brands trust PicPicxels with guaranteed 24h turnaround.',
  path: '/',
  keywords: ['photo editing', 'clipping path service', 'background removal', 'ecommerce image retouching', 'ghost mannequin', 'color correction', 'PicPicxels'],
});

async function getHomepageData() {
  const [homepageDataRes, siteSettingsRes] = await Promise.allSettled([
    fetchHomepageData(),
    fetchSiteSettings(),
  ]);

  const homepageData = homepageDataRes.status === 'fulfilled' ? homepageDataRes.value : null;
  const siteSettings = siteSettingsRes.status === 'fulfilled' ? siteSettingsRes.value : null;

  if (homepageData) {
    return {
      ...homepageData,
      siteSettings,
      services: homepageData.services ?? [],
      testimonials: homepageData.testimonials ?? [],
      technologies: homepageData.technologies ?? [],
      portfolios: homepageData.portfolios ?? [],
      portfolioCategories: homepageData.portfolioCategories ?? [],
      latestBlogs: homepageData.latestBlogs ?? [],
      caseStudies: homepageData.caseStudies ?? [],
      brandLogos: homepageData.brandLogos ?? [],
      homepageCTA: (homepageData as any).homepageCTA ?? null,
      faqs: homepageData.faqs ?? [],
    };
  }

  // Fallback: parallel fetches with optimized fetch utilities
  const fetchOpts = { 
    timeout: 8000,
    retries: 2,
    revalidate: 60,
  };

  const [
    servicesRes,
    testimonialsRes,
    technologiesRes,
    portfolioRes,
    categoriesRes,
    whyChooseUsRes,
    latestBlogsRes,
    caseStudiesRes,
    whyChooseFeaturesRes,
    heroRes,
    brandsRes,
    pricingRes,
    homepageCTARes,
    faqsRes,
    settingsRes,
  ] = await Promise.allSettled([
    fetchBackgroundJSON<Service[]>(`${BASE_URL}/api/v1/cms/services/homepage/`, fetchOpts),
    fetchBackgroundJSON<{ results: Testimonial[] }>(`${BASE_URL}/api/v1/cms/testimonials/`, fetchOpts),
    fetchBackgroundJSON<{ results: Technology[] }>(`${BASE_URL}/api/v1/cms/technologies/`, fetchOpts),
    fetchBackgroundJSON<PortfolioItem[]>(`${BASE_URL}/api/v1/portfolio/api/items/homepage/`, fetchOpts),
    fetchBackgroundJSON<PortfolioCategory[]>(`${BASE_URL}/api/v1/portfolio/api/categories/?homepage=true`, fetchOpts),
    fetchBackgroundJSON<{ results: WhyChooseSection[] }>(`${BASE_URL}/api/v1/cms/why-choose-us/`, fetchOpts),
    fetchBackgroundJSON<BlogPost[]>(`${BASE_URL}/api/v1/cms/blog/posts/latest/`, fetchOpts),
    fetchBackgroundJSON<CaseStudyItem[]>(`${BASE_URL}/api/v1/case-studies/api/items/homepage-section/`, fetchOpts),
    fetchBackgroundJSON<{ results: WhyChooseFeatureSection[] }>(`${BASE_URL}/api/v1/cms/why-choose-features/`, fetchOpts),
    fetchBackgroundJSON<{ results: HeroSection[] }>(`${BASE_URL}/api/v1/cms/hero/`, fetchOpts),
    fetchBackgroundJSON<{ results: BrandLogo[] }>(`${BASE_URL}/api/v1/cms/brands/`, fetchOpts),
    fetchBackgroundJSON<{ results: PricingConfigSectionData[] }>(`${BASE_URL}/api/v1/cms/pricing-config/`, fetchOpts),
    fetchBackgroundJSON<{ results: HomepageCTASection[] }>(`${BASE_URL}/api/v1/cms/homepage-cta/`, fetchOpts),
    fetchBackgroundJSON<{ results: FAQ[] }>(`${BASE_URL}/api/v1/cms/faqs/?is_homepage_faq=true`, fetchOpts),
    fetchBackgroundJSON<{ results: SiteSetting[] }>(`${BASE_URL}/api/v1/settings/site/`, fetchOpts),
  ]);

  // Extract values from Promise.allSettled results
  const extractValue = <T,>(result: PromiseSettledResult<T | null>): T | null => {
    if (result.status === 'fulfilled') return result.value;
    console.error('API call failed:', result.reason);
    return null;
  };

  const extractArray = <T,>(result: PromiseSettledResult<{ results: T[] } | null>): T[] => {
    if (result.status === 'fulfilled') return result.value?.results ?? [];
    console.error('API call failed:', (result as PromiseRejectedResult).reason);
    return [];
  };

  // Some endpoints (hero, why-choose-us, pricing-config, settings, homepage-cta) return paginated {results:[...]}
  // even though they are singletons. Extract the first item.
  const extractFirst = <T,>(result: PromiseSettledResult<{ results: T[] } | null>): T | null => {
    if (result.status === 'fulfilled') return result.value?.results?.[0] ?? null;
    console.error('API call failed:', (result as PromiseRejectedResult).reason);
    return null;
  };

  return {
    services: extractValue(servicesRes) ?? [],
    testimonials: extractArray(testimonialsRes),
    technologies: extractArray(technologiesRes),
    portfolios: extractValue(portfolioRes) ?? [],
    portfolioCategories: extractValue(categoriesRes) ?? [],
    whyChooseUs: extractFirst(whyChooseUsRes),
    latestBlogs: extractValue(latestBlogsRes) ?? [],
    caseStudies: extractValue(caseStudiesRes) ?? [],
    whyChooseFeatures: extractFirst(whyChooseFeaturesRes),
    heroData: extractFirst(heroRes),
    brandLogos: extractArray(brandsRes),
    pricingConfig: extractFirst(pricingRes),
    homepageCTA: extractFirst(homepageCTARes),
    faqs: extractArray(faqsRes).filter((f) => f.is_active !== false && f.is_homepage_faq !== false),
    siteSettings: extractFirst(settingsRes),
  };
}

async function HomeContent({ initialPortfolioCategory = '' }: { initialPortfolioCategory?: string } = {}) {
  const { services, testimonials, technologies, portfolios, portfolioCategories, whyChooseUs, latestBlogs, caseStudies, whyChooseFeatures, heroData, brandLogos, pricingConfig, homepageCTA, faqs, siteSettings } = await getHomepageData();
  const homepagePortfolios = (portfolios && portfolios.length > 0) ? portfolios : [];
  const homepageCategories = (portfolioCategories || []).filter((c: any) => c.show_on_homepage !== false);

  return (
    <>
      <JsonLd data={buildWebSiteSchema()} />
      <Header />
      <main id="main-content">
        <Hero hero={heroData} />
        <HomeClient
          services={services}
          testimonials={testimonials}
          technologies={technologies}
          portfolios={homepagePortfolios}
          portfolioCategories={homepageCategories}
          whyChooseUs={whyChooseUs}
          latestBlogs={latestBlogs}
          caseStudies={caseStudies}
          whyChooseFeatures={whyChooseFeatures}
          heroData={heroData}
          brandLogos={brandLogos}
          pricingConfig={pricingConfig}
          homepageCTA={homepageCTA}
          faqs={faqs}
          initialPortfolioCategory={initialPortfolioCategory}
        />
      </main>
      <Footer siteSettings={siteSettings} homepageCTA={homepageCTA} footerServices={services} />
    </>
  );
}

export default async function Home(props: {
  searchParams?: Promise<{ category?: string; portfolio_cat?: string }>;
}) {
  const sp = props.searchParams ? await props.searchParams : undefined;
  const initialCategory = sp?.portfolio_cat || sp?.category || '';
  return <HomeContent initialPortfolioCategory={initialCategory} />;
}
