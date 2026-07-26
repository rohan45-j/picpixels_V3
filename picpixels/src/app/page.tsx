import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/features/home/components/Hero';
import HomeClient from './HomeClient';
import type {
  Service, Testimonial, Technology, PortfolioItem, PortfolioCategory, BlogPost, CaseStudyItem,
  WhyChooseSection, WhyChooseFeatureSection, HeroSection, BrandLogo, PricingConfigSectionData, SiteSetting,
} from '@/services/public-api';
import { fetchWhyChooseUs, fetchLatestBlogPosts, fetchHomepageCaseStudiesSection, fetchWhyChooseFeatures, fetchHeroData, fetchBrandLogos, fetchPricingConfig, fetchSiteSettings } from '@/services/public-api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';

export const revalidate = 60;

import { fetchJSON } from '@/lib/fetch';

async function getHomepageData() {
  const [servicesRes, testimonialsRes, technologiesRes, portfolioRes, categoriesRes, whyChooseUsRes, latestBlogsRes, caseStudiesRes, whyChooseFeaturesRes, heroRes, brandsRes, pricingRes, settingsRes] = await Promise.all([
    fetchJSON<Service[]>(`${BASE_URL}/api/v1/cms/services/homepage/`),
    fetchJSON<{ results: Testimonial[] }>(`${BASE_URL}/api/v1/cms/testimonials/`),
    fetchJSON<{ results: Technology[] }>(`${BASE_URL}/api/v1/cms/technologies/`),
    fetchJSON<PortfolioItem[]>(`${BASE_URL}/api/v1/portfolio/api/items/homepage/`),
    fetchJSON<PortfolioCategory[]>(`${BASE_URL}/api/v1/portfolio/api/categories/`),
    fetchWhyChooseUs(),
    fetchLatestBlogPosts(),
    fetchHomepageCaseStudiesSection(),
    fetchWhyChooseFeatures(),
    fetchHeroData(),
    fetchBrandLogos(),
    fetchPricingConfig(),
    fetchSiteSettings(),
  ]);
  return {
    services: servicesRes ?? [],
    testimonials: testimonialsRes?.results ?? [],
    technologies: technologiesRes?.results ?? [],
    portfolios: portfolioRes ?? [],
    portfolioCategories: categoriesRes ?? [],
    whyChooseUs: whyChooseUsRes,
    latestBlogs: latestBlogsRes ?? [],
    caseStudies: caseStudiesRes ?? [],
    whyChooseFeatures: whyChooseFeaturesRes,
    heroData: heroRes,
    brandLogos: brandsRes,
    pricingConfig: pricingRes,
    siteSettings: settingsRes,
  };
}

export default async function Home() {
  const { services, testimonials, technologies, portfolios, portfolioCategories, whyChooseUs, latestBlogs, caseStudies, whyChooseFeatures, heroData, brandLogos, pricingConfig, siteSettings } = await getHomepageData();

  return (
    <>
      <Header />
      <main id="main-content">
      <Hero hero={heroData} />
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
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
