from rest_framework import serializers
from .models import (
    Page, Section, Banner, Service, ServiceGalleryImage, ServiceContentSection, ServiceHeroImage,
    HeroSection, HeroSlide, HeroStat, Testimonial,
    Author, BlogCategory, BlogTag, BlogPost, BlogContentSection, BlogDocumentBlock,
    FAQCategory, FAQ, ContactInquiry, TeamMember, BrandLogo,
    PricingPlan, Technology, PricingPromotionSection,
    PricingConfigSection, PricingConfigDropdownOption, PricingConfigCard, PricingConfigCardPrice, PricingConfigCTA,
    ServiceUnitRange, ServicePricingCard, ServicePricingCardPrice,
    FreeTrial, FreeTrialAttachment,
    WhyChooseSection, WhyChooseItem,
    WhyChooseFeatureSection, WhyChooseFeatureItem,
    ServiceEEAT, ServiceBrandLogo,
    ServiceWhyNeedFeature,
    ServiceProcessStep,
    ServiceWhyChooseCard,
    ServiceTool,
    ServicePricingTierCard,
    ServiceClientFeedback,
)


class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ['id', 'title', 'slug', 'meta_title', 'meta_description', 'content', 'created_at', 'updated_at']


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['id', 'name', 'data']


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ['id', 'title', 'subtitle', 'image', 'alt_text', 'cta_text', 'cta_link', 'order']


class ServiceGalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceGalleryImage
        fields = ['id', 'gallery_type', 'category', 'image', 'before_image', 'after_image', 'alt_text', 'before_image_alt', 'after_image_alt', 'caption', 'is_featured', 'is_visible', 'order']
        read_only_fields = ['service', 'created_at']


class ServiceContentSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceContentSection
        fields = ['id', 'layout', 'heading', 'content', 'image', 'image_alt', 'order', 'is_active']
        read_only_fields = ['service']


class ServiceHeroImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceHeroImage
        fields = ['id', 'image', 'alt_text', 'order', 'is_active']
        read_only_fields = ['service']


# ═══════════════════════════════════════════════════════════
# SERVICE DYNAMIC SECTION SERIALIZERS
# ═══════════════════════════════════════════════════════════

class ServiceEEATSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceEEAT
        fields = ['id', 'experience', 'expertise', 'authoritativeness', 'trustworthiness', 'is_active']


class ServiceBrandLogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceBrandLogo
        fields = ['id', 'logo', 'logo_alt', 'brand_name', 'display_order', 'is_active']
        read_only_fields = ['service']


class ServiceWhyNeedFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceWhyNeedFeature
        fields = ['id', 'title', 'description', 'icon_image', 'display_order', 'is_active']
        read_only_fields = ['service']


class ServiceProcessStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceProcessStep
        fields = ['id', 'step_number', 'title', 'description', 'image', 'image_alt', 'display_order', 'is_active']
        read_only_fields = ['service']


class ServiceWhyChooseCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceWhyChooseCard
        fields = ['id', 'icon_image', 'title', 'description', 'display_order', 'is_active']
        read_only_fields = ['service']


class ServiceToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceTool
        fields = ['id', 'logo', 'logo_alt', 'name', 'short_description', 'display_order', 'is_active']
        read_only_fields = ['service']


class ServicePricingTierCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicePricingTierCard
        fields = ['id', 'name', 'description', 'price', 'original_price', 'features', 'is_popular', 'badge_text', 'badge_color', 'button_text', 'button_link', 'display_order', 'is_active']
        read_only_fields = ['service']


class ServiceClientFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceClientFeedback
        fields = ['id', 'client_name', 'company', 'designation', 'photo', 'photo_alt', 'rating', 'review', 'display_order', 'is_active']


class ServiceSerializer(serializers.ModelSerializer):
    gallery_images = ServiceGalleryImageSerializer(many=True, read_only=True)
    content_sections = ServiceContentSectionSerializer(many=True, read_only=True)
    hero_images = ServiceHeroImageSerializer(many=True, read_only=True)
    faqs = serializers.SerializerMethodField()
    eeat = ServiceEEATSerializer(read_only=True)
    brand_logos = ServiceBrandLogoSerializer(many=True, read_only=True)
    why_need_features = ServiceWhyNeedFeatureSerializer(many=True, read_only=True)
    process_steps = ServiceProcessStepSerializer(many=True, read_only=True)
    why_choose_cards = ServiceWhyChooseCardSerializer(many=True, read_only=True)
    tools = ServiceToolSerializer(many=True, read_only=True)
    pricing_tier_cards = ServicePricingTierCardSerializer(many=True, read_only=True)
    client_feedbacks = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ['id', 'title', 'slug', 'short_description', 'description', 'features', 'icon', 'image', 'image_alt',
                  'hero_subtitle', 'hero_background', 'hero_image_alt', 'hero_cta_text', 'hero_cta_link',
                  'price', 'order', 'seo_title', 'seo_description',
                  'show_in_mega_menu', 'show_on_homepage', 'show_in_footer', 'show_in_related',
                  'is_active', 'is_featured', 'content_blocks', 'created_at', 'updated_at',
                  'gallery_images', 'content_sections', 'hero_images', 'faqs',
               'eeat', 'brand_section_title', 'why_need_section_title', 'why_need_section_description',
                   'process_section_title', 'why_choose_title', 'tools_section_title',
                    'pricing_title', 'pricing_badge_text', 'pricing_heading', 'pricing_description',
                    'pricing_starting_price', 'pricing_unit', 'pricing_notes', 'pricing_features',
                    'pricing_cta_text', 'pricing_cta_link', 'pricing_cta2_text', 'pricing_cta2_link',
                   'brand_logos', 'why_need_features', 'process_steps', 'why_choose_cards',
                   'tools', 'pricing_tier_cards', 'client_feedbacks']
        read_only_fields = ['created_at', 'updated_at']

    def get_faqs(self, obj):
        qs = getattr(obj, '_prefetched_faqs', None)
        if qs is None:
            qs = obj.faqs.filter(is_active=True).order_by('order')
        return FAQSerializer(qs, many=True).data

    def get_client_feedbacks(self, obj):
        qs = obj.client_feedbacks.filter(is_active=True).order_by('display_order')
        return ServiceClientFeedbackSerializer(qs, many=True).data


class ServiceListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'title', 'slug', 'short_description', 'description', 'features', 'icon', 'image', 'image_alt', 'price', 'order', 'is_featured', 'show_in_mega_menu', 'show_on_homepage', 'show_in_footer', 'show_in_related', 'is_active']


class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = ['id', 'image', 'alt_text', 'order']


class HeroStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroStat
        fields = ['id', 'value', 'label', 'order']


class HeroSectionSerializer(serializers.ModelSerializer):
    slides = HeroSlideSerializer(many=True, read_only=True)
    stats = HeroStatSerializer(many=True, read_only=True)

    class Meta:
        model = HeroSection
        fields = ['id', 'is_active', 'tagline', 'title', 'description', 'background_image', 'background_image_alt',
                  'cta_primary_text', 'cta_primary_link', 'cta_secondary_text', 'cta_secondary_link',
                  'slides', 'stats', 'created_at', 'updated_at']


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['id', 'client_name', 'client_role', 'company', 'text', 'avatar', 'avatar_alt', 'rating', 'order', 'is_active']


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name', 'slug', 'designation', 'bio', 'image', 'image_alt', 'email',
                  'linkedin_url', 'facebook_url', 'twitter_url', 'instagram_url',
                  'is_active', 'sort_order']


class BlogDocumentBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogDocumentBlock
        fields = ['id', 'title', 'file', 'description', 'download_text', 'sort_order', 'is_active']


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description', 'order']


class BlogTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogTag
        fields = ['id', 'name', 'slug']


class BlogContentSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogContentSection
        fields = ['id', 'template', 'heading', 'content', 'image', 'image_alt', 'order']
        read_only_fields = ['blog_post']


class BlogPostSerializer(serializers.ModelSerializer):
    content_sections = BlogContentSectionSerializer(many=True, read_only=True)
    document_blocks = BlogDocumentBlockSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    tag_names = serializers.SerializerMethodField()
    related_post_slugs = serializers.SerializerMethodField()
    author_image = serializers.SerializerMethodField()
    author_image_alt = serializers.SerializerMethodField()
    author_profile_data = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'short_description', 'excerpt', 'content',
                  'featured_image', 'featured_image_alt', 'hero_image', 'hero_image_alt',
                  'category', 'category_name',
                  'tags', 'tag_names',
                  'author_profile', 'author_profile_data',
                  'author_image', 'author_image_alt',
                  'is_featured', 'is_trending', 'is_published', 'status',
                  'published_at', 'scheduled_at', 'reading_time',
                  'canonical_url', 'meta_title', 'meta_description',
                  'og_title', 'og_description', 'og_image', 'og_image_alt',
                  'twitter_title', 'twitter_description', 'twitter_image', 'twitter_image_alt',
                  'focus_keyword', 'secondary_keywords',
                  'key_takeaways', 'content_blocks', 'faq_schema',
                  'related_services', 'related_posts', 'related_post_slugs',
                  'content_sections', 'document_blocks', 'created_at', 'updated_at']

    def get_tag_names(self, obj):
        return [t.name for t in obj.tags.all()]

    def get_related_post_slugs(self, obj):
        return list(obj.related_posts.values_list('slug', flat=True))

    def get_author_image(self, obj):
        if obj.author_profile and obj.author_profile.image:
            return obj.author_profile.image.url
        return None

    def get_author_image_alt(self, obj):
        if obj.author_profile and obj.author_profile.image_alt:
            return obj.author_profile.image_alt
        return None

    def get_author_profile_data(self, obj):
        if obj.author_profile:
            return AuthorSerializer(obj.author_profile).data
        return None


class BlogPostListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    tag_names = serializers.SerializerMethodField()
    author_image = serializers.SerializerMethodField()
    author_profile_data = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'short_description',
            'featured_image', 'featured_image_alt',
            'category', 'category_name',
            'tag_names', 'author_profile', 'author_image', 'author_profile_data',
            'is_featured', 'is_trending',
            'published_at', 'reading_time', 'created_at',
        ]

    def get_tag_names(self, obj):
        return [t.name for t in obj.tags.all()]

    def get_author_image(self, obj):
        if obj.author_profile and obj.author_profile.image:
            return obj.author_profile.image.url
        return None

    def get_author_profile_data(self, obj):
        if obj.author_profile:
            return AuthorSerializer(obj.author_profile).data
        return None


class FAQCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQCategory
        fields = ['id', 'name', 'order']


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'category', 'service', 'is_contact_faq', 'order', 'is_active']


class ContactInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'is_read']


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ['id', 'name', 'role', 'bio', 'photo', 'photo_alt', 'email', 'social_links', 'order', 'is_active']


class BrandLogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandLogo
        fields = ['id', 'name', 'logo', 'logo_alt', 'url', 'order', 'is_active']


class PricingPlanSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = PricingPlan
        fields = ['id', 'title', 'slug', 'image', 'image_alt', 'price_monthly', 'price_yearly', 'description', 'features', 'is_popular', 'button_text', 'button_link', 'order', 'is_active', 'show_banner', 'banner_text', 'banner_type', 'banner_bg_color', 'banner_text_color', 'banner_icon', 'banner_priority', 'banner_expiry']
        read_only_fields = ['slug']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class TechnologySerializer(serializers.ModelSerializer):
    class Meta:
        model = Technology
        fields = ['id', 'title', 'icon', 'icon_alt', 'display_order', 'is_active', 'created_at', 'updated_at']


class PricingConfigDropdownOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingConfigDropdownOption
        fields = ['id', 'label', 'order', 'is_active']


class PricingConfigCardPriceSerializer(serializers.ModelSerializer):
    unit_range_label = serializers.CharField(source='unit_range.label', read_only=True)

    class Meta:
        model = PricingConfigCardPrice
        fields = ['id', 'unit_range', 'unit_range_label', 'price', 'old_price']


class PricingConfigCardSerializer(serializers.ModelSerializer):
    prices = PricingConfigCardPriceSerializer(many=True, read_only=True)

    class Meta:
        model = PricingConfigCard
        fields = ['id', 'image', 'image_alt', 'title', 'description', 'button_text', 'sort_order', 'is_active', 'prices', 'show_banner', 'banner_text', 'banner_type', 'banner_bg_color', 'banner_text_color', 'banner_icon', 'banner_priority', 'banner_expiry']


class PricingConfigCTASerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingConfigCTA
        fields = ['id', 'button_text', 'url', 'open_in_new_tab']


class PricingConfigSectionSerializer(serializers.ModelSerializer):
    dropdown_options = PricingConfigDropdownOptionSerializer(many=True, read_only=True)
    cards = PricingConfigCardSerializer(many=True, read_only=True)
    cta = PricingConfigCTASerializer(read_only=True)

    class Meta:
        model = PricingConfigSection
        fields = ['id', 'is_active', 'subtitle', 'title', 'description', 'dropdown_options', 'cards', 'cta', 'created_at', 'updated_at']


class PricingPromotionSectionSerializer(serializers.ModelSerializer):
    image_desktop = serializers.SerializerMethodField()
    image_mobile = serializers.SerializerMethodField()
    image_desktop_alt = serializers.CharField(read_only=True)
    image_mobile_alt = serializers.CharField(read_only=True)

    class Meta:
        model = PricingPromotionSection
        fields = ['id', 'is_active', 'badge_text', 'title', 'subtitle', 'description', 'image_desktop', 'image_desktop_alt', 'image_mobile', 'image_mobile_alt', 'cta_text', 'cta_url', 'bg_color', 'use_theme_color', 'text_color', 'accent_color', 'start_date', 'end_date', 'display_order']

    def get_image_desktop(self, obj):
        if obj.image_desktop:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_desktop.url)
            return obj.image_desktop.url
        return None

    def get_image_mobile(self, obj):
        if obj.image_mobile:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_mobile.url)
            return obj.image_mobile.url
        return None


# ─── Dynamic Pricing Serializers ───

class ServiceUnitRangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceUnitRange
        fields = ['id', 'label', 'sort_order', 'is_active']


class ServicePricingCardPriceSerializer(serializers.ModelSerializer):
    unit_range_label = serializers.CharField(source='unit_range.label', read_only=True)

    class Meta:
        model = ServicePricingCardPrice
        fields = ['id', 'unit_range', 'unit_range_label', 'price', 'original_price']


class ServicePricingCardSerializer(serializers.ModelSerializer):
    prices = ServicePricingCardPriceSerializer(many=True, read_only=True)

    class Meta:
        model = ServicePricingCard
        fields = ['id', 'name', 'description', 'features', 'image', 'image_alt',
                  'badge_text', 'badge_color', 'button_text',
                  'sort_order', 'is_active', 'prices']


class ServicePricingSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='title', read_only=True)
    description = serializers.CharField(source='short_description', read_only=True)
    sort_order = serializers.IntegerField(source='order', read_only=True)
    unit_ranges = ServiceUnitRangeSerializer(many=True, read_only=True)
    cards = ServicePricingCardSerializer(many=True, read_only=True, source='pricing_cards')

    class Meta:
        model = Service
        fields = ['id', 'name', 'slug', 'description', 'is_active', 'sort_order',
                  'unit_ranges', 'cards']


class FreeTrialAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreeTrialAttachment
        fields = ['id', 'file', 'original_filename', 'uploaded_at']
        read_only_fields = ['id', 'original_filename', 'uploaded_at']


class FreeTrialSerializer(serializers.ModelSerializer):
    attachments = FreeTrialAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = FreeTrial
        fields = [
            'id', 'full_name', 'company_name', 'email', 'phone_number',
            'product_name', 'product_category', 'drive_link',
            'project_requirements', 'attachments', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class WhyChooseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhyChooseItem
        fields = ['id', 'company_name', 'description', 'speed', 'flexibility', 'quality', 'scalability', 'cost_effectiveness', 'display_order']


class WhyChooseSectionSerializer(serializers.ModelSerializer):
    items = WhyChooseItemSerializer(many=True, read_only=True)

    class Meta:
        model = WhyChooseSection
        fields = ['id', 'title', 'highlighted_word', 'subtitle', 'is_active', 'items', 'created_at', 'updated_at']


class WhyChooseFeatureItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhyChooseFeatureItem
        fields = ['id', 'icon', 'title', 'description', 'display_order', 'is_active']


class WhyChooseFeatureSectionSerializer(serializers.ModelSerializer):
    items = WhyChooseFeatureItemSerializer(many=True, read_only=True)

    class Meta:
        model = WhyChooseFeatureSection
        fields = ['id', 'title', 'subtitle', 'featured_image', 'featured_image_alt', 'is_active', 'items', 'created_at', 'updated_at']
