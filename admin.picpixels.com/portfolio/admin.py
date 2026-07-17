from django.contrib import admin
from unfold.admin import ModelAdmin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from unfold.widgets import UnfoldBooleanSwitchWidget
from .models import Category, Service, Portfolio, PortfolioGallery, PortfolioComparison


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ['name', 'is_active', 'sort_order', 'portfolio_count']
    search_fields = ['name']
    list_editable = ['is_active', 'sort_order']
    list_filter = ['is_active']
    prepopulated_fields = {'slug': ('name',)}
    formfield_overrides = {
        'is_active': {'widget': UnfoldBooleanSwitchWidget},
    }

    def portfolio_count(self, obj):
        return obj.portfolios.count()
    portfolio_count.short_description = 'Items'


@admin.register(Service)
class ServiceAdmin(ModelAdmin):
    list_display = ['name', 'sort_order', 'portfolio_count']
    search_fields = ['name']
    list_editable = ['sort_order']
    prepopulated_fields = {'slug': ('name',)}

    def portfolio_count(self, obj):
        return obj.portfolios.count()
    portfolio_count.short_description = 'Items'


class PortfolioGalleryInline(admin.TabularInline):
    model = PortfolioGallery
    extra = 1
    fields = ['image', 'alt_text', 'sort_order']
    readonly_fields = ['image_preview']
    classes = ['sortable']
    ordering = ['sort_order']

    class Media:
        js = ('admin/js/sortable-inline.js',)
        css = {'all': ('admin/css/sortable-inline.css',)}

    def image_preview(self, obj):
        if obj.pk and obj.image:
            return format_html(
                '<img src="{}" style="width:80px;height:60px;object-fit:cover;border-radius:6px;" />',
                obj.image.url
            )
        return '-'
    image_preview.short_description = 'Preview'


class PortfolioComparisonInline(admin.TabularInline):
    model = PortfolioComparison
    extra = 0
    fields = ['before_preview', 'before_image', 'before_image_alt', 'after_preview', 'after_image', 'after_image_alt', 'label', 'sort_order']
    readonly_fields = ['before_preview', 'after_preview']

    def before_preview(self, obj):
        if obj.pk and obj.before_image:
            return format_html(
                '<img src="{}" style="width:100px;height:70px;object-fit:cover;border-radius:6px;" />',
                obj.before_image.url
            )
        return mark_safe('<span style="color:#999;font-size:0.85rem;">No image</span>')
    before_preview.short_description = 'Before Preview'

    def after_preview(self, obj):
        if obj.pk and obj.after_image:
            return format_html(
                '<img src="{}" style="width:100px;height:70px;object-fit:cover;border-radius:6px;" />',
                obj.after_image.url
            )
        return mark_safe('<span style="color:#999;font-size:0.85rem;">No image</span>')
    after_preview.short_description = 'After Preview'


@admin.register(Portfolio)
class PortfolioAdmin(ModelAdmin):
    list_display = [
        'thumbnail_preview', 'title', 'category', 'service',
        'featured', 'is_published', 'sort_order', 'created_at'
    ]
    list_filter = ['category', 'service', 'featured', 'is_published', 'created_at']
    search_fields = ['title', 'short_description', 'client']
    list_editable = ['featured', 'is_published', 'sort_order']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['image_preview', 'created_at', 'updated_at']
    inlines = [PortfolioGalleryInline, PortfolioComparisonInline]

    fieldsets = [
        ('Content', {
            'fields': ['title', 'slug', 'category', 'service', 'short_description', 'full_description']
        }),
        ('Project Details', {
            'fields': ['client', 'completion_date', 'project_url']
        }),
        ('📸 Featured Image', {
            'fields': ['featured_image', 'featured_image_alt', 'image_preview']
        }),
        ('🔄 Before / After Images', {
            'fields': ['before_image', 'before_image_alt', 'after_image', 'after_image_alt'],
            'description': 'Upload a single before/after pair. For multiple pairs, use the "Before/After Pairs" section below.',
        }),
        ('Settings', {
            'fields': ['featured', 'is_published', 'sort_order', 'created_at', 'updated_at']
        }),
        ('SEO', {
            'fields': ['meta_title', 'meta_description'],
            'classes': ['collapse'],
        }),
    ]

    def thumbnail_preview(self, obj):
        if obj.featured_image:
            return format_html(
                '<img src="{}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;" />',
                obj.featured_image.url
            )
        return mark_safe('<span style="color:#999">No image</span>')
    thumbnail_preview.short_description = 'Image'

    def image_preview(self, obj):
        if obj.featured_image:
            return format_html(
                '<img src="{}" style="max-width:400px;max-height:300px;border-radius:12px;'
                'box-shadow:0 4px 20px rgba(0,0,0,0.1);" />',
                obj.featured_image.url
            )
        return '-'
    image_preview.short_description = 'Preview'


@admin.register(PortfolioGallery)
class PortfolioGalleryAdmin(ModelAdmin):
    list_display = ['portfolio', 'alt_text', 'sort_order', 'image_preview']
    list_filter = ['portfolio']
    search_fields = ['alt_text', 'portfolio__title']
    ordering = ['portfolio', 'sort_order']

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:80px;height:60px;object-fit:cover;border-radius:6px" />',
                obj.image.url
            )
        return '-'
    image_preview.short_description = 'Preview'


@admin.register(PortfolioComparison)
class PortfolioComparisonAdmin(ModelAdmin):
    list_display = ['portfolio', 'label', 'sort_order']
    list_filter = ['portfolio']
    search_fields = ['label', 'portfolio__title']
    ordering = ['portfolio', 'sort_order']
    fieldsets = (
        (None, {
            'fields': ('portfolio', 'before_image', 'before_image_alt', 'after_image', 'after_image_alt', 'label', 'sort_order'),
        }),
    )
