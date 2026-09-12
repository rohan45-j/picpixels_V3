from django import forms
from django.contrib import admin, messages
from django.db import models
from django.utils import timezone
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from unfold.decorators import display
from core.widgets import CustomToggleSwitch, ModernDateTimeWidget, ModernDateWidget
from .widgets import ContentBlockPreviewWidget, TagInputWidget, ColorPickerWidget
from .image_guidelines import IMG as IMG_GUIDELINES

def _size_guide(key):
    text = IMG_GUIDELINES.get(key, '')
    lines = text.strip().split('\n')
    return lines[0] if lines else ''


def _img_preview_html(url, size='max-height:48px;border-radius:4px'):
    return format_html('<img src="{}" style="{}" />', url, size)


import json
from .models import (
    PageCategory, Page, Section, Banner, Service, ServiceGalleryImage, ServiceContentSection, ServiceHeroImage,
    HeroSection, HeroSlide, HeroStat, Testimonial,
    Author, BlogCategory, BlogTag, BlogPost, BlogContentSection, BlogDocumentBlock,
    FAQCategory, FAQ, ContactInquiry, TeamMember, BrandLogo,
    PricingPlan, Technology, PricingPromotionSection,
    PricingConfigSection, PricingConfigDropdownOption, PricingConfigCard, PricingConfigCardPrice, PricingConfigCTA,
    FreeTrial, FreeTrialAttachment,
    ServiceUnitRange, ServicePricingCard, ServicePricingCardPrice,
    WhyChooseSection, WhyChooseItem, WhyChooseFeatureSection, WhyChooseFeatureItem,
    HomepageCTASection,
    ServiceEEAT, ServiceBrandLogo,
    ServiceWhyNeedFeature, ServiceProcessStep,
    ServiceWhyChooseCard, ServiceTool,
    ServicePricingTierCard, ServiceClientFeedback,
)


@admin.register(PageCategory)
class PageCategoryAdmin(ModelAdmin):
    list_display = ('name', 'slug', 'page_count', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('order', 'name')
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }

    def page_count(self, obj):
        return obj.pages.count()
    page_count.short_description = 'Pages'


@admin.register(Page)
class PageAdmin(ModelAdmin):
    list_display = ('title', 'category', 'slug', 'schema_type', 'is_active', 'updated_at')
    list_editable = ('is_active',)
    list_filter = ('category', 'schema_type', 'is_active')
    search_fields = ('title', 'slug')
    prepopulated_fields = {'slug': ('title',)}
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        ('Page Content & Details', {
            'fields': ('title', 'title_color', 'category', 'slug', 'is_active', 'content'),
        }),
        ('SEO & Meta Tags', {
            'classes': ('collapse',),
            'fields': ('meta_title', 'meta_description', 'seo_title', 'seo_description'),
        }),
        ('🏷️ Schema Markup (Structured Data)', {
            'fields': ('schema_type', 'custom_schema'),
            'description': 'Select the Schema.org type for this page or provide custom JSON-LD (without <script> tags).',
        }),
    )


@admin.register(Section)
class SectionAdmin(ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('name', 'data'),
        }),
    )


@admin.register(Banner)
class BannerAdmin(ModelAdmin):
    list_display = ('title', 'order', 'cta_text', 'image_preview')
    ordering = ('order',)
    search_fields = ('title',)
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('title', 'subtitle', 'image', 'alt_text', 'order'),
        }),
        ('Call to Action', {
            'fields': ('cta_text', 'cta_link'),
        }),
    )

    @display(description='Preview')
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:48px;border-radius:6px" />', obj.image.url)
        return '-'


class ServiceHeroImageInline(TabularInline):
    model = ServiceHeroImage
    extra = 1
    fields = ('image', 'image_preview', 'alt_text', 'order', 'is_active')
    readonly_fields = ('image_preview',)
    ordering = ('order',)
    verbose_name = 'Hero Image'
    verbose_name_plural = 'Hero Slides (Carousel)'
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }

    @display(description='Preview')
    def image_preview(self, obj):
        if obj.image:
            return _img_preview_html(obj.image.url)
        return '-'


class ServiceGalleryImageForm(forms.ModelForm):
    class Meta:
        model = ServiceGalleryImage
        fields = '__all__'
        help_texts = {
            'gallery_type': '',
            'category': '',
            'image': 'Recommended: 1600 × 1200 px (4:3)',
            'before_image': 'Recommended: 1600 × 1200 px (4:3)',
            'after_image': 'Recommended: 1600 × 1200 px (4:3)',
            'before_image_alt': '',
            'after_image_alt': '',
            'alt_text': '',
            'caption': '',
        }

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get('DELETE'):
            return cleaned_data

        gallery_type = cleaned_data.get('gallery_type')
        image = cleaned_data.get('image')
        before_image = cleaned_data.get('before_image')
        after_image = cleaned_data.get('after_image')

        if gallery_type in ('portfolio', 'case_study'):
            if not image and not getattr(self.instance, 'image', None):
                self.add_error('image', 'Image is required for Portfolio / Case Study.')
        elif gallery_type == 'before_after':
            has_before = bool(before_image or getattr(self.instance, 'before_image', None))
            has_after = bool(after_image or getattr(self.instance, 'after_image', None))
            if has_before and not has_after:
                self.add_error('after_image', 'After image is required to complete the Before & After pair.')
            elif has_after and not has_before:
                self.add_error('before_image', 'Before image is required to complete the Before & After pair.')

        return cleaned_data


class ServiceGalleryImageInline(TabularInline):
    model = ServiceGalleryImage
    form = ServiceGalleryImageForm
    extra = 1
    fields = ('gallery_type', 'category', 'image', 'image_preview', 'alt_text',
              'before_image', 'before_image_alt', 'after_image', 'after_image_alt',
              'caption', 'is_featured', 'is_visible', 'order')
    readonly_fields = ('image_preview',)
    ordering = ('order',)
    classes = ('collapse',)
    verbose_name = 'Gallery Image'
    verbose_name_plural = 'Portfolio, Gallery & Before / After'

    @display(description='Preview')
    def image_preview(self, obj):
        # Preview is strictly for Portfolio / Case Study showcase images, not Before & After
        if obj.gallery_type in ('portfolio', 'case_study') and obj.image:
            return _img_preview_html(obj.image.url, 'max-height:44px;border-radius:4px')
        return '-'


class ServiceContentSectionForm(forms.ModelForm):
    class Meta:
        model = ServiceContentSection
        fields = '__all__'
        widgets = {
            'is_active': CustomToggleSwitch,
            'content': forms.Textarea(attrs={'rows': 4, 'placeholder': 'Write your content here. Plain text only.'}),
        }

    class Media:
        js = ('admin/js/service_content_section.js?v=2',)


class ServiceContentSectionInline(TabularInline):
    model = ServiceContentSection
    form = ServiceContentSectionForm
    extra = 1
    fields = ('layout', 'heading', 'content', 'image', 'image_preview', 'image_alt', 'order', 'is_active')
    readonly_fields = ('image_preview',)
    ordering = ('order',)
    verbose_name = 'Other Content'
    verbose_name_plural = 'Others Content'
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }

    @display(description='Preview')
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<div style="display:flex;align-items:center;gap:8px">'
                '{}<span style="font-size:10px;color:#6b7280">{}</span>'
                '</div>',
                _img_preview_html(obj.image.url),
                _size_guide('service_content')
            )
        return format_html(
            '<span style="font-size:10px;color:#6b7280">{}</span>',
            _size_guide('service_content')
        )


class ServiceFAQInline(TabularInline):
    model = FAQ
    extra = 1
    fields = ('question', 'answer', 'order', 'is_active')
    ordering = ('order',)
    verbose_name = 'Question'
    verbose_name_plural = 'Frequently Asked Questions'
    classes = ('collapse',)
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }


class ServiceEEATForm(forms.ModelForm):
    class Meta:
        model = ServiceEEAT
        fields = '__all__'
        widgets = {
            'is_active': CustomToggleSwitch,
            'experience': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Describe your hands-on experience in this field...'}),
            'expertise': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Highlight your technical expertise and specializations...'}),
            'authoritativeness': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Mention awards, certifications, or industry recognition...'}),
            'trustworthiness': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Share trust signals like client count, guarantees, or policies...'}),
        }


class ServiceEEATInline(TabularInline):
    model = ServiceEEAT
    form = ServiceEEATForm
    max_num = 1
    extra = 0
    fields = ('experience', 'expertise', 'authoritativeness', 'trustworthiness', 'is_active')
    verbose_name = 'Expertise & Trust'
    verbose_name_plural = 'Expertise & Trust'
    classes = ('collapse',)
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }


class ServiceBrandLogoInline(TabularInline):
    model = ServiceBrandLogo
    extra = 1
    fields = ('logo', 'logo_preview', 'logo_alt', 'brand_name', 'display_order', 'is_active')
    readonly_fields = ('logo_preview',)
    ordering = ('display_order',)
    verbose_name = 'Brand Logo'
    verbose_name_plural = 'Brand Logos'
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }

    @display(description='Preview')
    def logo_preview(self, obj):
        if obj.logo:
            return format_html(
                '<div style="display:flex;align-items:center;gap:8px">'
                '{}<span style="font-size:10px;color:#6b7280">{}</span>'
                '</div>',
                _img_preview_html(obj.logo.url, 'max-height:40px;border-radius:4px'),
                _size_guide('brand_logo')
            )
        return format_html(
            '<span style="font-size:10px;color:#6b7280">{}</span>',
            _size_guide('brand_logo')
        )


class ServiceWhyNeedFeatureInline(TabularInline):
    model = ServiceWhyNeedFeature
    extra = 1
    fields = ('title', 'description', 'icon_image', 'icon_preview', 'display_order', 'is_active')
    readonly_fields = ('icon_preview',)
    ordering = ('display_order',)
    verbose_name = 'Service Benefit'
    verbose_name_plural = 'Service Benefits'
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }

    @display(description='Icon')
    def icon_preview(self, obj):
        if obj.icon_image:
            return format_html(
                '<div style="display:flex;align-items:center;gap:8px">'
                '{}<span style="font-size:10px;color:#6b7280">Recommended: 200×200 px</span>'
                '</div>',
                _img_preview_html(obj.icon_image.url, 'max-height:40px;border-radius:4px')
            )
        return format_html(
            '<span style="font-size:10px;color:#6b7280">Recommended: 200×200 px</span>'
        )


class ServiceProcessStepInline(TabularInline):
    model = ServiceProcessStep
    extra = 1
    fields = ('step_number', 'title', 'description', 'image', 'image_preview', 'image_alt', 'display_order', 'is_active')
    readonly_fields = ('image_preview',)
    ordering = ('display_order',)
    verbose_name = 'Step'
    verbose_name_plural = 'Steps'
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }

    @display(description='Image')
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<div style="display:flex;align-items:center;gap:8px">'
                '{}<span style="font-size:10px;color:#6b7280">Optional — icon or diagram</span>'
                '</div>',
                _img_preview_html(obj.image.url, 'max-height:40px;border-radius:4px')
            )
        return format_html(
            '<span style="font-size:10px;color:#6b7280">Optional — icon or diagram</span>'
        )


class ServiceWhyChooseCardInline(TabularInline):
    model = ServiceWhyChooseCard
    extra = 1
    fields = ('title', 'description', 'icon_image', 'icon_preview', 'display_order', 'is_active')
    readonly_fields = ('icon_preview',)
    ordering = ('display_order',)
    verbose_name = 'Why Choose Us Benefit'
    verbose_name_plural = 'Why Choose Us Benefits'
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }

    @display(description='Icon')
    def icon_preview(self, obj):
        if obj.icon_image:
            return format_html(
                '<div style="display:flex;align-items:center;gap:8px">'
                '{}<span style="font-size:10px;color:#6b7280">Recommended: 200×200 px</span>'
                '</div>',
                _img_preview_html(obj.icon_image.url, 'max-height:40px;border-radius:4px')
            )
        return format_html(
            '<span style="font-size:10px;color:#6b7280">Recommended: 200×200 px</span>'
        )


class ServiceToolInline(TabularInline):
    model = ServiceTool
    extra = 1
    fields = ('logo', 'logo_preview', 'logo_alt', 'name', 'short_description', 'display_order', 'is_active')
    readonly_fields = ('logo_preview',)
    ordering = ('display_order',)
    verbose_name = 'Tool'
    verbose_name_plural = 'Tools'
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }

    @display(description='Preview')
    def logo_preview(self, obj):
        if obj.logo:
            return format_html(
                '<div style="display:flex;align-items:center;gap:8px">'
                '{}<span style="font-size:10px;color:#6b7280">{}</span>'
                '</div>',
                _img_preview_html(obj.logo.url, 'max-height:40px;border-radius:4px'),
                _size_guide('technology_icon')
            )
        return format_html(
            '<span style="font-size:10px;color:#6b7280">{}</span>',
            _size_guide('technology_icon')
        )


class ServicePricingTierCardForm(forms.ModelForm):
    class Meta:
        model = ServicePricingTierCard
        fields = '__all__'
        widgets = {
            'features': TagInputWidget(),
        }

    def clean_features(self):
        data = self.cleaned_data.get('features')
        if isinstance(data, str):
            try:
                return json.loads(data)
            except json.JSONDecodeError:
                return []
        return data if isinstance(data, list) else []


class ServicePricingTierCardInline(StackedInline):
    model = ServicePricingTierCard
    form = ServicePricingTierCardForm
    extra = 0
    ordering = ('display_order',)
    verbose_name = 'Pricing Plan'
    verbose_name_plural = 'Pricing Plans'
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        ('Plan Details', {
            'fields': (
                ('name', 'display_order', 'is_active', 'is_popular'),
                ('price', 'original_price'),
                'description',
                'features',
                ('badge_text', 'badge_color'),
                ('button_text', 'button_link'),
            ),
        }),
    )


class ServiceClientFeedbackInline(TabularInline):
    model = ServiceClientFeedback
    extra = 1
    fields = ('client_name', 'company', 'designation', 'photo', 'photo_preview',
              'photo_alt', 'rating', 'review', 'display_order', 'is_active')
    readonly_fields = ('photo_preview',)
    ordering = ('display_order',)
    verbose_name = 'Client Feedback'
    verbose_name_plural = 'Client Feedbacks'
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }

    @display(description='Photo')
    def photo_preview(self, obj):
        if obj.photo:
            return format_html(
                '<div style="display:flex;align-items:center;gap:8px">'
                '{}<span style="font-size:10px;color:#6b7280">{}</span>'
                '</div>',
                format_html('<img src="{}" style="width:32px;height:32px;border-radius:50%;object-fit:cover" />', obj.photo.url),
                _size_guide('testimonial_avatar')
            )
        return format_html(
            '<span style="font-size:10px;color:#6b7280">{}</span>',
            _size_guide('testimonial_avatar')
        )


class ServiceAdminForm(forms.ModelForm):
    class Meta:
        model = Service
        fields = '__all__'
        widgets = {
            'title_color': ColorPickerWidget(),
            'why_choose_title_color': ColorPickerWidget(),
            'why_need_title_color': ColorPickerWidget(),
            'process_title_color': ColorPickerWidget(),
            'overview_title_color': ColorPickerWidget(),
            'faq_title_color': ColorPickerWidget(),
            'review_title_color': ColorPickerWidget(),
            'pricing_heading_color': ColorPickerWidget(),
            'features': TagInputWidget(),
            'pricing_features': TagInputWidget(),
            'is_active': CustomToggleSwitch,
            'is_featured': CustomToggleSwitch,
            'show_in_mega_menu': CustomToggleSwitch,
            'show_on_homepage': CustomToggleSwitch,
            'show_in_footer': CustomToggleSwitch,
            'show_in_related': CustomToggleSwitch,
        }
        help_texts = {
            'title': 'The main name of this service, e.g. "Background Removal".',
            'title_color': 'Custom color for title (hex e.g. #FF8A50). Default is solid black.',
            'slug': 'Auto-generated from title. Used in the page URL.',
            'short_description': 'Brief one-liner shown on service cards across the site.',
            'description': 'Full description displayed on the service detail page.',
            'icon': 'Material icon name or emoji, e.g. "brush", "✨".',
            'image': 'Recommended: 800 × 600 px (4:3). Thumbnail shown on service cards and listings.',
            'image_alt': 'Describes the thumbnail for screen readers and SEO. Auto-fills with filename by default.',
            'hero_title': 'Main H1 headline for the hero section. (The service title will not appear in the hero). If blank, hero subtitle is used.',
            'hero_subtitle': 'Supporting subtitle or description shown in the hero section below the H1.',
            'hero_background': 'Recommended: 1600 × 1200 px (4:3). Large background image for the hero area.',
            'hero_image_alt': 'Alt text for the hero background image. Auto-fills with filename by default.',
            'hero_cta_text': 'Button label, e.g. "Start Free Trial".',
            'hero_cta_link': 'Button destination, e.g. "/free-trial" or "https://..."',
            'seo_title': 'Custom page title for search engines (overrides service title).',
            'seo_description': 'Brief description shown in search engine results.',
            'order': 'Controls the display order. Lower numbers appear first.',
            'why_choose_title': 'Section heading for the "Why Choose Us" section. (Default: "Why Choose Us")',
            'why_need_section_title': 'Section heading for the "Why Should You Need Our Service" section. (Default: "Why Should You Need Our Service")',
            'why_need_section_description': 'Brief intro text below the "Why Need" heading.',
            'process_section_title': 'Section heading for the "Process & Workflow" timeline. (Default: "Process & Workflow")',
            'overview_title': 'Section heading for the Overview / Key Features section. (Default: "Overview of [Service Title]")',
            'faq_title': 'Section heading for the FAQ section. (Default: "[Service Title] - FAQs")',
            'review_title': 'Section heading for the Client Reviews section. (Default: "Our Clients & Reviews")',
            'pricing_title': 'Pricing section heading, e.g. "Transparent Pricing".',
            'pricing_badge_text': 'Small label above pricing, e.g. "Simple, Transparent Pricing".',
            'pricing_heading': 'Main heading for the pricing section.',
            'pricing_description': 'Description text below the pricing heading.',
            'pricing_starting_price': 'Starting price shown prominently, e.g. "$5.00".',
            'pricing_unit': 'Price unit, e.g. "/image", "/hour", "/project".',
            'pricing_notes': 'Short note shown near the pricing, e.g. "No hidden fees".',
            'pricing_cta_text': 'Primary pricing button label, e.g. "Get Started".',
            'pricing_cta_link': 'Primary pricing button URL.',
            'pricing_cta2_text': 'Secondary button label, e.g. "View All Plans".',
            'pricing_cta2_link': 'Secondary button URL.',
        }

    def clean_features(self):
        data = self.cleaned_data.get('features')
        if isinstance(data, str):
            try:
                return json.loads(data)
            except json.JSONDecodeError:
                return []
        return data if isinstance(data, list) else []

    def clean_pricing_features(self):
        data = self.cleaned_data.get('pricing_features')
        if isinstance(data, str):
            try:
                return json.loads(data)
            except json.JSONDecodeError:
                return []
        return data if isinstance(data, list) else []


@admin.register(Service)
class ServiceAdmin(ModelAdmin):
    form = ServiceAdminForm
    list_display = ('title', 'slug', 'price_display', 'order', 'is_active', 'is_featured', 'show_in_mega_menu', 'show_on_homepage', 'show_in_footer', 'icon_display', 'image_preview')
    list_filter = ('is_active', 'is_featured', 'show_in_mega_menu', 'show_on_homepage', 'show_in_footer')
    list_filter_submit = True
    list_editable = ('order', 'is_active', 'is_featured', 'show_in_mega_menu', 'show_on_homepage', 'show_in_footer')
    search_fields = ('title', 'short_description', 'description')
    ordering = ('order',)
    prepopulated_fields = {'slug': ('title',)}
    list_fullwidth = True
    inlines = [
        ServiceHeroImageInline,
        ServiceGalleryImageInline,
        ServicePricingTierCardInline,
        ServiceFAQInline,
        ServiceWhyNeedFeatureInline,
        ServiceProcessStepInline,
        ServiceWhyChooseCardInline,
        ServiceEEATInline,
        ServiceContentSectionInline,
    ]
    readonly_fields = ('thumbnail_preview', 'hero_bg_preview')
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        ('Service Information', {
            'fields': (
                'title', 'title_color', 'slug',
                'short_description', 'description',
                'features', 'icon',
                'image', 'thumbnail_preview', 'image_alt',
            ),
            'description': _size_guide('service_thumbnail'),
        }),
        ('Hero Section', {
            'classes': ('collapse',),
            'fields': (
                'hero_title',
                'hero_subtitle',
                'hero_background', 'hero_bg_preview', 'hero_image_alt',
                'hero_cta_text', 'hero_cta_link',
            ),
            'description': _size_guide('service_hero_bg'),
        }),
        ('Section Titles & Headings', {
            'fields': (
                ('why_choose_title', 'why_choose_title_color'),
                ('why_need_section_title', 'why_need_title_color'),
                'why_need_section_description',
                ('process_section_title', 'process_title_color'),
                ('overview_title', 'overview_title_color'),
                ('faq_title', 'faq_title_color'),
                ('review_title', 'review_title_color'),
            ),
            'description': 'Customize section titles and their colors. 💡 Word Highlight Tip: Wrap any word in {Word} to highlight it in brand orange, or use {#FF8A50}Word{/#} for a custom color (e.g. "Why {Choose} Us").',
        }),
        ('Pricing', {
            'classes': ('collapse',),
            'fields': (
                'pricing_title', 'pricing_badge_text',
                ('pricing_heading', 'pricing_heading_color'),
                'pricing_description',
                'pricing_starting_price', 'pricing_unit', 'pricing_notes',
                'pricing_features',
                'pricing_cta_text', 'pricing_cta_link',
                'pricing_cta2_text', 'pricing_cta2_link',
            ),
        }),
        ('SEO & Display', {
            'classes': ('collapse',),
            'fields': (
                'seo_title', 'seo_description',
                'order', 'price',
                'is_active', 'is_featured',
                'show_in_mega_menu', 'show_on_homepage',
                'show_in_footer', 'show_in_related',
            ),
        }),
    )

    change_form_template = 'admin/cms/service/change_form.html'

    class Media:
        css = {
            'all': (
                'admin/css/service_admin.css',
                'admin/css/service_bulk_upload.css',
                'admin/css/service_admin_image_enhancer.css',
            ),
        }
        js = (
            'admin/js/service_bulk_upload.js',
            'admin/js/service_admin_image_enhancer.js',
        )

    @display(description='Price')
    def price_display(self, obj):
        if obj.price:
            return f'${obj.price:.2f}'
        return '-'

    @display(description='Icon')
    def icon_display(self, obj):
        if obj.icon:
            return format_html('<span class="material-symbols-outlined">{}</span>', obj.icon)
        return '-'

    @display(description='Thumbnail')
    def thumbnail_preview(self, obj):
        if obj.image:
            return format_html(
                '<div style="display:flex;align-items:center;gap:8px">'
                '{}<span style="font-size:10px;color:#6b7280">{}</span>'
                '</div>',
                _img_preview_html(obj.image.url, 'max-height:60px;border-radius:6px'),
                _size_guide('service_thumbnail')
            )
        return format_html(
            '<span style="font-size:10px;color:#6b7280">{}</span>',
            _size_guide('service_thumbnail')
        )

    @display(description='Hero Background')
    def hero_bg_preview(self, obj):
        if obj.hero_background:
            return format_html(
                '<div style="display:flex;align-items:center;gap:8px">'
                '{}<span style="font-size:10px;color:#6b7280">{}</span>'
                '</div>',
                _img_preview_html(obj.hero_background.url, 'max-height:60px;border-radius:6px'),
                _size_guide('service_hero_bg')
            )
        return format_html(
            '<span style="font-size:10px;color:#6b7280">{}</span>',
            _size_guide('service_hero_bg')
        )

    @display(description='Image')
    def image_preview(self, obj):
        return self.thumbnail_preview(obj)

    @display(description='Active')
    def is_active_status(self, obj):
        if obj.is_active:
            return mark_safe('<span style="color:#10b981">Active</span>')
        return mark_safe('<span style="color:#ef4444">Inactive</span>')

    def save_model(self, request, obj, form, change):
        """Save the service, then process any bulk-uploaded images.

        All bulk record creation is wrapped in transaction.atomic() so that
        a failure during bulk processing never leaves orphan records.
        """
        from django.db import transaction
        from urllib.parse import urlparse, unquote
        from django.core.files.base import ContentFile
        from django.core.files.storage import default_storage

        def _resolve_path(url):
            url = unquote(url)
            if url.startswith('/media/'):
                return url[len('/media/'):]
            elif url.startswith('http://') or url.startswith('https://'):
                parsed = urlparse(url)
                p = unquote(parsed.path).lstrip('/')
                return p[len('media/'):] if p.startswith('media/') else p
            return url.lstrip('/')

        def _read_file(url):
            rel_path = _resolve_path(url).replace('\\', '/').lstrip('/')
            file_name = rel_path.split('/')[-1]
            return default_storage.open(rel_path).read(), file_name

        # Process bulk upload data from the hidden JSON field
        raw = request.POST.get('bulk_uploads_json', '')
        bulk_data = {}
        if raw:
            if isinstance(raw, str):
                raw = raw.strip()
                if raw:
                    try:
                        bulk_data = json.loads(raw)
                    except (json.JSONDecodeError, ValueError, TypeError):
                        bulk_data = {}
            elif isinstance(raw, dict):
                bulk_data = raw

        has_hero = bool(bulk_data.get('hero_images'))
        has_gallery = bool(bulk_data.get('gallery_images'))
        has_ba = bool(bulk_data.get('before_after_pairs'))

        if not (has_hero or has_gallery or has_ba):
            super().save_model(request, obj, form, change)
            return

        try:
            with transaction.atomic():
                super().save_model(request, obj, form, change)

                # Process hero images
                hero_items = bulk_data.get('hero_images', [])
                if hero_items:
                    max_order = ServiceHeroImage.objects.filter(
                        service=obj
                    ).order_by('-order').values_list('order', flat=True).first() or 0
                    for idx, item in enumerate(hero_items):
                        url = item.get('url', '')
                        if not url:
                            continue
                        try:
                            file_content, file_name = _read_file(url)
                            hero_image = ServiceHeroImage(
                                service=obj,
                                alt_text=item.get('alt_text', ''),
                                order=max_order + idx + 1,
                                is_active=True,
                            )
                            hero_image.image.save(file_name, ContentFile(file_content), save=True)
                        except Exception as e:
                            messages.warning(
                                request,
                                'Bulk hero image "{}" failed: {}'.format(item.get("url", ""), e),
                            )

                # Process gallery images
                gallery_items = bulk_data.get('gallery_images', [])
                if gallery_items:
                    max_order = ServiceGalleryImage.objects.filter(
                        service=obj
                    ).order_by('-order').values_list('order', flat=True).first() or 0
                    for idx, item in enumerate(gallery_items):
                        url = item.get('url', '')
                        if not url:
                            continue
                        try:
                            file_content, file_name = _read_file(url)
                            gallery_image = ServiceGalleryImage(
                                service=obj,
                                gallery_type=item.get('gallery_type', 'portfolio'),
                                category=item.get('category', ''),
                                alt_text=item.get('alt_text', ''),
                                caption=item.get('caption', ''),
                                is_featured=item.get('is_featured', False),
                                is_visible=item.get('is_visible', True),
                                order=max_order + idx + 1,
                            )
                            gallery_image.image.save(file_name, ContentFile(file_content), save=True)
                        except Exception as e:
                            messages.warning(
                                request,
                                'Bulk gallery image "{}" failed: {}'.format(item.get("url", ""), e),
                            )

                # Process before/after pairs
                ba_items = bulk_data.get('before_after_pairs', [])
                if ba_items:
                    max_order = ServiceGalleryImage.objects.filter(
                        service=obj
                    ).order_by('-order').values_list('order', flat=True).first() or 0
                    for idx, item in enumerate(ba_items):
                        before_url = item.get('url', '')
                        after_url = item.get('after_url', '')
                        if not before_url or not after_url:
                            continue
                        try:
                            before_content, before_name = _read_file(before_url)
                            after_content, after_name = _read_file(after_url)

                            ba_image = ServiceGalleryImage(
                                service=obj,
                                gallery_type='before_after',
                                before_image_alt=item.get('before_image_alt', ''),
                                after_image_alt=item.get('after_image_alt', ''),
                                caption=item.get('caption', ''),
                                is_featured=item.get('is_featured', False),
                                is_visible=item.get('is_visible', True),
                                order=max_order + idx + 1,
                            )
                            ba_image.before_image.save(
                                before_name, ContentFile(before_content), save=False
                            )
                            ba_image.after_image.save(
                                after_name, ContentFile(after_content), save=True
                            )
                        except Exception as e:
                            messages.warning(
                                request,
                                'Bulk before/after pair #{} failed: {}'.format(idx + 1, e),
                            )
        except Exception as err:
            # Fallback: save service without bulk images if atomic block fails
            import logging
            logging.getLogger(__name__).warning('Bulk uploads failed during service save: %s', err, exc_info=True)
            super().save_model(request, obj, form, change)
            messages.error(
                request,
                'One or more bulk uploads failed. '
                'The service was saved without the bulk images.',
            )


@admin.register(ServiceGalleryImage)
class ServiceGalleryImageAdmin(ModelAdmin):
    list_select_related = ('service',)
    list_display = ('service', 'gallery_type', 'category', 'alt_text', 'is_featured', 'is_visible', 'order', 'image_preview')
    list_filter = ('gallery_type', 'is_featured', 'is_visible')
    ordering = ('service', 'order')
    search_fields = ('alt_text', 'caption', 'category')
    list_fullwidth = True
    fieldsets = (
        ('📌 Service Page Media', {
            'fields': ('service', 'gallery_type', 'category', 'image', 'alt_text', 'caption'),
        }),
        ('📌 Before & After Comparison', {
            'fields': ('before_image', 'before_image_alt', 'after_image', 'after_image_alt'),
            'description': 'For the best comparison, use before and after images with the same angle, framing, and lighting.',
        }),
        ('Display Settings', {
            'fields': ('is_featured', 'is_visible', 'order'),
        }),
    )

    @display(description='Image')
    def image_preview(self, obj):
        previews = []
        if obj.image:
            previews.append(format_html('<img src="{}" style="max-height:40px;border-radius:4px" />', obj.image.url))
        if obj.before_image:
            previews.append(format_html('<div style="font-size:10px;color:#666">Before:</div><img src="{}" style="max-height:36px;border-radius:4px" />', obj.before_image.url))
        if obj.after_image:
            previews.append(format_html('<div style="font-size:10px;color:#666">After:</div><img src="{}" style="max-height:36px;border-radius:4px" />', obj.after_image.url))
        return mark_safe('<div style="display:flex;gap:6px;align-items:center">' + ''.join(str(p) for p in previews) + '</div>') if previews else '-'


@admin.register(ServiceContentSection)
class ServiceContentSectionAdmin(ModelAdmin):
    list_select_related = ('service',)
    list_display = ('service', 'layout', 'heading', 'order', 'is_active', 'image_preview')
    list_editable = ('is_active',)
    list_filter = ('layout', 'is_active')
    ordering = ('service', 'order')
    search_fields = ('heading', 'content')
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        ('Content Block', {
            'fields': ('service', 'layout', 'heading', 'content', 'order'),
        }),
        ('📌 Service Page Media', {
            'fields': ('image', 'image_alt'),
        }),
        ('Settings', {
            'fields': ('is_active',),
            'classes': ('collapse',),
        }),
    )

    @display(description='Image')
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:40px;border-radius:4px" />', obj.image.url)
        return '-'


@admin.register(ServiceHeroImage)
class ServiceHeroImageAdmin(ModelAdmin):
    list_select_related = ('service',)
    list_display = ('service', 'alt_text', 'order', 'is_active', 'image_preview')
    list_editable = ('is_active',)
    list_filter = ('is_active',)
    ordering = ('service', 'order')
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        ('📌 Service Page Media', {
            'fields': ('service', 'image', 'alt_text', 'order'),
        }),
        ('Settings', {
            'fields': ('is_active',),
            'classes': ('collapse',),
        }),
    )

    @display(description='Image')
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:40px;border-radius:4px" />', obj.image.url)
        return '-'


class HeroSlideInline(TabularInline):
    model = HeroSlide
    extra = 1
    fields = ('image', 'alt_text', 'order', 'image_preview')
    readonly_fields = ('image_preview',)
    ordering = ('order',)

    @display(description='Preview')
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:48px;border-radius:4px" />', obj.image.url)
        return '-'


class HeroStatInline(TabularInline):
    model = HeroStat
    extra = 1
    fields = ('value', 'label', 'order')
    ordering = ('order',)


@admin.register(HeroSection)
class HeroSectionAdmin(ModelAdmin):
    list_display = ('title_preview', 'is_active', 'updated_at')
    list_editable = ('is_active',)
    list_fullwidth = True
    inlines = [HeroSlideInline, HeroStatInline]
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        (None, {
            'fields': ('is_active',),
        }),
        ('Hero Content', {
            'fields': ('tagline', 'title', 'title_color', 'description', 'background_image', 'background_image_alt'),
        }),
        ('Primary CTA', {
            'fields': ('cta_primary_text', 'cta_primary_link'),
        }),
        ('Secondary CTA', {
            'fields': ('cta_secondary_text', 'cta_secondary_link'),
        }),
    )

    @display(description='Title')
    def title_preview(self, obj):
        return obj.title[:80] + '...' if len(obj.title) > 80 else obj.title


@admin.register(HeroSlide)
class HeroSlideAdmin(ModelAdmin):
    list_select_related = ('hero_section',)
    list_display = ('hero_section', 'alt_text', 'order', 'image_preview')
    ordering = ('hero_section', 'order')
    search_fields = ('alt_text',)
    list_fullwidth = True
    fieldsets = (
        ('📌 Hero Section Media', {
            'fields': ('hero_section', 'image', 'alt_text', 'order'),
        }),
    )

    @display(description='Image')
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:48px;border-radius:4px" />', obj.image.url)
        return '-'


@admin.register(HeroStat)
class HeroStatAdmin(ModelAdmin):
    list_select_related = ('hero_section',)
    list_display = ('hero_section', 'value', 'label', 'order')
    ordering = ('hero_section', 'order')
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('hero_section', 'value', 'label', 'order'),
        }),
    )


@admin.register(Testimonial)
class TestimonialAdmin(ModelAdmin):
    list_display = ('client_name', 'rating_stars', 'order', 'is_active', 'avatar_preview')
    list_filter = ('rating', 'is_active')
    list_filter_submit = True
    ordering = ('order',)
    search_fields = ('client_name',)
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        (None, {
            'fields': ('client_name', 'client_role', 'company', 'text', 'rating', 'avatar', 'avatar_alt', 'order', 'is_active'),
        }),
    )

    @display(description='Rating')
    def rating_stars(self, obj):
        stars = '★' * obj.rating + '☆' * (5 - obj.rating)
        color = '#f59e0b'
        return format_html('<span style="color:{}">{}</span>', color, stars)

    @display(description='Avatar')
    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" style="width:32px;height:32px;border-radius:50%;object-fit:cover" />', obj.avatar.url)
        return '-'


@admin.register(Author)
class AuthorAdmin(ModelAdmin):
    list_display = ('name', 'designation', 'is_active', 'sort_order', 'image_preview')
    list_editable = ('is_active', 'sort_order')
    list_filter = ('is_active',)
    search_fields = ('name', 'designation', 'bio', 'email')
    prepopulated_fields = {'slug': ('name',)}
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        ('Profile', {
            'fields': ('name', 'slug', 'designation', 'bio', 'image', 'image_alt'),
        }),
        ('Contact', {
            'fields': ('email',),
        }),
        ('Social Links', {
            'classes': ('collapse',),
            'fields': ('linkedin_url', 'facebook_url', 'twitter_url', 'instagram_url'),
        }),
        ('Settings', {
            'fields': ('is_active', 'sort_order'),
        }),
    )

    @display(description='Photo')
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width:48px;height:48px;border-radius:50%;object-fit:cover" />', obj.image.url)
        return '-'


@admin.register(BlogCategory)
class BlogCategoryAdmin(ModelAdmin):
    list_display = ('name', 'slug', 'order', 'post_count')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('order',)
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description', 'order'),
        }),
    )

    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = 'Posts'


@admin.register(BlogTag)
class BlogTagAdmin(ModelAdmin):
    list_display = ('name', 'slug', 'post_count')
    prepopulated_fields = {'slug': ('name',)}
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('name', 'slug'),
        }),
    )

    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = 'Posts'


class BlogContentSectionForm(forms.ModelForm):
    class Meta:
        model = BlogContentSection
        fields = '__all__'

    class Media:
        js = ('admin/js/blog_content_section.js',)


class BlogContentSectionInline(TabularInline):
    model = BlogContentSection
    form = BlogContentSectionForm
    extra = 1
    fields = ('template', 'heading', 'content', 'image', 'image_alt', 'order', 'image_preview')
    readonly_fields = ('image_preview',)
    ordering = ('order',)
    classes = ('collapse',)

    @display(description='Preview')
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:48px;border-radius:4px" />', obj.image.url)
        return '-'


class BlogDocumentBlockInline(TabularInline):
    model = BlogDocumentBlock
    extra = 1
    fields = ('title', 'file', 'description', 'download_text', 'sort_order', 'is_active')
    ordering = ('sort_order',)
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }


class BlogPostAdminForm(forms.ModelForm):
    class Meta:
        model = BlogPost
        fields = '__all__'
        widgets = {
            'content_blocks': ContentBlockPreviewWidget(),
            # 'published_at': ModernDateTimeWidget(),
            # 'scheduled_at': ModernDateTimeWidget(),
        }

    def clean_content_blocks(self):
        """Ensure content_blocks is stored as a Python list.
        The widget may return a JSON string; convert it to a list.
        """
        data = self.cleaned_data.get('content_blocks')
        if isinstance(data, str):
            try:
                return json.loads(data)
            except json.JSONDecodeError:
                raise forms.ValidationError('Invalid JSON in content blocks')
        return data

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        instance = kwargs.get('instance')
        if instance and instance.slug:
            self.fields['content_blocks'].widget.attrs['data-slug'] = instance.slug


@admin.register(BlogPost)
class BlogPostAdmin(ModelAdmin):
    form = BlogPostAdminForm
    change_form_template = 'admin/cms/blogpost/change_form.html'
    list_select_related = ('author_profile', 'category')
    list_display = ('title', 'category', 'status', 'is_featured', 'is_trending', 'reading_time', 'author_name', 'featured_image_thumb')
    list_filter = ('status', 'is_featured', 'is_trending', 'category', 'author_profile')
    list_filter_submit = True
    search_fields = ('title', 'excerpt', 'short_description', 'content')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('-published_at',)
    filter_horizontal = ('tags', 'related_services', 'related_posts')
    list_fullwidth = True
    fieldsets = (
        ('Blog Information', {
            'fields': ('title', 'slug', 'short_description', 'excerpt'),
        }),
        ('Publishing', {
            'classes': ('collapse',),
            'fields': ('status', 'is_published', 'author_profile', 'category', 'tags', 'published_at', 'scheduled_at', 'reading_time', 'is_featured', 'is_trending'),
        }),
    ('📸 Featured Media Images', {
        'fields': ('featured_image', 'featured_image_alt', 'hero_image', 'hero_image_alt'),
    }),
        ('Content Builder', {
            'fields': ('content_blocks', 'content'),
            'description': 'Build your page visually with the section builder above. The legacy "content" field is auto-mapped as a text block if content_blocks is empty.',
        }),
        ('Documents', {
            'classes': ('collapse',),
            'fields': (),
            'description': 'Add downloadable document blocks (PDF, DOC, etc.) for this post.',
        }),
    ('🔗 SEO & Social Share Images', {
        'classes': ('collapse',),
        'fields': ('meta_title', 'meta_description', 'canonical_url', 'og_title', 'og_description', 'og_image', 'og_image_alt', 'twitter_title', 'twitter_description', 'twitter_image', 'twitter_image_alt'),
    }),
        ('🏷️ Schema Markup (Structured Data)', {
            'fields': ('schema_type', 'custom_schema', 'faq_schema'),
            'description': 'Configure Schema.org type for this blog post. You can also paste custom JSON-LD (without <script> tags).',
        }),
        ('Advanced SEO', {
            'classes': ('collapse',),
            'fields': ('focus_keyword', 'secondary_keywords', 'key_takeaways', 'related_services', 'related_posts'),
        }),
    )
    inlines = [BlogDocumentBlockInline]

    class Media:
        css = {
            'all': ('admin/css/blog_post_admin.css',),
        }
        js = ('admin/js/blog_post_admin.js',)

    @display(description='Image')
    def featured_image_thumb(self, obj):
        if obj.featured_image:
            return format_html('<img src="{}" style="width:48px;height:36px;border-radius:4px;object-fit:cover" />', obj.featured_image.url)
        return '-'

    @display(description='Author')
    def author_name(self, obj):
        if obj.author_profile:
            return obj.author_profile.name
        return '-'


@admin.register(BlogContentSection)
class BlogContentSectionAdmin(ModelAdmin):
    list_select_related = ('blog_post',)
    list_display = ('blog_post', 'template', 'heading', 'order', 'image_preview')
    list_filter = ('template',)
    ordering = ('blog_post', 'order')
    search_fields = ('heading', 'content')
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('blog_post', 'template', 'heading', 'content', 'image', 'image_alt', 'order'),
        }),
    )

    @display(description='Image')
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:40px;border-radius:4px" />', obj.image.url)
        return '-'


@admin.register(BlogDocumentBlock)
class BlogDocumentBlockAdmin(ModelAdmin):
    list_select_related = ('blog_post',)
    list_display = ('title', 'blog_post', 'download_text', 'sort_order', 'is_active')
    list_filter = ('is_active', 'blog_post')
    ordering = ('blog_post', 'sort_order')
    search_fields = ('title', 'description')
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        (None, {
            'fields': ('blog_post', 'title', 'file', 'description', 'download_text', 'sort_order', 'is_active'),
        }),
    )


@admin.register(FAQCategory)
class FAQCategoryAdmin(ModelAdmin):
    list_display = ('name', 'order', 'faq_count')
    ordering = ('order',)
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('name', 'order'),
        }),
    )

    def faq_count(self, obj):
        return obj.faqs.count()
    faq_count.short_description = 'FAQs'


@admin.register(FAQ)
class FAQAdmin(ModelAdmin):
    list_select_related = ('category', 'service')
    list_display = ('question', 'category', 'is_portfolio_faq', 'is_homepage_faq', 'is_contact_faq', 'order', 'is_active')
    list_editable = ('is_portfolio_faq', 'is_homepage_faq', 'is_active')
    list_filter = ('category', 'is_portfolio_faq', 'is_homepage_faq', 'is_contact_faq', 'is_active', 'service')
    list_filter_submit = True
    ordering = ('order',)
    search_fields = ('question', 'answer')
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        ('FAQ Details', {
            'fields': ('question', 'answer', 'category', 'service', 'order', 'is_active'),
        }),
        ('Page Placements', {
            'fields': ('is_portfolio_faq', 'is_homepage_faq', 'is_contact_faq'),
            'description': 'Toggle which pages this FAQ should appear on (Portfolio Page, Homepage, Contact Page).',
        }),
    )

    @display(description='Service')
    def linked_service(self, obj):
        if obj.service:
            return obj.service.title
        return '-'


@admin.register(ContactInquiry)
class ContactInquiryAdmin(ModelAdmin):
    list_display = ('name', 'email', 'subject', 'unread_badge', 'created_at')
    list_filter = ('is_read', 'created_at')
    list_filter_submit = True
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('name', 'email', 'subject', 'message', 'created_at')
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('name', 'email', 'subject', 'message'),
        }),
        ('Status', {
            'fields': ('is_read', 'created_at'),
        }),
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return True

    @display(description='Status')
    def unread_badge(self, obj):
        if obj.is_read:
            return mark_safe('<span style="color:#9ca3af">Read</span>')
        return mark_safe('<span style="background:#ef444415;color:#ef4444;padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:600">Unread</span>')


@admin.register(TeamMember)
class TeamMemberAdmin(ModelAdmin):
    list_display = ('name', 'role', 'order', 'is_active', 'photo_preview')
    list_filter = ('is_active',)
    list_filter_submit = True
    ordering = ('order',)
    search_fields = ('name', 'role', 'email')
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        (None, {
            'fields': ('name', 'role', 'bio', 'photo', 'photo_alt', 'email', 'order', 'is_active'),
        }),
        ('Social Links', {
            'classes': ('collapse',),
            'fields': ('social_links',),
        }),
    )

    @display(description='Photo')
    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="width:32px;height:32px;border-radius:50%;object-fit:cover" />', obj.photo.url)
        return '-'


@admin.register(BrandLogo)
class BrandLogoAdmin(ModelAdmin):
    list_display = ('name', 'order', 'is_active', 'url', 'logo_preview')
    ordering = ('order',)
    search_fields = ('name',)
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        (None, {
            'fields': ('name', 'logo', 'logo_alt', 'url', 'order', 'is_active'),
        }),
    )

    @display(description='Logo')
    def logo_preview(self, obj):
        if obj.logo:
            return format_html('<img src="{}" style="max-height:40px;border-radius:4px" />', obj.logo.url)
        return '-'


@admin.register(PricingPlan)
class PricingPlanAdmin(ModelAdmin):
    list_display = ('title', 'image_preview', 'price_display', 'price_yearly_display', 'popular_badge', 'feature_count', 'order', 'is_popular', 'is_active')
    list_filter = ('is_popular', 'is_active')
    list_filter_submit = True
    ordering = ('order',)
    search_fields = ('title', 'description')
    list_fullwidth = True
    list_editable = ('order', 'is_popular', 'is_active')
    prepopulated_fields = {'slug': ('title',)}
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'description'),
        }),
        ('Card Image', {
            'fields': ('image', 'image_alt', 'image_preview_display'),
            'classes': ('wide',),
        }),
        ('Pricing', {
            'fields': ('price_monthly', 'price_yearly'),
        }),
        ('Features', {
            'fields': ('features',),
        }),
        ('CTA & Display', {
            'fields': ('button_text', 'button_link', 'order', 'is_popular', 'is_active'),
        }),
        ('🎯 Promotion Banner', {
            'classes': ('collapse',),
            'fields': (
                'show_banner', 'banner_text', 'banner_type', 'banner_icon',
                ('banner_bg_color', 'banner_text_color'),
                'banner_priority', 'banner_expiry',
            ),
            'description': 'Configure a promotional banner that appears above this pricing card. All fields are CMS-managed — no developer involvement needed for campaigns.',
        }),
    )
    readonly_fields = ('image_preview_display',)

    @display(description='Image')
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:40px;border-radius:6px;width:auto" />', obj.image.url)
        return mark_safe('<span style="color:#9ca3af">—</span>')

    @display(description='Image Preview')
    def image_preview_display(self, obj):
        if obj.image:
            return format_html(
                '<div style="padding:12px 0"><img src="{}" style="max-width:100%%;max-height:200px;border-radius:12px;border:1px solid rgba(0,0,0,0.08);box-shadow:0 2px 8px rgba(0,0,0,0.06)" /></div>',
                obj.image.url
            )
        return mark_safe('<div style="padding:16px 0;color:#9ca3af;font-size:0.85rem">No image uploaded. A placeholder will be shown on the frontend.</div>')

    @display(description='Monthly')
    def price_display(self, obj):
        return f'${obj.price_monthly:.2f}'

    @display(description='Yearly')
    def price_yearly_display(self, obj):
        if obj.price_yearly:
            return f'${obj.price_yearly:.2f}'
        return mark_safe('<span style="color:#9ca3af">—</span>')

    @display(description='Popular')
    def popular_badge(self, obj):
        if obj.is_popular:
            return mark_safe('<span style="background:#ff8a5015;color:#ff8a50;padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:600">★ Popular</span>')
        return mark_safe('<span style="color:#9ca3af">—</span>')

    @display(description='# Features')
    def feature_count(self, obj):
        return len(obj.features) if obj.features else 0

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'banner_expiry':
            # Use a single-value DateTimeField matching the single-input
            # ModernDateTimeWidget. The admin default (SplitDateTimeField /
            # MultiValueField) crashes with "NoneType has no len()" when the
            # field is submitted empty (see MultiValueField.has_changed).
            kwargs['form_class'] = forms.DateTimeField
            kwargs['widget'] = ModernDateTimeWidget()
        return super().formfield_for_dbfield(db_field, request, **kwargs)


@admin.register(Technology)
class TechnologyAdmin(ModelAdmin):
    list_display = ('title', 'display_order', 'is_active', 'icon_preview')
    list_filter = ('is_active',)
    list_editable = ('display_order', 'is_active')
    ordering = ('display_order',)
    search_fields = ('title',)
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        (None, {
            'fields': ('title', 'icon', 'icon_alt', 'display_order', 'is_active'),
        }),
    )

    @display(description='Icon')
    def icon_preview(self, obj):
        if obj.icon:
            return format_html('<img src="{}" style="max-height:40px;border-radius:4px" />', obj.icon.url)
        return mark_safe('<span style="color:#9ca3af">—</span>')


class PricingPromotionSectionForm(forms.ModelForm):
    # Declared explicitly so the single-input ModernDateTimeWidget is paired
    # with a single-value DateTimeField. Otherwise the admin default
    # (SplitDateTimeField / MultiValueField) crashes with "NoneType has no
    # len()" in MultiValueField.has_changed when the field is empty.
    start_date = forms.DateTimeField(
        widget=ModernDateTimeWidget(), required=False,
        help_text='Campaign goes live automatically on this date and time. Leave blank to start immediately.'
    )
    end_date = forms.DateTimeField(
        widget=ModernDateTimeWidget(), required=False,
        help_text='Campaign expires automatically after this date and time. Leave blank for no end date.'
    )

    class Meta:
        model = PricingPromotionSection
        fields = '__all__'
        widgets = {
            'is_active': CustomToggleSwitch,
            'use_theme_color': CustomToggleSwitch,
            'bg_color': forms.TextInput(attrs={'type': 'color', 'class': 'vColorField'}),
            'text_color': forms.TextInput(attrs={'type': 'color', 'class': 'vColorField'}),
            'accent_color': forms.TextInput(attrs={'type': 'color', 'class': 'vColorField'}),
        }
        help_texts = {
            'is_active': 'Toggle ON to show this promotion on the pricing page.',
            'use_theme_color': 'ON = uses website theme colors automatically. OFF = uses the custom HEX color below.',
            'badge_text': 'Short label above the title. Examples: "Limited Time Offer", "Special Deal".',
            'title': 'Main headline. Examples: "Get 30% Off This Month", "Black Friday Special".',
            'subtitle': 'Brief supporting text below the title.',
            'description': 'Detailed promotion description. Supports HTML for rich formatting.',
            'cta_text': 'Button label. Examples: "Claim Offer", "Get Started", "View Plans".',
            'cta_url': 'Destination URL or relative path. Examples: "/pricing", "/contact".',
            'bg_color': 'Section background color (HEX). Only used when "Use Theme Color" is OFF.',
            'text_color': 'Main text and description color (HEX).',
            'accent_color': 'Accent color for badge border and CTA button (HEX).',
            'start_date': 'Campaign goes live automatically on this date and time. Leave blank to start immediately.',
            'end_date': 'Campaign expires automatically after this date and time. Leave blank for no end date.',
            'display_order': 'Controls display order when multiple promotions exist. Lower numbers appear first.',
        }

    def clean(self):
        cleaned_data = super().clean()
        start = cleaned_data.get('start_date')
        end = cleaned_data.get('end_date')
        if start and end and end <= start:
            raise forms.ValidationError({
                'end_date': 'End date must be after the start date.',
            })
        return cleaned_data


@admin.register(PricingPromotionSection)
class PricingPromotionSectionAdmin(ModelAdmin):
    form = PricingPromotionSectionForm
    list_display = ('title_preview', 'badge_text', 'campaign_status_badge', 'display_order', 'is_active', 'updated_at')
    list_editable = ('is_active', 'display_order')
    list_filter = ('is_active',)
    search_fields = ('title', 'badge_text', 'description')
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    ordering = ('display_order', '-created_at')
    list_fullwidth = True
    fieldsets = (
        ('📌 Content', {
            'fields': ('badge_text', 'title', 'subtitle', 'description', 'cta_text', 'cta_url'),
            'description': 'Set the promotional message, call-to-action, and optional badge label.',
        }),
        ('📌 Scheduling', {
            'fields': ('is_active', ('start_date', 'end_date'), 'display_order'),
            'description': 'Toggle the campaign on/off and configure its active date range.',
        }),
        ('📌 Appearance', {
            'fields': ('bg_color', 'use_theme_color', 'text_color', 'accent_color', 'image_desktop', 'image_desktop_alt', 'image_mobile', 'image_mobile_alt'),
            'description': 'Control colors and upload a promotional banner image. Enable "Use Theme Color" to inherit the website design automatically.',
        }),
    )

    class Media:
        js = ('admin/js/pricing_promotion_admin.js',)
        css = {
            'all': ('admin/css/pricing_promotion_admin.css',),
        }

    @display(description='Title')
    def title_preview(self, obj):
        if obj.title:
            return obj.title[:60] + '...' if len(obj.title) > 60 else obj.title
        return mark_safe('<span style="color:#9ca3af">(no title)</span>')

    @display(description='Status')
    def campaign_status_badge(self, obj):
        now = timezone.now()
        if not obj.is_active:
            return mark_safe(
                '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;'
                'border-radius:100px;font-size:0.7rem;font-weight:600;letter-spacing:0.03em;'
                'background:#f3f4f6;color:#9ca3af;border:1px solid #e5e7eb">'
                '⏸ Disabled</span>'
            )
        if obj.start_date and obj.start_date > now:
            return mark_safe(
                '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;'
                'border-radius:100px;font-size:0.7rem;font-weight:600;letter-spacing:0.03em;'
                'background:#fef3c7;color:#92400e;border:1px solid #fde68a">'
                '⏳ Scheduled</span>'
            )
        if obj.end_date and obj.end_date < now:
            return mark_safe(
                '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;'
                'border-radius:100px;font-size:0.7rem;font-weight:600;letter-spacing:0.03em;'
                'background:#fee2e2;color:#991b1b;border:1px solid #fecaca">'
                '⌛ Expired</span>'
            )
        return mark_safe(
            '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;'
            'border-radius:100px;font-size:0.7rem;font-weight:600;letter-spacing:0.03em;'
            'background:#d1fae5;color:#065f46;border:1px solid #a7f3d0">'
            '● Live</span>'
        )




class PricingConfigDropdownOptionInline(TabularInline):
    model = PricingConfigDropdownOption
    extra = 1
    fields = ('label', 'order', 'is_active')
    ordering = ('order',)
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }


class PricingConfigCardInline(TabularInline):
    model = PricingConfigCard
    extra = 1
    fields = ('image', 'image_alt', 'title', 'description', 'button_text', 'sort_order', 'is_active', 'image_preview', 'show_banner')
    readonly_fields = ('image_preview',)
    ordering = ('sort_order',)
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }

    @display(description='Preview')
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:48px;border-radius:6px" />', obj.image.url)
        return '-'


class PricingConfigCTAInline(TabularInline):
    model = PricingConfigCTA
    max_num = 1
    extra = 0
    fields = ('button_text', 'url', 'open_in_new_tab')


class PricingConfigCardPriceInline(TabularInline):
    model = PricingConfigCardPrice
    extra = 3
    fields = ('card', 'unit_range', 'price', 'old_price')
    autocomplete_fields = ('card', 'unit_range')
    ordering = ('card__sort_order', 'unit_range__order')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        field = super().formfield_for_foreignkey(db_field, request, **kwargs)
        if db_field.name == 'card' and 'parent_object' in kwargs:
            field.queryset = field.queryset.filter(section=kwargs['parent_object'])
        if db_field.name == 'unit_range' and 'parent_object' in kwargs:
            field.queryset = field.queryset.filter(section=kwargs['parent_object'])
        return field

    def get_formset(self, request, obj=None, **kwargs):
        FormSet = super().get_formset(request, obj, **kwargs)
        original_init = FormSet.__init__

        def patched_init(self, *args, **kwargs):
            original_init(self, *args, **kwargs)
            if obj:
                for form in self.forms:
                    if 'card' in form.fields:
                        form.fields['card'].queryset = form.fields['card'].queryset.filter(section=obj)
                    if 'unit_range' in form.fields:
                        form.fields['unit_range'].queryset = form.fields['unit_range'].queryset.filter(section=obj)

        FormSet.__init__ = patched_init
        return FormSet


@admin.register(PricingConfigSection)
class PricingConfigSectionAdmin(ModelAdmin):
    list_display = ('title_preview', 'cards_count', 'dropdown_count', 'has_cta', 'is_active', 'updated_at')
    list_editable = ('is_active',)
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    inlines = [PricingConfigDropdownOptionInline, PricingConfigCardInline, PricingConfigCardPriceInline, PricingConfigCTAInline]

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        obj = form.instance
        for p in obj.card_prices.filter(section__isnull=True):
            p.section = obj
            p.save(update_fields=['section'])
    fieldsets = (
        (None, {
            'fields': ('is_active',),
        }),
        ('Content', {
            'fields': ('subtitle', 'title', 'description'),
        }),
    )

    @display(description='Title')
    def title_preview(self, obj):
        return obj.title[:80] + '...' if len(obj.title) > 80 else obj.title

    @display(description='Cards')
    def cards_count(self, obj):
        count = obj.cards.count()
        active = obj.cards.filter(is_active=True).count()
        return f'{active} / {count}'

    @display(description='Options')
    def dropdown_count(self, obj):
        count = obj.dropdown_options.count()
        active = obj.dropdown_options.filter(is_active=True).count()
        return f'{active} / {count}'

    @display(description='CTA', boolean=True)
    def has_cta(self, obj):
        return hasattr(obj, 'cta') and obj.cta is not None


@admin.register(PricingConfigCard)
class PricingConfigCardAdmin(ModelAdmin):
    list_select_related = ('section',)
    list_display = ('title', 'section', 'sort_order', 'is_active', 'show_banner')
    list_editable = ('sort_order', 'is_active', 'show_banner')
    list_filter = ('section', 'is_active', 'show_banner')
    search_fields = ('title',)
    ordering = ('section', 'sort_order')
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        (None, {
            'fields': ('section', 'image', 'image_alt', 'title', 'description', 'button_text', 'sort_order', 'is_active'),
        }),
        ('🎯 Promotion Banner', {
            'classes': ('collapse',),
            'fields': (
                'show_banner', 'banner_text', 'banner_type', 'banner_icon',
                ('banner_bg_color', 'banner_text_color'),
                'banner_priority', 'banner_expiry',
            ),
            'description': 'Configure a promotional banner that appears above this pricing card.',
        }),
    )

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'banner_expiry':
            # Use a single-value DateTimeField matching the single-input
            # ModernDateTimeWidget. The admin default (SplitDateTimeField /
            # MultiValueField) crashes with "NoneType has no len()" when the
            # field is submitted empty (see MultiValueField.has_changed).
            kwargs['form_class'] = forms.DateTimeField
            kwargs['widget'] = ModernDateTimeWidget()
        return super().formfield_for_dbfield(db_field, request, **kwargs)


@admin.register(PricingConfigDropdownOption)
class PricingConfigDropdownOptionAdmin(ModelAdmin):
    list_select_related = ('section',)
    list_display = ('label', 'section', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    list_filter = ('section', 'is_active')
    search_fields = ('label',)
    ordering = ('section', 'order')
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }


@admin.register(PricingConfigCardPrice)
class PricingConfigCardPriceAdmin(ModelAdmin):
    list_select_related = ('card', 'unit_range')
    list_display = ('card_title', 'unit_range_label', 'price', 'old_price')
    list_editable = ('price', 'old_price')
    list_filter = ('card__section', 'card', 'unit_range')
    list_fullwidth = True
    search_fields = ('card__title', 'unit_range__label', 'price')
    autocomplete_fields = ('card', 'unit_range')

    @display(description='Card', ordering='card__title')
    def card_title(self, obj):
        return obj.card.title

    @display(description='Unit Range', ordering='unit_range__order')
    def unit_range_label(self, obj):
        return obj.unit_range.label


class FreeTrialAttachmentInline(TabularInline):
    model = FreeTrialAttachment
    extra = 0
    readonly_fields = ('file', 'original_filename', 'uploaded_at')
    can_delete = True

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(FreeTrial)
class FreeTrialAdmin(ModelAdmin):
    list_display = ('type_badge', 'full_name', 'phone_actions', 'email', 'product_name', 'country', 'sms_status', 'is_read', 'created_at')
    list_editable = ('sms_status', 'is_read')
    list_filter = ('request_type', 'sms_status', 'is_read', 'product_category', 'created_at')
    search_fields = ('full_name', 'email', 'phone_number', 'product_name', 'company_name', 'country')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'phone_actions_detail')
    actions = ['mark_sms_sent', 'mark_contacted_whatsapp']
    fieldsets = (
        ('Submission Type & Plan', {
            'fields': ('request_type', 'package_price'),
        }),
        ('Contact Information', {
            'fields': ('full_name', 'company_name', 'country', 'email', 'phone_number', 'phone_actions_detail'),
        }),
        ('📱 Client SMS & Communication Tracking', {
            'fields': ('sms_status', 'last_sms_sent_at', 'sms_notes'),
            'description': 'Track SMS messages, confirmation status, or communication notes for this client.',
        }),
        ('Project Details', {
            'fields': ('product_name', 'product_category', 'drive_link', 'project_requirements'),
        }),
        ('Status', {
            'fields': ('is_read', 'created_at'),
        }),
    )
    inlines = [FreeTrialAttachmentInline]

    @display(description='Type')
    def type_badge(self, obj):
        if obj.request_type == 'order_request':
            return format_html(
                '<span style="background:#10b98118;color:#059669;border:1px solid #10b98138;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:700;white-space:nowrap;">'
                '🛒 Order Request</span>'
            )
        return format_html(
            '<span style="background:#6366f118;color:#6366f1;border:1px solid #6366f138;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:700;white-space:nowrap;">'
            '🚀 Free Trial</span>'
        )

    @display(description='Phone / Quick SMS')
    def phone_actions(self, obj):
        if not obj.phone_number:
            return mark_safe('<span style="color:#94a3b8;font-size:0.8rem;">No Phone</span>')
        clean_num = ''.join(c for c in obj.phone_number if c.isdigit() or c == '+')
        msg = f"Hello {obj.full_name}, thank you for requesting a free trial with PicPixels for '{obj.product_name}'. We are reviewing your images."
        import urllib.parse
        encoded_msg = urllib.parse.quote(msg)
        wa_link = f"https://wa.me/{clean_num.replace('+', '')}?text={encoded_msg}"
        sms_link = f"sms:{clean_num}?body={encoded_msg}"
        return format_html(
            '<div style="display:flex;align-items:center;gap:6px;">'
            '<span>{}</span>'
            '<a href="{}" target="_blank" title="Chat on WhatsApp" style="padding:2px 6px;background:#25D366;color:#fff;border-radius:4px;font-size:0.75rem;text-decoration:none;font-weight:600;">WA</a>'
            '<a href="{}" title="Send SMS" style="padding:2px 6px;background:#0284c7;color:#fff;border-radius:4px;font-size:0.75rem;text-decoration:none;font-weight:600;">SMS</a>'
            '</div>',
            obj.phone_number, wa_link, sms_link
        )

    @display(description='Direct Client Communication')
    def phone_actions_detail(self, obj):
        if not obj.phone_number:
            return 'No phone number provided by client.'
        clean_num = ''.join(c for c in obj.phone_number if c.isdigit() or c == '+')
        msg = f"Hello {obj.full_name}, thank you for requesting a free trial with PicPixels for '{obj.product_name}'. We have received your project requirements and our retouching team is working on your trial images."
        import urllib.parse
        encoded_msg = urllib.parse.quote(msg)
        wa_link = f"https://wa.me/{clean_num.replace('+', '')}?text={encoded_msg}"
        sms_link = f"sms:{clean_num}?body={encoded_msg}"
        return format_html(
            '<div style="display:flex;gap:10px;margin-top:4px;">'
            '<a href="{}" target="_blank" class="button" style="background:#25D366;color:#fff;padding:6px 14px;border-radius:6px;text-decoration:none;font-weight:600;">💬 Open WhatsApp Chat with Client</a>'
            '<a href="{}" class="button" style="background:#0284c7;color:#fff;padding:6px 14px;border-radius:6px;text-decoration:none;font-weight:600;">✉️ Send Native SMS to Client</a>'
            '</div>',
            wa_link, sms_link
        )

    @admin.action(description='Mark selected as SMS Sent')
    def mark_sms_sent(self, request, queryset):
        queryset.update(sms_status='sent', last_sms_sent_at=timezone.now())

    @admin.action(description='Mark selected as Contacted via WhatsApp/Call')
    def mark_contacted_whatsapp(self, request, queryset):
        queryset.update(sms_status='contacted', last_sms_sent_at=timezone.now())


# ─── Dynamic Pricing Admin ───

class ServiceUnitRangeInline(TabularInline):
    model = ServiceUnitRange
    extra = 1
    fields = ['label', 'sort_order', 'is_active']
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }


class ServicePricingCardPriceInline(TabularInline):
    model = ServicePricingCardPrice
    extra = 1
    autocomplete_fields = ['unit_range']
    fields = ['unit_range', 'price', 'original_price']


class ServicePricingCardInline(TabularInline):
    model = ServicePricingCard
    extra = 1
    show_change_link = True
    fields = ['name', 'description', 'badge_text', 'badge_color', 'sort_order', 'is_active']
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }


@admin.register(ServiceUnitRange)
class ServiceUnitRangeAdmin(ModelAdmin):
    list_select_related = ('service',)
    list_display = ['label', 'service', 'sort_order', 'is_active']
    list_editable = ['sort_order', 'is_active']
    list_filter = ['service']
    search_fields = ['label']
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }


@admin.register(ServicePricingCard)
class ServicePricingCardAdmin(ModelAdmin):
    list_select_related = ('service',)
    list_display = ['name', 'service', 'badge_text', 'sort_order', 'is_active']
    list_editable = ['sort_order', 'is_active']
    list_filter = ['service']
    search_fields = ['name', 'description']
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    inlines = [ServicePricingCardPriceInline]
    fieldsets = (
        (None, {
            'fields': ('service', 'name', 'description', 'features', 'image', 'image_alt', 'badge_text', 'badge_color', 'button_text', 'sort_order', 'is_active'),
        }),
    )

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'features':
            kwargs['widget'] = TagInputWidget()
        return super().formfield_for_dbfield(db_field, request, **kwargs)


@admin.register(ServicePricingCardPrice)
class ServicePricingCardPriceAdmin(ModelAdmin):
    list_select_related = ('card', 'unit_range')
    list_display = ['card', 'unit_range', 'price', 'original_price']
    list_editable = ['price', 'original_price']
    autocomplete_fields = ['card', 'unit_range']


class WhyChooseFeatureItemInline(TabularInline):
    model = WhyChooseFeatureItem
    extra = 1
    can_delete = True
    show_change_link = True
    fields = ('icon', 'title', 'description', 'display_order', 'is_active')
    ordering = ('display_order',)
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }

    def has_delete_permission(self, request, obj=None):
        return True


@admin.register(WhyChooseFeatureSection)
class WhyChooseFeatureSectionAdmin(ModelAdmin):
    list_display = ('title', 'is_active', 'updated_at')
    list_editable = ('is_active',)
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    inlines = [WhyChooseFeatureItemInline]
    fieldsets = (
        (None, {
            'fields': ('title', 'subtitle', 'featured_image', 'featured_image_alt', 'is_active'),
        }),
    )


class WhyChooseItemInline(TabularInline):
    model = WhyChooseItem
    extra = 1
    can_delete = True
    show_change_link = True
    fields = ('company_name', 'description', 'speed', 'flexibility', 'quality', 'scalability', 'cost_effectiveness', 'display_order', 'is_active')
    ordering = ('display_order',)
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }


@admin.register(WhyChooseSection)
class WhyChooseSectionAdmin(ModelAdmin):
    list_display = ('title', 'is_active', 'updated_at')
    list_editable = ('is_active',)
    list_fullwidth = True
    inlines = [WhyChooseItemInline]
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        (None, {
            'fields': ('title', 'highlighted_word', 'subtitle', 'is_active'),
        }),
    )


@admin.register(WhyChooseItem)
class WhyChooseItemAdmin(ModelAdmin):
    list_display = ('company_name', 'section', 'display_order', 'is_active')
    list_editable = ('is_active',)
    list_filter = ('section', 'is_active')
    list_fullwidth = True
    search_fields = ('company_name',)
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        (None, {
            'fields': ('section', 'company_name', 'description', 'display_order', 'is_active'),
        }),
        ('Feature Flags', {
            'fields': ('speed', 'flexibility', 'quality', 'scalability', 'cost_effectiveness'),
            'classes': ('collapse',),
        }),
    )


@admin.register(HomepageCTASection)
class HomepageCTASectionAdmin(ModelAdmin):
    list_display = ('title', 'badge_text', 'primary_button_text', 'primary_button_is_active', 'secondary_button_text', 'secondary_button_is_active', 'is_active', 'updated_at')
    list_editable = ('is_active', 'primary_button_is_active', 'secondary_button_is_active')
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        ('Section Overview', {
            'fields': ('is_active', 'badge_text', 'title', 'title_color', 'subtitle'),
            'description': 'Configure the main headline and subtitle for the homepage Free Trial / CTA banner.',
        }),
        ('Primary Button (Button 1)', {
            'fields': ('primary_button_is_active', 'primary_button_text', 'primary_button_link'),
            'description': 'Main call-to-action button (e.g. "Start Free Trial →").',
        }),
        ('Secondary Button (Button 2 - Optional)', {
            'fields': ('secondary_button_is_active', 'secondary_button_text', 'secondary_button_link'),
            'description': 'Optional secondary button (e.g. "Contact Us"). Turn off the toggle switch if you only want 1 button.',
        }),
    )
