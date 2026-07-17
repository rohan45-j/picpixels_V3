// ============ CMS / Public Types ============

export interface CMSPage {
  title: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  content: Section[];
}

export interface Section {
  type: string;
  data: any;
}

export interface SiteSetting {
  id?: number;
  site_name: string;
  tagline?: string;
  logo?: string;
  favicon?: string;
  support_email?: string;
  support_phone?: string;
  address?: string;
  social_links?: Record<string, string>;
  copyright_text?: string;
}

export interface SEOSetting {
  id?: number;
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
  url?: string;
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
  stat_value?: string;
  stat_label?: string;
  stat_description?: string;
  quote_author?: string;
  quote_role?: string;
  button_text?: string;
  button_link?: string;
  cta_description?: string;
  layout?: 'left' | 'right';
  alignment?: 'full' | 'centered' | 'small';
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
  hero_subtitle?: string;
  hero_background?: string;
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
}

export interface Testimonial {
  id: number;
  client_name: string;
  client_role?: string;
  company?: string;
  text: string;
  avatar?: string;
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
  order: number;
  is_active: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio?: string;
  photo?: string;
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
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
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
  excerpt?: string;
  content: string;
  featured_image?: string;
  category?: number;
  tags?: number[];
  author_profile?: number;
  author_profile_data?: Author | null;
  author_image?: string | null;
  author_image_alt?: string | null;
  is_featured: boolean;
  is_published: boolean;
  published_at?: string;
  content_sections?: BlogContentSection[];
  document_blocks?: BlogDocumentBlock[];
  created_at: string;
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

export interface SubscriptionPlan {
  id: number;
  name: string;
  monthly_fee: string;
  annual_fee: string;
  per_image_base_discount: string;
  turnaround_hours_guaranteed: number;
  features: Record<string, any>;
}

// ============ Admin / API Types ============

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CrudApi<T> {
  list: (params?: Record<string, any>) => Promise<PaginatedResponse<T>>;
  getAll: (params?: Record<string, any>) => Promise<T[]>;
  get: (id: number | string) => Promise<T>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: number | string, data: Partial<T>) => Promise<T>;
  patch: (id: number | string, data: Partial<T>) => Promise<T>;
  delete: (id: number | string) => Promise<void>;
}

// ============ Admin Auth ============

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  is_staff: boolean;
}

export interface DashboardStats {
  total_users: number;
  active_subscriptions: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: string;
  monthly_revenue: string;
  total_contacts: number;
  unread_contacts: number;
  total_blog_posts: number;
  published_blog_posts: number;
  recent_contacts: any[];
  recent_orders: any[];
}

// ============ Dashboard / UI Types ============

export interface Annotation {
  id: string;
  x: number;
  y: number;
  comment: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type?: string;
}
