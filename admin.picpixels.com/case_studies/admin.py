from django.contrib import admin
from django.utils.html import mark_safe
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from unfold.widgets import UnfoldBooleanSwitchWidget
from .models import CaseStudyCategory, CaseStudyTag, CaseStudy, CaseStudyImage, CaseStudyTestimonial


@admin.register(CaseStudyCategory)
class CaseStudyCategoryAdmin(ModelAdmin):
    list_display = ['name', 'slug', 'case_study_count', 'is_active', 'sort_order']
    list_editable = ['is_active', 'sort_order']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']
    formfield_overrides = {
        'is_active': {'widget': UnfoldBooleanSwitchWidget},
    }

    def case_study_count(self, obj):
        return obj.case_studies.filter(is_published=True).count()
    case_study_count.short_description = 'Published Case Studies'


@admin.register(CaseStudyTag)
class CaseStudyTagAdmin(ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


class CaseStudyImageInline(TabularInline):
    model = CaseStudyImage
    extra = 1
    fields = ['image', 'alt_text', 'caption', 'sort_order', 'image_preview']
    readonly_fields = ['image_preview']

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(
                f'<img src="{obj.image.url}" style="width:80px;height:60px;'
                f'object-fit:cover;border-radius:6px;" />'
            )
        return mark_safe('<span style="color:#9CA3AF;">No image</span>')
    image_preview.short_description = 'Preview'


class CaseStudyTestimonialInline(StackedInline):
    model = CaseStudyTestimonial
    extra = 0
    max_num = 1
    fields = ['author_name', 'author_role', 'company', 'photo', 'photo_preview', 'quote', 'rating']
    readonly_fields = ['photo_preview']

    def photo_preview(self, obj):
        if obj.photo:
            return mark_safe(
                f'<img src="{obj.photo.url}" style="width:60px;height:60px;'
                f'object-fit:cover;border-radius:50%;" />'
            )
        return mark_safe('<span style="color:#9CA3AF;">No photo</span>')
    photo_preview.short_description = 'Photo'


class CaseStudyThumbnailPreview(admin.SimpleListFilter):
    title = 'Thumbnail'
    parameter_name = 'thumbnail'

    def lookups(self, request, model_admin):
        return [('yes', 'Has Image'), ('no', 'No Image')]

    def queryset(self, request, queryset):
        if self.value() == 'yes':
            return queryset.exclude(featured_image='')
        if self.value() == 'no':
            return queryset.filter(featured_image='')
        return queryset


@admin.register(CaseStudy)
class CaseStudyAdmin(ModelAdmin):
    list_display = [
        'thumbnail_preview', 'title', 'category', 'status_badge',
        'featured', 'publish_date', 'reading_time', 'sort_order',
    ]
    list_editable = ['featured', 'sort_order']
    list_filter = ['status', 'is_published', 'featured', 'category', CaseStudyThumbnailPreview]
    search_fields = ['title', 'excerpt', 'client_name', 'industry']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['thumbnail_preview', 'created_at', 'updated_at']
    inlines = [CaseStudyImageInline, CaseStudyTestimonialInline]
    filter_horizontal = ['tags']
    date_hierarchy = 'publish_date'

    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'excerpt', 'introduction'),
        }),
        ('Categorization', {
            'fields': ('category', 'tags'),
        }),
        ('Featured Images', {
            'fields': (
                'featured_image', 'featured_image_alt', 'thumbnail_preview',
                'hero_banner', 'hero_banner_alt',
                'og_image',
            ),
        }),
        ('Client Information', {
            'fields': (
                'client_name', 'client_logo', 'industry', 'country',
                'brand_values', 'project_goals',
            ),
        }),
        ('Project Scope', {
            'fields': (
                'services_provided', 'technologies_used',
                'project_duration', 'completion_date', 'reading_time',
            ),
        }),
        ('Story Sections', {
            'fields': (
                'project_overview', 'challenges', 'solution',
                'scope_of_work', 'process_workflow',
                'results', 'statistics',
            ),
        }),
        ('Full Content (Legacy)', {
            'fields': ('full_content',),
            'classes': ('collapse',),
        }),
        ('Publishing', {
            'fields': ('status', 'publish_date', 'is_published', 'featured', 'sort_order'),
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description', 'canonical_url'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def thumbnail_preview(self, obj):
        if obj.featured_image:
            return mark_safe(
                f'<img src="{obj.featured_image.url}" style="width:60px;height:60px;'
                f'object-fit:cover;border-radius:6px;" alt="{obj.featured_image_alt}" />'
            )
        return mark_safe(
            '<span style="color:#9CA3AF;font-size:0.8rem;">No image</span>'
        )
    thumbnail_preview.short_description = 'Image'

    def status_badge(self, obj):
        colors = {'draft': '#6B7280', 'published': '#10B981', 'scheduled': '#F59E0B'}
        color = colors.get(obj.status, '#6B7280')
        label = obj.get_status_display()
        return mark_safe(
            f'<span style="background:{color};color:#fff;'
            f'padding:2px 8px;border-radius:10px;font-size:0.7rem;'
            f'font-weight:600;">{label}</span>'
        )
    status_badge.short_description = 'Status'
