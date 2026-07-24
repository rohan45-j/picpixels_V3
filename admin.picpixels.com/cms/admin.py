from django import forms
from django.contrib import admin
from django.db import models
from django.utils import timezone
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display
from core.widgets import CustomToggleSwitch, ModernDateTimeWidget, ModernDateWidget
from .widgets import ContentBlockPreviewWidget
from .image_guidelines import IMG as IMG_GUIDELINES

def _size_guide(key):
    text = IMG_GUIDELINES.get(key, '')
    lines = text.strip().split('\n')
    return lines[0] if lines else ''


def _img_preview_html(url, size='max-height:48px;border-radius:4px'):
    return format_html('<img src="{}" style="{}" />', url, size)


import json
from .models import (
    Page, Section, Banner, Service, ServiceGalleryImage, ServiceContentSection, ServiceHeroImage,
    HeroSection, HeroSlide, HeroStat, Testimonial,
    Author, BlogCategory, BlogTag, BlogPost, BlogContentSection, BlogDocumentBlock,
    FAQCategory, FAQ, ContactInquiry, TeamMember, BrandLogo,
    PricingPlan, Technology, PricingPromotionSection,
    PricingConfigSection, PricingConfigDropdownOption, PricingConfigCard, PricingConfigCardPrice, PricingConfigCTA,
    FreeTrial, FreeTrialAttachment,
    ServiceUnitRange, ServicePricingCard, ServicePricingCardPrice,
    WhyChooseSection, WhyChooseItem, WhyChooseFeatureSection, WhyChooseFeatureItem,
    ServiceEEAT, ServiceBrandLogo,
    ServiceWhyNeedFeature, ServiceProcessStep,
    ServiceWhyChooseCard, ServiceTool,
    ServicePricingTierCard, ServiceClientFeedback,
)


@admin.register(Page)
class PageAdmin(ModelAdmin):
    list_display = ('title', 'slug', 'created_at', 'updated_at')
    search_fields = ('title', 'slug')
    prepopulated_fields = {'slug': ('title',)}
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'content'),
        }),
        ('SEO & Meta', {
            'classes': ('collapse',),
            'fields': ('meta_title', 'meta_description', 'seo_title', 'seo_description'),
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
    verbose_name_plural = 'Hero Images'
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
                _size_guide('service_hero_slide')
            )
        return format_html(
            '<span style="font-size:10px;color:#6b7280">{}</span>',
            _size_guide('service_hero_slide')
        )


class ServiceGalleryImageInline(TabularInline):
    model = ServiceGalleryImage
    extra = 1
    fields = ('gallery_type', 'category', 'image', 'image_preview', 'alt_text',
              'before_image', 'before_image_alt', 'after_image', 'after_image_alt',
              'caption', 'is_featured', 'is_visible', 'order')
    readonly_fields = ('image_preview',)
    ordering = ('order',)
    classes = ('collapse',)
    verbose_name = 'Gallery Image'
    verbose_name_plural = 'Gallery Images'

    @display(description='Preview')
    def image_preview(self, obj):
        parts = []
        if obj.image:
            parts.append(
                f'<div>{_img_preview_html(obj.image.url)}'
                f'<div style="font-size:10px;color:#6b7280;margin-top:2px">{_size_guide("service_gallery")}</div></div>'
            )
        if obj.before_image:
            parts.append(
                f'<div><div style="font-size:10px;color:#6b7280;font-weight:500;margin-bottom:2px">Before:</div>'
                f'{_img_preview_html(obj.before_image.url, "max-height:40px;border-radius:4px")}'
                f'<div style="font-size:10px;color:#6b7280;margin-top:2px">{_size_guide("service_before_after")}</div></div>'
            )
        if obj.after_image:
            parts.append(
                f'<div><div style="font-size:10px;color:#6b7280;font-weight:500;margin-bottom:2px">After:</div>'
                f'{_img_preview_html(obj.after_image.url, "max-height:40px;border-radius:4px")}'
                f'<div style="font-size:10px;color:#6b7280;margin-top:2px">{_size_guide("service_before_after")}</div></div>'
            )
        return mark_safe('<div style="display:flex;gap:12px;align-items:start">' + ''.join(parts) + '</div>') if parts else '-'


class ServiceContentSectionForm(forms.ModelForm):
    class Meta:
        model = ServiceContentSection
        fields = '__all__'
        widgets = {
            'is_active': CustomToggleSwitch,
        }

    class Media:
        js = ('admin/js/service_content_section.js',)


class ServiceContentSectionInline(TabularInline):
    model = ServiceContentSection
    form = ServiceContentSectionForm
    extra = 1
    fields = ('layout', 'heading', 'content', 'image', 'image_preview', 'image_alt', 'order', 'is_active')
    readonly_fields = ('image_preview',)
    ordering = ('order',)
    classes = ('collapse',)
    verbose_name = 'Content Section'
    verbose_name_plural = 'Content Sections'

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
    verbose_name = 'FAQ'
    verbose_name_plural = 'FAQs'
    classes = ('collapse',)
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }


class ServiceEEATInline(TabularInline):
    model = ServiceEEAT
    max_num = 1
    extra = 0
    fields = ('experience', 'expertise', 'authoritativeness', 'trustworthiness', 'is_active')
    verbose_name = 'EEAT'
    verbose_name_plural = 'EEAT'
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
    verbose_name = 'Why Need Feature'
    verbose_name_plural = 'Why Need Features'
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
    verbose_name = 'Process Step'
    verbose_name_plural = 'Process Steps'
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
    verbose_name = 'Why Choose Card'
    verbose_name_plural = 'Why Choose Cards'
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


class ServicePricingTierCardInline(TabularInline):
    model = ServicePricingTierCard
    extra = 1
    fields = ('name', 'price', 'original_price', 'description', 'features',
              'is_popular', 'badge_text', 'badge_color',
              'button_text', 'button_link', 'display_order', 'is_active')
    ordering = ('display_order',)
    verbose_name = 'Pricing Tier Card'
    verbose_name_plural = 'Pricing Tier Cards'
    classes = ('collapse',)
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }


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


@admin.register(Service)
class ServiceAdmin(ModelAdmin):
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
        ServiceEEATInline,
        ServiceWhyNeedFeatureInline,
        ServiceProcessStepInline,
        ServiceWhyChooseCardInline,
        ServicePricingTierCardInline,
        ServiceFAQInline,
        ServiceGalleryImageInline,
        ServiceContentSectionInline,
    ]
    readonly_fields = ('thumbnail_preview', 'hero_bg_preview')
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        ('1. Basic Information', {
            'fields': (
                'title', 'slug',
                'short_description',
                'description',
                'features',
                'icon',
                'image', 'thumbnail_preview', 'image_alt',
            ),
            'description': _size_guide('service_thumbnail'),
        }),
        ('2. Hero Section', {
            'classes': ('collapse',),
            'fields': (
                'hero_subtitle',
                'hero_background', 'hero_bg_preview', 'hero_image_alt',
                'hero_cta_text', 'hero_cta_link',
            ),
            'description': _size_guide('service_hero_bg'),
        }),
        ('3. EEAT — Expertise, Experience, Authority & Trust', {
            'fields': (),
            'description': 'Configure the EEAT fields in the inline section below. '
                           'These showcase your credibility and domain expertise on the service page.',
        }),
        ('4. Why Should You Need Our Service', {
            'classes': ('collapse',),
            'fields': ('why_need_section_title', 'why_need_section_description'),
            'description': 'Set the section heading above, then add feature cards in the '
                           '"Why Need Features" inline below. Each card = one reason.',
        }),
        ('5. Process & Workflow', {
            'classes': ('collapse',),
            'fields': ('process_section_title',),
            'description': 'Set the section title above, then add workflow steps in the '
                           '"Process Steps" inline below. Each step is a stage in your delivery.',
        }),
        ('6. Why Choose Us', {
            'classes': ('collapse',),
            'fields': ('why_choose_title',),
            'description': 'Set the heading above, then add benefit cards in the '
                           '"Why Choose Cards" inline below. Each card = one differentiator.',
        }),
        ('7. Pricing', {
            'classes': ('collapse',),
            'fields': (
                'pricing_title', 'pricing_badge_text',
                'pricing_heading', 'pricing_description',
                'pricing_starting_price', 'pricing_unit', 'pricing_notes',
                'pricing_features',
                'pricing_cta_text', 'pricing_cta_link',
                'pricing_cta2_text', 'pricing_cta2_link',
            ),
            'description': 'Configure the pricing section text above, then add tier cards in the '
                           '"Pricing Tier Cards" inline below.',
        }),
        ('8. FAQ', {
            'fields': (),
            'description': 'Add frequently asked questions in the "FAQs" inline below. '
                           'Each appears in the accordion on the service page.',
        }),
        ('9. SEO & Meta', {
            'classes': ('collapse',),
            'fields': ('seo_title', 'seo_description'),
            'description': 'Optional meta fields for search engine optimization.',
        }),
        ('10. Publish Settings', {
            'fields': (
                'order', 'price',
                'is_active', 'is_featured',
                'show_in_mega_menu', 'show_on_homepage',
                'show_in_footer', 'show_in_related',
            ),
            'description': 'Control visibility, ordering, and display across the site.',
        }),
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
        ('📌 Comparison Media (Before/After)', {
            'fields': ('before_image', 'before_image_alt', 'after_image', 'after_image_alt'),
            'description': 'Upload paired before/after images with matching dimensions for the comparison slider.',
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
            'fields': ('tagline', 'title', 'description', 'background_image', 'background_image_alt'),
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
        ('Advanced SEO', {
            'classes': ('collapse',),
            'fields': ('focus_keyword', 'secondary_keywords', 'faq_schema', 'key_takeaways', 'related_services', 'related_posts'),
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
    list_display = ('question', 'category', 'linked_service', 'is_contact_faq', 'order', 'is_active')
    list_filter = ('category', 'is_active', 'is_contact_faq', 'service')
    list_filter_submit = True
    ordering = ('order',)
    search_fields = ('question',)
    list_fullwidth = True
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    fieldsets = (
        (None, {
            'fields': ('question', 'answer', 'category', 'service', 'is_contact_faq', 'order', 'is_active'),
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
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name == 'banner_expiry':
            formfield.widget = ModernDateTimeWidget()
        return formfield


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
    class Meta:
        model = PricingPromotionSection
        fields = '__all__'
        widgets = {
            'is_active': CustomToggleSwitch,
            'use_theme_color': CustomToggleSwitch,
            'bg_color': forms.TextInput(attrs={'type': 'color', 'class': 'vColorField'}),
            'text_color': forms.TextInput(attrs={'type': 'color', 'class': 'vColorField'}),
            'accent_color': forms.TextInput(attrs={'type': 'color', 'class': 'vColorField'}),
            'start_date': ModernDateTimeWidget(),
            'end_date': ModernDateTimeWidget(),
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
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name == 'banner_expiry':
            formfield.widget = ModernDateTimeWidget()
        return formfield


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
    list_display = ('full_name', 'email', 'product_name', 'product_category', 'created_at', 'is_read')
    list_editable = ('is_read',)
    list_filter = ('product_category', 'is_read', 'created_at')
    search_fields = ('full_name', 'email', 'product_name', 'company_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Contact Information', {
            'fields': ('full_name', 'company_name', 'email', 'phone_number'),
        }),
        ('Project Details', {
            'fields': ('product_name', 'product_category', 'drive_link', 'project_requirements'),
        }),
        ('Status', {
            'fields': ('is_read', 'created_at'),
        }),
    )
    inlines = [FreeTrialAttachmentInline]


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
