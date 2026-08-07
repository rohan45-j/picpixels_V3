import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/features/home/components/Hero';
import HomeClient from './HomeClient';
import { Suspense } from 'react';
import type {
  Service, Testimonial, Technology, PortfolioItem, PortfolioCategory, BlogPost, CaseStudyItem,
  WhyChooseSection, WhyChooseFeatureSection, HeroSection, BrandLogo, PricingConfigSectionData, SiteSetting,
} from '@/services/public-api';
import { fetchHomepageData, fetchSiteSettings } from '@/services/public-api';
import { fetchCriticalJSON, fetchBackgroundJSON } from '@/lib/fetch';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';

export const revalidate = 60;

// Skeleton loader components for better perceived performance
function HeroSkeleton() {
  return (
    <div className="animate-pulse min-h-[60vh] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
  );
}

function HomeClientSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function getHomepageData() {
  // Use consolidated homepage API if available, otherwise fall back to parallel fetches with optimized caching
  let homepageData = null;
  try {
    homepageData = await fetchHomepageData();
  } catch (e) {
    console.warn('Consolidated homepage API failed, falling back to parallel fetches:', e);
  }
  
  if (homepageData) {
    // Consolidated endpoint returned data - use it
    const siteSettings = await fetchSiteSettings();
    return { 
      ...homepageData, 
      siteSettings,
      // Ensure arrays are never undefined
      services: homepageData.services ?? [],
      testimonials: homepageData.testimonials ?? [],
      technologies: homepageData.technologies ?? [],
      portfolios: homepageData.portfolios ?? [],
      portfolioCategories: homepageData.portfolioCategories ?? [],
      latestBlogs: homepageData.latestBlogs ?? [],
      caseStudies: homepageData.caseStudies ?? [],
      brandLogos: homepageData.brandLogos ?? [],
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
    settingsRes,
  ] = await Promise.allSettled([
    fetchBackgroundJSON<Service[]>(`${BASE_URL}/api/v1/cms/services/homepage/`, fetchOpts),
    fetchBackgroundJSON<{ results: Testimonial[] }>(`${BASE_URL}/api/v1/cms/testimonials/`, fetchOpts),
    fetchBackgroundJSON<{ results: Technology[] }>(`${BASE_URL}/api/v1/cms/technologies/`, fetchOpts),
    fetchBackgroundJSON<PortfolioItem[]>(`${BASE_URL}/api/v1/portfolio/api/items/homepage/`, fetchOpts),
    fetchBackgroundJSON<PortfolioCategory[]>(`${BASE_URL}/api/v1/portfolio/api/categories/`, fetchOpts),
    fetchBackgroundJSON<{ results: WhyChooseSection[] }>(`${BASE_URL}/api/v1/cms/why-choose-us/`, fetchOpts),
    fetchBackgroundJSON<BlogPost[]>(`${BASE_URL}/api/v1/cms/blog/posts/latest/`, fetchOpts),
    fetchBackgroundJSON<CaseStudyItem[]>(`${BASE_URL}/api/v1/case-studies/api/items/homepage-section/`, fetchOpts),
    fetchBackgroundJSON<{ results: WhyChooseFeatureSection[] }>(`${BASE_URL}/api/v1/cms/why-choose-features/`, fetchOpts),
    fetchBackgroundJSON<{ results: HeroSection[] }>(`${BASE_URL}/api/v1/cms/hero/`, fetchOpts),
    fetchBackgroundJSON<{ results: BrandLogo[] }>(`${BASE_URL}/api/v1/cms/brands/`, fetchOpts),
    fetchBackgroundJSON<{ results: PricingConfigSectionData[] }>(`${BASE_URL}/api/v1/cms/pricing-config/`, fetchOpts),
    fetchBackgroundJSON<{ results: SiteSetting[] }>(`${BASE_URL}/api/v1/settings/site/?_=${Date.now()}`, fetchOpts),
  ]);

  // Extract values from Promise.allSettled results
  const extractValue = <T>(result: PromiseSettledResult<T | null>): T | null => {
    if (result.status === 'fulfilled') return result.value;
    console.error('API call failed:', result.reason);
    return null;
  };

  const extractArray = <T>(result: PromiseSettledResult<{ results: T[] } | null>): T[] => {
    if (result.status === 'fulfilled' && result.value?.results) return result.value.results;
    console.error('API call failed:', result.reason);
    return [];
  };

  // Some endpoints (hero, why-choose-us, pricing-config, settings) return paginated {results:[...]}
  // even though they are singletons. Extract the first item.
  const extractFirst = <T>(result: PromiseSettledResult<{ results: T[] } | null>): T | null => {
    if (result.status === 'fulfilled' && result.value?.results?.length) return result.value.results[0];
    console.error('API call failed:', result.reason);
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
    siteSettings: extractFirst(settingsRes),
  };
}

async function HomeContent() {
  const { services, testimonials, technologies, portfolios, portfolioCategories, whyChooseUs, latestBlogs, caseStudies, whyChooseFeatures, heroData, brandLogos, pricingConfig, siteSettings } = await getHomepageData();

  return (
    <>
      <Header />
      <main id="main-content">
        <Suspense fallback={<HeroSkeleton />}>
          <Hero hero={heroData} />
        </Suspense>
        <Suspense fallback={<HomeClientSkeleton />}>
          <HomeClient
            services={services}
            testimonials={testimonials}
            technologies={technologies}
            portfolios={portfolios}
            portfolioCategories={portfolioCategories}
            whyChooseUs={whyChooseUs}
            latestBlogs={latestBlogs}
            caseStudies={caseStudies}
            whyChooseFeatures={whyChooseFeatures}
            heroData={heroData}
            brandLogos={brandLogos}
            pricingConfig={pricingConfig}
          />
        </Suspense>
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}

export default async function Home() {
  return <HomeContent />;
}
