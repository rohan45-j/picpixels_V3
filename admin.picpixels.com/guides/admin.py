from django.contrib import admin
from django.db import models
from django.utils import timezone
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from unfold.admin import ModelAdmin
from unfold.decorators import display
from core.widgets import CustomToggleSwitch, ModernDateWidget
from cms.image_guidelines import IMG as IMG_GUIDELINES
from .models import GuideCategory, Guide


def _size_guide(key):
    text = IMG_GUIDELINES.get(key, '')
    lines = text.strip().split('\n')
    return lines[0] if lines else ''


@admin.register(GuideCategory)
class GuideCategoryAdmin(ModelAdmin):
    list_display = ['name', 'slug', 'guide_count', 'is_active', 'sort_order']
    list_editable = ['is_active', 'sort_order']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }

    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description', 'is_active', 'sort_order'),
        }),
    )

    def guide_count(self, obj):
        return obj.guides.filter(is_published=True).count()
    guide_count.short_description = 'Published Guides'


@admin.register(Guide)
class GuideAdmin(ModelAdmin):
    list_display = [
        'thumbnail_preview', 'title', 'category', 'reading_time_display',
        'author', 'featured', 'is_published', 'publish_date',
    ]
    list_editable = ['featured', 'is_published']
    list_filter = ['is_published', 'featured', 'category', 'author']
    search_fields = ['title', 'short_description', 'full_content', 'author']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = [
        'thumbnail_preview', 'og_image_preview', 'reading_time_display',
        'created_at', 'updated_at',
    ]
    date_hierarchy = 'publish_date'
    save_on_top = True

    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }

    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title',
                'slug',
                'category',
                'short_description',
                ('reading_time', 'reading_time_display'),
                'sort_order',
            ),
            'description': 'Core guide details. Fields marked with * are required.',
        }),
        ('Hero Information', {
            'fields': (
                'hero_badge_text',
                'hero_subtitle',
            ),
            'description': 'Optional content displayed at the top of the guide detail page.',
            'classes': ('collapse',),
        }),
        ('Featured Image', {
            'fields': (
                'featured_image',
                'featured_image_alt',
                'featured_image_caption',
                'thumbnail_preview',
            ),
            'description': f'Upload a featured image. Recommended: {_size_guide("blog_featured")} (16:9 ratio). Used on listing cards and as the social share image if no OG image is set.',
        }),
        ('Content', {
            'fields': ('full_content',),
            'description': 'Main body of the guide. Use Heading 2 and Heading 3 for section titles — these will automatically generate the Table of Contents on the frontend.',
        }),
        ('SEO', {
            'fields': (
                'meta_title',
                'meta_description',
                'meta_keywords',
                'canonical_url',
                ('og_image', 'og_image_preview'),
            ),
            'description': 'Control how this guide appears in search engines and social media.',
            'classes': ('collapse',),
        }),
        ('Publish Settings', {
            'fields': (
                'is_published',
                'featured',
                'author',
                'publish_date',
            ),
            'description': 'Controls visibility and attribution.',
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def get_fieldsets(self, request, obj=None):
        fs = super().get_fieldsets(request, obj)
        if not obj:
            fs = tuple(
                (title, data) for title, data in fs
                if title != 'Timestamps'
            )
        return fs

    def save_model(self, request, obj, form, change):
        if not obj.publish_date and obj.is_published:
            obj.publish_date = timezone.now().date()
        super().save_model(request, obj, form, change)

    @display(description='Image', header=False)
    def thumbnail_preview(self, obj):
        if obj.featured_image:
            style = 'width:80px;height:80px;object-fit:cover;border-radius:8px;'
            caption = obj.featured_image_caption or ''
            caption_html = (
                f'<div style="font-size:11px;color:#6b7280;margin-top:4px;max-width:280px">'
                f'{caption}</div>'
            ) if caption else ''
            return format_html(
                '<div style="display:flex;align-items:center;gap:12px">'
                '<img src="{}" style="{}" />'
                '<div>'
                '<span style="font-size:11px;color:#6b7280;display:block">{}</span>'
                '{}'
                '</div>'
                '</div>',
                obj.featured_image.url,
                style,
                _size_guide('blog_featured'),
                caption_html,
            )
        return mark_safe(
            '<span style="color:#9CA3AF;font-size:0.8rem;">No image uploaded</span>'
        )

    @display(description='OG Image Preview', header=False)
    def og_image_preview(self, obj):
        if obj.og_image:
            style = 'max-width:200px;max-height:100px;border-radius:6px;border:1px solid #e5e7eb;'
            return format_html(
                '<div style="display:flex;align-items:center;gap:10px">'
                '<img src="{}" style="{}" />'
                '<span style="font-size:11px;color:#6b7280">{}</span>'
                '</div>',
                obj.og_image.url,
                style,
                _size_guide('og_image'),
            )
        return mark_safe(
            '<span style="color:#9CA3AF;font-size:0.8rem;">No OG image set</span>'
        )

    @display(description='Reading Time')
    def reading_time_display(self, obj):
        word_count = len(obj.full_content.split()) if obj.full_content else 0
        minutes = obj.reading_time or max(1, round(word_count / 200))
        return format_html(
            '<span style="font-size:0.85rem;color:#6b7280">{} min · {} words</span>',
            minutes,
            word_count,
        )

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name == 'publish_date':
            formfield.widget = ModernDateWidget()
        return formfield
