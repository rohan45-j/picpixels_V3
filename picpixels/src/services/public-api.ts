const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';

export function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Django MEDIA_URL is /media/ — handle both relative paths with and without /media/ prefix
  const normalized = path.startsWith('/media/') ? path : `/${path}`;
  if (normalized.startsWith('/media/')) {
    return `${BASE_URL}${normalized}`;
  }
  return `${BASE_URL}/media${normalized}`;
}

function apiFetch(url: string): Promise<Response> {
  console.log('[API] Fetching:', url);
  return fetch(url, {
    cache: 'force-cache',
  }).then((resp) => {
    console.log('[API] Response status:', resp.status, 'for', url);
    return resp;
  }).catch((err) => {
    console.error(`[API] Network error fetching ${url}:`, err);
    return new Response(null, { status: 503, statusText: 'Service Unavailable' });
  });
}

export interface CMSPage {
  title: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  content: Section[]; // Array of sections defined in the CMS
}

export interface Section {
  type: string; // e.g., 'hero', 'services', 'testimonials', etc.
  data: any;    // Arbitrary JSON payload the component consumes
}

export interface SiteSetting {
  site_name: string;
  tagline?: string;
  logo?: string;
  logo_alt?: string;
  favicon?: string;
  support_email?: string;
  support_phone?: string;
  address?: string;
  social_links?: Record<string, string>;
  copyright_text?: string;
  whatsapp_phone?: string;
  whatsapp_message?: string;
}

export interface SEOSetting {
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  robots_txt?: string;
}

export interface NavigationItem {
  id: number;
  label: string;
  url: string;
  location: 'header' | 'footer' | 'mega_menu';
  parent?: number | null;
  order: number;
  is_active: boolean;
  opens_in_new_tab: boolean;
  icon?: string;
  css_class?: string;
  children?: NavigationItem[];
}

export interface BrandLogo {
  id: number;
  name: string;
  logo: string;
  logo_alt?: string;
  url?: string;
  order: number;
  is_active?: boolean;
}

export interface ServiceHeroImage {
  id?: number;
  image: string;
  alt_text: string;
  order: number;
}

export interface ServiceGalleryImage {
  id?: number;
  gallery_type: 'before_after' | 'portfolio' | 'case_study';
  category: string;
  image: string;
  before_image?: string;
  after_image?: string;
  alt_text: string;
  before_image_alt?: string;
  after_image_alt?: string;
  caption: string;
  is_featured: boolean;
  is_visible: boolean;
  order: number;
}

export interface ServiceContentSection {
  id?: number;
  layout: 'text_left' | 'text_right' | 'full_width' | 'image_top' | 'text_only';
  heading: string;
  content: string;
  image?: string;
  image_alt: string;
  order: number;
}

export interface ServiceEEAT {
  id?: number;
  experience: string;
  expertise: string;
  authoritativeness: string;
  trustworthiness: string;
  is_active?: boolean;
}

export interface ServiceBrandLogo {
  id?: number;
  logo: string;
  logo_alt?: string;
  brand_name: string;
  display_order: number;
}

export interface ServiceWhyNeedFeature {
  id?: number;
  title: string;
  description?: string;
  icon_image?: string;
  display_order: number;
  is_active: boolean;
}

export interface ServiceProcessStep {
  id?: number;
  step_number: number;
  title: string;
  description?: string;
  image?: string;
  image_alt?: string;
  display_order: number;
  is_active: boolean;
}

export interface ServiceWhyChooseCard {
  id?: number;
  icon_image?: string;
  title: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export interface ServiceTool {
  id?: number;
  logo?: string;
  logo_alt?: string;
  name: string;
  short_description?: string;
  display_order: number;
  is_active: boolean;
}

export interface ServicePricingTierCard {
  id?: number;
  name: string;
  description?: string;
  price?: string;
  original_price?: string;
  features?: string[];
  is_popular: boolean;
  badge_text?: string;
  badge_color?: string;
  button_text: string;
  button_link?: string;
  display_order: number;
  is_active: boolean;
}

export interface ServiceClientFeedback {
  id?: number;
  client_name: string;
  company?: string;
  designation?: string;
  photo?: string;
  photo_alt?: string;
  rating: number;
  review?: string;
  display_order: number;
  is_active: boolean;
}

export interface Service {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  features: string[];
  icon?: string;
  image?: string;
  image_alt?: string;
  hero_subtitle?: string;
  hero_background?: string;
  hero_image_alt?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;
  hero_images?: ServiceHeroImage[];
  price: string;
  order: number;
  seo_title?: string;
  seo_description?: string;
  show_in_mega_menu: boolean;
  show_on_homepage: boolean;
  show_in_footer: boolean;
  show_in_related: boolean;
  is_active: boolean;
  is_featured: boolean;
  content_blocks?: ContentBlock[];
  created_at: string;
  updated_at: string;
  gallery_images?: ServiceGalleryImage[];
  content_sections?: ServiceContentSection[];
  faqs?: FAQ[];
  eeat?: ServiceEEAT;
  brand_section_title?: string;
  why_need_section_title?: string;
  why_need_section_description?: string;
  process_section_title?: string;
  why_choose_title?: string;
  tools_section_title?: string;
  pricing_title?: string;
  pricing_badge_text?: string;
  pricing_heading?: string;
  pricing_description?: string;
  pricing_starting_price?: string;
  pricing_unit?: string;
  pricing_notes?: string;
  pricing_features?: string[];
  pricing_cta_text?: string;
  pricing_cta_link?: string;
  pricing_cta2_text?: string;
  pricing_cta2_link?: string;
  brand_logos?: ServiceBrandLogo[];
  why_need_features?: ServiceWhyNeedFeature[];
  process_steps?: ServiceProcessStep[];
  why_choose_cards?: ServiceWhyChooseCard[];
  tools?: ServiceTool[];
  pricing_tier_cards?: ServicePricingTierCard[];
  client_feedbacks?: ServiceClientFeedback[];
}

export interface Testimonial {
  id: number;
  client_name: string;
  client_role?: string;
  company?: string;
  text: string;
  avatar?: string;
  avatar_alt?: string;
  rating: number;
  order: number;
  is_active: boolean;
}

export interface FAQCategory {
  id: number;
  name: string;
  order: number;
  faqs?: FAQ[];
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: number;
  service?: number;
  is_contact_faq?: boolean;
  order: number;
  is_active: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  photo_alt?: string;
  email?: string;
  social_links?: Record<string, string>;
  order: number;
  is_active: boolean;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  order?: number;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

export interface ContentBlock {
  type: 'heading' | 'text' | 'image' | 'image_with_text' | 'gallery' | 'code' | 'callout' | 'faq' | 'list' | 'table' | 'step' | 'divider' | 'stats' | 'quote' | 'cta' | 'full_width_image';
  level?: number;
  content?: string;
  language?: string;
  style?: 'info' | 'warning' | 'success';
  title?: string;
  src?: string;
  alt?: string;
  caption?: string;
  text?: string;
  images?: Array<{ src: string; alt?: string; caption?: string }>;
  question?: string;
  answer?: string;
  ordered?: boolean;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  /** stats block */
  stat_value?: string;
  stat_label?: string;
  stat_description?: string;
  /** quote block */
  quote_author?: string;
  quote_role?: string;
  /** cta block */
  button_text?: string;
  button_link?: string;
  cta_description?: string;
  /** image_with_text layout */
  layout?: 'left' | 'right';
  /** full_width_image block */
  alignment?: 'full' | 'centered' | 'small';
}

export interface BlogContentSection {
  id?: number;
  blog_post?: number;
  template: 'image_left' | 'image_right' | 'full_width' | 'image_top' | 'text_only';
  heading?: string;
  content: string;
  image?: string;
  image_alt?: string;
  order: number;
}

export interface Author {
  id: number;
  name: string;
  slug: string;
  designation?: string;
  bio?: string;
  image?: string;
  image_alt?: string;
  email?: string;
  linkedin_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  is_active: boolean;
  sort_order?: number;
}

export interface BlogDocumentBlock {
  id: number;
  title: string;
  file: string;
  description?: string;
  download_text?: string;
  sort_order?: number;
  is_active: boolean;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  featured_image_alt?: string;
  hero_image?: string;
  hero_image_alt?: string;
  category?: number;
  category_name?: string;
  tags?: number[];
  tag_names?: string[];
  author_profile?: number;
  author_profile_data?: Author | null;
  author_image?: string | null;
  author_image_alt?: string | null;
  is_featured: boolean;
  is_trending?: boolean;
  is_published: boolean;
  status?: string;
  published_at?: string;
  scheduled_at?: string;
  reading_time?: number;
  canonical_url?: string;
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_image_alt?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  twitter_image_alt?: string;
  focus_keyword?: string;
  secondary_keywords?: string[];
  key_takeaways?: string[];
  content_blocks?: ContentBlock[];
  faq_schema?: { question: string; answer: string }[];
  related_services?: number[];
  related_posts?: number[];
  related_post_slugs?: string[];
  content_sections?: BlogContentSection[];
  document_blocks?: BlogDocumentBlock[];
  created_at: string;
  updated_at?: string;
}

export interface HeroSlide {
  id: number;
  image: string;
  alt_text: string;
  order: number;
}

export interface HeroStat {
  id: number;
  value: string;
  label: string;
  order: number;
}

export interface HeroSection {
  id: number;
  is_active: boolean;
  tagline: string;
  title: string;
  description: string;
  background_image: string | null;
  background_image_alt?: string;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
  slides: HeroSlide[];
  stats: HeroStat[];
  created_at: string;
  updated_at: string;
}

export interface PricingBanner {
  show_banner: boolean;
  banner_text: string;
  banner_type: string;
  banner_bg_color: string;
  banner_text_color: string;
  banner_icon: string;
  banner_priority: number;
  banner_expiry: string | null;
}

export interface PricingPlan extends PricingBanner {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  image_alt?: string;
  price_monthly: string;
  price_yearly: string | null;
  description: string;
  features: string[];
  is_popular: boolean;
  button_text: string;
  button_link: string;
  order: number;
  is_active: boolean;
}

export interface PortfolioCategory {
  id: number;
  name: string;
  slug: string;
  portfolio_count?: number;
}

export interface PortfolioService {
  id: number;
  name: string;
  slug: string;
}

export interface PortfolioGalleryItem {
  id: number;
  image: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
}

export interface PortfolioComparisonItem {
  id: number;
  before_image: string;
  before_image_alt?: string;
  before_image_url: string;
  after_image: string;
  after_image_alt?: string;
  after_image_url: string;
  label: string;
  sort_order: number;
}

export interface PortfolioItem {
  id: number;
  title: string;
  slug: string;
  category: number;
  category_name: string;
  category_slug: string;
  service: number | null;
  service_name: string | null;
  service_slug: string | null;
  featured_image: string;
  featured_image_alt?: string;
  featured_image_url: string;
  before_image: string;
  before_image_alt?: string;
  before_image_url: string;
  after_image: string;
  after_image_alt?: string;
  after_image_url: string;
  short_description: string;
  full_description: string;
  client: string;
  completion_date: string | null;
  project_url: string;
  featured: boolean;
  gallery: PortfolioGalleryItem[];
  comparisons: PortfolioComparisonItem[];
  meta_title: string;
  meta_description: string;
  prev_project?: { title: string; slug: string } | null;
  next_project?: { title: string; slug: string } | null;
  created_at: string;
}

export async function fetchPortfolioCategories(): Promise<PortfolioCategory[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/portfolio/api/categories/`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch { return []; }
}

export async function fetchPortfolioServices(): Promise<PortfolioService[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/portfolio/api/services/`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch { return []; }
}

export async function fetchHomepagePortfolios(): Promise<PortfolioItem[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/portfolio/api/items/homepage/`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch { return []; }
}

// ─── Case Studies ──────────────────────────────────────────────

export interface CaseStudyCategory {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  case_study_count?: number;
}

export interface CaseStudyTag {
  id: number;
  name: string;
  slug: string;
}

export interface CaseStudyImage {
  id: number;
  image: string | null;
  image_url: string | null;
  alt_text: string;
  caption: string;
  sort_order: number;
}

export interface CaseStudyTestimonial {
  id: number;
  author_name: string;
  author_role: string;
  company: string;
  photo: string | null;
  photo_url: string | null;
  quote: string;
  rating: number;
}

export interface CaseStudyItem {
  id: number;
  title: string;
  slug: string;
  category: number;
  category_name: string;
  category_slug: string;
  tags: CaseStudyTag[];
  featured_image: string | null;
  featured_image_alt: string;
  featured_image_url: string | null;
  hero_banner: string | null;
  hero_banner_alt: string;
  hero_banner_url: string | null;
  og_image: string | null;
  excerpt: string;
  introduction: string;
  short_description: string;
  client_name: string;
  client_logo: string | null;
  industry: string;
  country: string;
  brand_values: string;
  project_goals: string;
  services_provided?: string;
  technologies_used?: string;
  project_duration?: string;
  completion_date?: string | null;
  reading_time: number;
  gallery_images?: CaseStudyImage[];
  testimonials?: CaseStudyTestimonial[];
  full_content?: string;
  project_overview?: string;
  challenges?: string;
  solution?: string;
  scope_of_work?: string[];
  process_workflow?: string;
  results?: string;
  statistics?: { value: string; label: string; suffix?: string }[];
  publish_date: string | null;
  featured: boolean;
  status: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  prev_case_study?: { title: string; slug: string } | null;
  next_case_study?: { title: string; slug: string } | null;
  related_case_studies?: CaseStudyItem[];
  created_at: string;
  updated_at: string;
}

export async function fetchCaseStudyCategories(): Promise<CaseStudyCategory[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/case-studies/api/categories/`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch { return []; }
}

export async function fetchCaseStudies(params?: {
  category?: string;
  search?: string;
  page?: number;
}): Promise<{ results: CaseStudyItem[]; count: number; next: string | null; previous: string | null }> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', String(params.page));
    const qs = searchParams.toString();
    const url = `${BASE_URL}/api/v1/case-studies/api/items/${qs ? '?' + qs : ''}`;
    const resp = await apiFetch(url);
    if (!resp.ok) return { results: [], count: 0, next: null, previous: null };
    return await resp.json();
  } catch { return { results: [], count: 0, next: null, previous: null }; }
}

export async function fetchCaseStudyBySlug(slug: string): Promise<CaseStudyItem | null> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/case-studies/api/items/${slug}/`);
    if (!resp.ok) return null;
    return await resp.json();
  } catch { return null; }
}

export async function fetchHomepageCaseStudies(): Promise<CaseStudyItem[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/case-studies/api/items/homepage/`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch { return []; }
}

// ─── Guides ───────────────────────────────────────────────────

export interface GuideCategory {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  guide_count?: number;
}

export interface GuideItem {
  id: number;
  title: string;
  slug: string;
  category: number;
  category_name: string;
  category_slug: string;
  featured_image: string | null;
  featured_image_alt: string;
  featured_image_url: string | null;
  featured_image_caption?: string;
  short_description: string;
  full_content?: string;
  reading_time?: number;
  hero_badge_text?: string;
  hero_subtitle?: string;
  author?: string;
  publish_date: string | null;
  featured: boolean;
  sort_order?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_image_url?: string;
  prev_guide?: { title: string; slug: string } | null;
  next_guide?: { title: string; slug: string } | null;
  related_guides?: GuideItem[];
  created_at: string;
  updated_at: string;
}

export async function fetchGuideCategories(): Promise<GuideCategory[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/guides/api/categories/`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch { return []; }
}

export async function fetchGuides(params?: {
  category?: string;
  search?: string;
  page?: number;
}): Promise<{ results: GuideItem[]; count: number; next: string | null; previous: string | null }> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', String(params.page));
    const qs = searchParams.toString();
    const url = `${BASE_URL}/api/v1/guides/api/items/${qs ? '?' + qs : ''}`;
    const resp = await apiFetch(url);
    if (!resp.ok) return { results: [], count: 0, next: null, previous: null };
    return await resp.json();
  } catch { return { results: [], count: 0, next: null, previous: null }; }
}

export async function fetchGuideBySlug(slug: string): Promise<GuideItem | null> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/guides/api/items/${slug}/`);
    if (!resp.ok) return null;
    return await resp.json();
  } catch { return null; }
}

export async function fetchHomepageGuides(): Promise<GuideItem[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/guides/api/items/homepage/`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch { return []; }
}

export interface WhyChooseItem {
  id: number;
  company_name: string;
  description: string;
  speed: boolean;
  flexibility: boolean;
  quality: boolean;
  scalability: boolean;
  cost_effectiveness: boolean;
  display_order: number;
}

export interface WhyChooseSection {
  id: number;
  title: string;
  highlighted_word: string;
  subtitle: string;
  is_active: boolean;
  items: WhyChooseItem[];
}

export interface WhyChooseFeatureItem {
  id: number;
  icon: string | null;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export interface WhyChooseFeatureSection {
  id: number;
  title: string;
  subtitle: string;
  featured_image: string | null;
  featured_image_alt: string;
  is_active: boolean;
  items: WhyChooseFeatureItem[];
}

export async function fetchWhyChooseFeatures(): Promise<WhyChooseFeatureSection | null> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/why-choose-features/`);
    if (!resp.ok) return null;
    const data = await resp.json();
    const results = data.results || data;
    return Array.isArray(results) ? (results[0] || null) : results;
  } catch (e) {
    console.error('Failed to fetch Why Choose Features', e);
    return null;
  }
}

export async function fetchWhyChooseUs(): Promise<WhyChooseSection | null> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/why-choose-us/`);
    if (!resp.ok) return null;
    const data = await resp.json();
    const results = data.results || data;
    return Array.isArray(results) ? (results[0] || null) : results;
  } catch (e) {
    console.error('Failed to fetch Why Choose Us', e);
    return null;
  }
}

export async function fetchLatestBlogPosts(): Promise<BlogPost[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/blog/posts/latest/`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch (e) {
    console.error('Failed to fetch latest blog posts', e);
    return [];
  }
}

export async function fetchHomepageCaseStudiesSection(): Promise<CaseStudyItem[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/case-studies/api/items/homepage-section/`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch (e) {
    console.error('Failed to fetch homepage case studies', e);
    return [];
  }
}

export interface Technology {
  id: number;
  title: string;
  icon?: string;
  icon_alt?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  monthly_fee: string;
  annual_fee: string;
  per_image_base_discount: string;
  turnaround_hours_guaranteed: number;
  features: Record<string, any>;
}

/**
 * Fetch a CMS page by its slug.
 */
export async function fetchCMSPage(slug: string): Promise<CMSPage | null> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/pages/?slug=${slug}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.results?.[0] ?? null;
  } catch (e) {
    console.error('Failed to fetch CMS page', e);
    return null;
  }
}

export async function fetchSiteSettings(): Promise<SiteSetting | null> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/settings/site/`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.results?.[0] ?? null;
  } catch (e) {
    console.error('Failed to fetch Site Settings', e);
    return null;
  }
}

export async function fetchSEOSettings(): Promise<SEOSetting | null> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/settings/seo/`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.results?.[0] ?? null;
  } catch (e) {
    console.error('Failed to fetch SEO Settings', e);
    return null;
  }
}

export async function fetchNavigationItems(location: 'header' | 'footer' | 'mega_menu'): Promise<NavigationItem[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/navigation/?location=${location}`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error(`Failed to fetch ${location} navigation items`, e);
    return [];
  }
}

export async function fetchBrandLogos(): Promise<BrandLogo[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/brands/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error('Failed to fetch Brand Logos', e);
    return [];
  }
}

export async function fetchHeroData(): Promise<HeroSection | null> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/hero/`);
    if (!resp.ok) return null;
    const data = await resp.json();
    const results = data.results || data;
    return Array.isArray(results) ? (results[0] || null) : null;
  } catch (e) {
    console.error('Failed to fetch Hero Section', e);
    return null;
  }
}

export async function fetchCoreServices(): Promise<Service[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/services/?brief=1`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error('Failed to fetch Core Services', e);
    return [];
  }
}

export async function fetchServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/services/?slug=${encodeURIComponent(slug)}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    const results = data.results || data;
    return Array.isArray(results) ? (results[0] || null) : null;
  } catch (e) {
    console.error(`Failed to fetch service by slug: ${slug}`, e);
    return null;
  }
}

export async function fetchMegaMenuServices(): Promise<Service[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/services/mega_menu/`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch (e) {
    console.error('Failed to fetch mega menu services', e);
    return [];
  }
}

export async function fetchHomepageServices(): Promise<Service[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/services/homepage/`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch (e) {
    console.error('Failed to fetch homepage services', e);
    return [];
  }
}

export async function fetchFooterServices(): Promise<Service[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/services/footer/`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch (e) {
    console.error('Failed to fetch footer services', e);
    return [];
  }
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/testimonials/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error('Failed to fetch Testimonials', e);
    return [];
  }
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/team/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error('Failed to fetch Team Members', e);
    return [];
  }
}

export async function fetchFAQs(): Promise<FAQ[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/faqs/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error('Failed to fetch FAQs', e);
    return [];
  }
}

export async function fetchFAQCategories(): Promise<FAQCategory[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/faq/categories/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error('Failed to fetch FAQ Categories', e);
    return [];
  }
}

export async function fetchContactFAQs(): Promise<FAQ[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/faqs/?is_contact_faq=true`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error('Failed to fetch Contact FAQs', e);
    return [];
  }
}

/**
 * Submit dynamic contact inquiry form.
 */
export async function submitContactInquiry(data: { name: string; email: string; subject: string; message: string }): Promise<boolean> {
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/cms/contacts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return resp.ok;
  } catch (e) {
    console.error('Failed to submit contact inquiry', e);
    return false;
  }
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/blog/posts/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error('Failed to fetch Blog Posts', e);
    return [];
  }
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const url = `${BASE_URL}/api/v1/cms/blog/posts/${encodeURIComponent(slug)}/`;
    console.log('[API] fetchBlogPostBySlug called with slug:', slug, 'url:', url);
    const resp = await apiFetch(url);
    console.log('[API] fetchBlogPostBySlug response:', resp.status, resp.ok);
    if (!resp.ok) {
      console.error('[API] fetchBlogPostBySlug failed with status:', resp.status);
      return null;
    }
    const data = await resp.json();
    console.log('[API] fetchBlogPostBySlug data:', data?.title);
    return data;
  } catch (e) {
    console.error(`[API] Failed to fetch blog post: ${slug}`, e);
    return null;
  }
}

export async function fetchBlogCategories(): Promise<BlogCategory[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/blog/categories/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error('Failed to fetch Blog Categories', e);
    return [];
  }
}

export async function fetchFeaturedBlogPosts(): Promise<BlogPost[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/blog/posts/?is_featured=true`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error('Failed to fetch featured posts', e);
    return [];
  }
}

export async function fetchTrendingBlogPosts(): Promise<BlogPost[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/blog/posts/?is_trending=true`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error('Failed to fetch trending posts', e);
    return [];
  }
}

export async function fetchBlogPostsByCategory(categoryId: number): Promise<BlogPost[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/blog/posts/?category=${categoryId}`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error('Failed to fetch posts by category', e);
    return [];
  }
}

export async function fetchPopularBlogPosts(limit = 5): Promise<BlogPost[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/blog/posts/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    const posts: BlogPost[] = data.results || data;
    return posts.slice(0, limit);
  } catch (e) {
    console.error('Failed to fetch popular posts', e);
    return [];
  }
}

/**
 * Fetch subscription plans from users module.
 */
export async function fetchPricingPlans(): Promise<PricingPlan[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/pricing/?is_active=true`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error('Failed to fetch Pricing Plans', e);
    return [];
  }
}

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/users/plans/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error('Failed to fetch Subscription Plans', e);
    return [];
  }
}

export async function fetchTechnologies(): Promise<Technology[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/technologies/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data;
  } catch (e) {
    console.error('Failed to fetch Technologies', e);
    return [];
  }
}

export interface PricingConfigDropdownOption {
  id: number;
  label: string;
  order: number;
  is_active: boolean;
}

export interface PricingConfigCardPrice {
  id: number;
  unit_range: number;
  unit_range_label: string;
  price: string;
  old_price: string;
}

export interface PricingConfigCard extends PricingBanner {
  id: number;
  image: string | null;
  image_alt?: string;
  title: string;
  description: string;
  button_text: string;
  sort_order: number;
  is_active: boolean;
  prices: PricingConfigCardPrice[];
}

export interface PricingConfigCTA {
  id: number;
  button_text: string;
  url: string;
  open_in_new_tab: boolean;
}

export interface PricingConfigSectionData {
  id: number;
  is_active: boolean;
  subtitle: string;
  title: string;
  description: string;
  dropdown_options: PricingConfigDropdownOption[];
  cards: PricingConfigCard[];
  cta: PricingConfigCTA | null;
}

export interface PricingPromotion {
  id: number;
  is_active: boolean;
  badge_text: string;
  title: string;
  subtitle: string;
  description: string;
  image_desktop: string | null;
  image_mobile: string | null;
  cta_text: string;
  cta_url: string;
  bg_color: string;
  use_theme_color: boolean;
  text_color: string;
  accent_color: string;
  start_date: string | null;
  end_date: string | null;
  display_order: number;
}

// ─── Dynamic Pricing (Service + Unit Range + Tiers) ───

export interface PricingServiceUnitRange {
  id: number;
  label: string;
  sort_order: number;
  is_active: boolean;
}

export interface PricingServiceCardPrice {
  id: number;
  unit_range: number;
  unit_range_label: string;
  price: string;
  original_price: string | null;
}

export interface PricingServiceCard {
  id: number;
  name: string;
  description: string;
  features: string[];
  image: string | null;
  image_alt?: string;
  badge_text: string;
  badge_color: string;
  button_text: string;
  sort_order: number;
  is_active: boolean;
  prices: PricingServiceCardPrice[];
}

export interface PricingService {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  unit_ranges: PricingServiceUnitRange[];
  cards: PricingServiceCard[];
}

export async function fetchPricingServices(): Promise<PricingService[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/services/pricing/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data || [];
  } catch (e) {
    console.error('Failed to fetch pricing services', e);
    return [];
  }
}

export async function fetchPricingServiceBySlug(slug: string): Promise<PricingService | null> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/pricing-services/${slug}/`);
    if (!resp.ok) return null;
    return await resp.json();
  } catch (e) {
    console.error('Failed to fetch pricing service', e);
    return null;
  }
}

export async function fetchPricingPromotions(): Promise<PricingPromotion[]> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/pricing-promotions/`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || data || [];
  } catch (e) {
    console.error('Failed to fetch pricing promotions', e);
    return [];
  }
}

export interface OrderSummaryData {
  source: 'configurator' | 'pricing';
  title: string;
  description: string;
  image: string | null;
  price: string;
  oldPrice?: string;
  features: string[];
  unitRange?: string;
  quantity?: number;
  totalPrice?: string;
}

const ORDER_STORAGE_KEY = 'picpicxels_order_summary';

export function storeOrderSummary(data: OrderSummaryData): void {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function getOrderSummary(): OrderSummaryData | null {
  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OrderSummaryData) : null;
  } catch {
    return null;
  }
}

export function clearOrderSummary(): void {
  try {
    localStorage.removeItem(ORDER_STORAGE_KEY);
  } catch {
    // noop
  }
}

export async function fetchPricingConfig(): Promise<PricingConfigSectionData | null> {
  try {
    const resp = await apiFetch(`${BASE_URL}/api/v1/cms/pricing-config/`);
    if (!resp.ok) return null;
    const data = await resp.json();
    const results = data.results || data;
    return Array.isArray(results) ? (results[0] || null) : results;
  } catch (e) {
    console.error('Failed to fetch Pricing Config', e);
    return null;
  }
}

export async function submitFreeTrial(data: {
  full_name: string;
  company_name?: string;
  email: string;
  phone_number?: string;
  product_name: string;
  product_category: string;
  drive_link?: string;
  project_requirements: string;
}, files?: File[]): Promise<boolean> {
  try {
    const form = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== '') {
        form.append(key, value);
      }
    }
    if (files) {
      for (const f of files) {
        form.append('files', f);
      }
    }
    const resp = await fetch(`${BASE_URL}/api/v1/cms/free-trials/`, {
      method: 'POST',
      body: form,
    });
    return resp.ok;
  } catch (e) {
    console.error('Failed to submit free trial', e);
    return false;
  }
}

