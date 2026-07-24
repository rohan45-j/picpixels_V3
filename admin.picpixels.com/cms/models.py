from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from django.db.models import JSONField
from ckeditor.fields import RichTextField
from .image_guidelines import IMG


class Page(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=200)
    meta_title = models.CharField(max_length=200, blank=True)
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.TextField(blank=True)
    meta_description = models.TextField(blank=True)
    content = JSONField(default=dict, help_text="Structure describing sections and components")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Section(models.Model):
    name = models.CharField(max_length=100)
    data = JSONField(default=dict)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.name


class Banner(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to='banners/', help_text=IMG['banner'])
    alt_text = models.CharField(max_length=200, blank=True)
    cta_text = models.CharField(max_length=100, blank=True)
    cta_link = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class Service(models.Model):
    title = models.CharField(max_length=150)
    slug = models.SlugField(unique=True, max_length=200, blank=True, help_text='URL identifier (auto-generated from title)')
    short_description = models.CharField(max_length=300, blank=True, help_text='Brief description for service cards')
    description = models.TextField(help_text='Detailed service description')
    features = models.JSONField(default=list, blank=True, help_text='List of features as JSON array')
    icon = models.CharField(max_length=100, blank=True, help_text='Material icon name or emoji')
    image = models.ImageField(upload_to='services/', blank=True, null=True, help_text=IMG['service_thumbnail'])
    image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the service thumbnail image')
    hero_subtitle = models.CharField(max_length=300, blank=True, help_text='Subtitle displayed in the hero section')
    hero_background = models.ImageField(upload_to='services/hero/', blank=True, null=True, help_text=IMG['service_hero_bg'])
    hero_image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the hero background image')
    hero_cta_text = models.CharField(max_length=100, blank=True, default='Start Free Trial', help_text='CTA button text in hero section')
    hero_cta_link = models.CharField(max_length=255, blank=True, default='/free-trial', help_text='CTA button link in hero section')
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00, help_text='Starting price per image')
    order = models.PositiveIntegerField(default=0)
    seo_title = models.CharField(max_length=200, blank=True, help_text='Custom SEO title for this service page')
    seo_description = models.TextField(blank=True, help_text='Custom SEO meta description')
    show_in_mega_menu = models.BooleanField(default=True, help_text='Show in Solutions mega menu')
    show_on_homepage = models.BooleanField(default=True, help_text='Show in homepage popular services section')
    show_in_footer = models.BooleanField(default=True, help_text='Show in footer services links')
    show_in_related = models.BooleanField(default=True, help_text='Show in related services section')
    is_active = models.BooleanField(default=True, db_index=True, help_text='Show on website')
    is_featured = models.BooleanField(default=False, db_index=True, help_text='Featured service (highlighted on homepage)')
    content_blocks = models.JSONField(default=list, blank=True, null=True, help_text='Modular content blocks array. Supported types: heading, text, image, image_with_text, gallery, code, callout, faq, list, table, step, divider')
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    brand_section_title = models.CharField(max_length=200, default='Trusted by Brands & Partners', blank=True)
    why_need_section_title = models.CharField(max_length=200, default='Why Should You Need Our Service', blank=True)
    why_need_section_description = models.TextField(blank=True, default='')
    process_section_title = models.CharField(max_length=200, default='Process & Workflow', blank=True)
    why_choose_title = models.CharField(max_length=200, default='Why Choose Us', blank=True)
    tools_section_title = models.CharField(max_length=200, default='Tools We Use', blank=True)
    pricing_title = models.CharField(max_length=200, default='Pricing', blank=True)
    pricing_badge_text = models.CharField(max_length=200, blank=True, default='', help_text='e.g. "Simple, Transparent Pricing"')
    pricing_heading = models.CharField(max_length=300, blank=True, default='', help_text='Main heading for premium pricing section')
    pricing_description = models.TextField(blank=True, default='', help_text='Description text for pricing section')
    pricing_starting_price = models.CharField(max_length=100, blank=True, default='', help_text='e.g. "$5.00"')
    pricing_unit = models.CharField(max_length=50, blank=True, default='/image', help_text='Price unit e.g. "/image", "/hour", "/project"')
    pricing_notes = models.CharField(max_length=500, blank=True, default='', help_text='Short notes about pricing')
    pricing_features = models.JSONField(default=list, blank=True, help_text='List of features as JSON array')
    pricing_cta_text = models.CharField(max_length=100, blank=True, default='Get Started')
    pricing_cta_link = models.CharField(max_length=500, blank=True, default='/free-trial')
    pricing_cta2_text = models.CharField(max_length=100, blank=True, default='View All Plans')
    pricing_cta2_link = models.CharField(max_length=500, blank=True, default='/pricing')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['order']
        verbose_name = 'Service'
        verbose_name_plural = 'Services'

    def __str__(self):
        return self.title


class ServiceGalleryImage(models.Model):
    GALLERY_TYPE_CHOICES = [
        ('before_after', 'Before & After'),
        ('portfolio', 'Portfolio'),
        ('case_study', 'Case Study'),
    ]
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE,
        related_name='gallery_images',
    )
    gallery_type = models.CharField(
        max_length=20, choices=GALLERY_TYPE_CHOICES,
        default='portfolio', help_text='Gallery section type',
    )
    category = models.CharField(
        max_length=100, blank=True,
        help_text='Filter category (e.g. "ecommerce", "fashion", "jewelry")',
    )
    image = models.ImageField(upload_to='services/gallery/', help_text=IMG['service_gallery'])
    before_image = models.ImageField(
        upload_to='services/gallery/before_after/', blank=True, null=True,
        help_text=IMG['service_before_after'],
    )
    after_image = models.ImageField(
        upload_to='services/gallery/before_after/', blank=True, null=True,
        help_text=IMG['service_before_after'],
    )
    before_image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the before image')
    after_image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the after image')
    alt_text = models.CharField(max_length=200, blank=True)
    caption = models.CharField(max_length=300, blank=True)
    is_featured = models.BooleanField(default=False, help_text='Show in featured showcase')
    is_visible = models.BooleanField(default=True, help_text='Display on website')
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'Service Gallery Image'
        verbose_name_plural = 'Service Gallery Images'

    def __str__(self):
        return f'{self.get_gallery_type_display()} - {self.caption or self.alt_text or f"Image {self.order}"} for {self.service.title}'


class ServiceContentSection(models.Model):
    LAYOUT_CHOICES = [
        ('text_left', 'Text Left / Image Right'),
        ('text_right', 'Image Left / Text Right'),
        ('full_width', 'Full Width Content'),
        ('image_top', 'Image on Top / Text Below'),
        ('text_only', 'Text Only (No Image)'),
    ]
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE,
        related_name='content_sections',
    )
    layout = models.CharField(max_length=20, choices=LAYOUT_CHOICES, default='text_left')
    heading = models.CharField(max_length=300, blank=True)
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to='services/content/', blank=True, null=True, help_text=IMG['service_content'])
    image_alt = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, help_text='Show on website')

    class Meta:
        ordering = ['order']
        verbose_name = 'Service Content Section'
        verbose_name_plural = 'Service Content Sections'

    def __str__(self):
        return f'{self.get_layout_display()} - {self.heading or "Untitled"}'


class ServiceHeroImage(models.Model):
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE,
        related_name='hero_images',
    )
    image = models.ImageField(upload_to='services/hero/', help_text=IMG['service_hero_slide'])
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, help_text='Show on website')

    class Meta:
        ordering = ['order']
        verbose_name = 'Service Hero Image'
        verbose_name_plural = 'Service Hero Images'

    def __str__(self):
        return self.alt_text or f'Hero Image {self.order}'


class HeroSection(models.Model):
    is_active = models.BooleanField(default=True, help_text='Show on homepage')
    tagline = models.CharField(max_length=200, blank=True, default='Photo Editing Services at Affordable Pricing')
    title = models.CharField(max_length=500, default='Get pixel-perfect photo editing services with quality as our top priority')
    description = models.TextField(blank=True, default='We edited over 5M+ images for brands, retailers, media agencies, and commercial photographers. Bulk order discounts available. Ready to assist 24/7.')
    background_image = models.ImageField(upload_to='hero/', blank=True, null=True, help_text=IMG['hero_section_bg'])
    background_image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the hero background image')
    cta_primary_text = models.CharField(max_length=100, blank=True, default='Free Trial')
    cta_primary_link = models.CharField(max_length=255, blank=True, default='/free-trial')
    cta_secondary_text = models.CharField(max_length=100, blank=True, default='See Pricing')
    cta_secondary_link = models.CharField(max_length=255, blank=True, default='/pricing')
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        verbose_name = 'Hero Section'
        verbose_name_plural = 'Hero Sections'

    def __str__(self):
        return 'Landing Page Hero Section'


class HeroSlide(models.Model):
    hero_section = models.ForeignKey(
        HeroSection, on_delete=models.CASCADE,
        related_name='slides',
    )
    image = models.ImageField(upload_to='hero/slides/', help_text=IMG['hero_slide'])
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Hero Slide'
        verbose_name_plural = 'Hero Slides'

    def __str__(self):
        return self.alt_text or f'Slide {self.order}'


class HeroStat(models.Model):
    hero_section = models.ForeignKey(
        HeroSection, on_delete=models.CASCADE,
        related_name='stats',
    )
    value = models.CharField(max_length=50, help_text='e.g. "5M+"')
    label = models.CharField(max_length=100, help_text='e.g. "Images Edited"')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Hero Stat'
        verbose_name_plural = 'Hero Stats'

    def __str__(self):
        return f'{self.value} {self.label}'


class Testimonial(models.Model):
    client_name = models.CharField(max_length=100)
    client_role = models.CharField(max_length=200, blank=True, default='')
    company = models.CharField(max_length=200, blank=True, default='')
    text = models.TextField()
    avatar = models.ImageField(upload_to='testimonials/', blank=True, null=True, help_text=IMG['testimonial_avatar'])
    avatar_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the testimonial avatar')
    rating = models.PositiveSmallIntegerField(default=5)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.client_name


class Author(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, max_length=100)
    designation = models.CharField(max_length=200, blank=True, help_text='Job title / designation')
    bio = models.TextField(blank=True, help_text='Short author biography')
    image = models.ImageField(upload_to='authors/', blank=True, null=True, help_text=IMG['author_photo'])
    image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the author image')
    email = models.EmailField(blank=True, help_text='Author email address (optional)')
    linkedin_url = models.URLField(blank=True, help_text='LinkedIn profile URL')
    facebook_url = models.URLField(blank=True, help_text='Facebook profile URL')
    twitter_url = models.URLField(blank=True, help_text='X / Twitter profile URL')
    instagram_url = models.URLField(blank=True, help_text='Instagram profile URL')
    is_active = models.BooleanField(default=True, help_text='Show on website')
    sort_order = models.PositiveIntegerField(default=0, help_text='Display order')

    class Meta:
        ordering = ['sort_order', 'name']
        verbose_name = 'Author'
        verbose_name_plural = 'Authors'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, max_length=100)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Blog Category'
        verbose_name_plural = 'Blog Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogTag(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True, max_length=100)

    class Meta:
        ordering = ['name']
        verbose_name = 'Blog Tag'
        verbose_name_plural = 'Blog Tags'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogContentSection(models.Model):
    TEMPLATE_CHOICES = [
        ('image_left', 'Image Left / Content Right'),
        ('image_right', 'Content Left / Image Right'),
        ('full_width', 'Full Width Content'),
        ('image_top', 'Image Above / Text Below'),
        ('text_only', 'Text Only (No Image)'),
    ]
    blog_post = models.ForeignKey(
        'BlogPost', on_delete=models.CASCADE,
        related_name='content_sections',
    )
    template = models.CharField(max_length=20, choices=TEMPLATE_CHOICES, default='full_width')
    heading = models.CharField(max_length=300, blank=True)
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to='blog/sections/', blank=True, null=True, help_text=IMG['blog_content'])
    image_alt = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Blog Content Section'

    def __str__(self):
        return f'{self.get_template_display()} - {self.heading or "Untitled"}'


class BlogDocumentBlock(models.Model):
    blog_post = models.ForeignKey('BlogPost', on_delete=models.CASCADE, related_name='document_blocks')
    title = models.CharField(max_length=200, help_text='Document title')
    file = models.FileField(upload_to='blog/documents/', help_text=IMG['blog_document'])
    description = models.TextField(blank=True, help_text='Short description of the document')
    download_text = models.CharField(max_length=100, default='Download Document', help_text='Download button text')
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['sort_order']
        verbose_name = 'Document Block'
        verbose_name_plural = 'Document Blocks'

    def __str__(self):
        return self.title


class BlogPost(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('scheduled', 'Scheduled'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=200)
    short_description = models.CharField(max_length=300, blank=True, help_text='SEO meta description / card description')
    excerpt = models.CharField(max_length=300, blank=True, help_text='Article excerpt / summary')
    content = RichTextField(blank=True, null=True, help_text='Legacy content field')
    featured_image = models.ImageField(upload_to='blog/', blank=True, null=True, help_text=IMG['blog_featured'])
    featured_image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the featured image')
    hero_image = models.ImageField(upload_to='blog/hero/', blank=True, null=True, help_text=IMG['blog_hero'])
    hero_image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the hero image')
    category = models.ForeignKey(
        BlogCategory, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='posts',
    )
    tags = models.ManyToManyField(BlogTag, blank=True, related_name='posts')
    author_profile = models.ForeignKey(
        Author, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='posts',
        help_text='Link to a registered author profile (provides avatar, bio, designation, social links)',
    )
    is_featured = models.BooleanField(default=False, db_index=True, help_text='Show in featured section')
    is_trending = models.BooleanField(default=False, help_text='Mark as trending/hot topic')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    is_published = models.BooleanField(default=False, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True, help_text='Schedule future publication')
    reading_time = models.PositiveIntegerField(default=0, help_text='Estimated reading time in minutes')
    canonical_url = models.URLField(blank=True, help_text='Custom canonical URL if different from default')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Executive Summary / Key Takeaways
    key_takeaways = models.JSONField(default=list, blank=True, null=True, help_text='Key takeaways / learning objectives as JSON array of strings')

    # SEO Fields
    meta_title = models.CharField(max_length=200, blank=True, help_text='Custom SEO title (overrides title)')
    meta_description = models.TextField(blank=True, help_text='Custom SEO meta description')
    og_title = models.CharField(max_length=200, blank=True, help_text='Open Graph title')
    og_description = models.TextField(blank=True, help_text='Open Graph description')
    og_image = models.ImageField(upload_to='blog/og/', blank=True, null=True, help_text=IMG['og_image'])
    og_image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the OG image')

    # Twitter Card Fields
    twitter_title = models.CharField(max_length=200, blank=True, help_text='Twitter Card title')
    twitter_description = models.TextField(blank=True, help_text='Twitter Card description')
    twitter_image = models.ImageField(upload_to='blog/twitter/', blank=True, null=True, help_text=IMG['twitter_image'])
    twitter_image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the Twitter image')

    # AI SEO Keywords
    focus_keyword = models.CharField(max_length=100, blank=True, help_text='Primary focus keyword for SEO')
    secondary_keywords = models.JSONField(default=list, blank=True, null=True, help_text='Secondary keywords as JSON array')

    # Block-based Content System
    content_blocks = models.JSONField(default=list, blank=True, null=True, help_text='Modular content blocks array. Supported types: heading, text, image, image_with_text, gallery, code, callout, faq, list, table, step, divider, stats, quote, cta, full_width_image')

    # Structured Data
    faq_schema = models.JSONField(default=list, blank=True, null=True, help_text='FAQPage structured data items: [{"question":"...","answer":"..."}]')

    # Internal Linking
    related_services = models.ManyToManyField('Service', blank=True, help_text='Related services to link')
    related_posts = models.ManyToManyField('self', blank=True, help_text='Manually related blog posts')

    class Meta:
        ordering = ['-published_at', '-created_at']
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'

    def calculate_reading_time(self):
        """Estimate reading time from content or content_blocks."""
        total_words = 0
        if self.content:
            total_words += len(self.content.split())
        if self.content_blocks:
            for block in self.content_blocks:
                if block.get('type') in ('text', 'heading', 'callout'):
                    total_words += len(block.get('content', '').split())
                elif block.get('type') == 'list':
                    total_words += sum(len(i.split()) for i in block.get('items', []))
                elif block.get('type') == 'faq':
                    total_words += len(block.get('question', '').split()) + len(block.get('answer', '').split())
                elif block.get('type') == 'step':
                    total_words += len(block.get('title', '').split()) + len(block.get('content', '').split())
                elif block.get('type') == 'table':
                    for row in block.get('rows', []):
                        total_words += sum(len(c.split()) for c in row)
        return max(1, round(total_words / 200))

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if not self.reading_time:
            self.reading_time = self.calculate_reading_time()
        if self.status == 'published':
            self.is_published = True
            if not self.published_at:
                self.published_at = timezone.now()
        elif self.status in ('draft', 'scheduled'):
            self.is_published = False
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class FAQCategory(models.Model):
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'FAQ Category'
        verbose_name_plural = 'FAQ Categories'

    def __str__(self):
        return self.name


class FAQ(models.Model):
    question = models.CharField(max_length=250)
    answer = models.TextField()
    category = models.ForeignKey(
        FAQCategory, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='faqs',
    )
    service = models.ForeignKey(
        'Service', on_delete=models.CASCADE,
        null=True, blank=True, related_name='faqs',
    )
    is_contact_faq = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.question


class ContactInquiry(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.subject}"


class TeamMember(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='team/', blank=True, null=True, help_text=IMG['team_photo'])
    photo_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the team member photo')
    email = models.EmailField(blank=True)
    social_links = JSONField(default=dict, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'Team Member'
        verbose_name_plural = 'Team Members'

    def __str__(self):
        return self.name


class BrandLogo(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='brands/', help_text=IMG['brand_logo'])
    logo_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the brand logo')
    url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, help_text='Show on website')

    class Meta:
        ordering = ['order']
        verbose_name = 'Brand Logo'
        verbose_name_plural = 'Brand Logos'

    def __str__(self):
        return self.name


class PricingPlan(models.Model):
    title = models.CharField(max_length=200, help_text='Plan name (e.g. "Starter", "Professional")')
    slug = models.SlugField(unique=True, max_length=200, blank=True, help_text='URL identifier (auto-generated from title)')
    image = models.ImageField(upload_to='pricing/', blank=True, null=True, help_text=IMG['pricing_card'])
    image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the pricing plan image')
    price_monthly = models.DecimalField(max_digits=8, decimal_places=2, default=0.00, help_text='Monthly price in USD')
    price_yearly = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True, help_text='Yearly price per month in USD (optional)')
    description = models.TextField(blank=True, help_text='Short description of the plan')
    features = models.JSONField(default=list, blank=True, help_text='Feature list as JSON array of strings')
    is_popular = models.BooleanField(default=False, help_text='Highlight as "Most Popular" plan')
    button_text = models.CharField(max_length=100, blank=True, default='Get Started', help_text='CTA button text')
    button_link = models.CharField(max_length=255, blank=True, default='/free-trial', help_text='CTA button link')
    order = models.PositiveIntegerField(default=0, help_text='Display order')
    is_active = models.BooleanField(default=True, help_text='Show on website')

    # Promotion banner fields
    show_banner = models.BooleanField(default=False, help_text='Show promotion banner above card')
    banner_text = models.CharField(max_length=100, blank=True, help_text='e.g. "Limited Time Offer", "Save 30%"')
    banner_type = models.CharField(
        max_length=20,
        choices=[
            ('discount', 'Discount'),
            ('popular', 'Popular'),
            ('recommended', 'Recommended'),
            ('new', 'New'),
            ('custom', 'Custom'),
        ],
        default='custom',
        help_text='Visual style for the banner'
    )
    banner_bg_color = models.CharField(max_length=20, default='#FF8A50', help_text='Banner background color (HEX)')
    banner_text_color = models.CharField(max_length=20, default='#FFFFFF', help_text='Banner text color (HEX)')
    banner_icon = models.CharField(
        max_length=50, blank=True,
        choices=[
            ('', 'None'),
            ('fire', 'Fire'),
            ('star', 'Star'),
            ('crown', 'Crown'),
            ('bolt', 'Lightning'),
            ('card_giftcard', 'Gift'),
            ('local_offer', 'Tag'),
        ],
        default='',
        help_text='Optional icon displayed before banner text'
    )
    banner_priority = models.PositiveIntegerField(default=0, help_text='Higher priority displays first')
    banner_expiry = models.DateTimeField(blank=True, null=True, help_text='Auto-hide banner after this date')

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['order']
        verbose_name = 'Pricing Plan'
        verbose_name_plural = 'Pricing Plans'

    def __str__(self):
        return self.title


class Technology(models.Model):
    title = models.CharField(max_length=100)
    icon = models.ImageField(upload_to='technology/', blank=True, null=True, help_text=IMG['technology_icon'])
    icon_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the technology icon')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order']
        verbose_name = 'Technology'
        verbose_name_plural = 'Technologies'

    def __str__(self):
        return self.title


class PricingConfigSection(models.Model):
    is_active = models.BooleanField(default=True, help_text='Show this section on the homepage')
    subtitle = models.CharField(max_length=200, blank=True, default='SIMPLE PRICING OF 3D CONTENT FOR E-COMMERCE')
    title = models.CharField(max_length=500, default='Create your product detail page')
    description = models.TextField(blank=True, default='Choose the pricing tier and card type that fits your product visualization needs.')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Pricing Configurator'
        verbose_name_plural = 'Pricing Configurators'

    def __str__(self):
        return f'Pricing Configurator ({self.pk})'


class PricingConfigDropdownOption(models.Model):
    section = models.ForeignKey(PricingConfigSection, on_delete=models.CASCADE, related_name='dropdown_options')
    label = models.CharField(max_length=200, help_text='e.g. "1-10 units"')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'Dropdown Option'
        verbose_name_plural = 'Dropdown Options'

    def __str__(self):
        return self.label


class PricingConfigCard(models.Model):
    section = models.ForeignKey(PricingConfigSection, on_delete=models.CASCADE, related_name='cards')
    image = models.ImageField(upload_to='pricing_config/', blank=True, null=True, help_text=IMG['pricing_config_card'])
    image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the pricing card image')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, help_text='Short description for this card')
    button_text = models.CharField(max_length=100, default='Select')
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    # Promotion banner fields
    show_banner = models.BooleanField(default=False, help_text='Show promotion banner above card')
    banner_text = models.CharField(max_length=100, blank=True, help_text='e.g. "Limited Time Offer", "Save 30%"')
    banner_type = models.CharField(
        max_length=20,
        choices=[
            ('discount', 'Discount'),
            ('popular', 'Popular'),
            ('recommended', 'Recommended'),
            ('new', 'New'),
            ('custom', 'Custom'),
        ],
        default='custom',
        help_text='Visual style for the banner'
    )
    banner_bg_color = models.CharField(max_length=20, default='#FF8A50', help_text='Banner background color (HEX)')
    banner_text_color = models.CharField(max_length=20, default='#FFFFFF', help_text='Banner text color (HEX)')
    banner_icon = models.CharField(
        max_length=50, blank=True,
        choices=[
            ('', 'None'),
            ('fire', 'Fire'),
            ('star', 'Star'),
            ('crown', 'Crown'),
            ('bolt', 'Lightning'),
            ('card_giftcard', 'Gift'),
            ('local_offer', 'Tag'),
        ],
        default='',
        help_text='Optional icon displayed before banner text'
    )
    banner_priority = models.PositiveIntegerField(default=0, help_text='Higher priority displays first')
    banner_expiry = models.DateTimeField(blank=True, null=True, help_text='Auto-hide banner after this date')

    class Meta:
        ordering = ['sort_order']
        verbose_name = 'Pricing Card'
        verbose_name_plural = 'Pricing Cards'

    def __str__(self):
        return self.title


class PricingConfigCardPrice(models.Model):
    section = models.ForeignKey(PricingConfigSection, on_delete=models.CASCADE, related_name='card_prices', null=True, blank=True)
    card = models.ForeignKey(PricingConfigCard, on_delete=models.CASCADE, related_name='prices')
    unit_range = models.ForeignKey(PricingConfigDropdownOption, on_delete=models.CASCADE, related_name='card_prices')
    price = models.CharField(max_length=50, help_text='e.g. "$150"')
    old_price = models.CharField(max_length=50, blank=True, help_text='Strikethrough price, e.g. "$180"')

    class Meta:
        verbose_name = 'Pricing Card Price'
        verbose_name_plural = 'Pricing Card Prices'
        unique_together = ('card', 'unit_range')
        ordering = ('unit_range__order',)

    def __str__(self):
        return f'{self.card.title} — {self.unit_range.label}: {self.price}'


class PricingConfigCTA(models.Model):
    section = models.OneToOneField(PricingConfigSection, on_delete=models.CASCADE, related_name='cta')
    button_text = models.CharField(max_length=100, default='Continue')
    url = models.CharField(max_length=500, default='/free-trial')
    open_in_new_tab = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'CTA Button'
        verbose_name_plural = 'CTA Buttons'

    def __str__(self):
        return self.button_text


class PricingPromotionSection(models.Model):
    is_active = models.BooleanField(default=False, help_text='Show this promotion on the pricing page')
    badge_text = models.CharField(max_length=100, blank=True, help_text='e.g. "Limited Time Offer", "Special Deal"')
    title = models.CharField(max_length=255, blank=True, help_text='e.g. "Get 30% Off This Month"')
    subtitle = models.CharField(max_length=255, blank=True, help_text='Short supporting text')
    description = models.TextField(blank=True, help_text='Rich text description of the promotion')
    image_desktop = models.ImageField(upload_to='promotions/', blank=True, null=True, help_text='Desktop banner (recommended: 1920×600)')
    image_desktop_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the desktop promotion image')
    image_mobile = models.ImageField(upload_to='promotions/', blank=True, null=True, help_text='Mobile banner (recommended: 1080×1080)')
    image_mobile_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the mobile promotion image')
    cta_text = models.CharField(max_length=100, blank=True, help_text='e.g. "Claim Offer", "Get Started"')
    cta_url = models.CharField(max_length=500, blank=True, default='/pricing', help_text='Button link')
    bg_color = models.CharField(max_length=20, default='#0F172A', help_text='Section background color (HEX). Only used if "Use Theme Color" is OFF.')
    use_theme_color = models.BooleanField(default=True, help_text='Use theme CSS variables (--primary-color, --accent-color) instead of custom background color. Keeps the promotion visually consistent with the site design.')
    text_color = models.CharField(max_length=20, default='#FFFFFF', help_text='Main text color (HEX)')
    accent_color = models.CharField(max_length=20, default='#FF8A50', help_text='Badge and CTA accent color (HEX)')
    start_date = models.DateTimeField(blank=True, null=True, help_text='Campaign start date')
    end_date = models.DateTimeField(blank=True, null=True, help_text='Campaign end date (auto-hides after)')
    display_order = models.PositiveIntegerField(default=0, help_text='Display order (if multiple promotions)')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', '-created_at']
        verbose_name = 'Promotion Campaign'
        verbose_name_plural = 'Promotion Campaigns'

    def __str__(self):
        return self.title or self.badge_text or f'Promotion #{self.pk}'


# ─── Dynamic Pricing: Service + Unit Range + Tiered Cards ───
# These models FK to the existing Service model so the dropdown uses
# the same services already managed in the Django admin panel.

class ServiceUnitRange(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='unit_ranges')
    label = models.CharField(max_length=200, help_text='e.g. "1-25 images", "26-100 images"')
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['sort_order']
        verbose_name = 'Service Unit Range'
        verbose_name_plural = 'Service Unit Ranges'
        unique_together = ['service', 'label']

    def __str__(self):
        return f'{self.service.title} — {self.label}'


class ServicePricingCard(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='pricing_cards')
    name = models.CharField(max_length=200, help_text='e.g. "Basic", "Standard", "Premium"')
    description = models.TextField(blank=True)
    features = models.JSONField(default=list, blank=True)
    image = models.ImageField(upload_to='service_pricing_cards/', blank=True, null=True)
    image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the pricing card image')
    badge_text = models.CharField(max_length=100, blank=True, help_text='e.g. "Popular", "Best Value"')
    badge_color = models.CharField(max_length=20, blank=True, help_text='HEX color for badge')
    button_text = models.CharField(max_length=100, default='Select')
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order']
        verbose_name = 'Service Pricing Card'
        verbose_name_plural = 'Service Pricing Cards'

    def __str__(self):
        return f'{self.service.title} — {self.name}'


class ServicePricingCardPrice(models.Model):
    card = models.ForeignKey(ServicePricingCard, on_delete=models.CASCADE, related_name='prices')
    unit_range = models.ForeignKey(ServiceUnitRange, on_delete=models.CASCADE, related_name='card_prices')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text='Strikethrough original price')

    class Meta:
        unique_together = ['card', 'unit_range']
        verbose_name = 'Service Pricing Card Price'
        verbose_name_plural = 'Service Pricing Card Prices'

    def __str__(self):
        return f'{self.card.name} @ {self.unit_range.label} = ${self.price}'


class FreeTrial(models.Model):
    PRODUCT_CATEGORIES = [
        ('clothing', 'Clothing / Apparel'),
        ('electronics', 'Electronics'),
        ('jewelry', 'Jewelry / Watches'),
        ('home_garden', 'Home & Garden'),
        ('beauty', 'Beauty / Cosmetics'),
        ('food', 'Food & Beverage'),
        ('automotive', 'Automotive'),
        ('other', 'Other'),
    ]

    full_name = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200, blank=True, null=True)
    email = models.EmailField()
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    product_name = models.CharField(max_length=300)
    product_category = models.CharField(max_length=50, choices=PRODUCT_CATEGORIES)
    drive_link = models.URLField(max_length=1000, blank=True, null=True)
    project_requirements = models.TextField()
    is_read = models.BooleanField(default=False, help_text='Mark as read when reviewed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Trial Request'
        verbose_name_plural = 'Trial Requests'
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.full_name} — {self.product_name} ({self.created_at.strftime("%Y-%m-%d")})'


class FreeTrialAttachment(models.Model):
    free_trial = models.ForeignKey(FreeTrial, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='free_trial_attachments/', help_text=IMG['free_trial_attachment'])
    original_filename = models.CharField(max_length=500)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Free Trial Attachment'
        verbose_name_plural = 'Free Trial Attachments'
        ordering = ('uploaded_at',)

    def __str__(self):
        return self.original_filename


class WhyChooseSection(models.Model):
    title = models.CharField(max_length=200, default='Why Choose Us')
    highlighted_word = models.CharField(max_length=50, default='Choose')
    subtitle = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Why Choose Section'
        verbose_name_plural = 'Why Choose Sections'

    def __str__(self):
        return self.title


class WhyChooseItem(models.Model):
    section = models.ForeignKey(WhyChooseSection, on_delete=models.CASCADE, related_name='items', null=True, blank=True)
    company_name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    speed = models.BooleanField(default=False)
    flexibility = models.BooleanField(default=False)
    quality = models.BooleanField(default=False)
    scalability = models.BooleanField(default=False)
    cost_effectiveness = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']
        verbose_name = 'Why Choose Item'
        verbose_name_plural = 'Why Choose Items'

    def __str__(self):
        return self.company_name


class WhyChooseFeatureSection(models.Model):
    title = models.CharField(max_length=200, default='Why Choose Us')
    subtitle = models.TextField(blank=True, default='')
    featured_image = models.ImageField(upload_to='why-choose-features/', blank=True, null=True)
    featured_image_alt = models.CharField(max_length=200, blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Why Choose Feature Section'
        verbose_name_plural = 'Why Choose Feature Sections'

    def __str__(self):
        return self.title


class WhyChooseFeatureItem(models.Model):
    section = models.ForeignKey(WhyChooseFeatureSection, on_delete=models.CASCADE, related_name='items', null=True, blank=True)
    icon = models.ImageField(upload_to='why-choose-features/icons/', blank=True, null=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']
        verbose_name = 'Why Choose Feature Item'
        verbose_name_plural = 'Why Choose Feature Items'

    def __str__(self):
        return self.title


# ═══════════════════════════════════════════════════════════
# SERVICE DYNAMIC SECTIONS (Service Details Page)
# ═══════════════════════════════════════════════════════════

class ServiceEEAT(models.Model):
    service = models.OneToOneField(Service, on_delete=models.CASCADE, related_name='eeat')
    experience = models.TextField(blank=True, help_text='Experience description')
    expertise = models.TextField(blank=True, help_text='Expertise description')
    authoritativeness = models.TextField(blank=True, help_text='Authoritativeness description')
    trustworthiness = models.TextField(blank=True, help_text='Trustworthiness description')
    is_active = models.BooleanField(default=True, help_text='Show EEAT section on service page')

    class Meta:
        verbose_name = 'Service EEAT'
        verbose_name_plural = 'Service EEAT'

    def __str__(self):
        return f'EEAT for {self.service.title}'


class ServiceBrandLogo(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='brand_logos')
    logo = models.ImageField(upload_to='service_brands/', help_text='Brand logo image')
    logo_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for brand logo')
    brand_name = models.CharField(max_length=200, help_text='Brand name')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, help_text='Show on website')

    class Meta:
        ordering = ['display_order']
        verbose_name = 'Service Brand Logo'
        verbose_name_plural = 'Service Brand Logos'

    def __str__(self):
        return self.brand_name


class ServiceWhyNeedFeature(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='why_need_features')
    title = models.CharField(max_length=200, help_text='Feature title')
    description = models.TextField(blank=True, help_text='Feature description')
    icon_image = models.ImageField(upload_to='service_why_need/', blank=True, null=True, help_text='Optional icon/image')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']
        verbose_name = 'Why Need Feature'
        verbose_name_plural = 'Why Need Features'

    def __str__(self):
        return self.title


class ServiceProcessStep(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='process_steps')
    step_number = models.PositiveIntegerField(default=1, help_text='Step number')
    title = models.CharField(max_length=200, help_text='Step title')
    description = models.TextField(blank=True, help_text='Step description')
    image = models.ImageField(upload_to='service_process/', blank=True, null=True, help_text='Optional step image/icon')
    image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for step image')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']
        verbose_name = 'Service Process Step'
        verbose_name_plural = 'Service Process Steps'

    def __str__(self):
        return f'Step {self.step_number}: {self.title}'


class ServiceWhyChooseCard(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='why_choose_cards')
    icon_image = models.ImageField(upload_to='service_why_choose/', blank=True, null=True, help_text='Optional icon/image')
    title = models.CharField(max_length=200, help_text='Card title')
    description = models.TextField(blank=True, help_text='Card description')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']
        verbose_name = 'Why Choose Card'
        verbose_name_plural = 'Why Choose Cards'

    def __str__(self):
        return self.title


class ServiceTool(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='tools')
    logo = models.ImageField(upload_to='service_tools/', blank=True, null=True, help_text='Tool logo')
    logo_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for tool logo')
    name = models.CharField(max_length=200, help_text='Tool name')
    short_description = models.TextField(blank=True, help_text='Short description')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']
        verbose_name = 'Service Tool'
        verbose_name_plural = 'Service Tools'

    def __str__(self):
        return self.name


class ServicePricingTierCard(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='pricing_tier_cards')
    name = models.CharField(max_length=200, help_text='Card name e.g. "Basic", "Standard"')
    description = models.TextField(blank=True, help_text='Card description')
    price = models.CharField(max_length=100, blank=True, help_text='e.g. "$5.00"')
    original_price = models.CharField(max_length=100, blank=True, help_text='Strikethrough price e.g. "$8.00"')
    features = models.JSONField(default=list, blank=True, null=True, help_text='List of features as JSON array')
    is_popular = models.BooleanField(default=False, help_text='Highlight as popular')
    badge_text = models.CharField(max_length=100, blank=True, help_text='e.g. "Popular", "Best Value"')
    badge_color = models.CharField(max_length=20, blank=True, help_text='HEX color for badge')
    button_text = models.CharField(max_length=100, default='Select')
    button_link = models.CharField(max_length=500, blank=True, default='/free-trial')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']
        verbose_name = 'Service Pricing Tier Card'
        verbose_name_plural = 'Service Pricing Tier Cards'

    def __str__(self):
        return f'{self.name} - {self.service.title}'


class ServiceClientFeedback(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='client_feedbacks')
    client_name = models.CharField(max_length=200, help_text='Client name')
    company = models.CharField(max_length=200, blank=True, help_text='Company name')
    designation = models.CharField(max_length=200, blank=True, help_text='Job title / designation')
    photo = models.ImageField(upload_to='service_feedbacks/', blank=True, null=True, help_text='Client photo')
    photo_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for client photo')
    rating = models.PositiveSmallIntegerField(default=5, help_text='Rating 1-5')
    review = models.TextField(blank=True, help_text='Client review text')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']
        verbose_name = 'Service Client Feedback'
        verbose_name_plural = 'Service Client Feedbacks'

    def __str__(self):
        return f'{self.client_name} - {self.service.title}'
