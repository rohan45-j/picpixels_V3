from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import SiteSetting, SEOSetting


@admin.register(SiteSetting)
class SiteSettingAdmin(ModelAdmin):
    list_display = ('site_name', 'support_email', 'support_phone', 'logo_preview', 'updated_at')
    search_fields = ('site_name', 'support_email')
    list_fullwidth = True
    fieldsets = (
    ('🎨 Branding Assets (Logo & Favicon)', {
        'fields': ('site_name', 'tagline', 'logo', 'logo_alt', 'favicon', 'favicon_alt'),
    }),
        ('Contact Information', {
            'fields': ('support_email', 'support_phone', 'address'),
        }),
        ('Social & Legal', {
            'fields': ('social_links', 'copyright_text'),
        }),
    )

    def has_add_permission(self, request):
        if SiteSetting.objects.exists():
            return False
        return super().has_add_permission(request)

    @display(description='Logo')
    def logo_preview(self, obj):
        if obj.logo:
            return format_html('<img src="{}" style="max-height:32px;border-radius:4px" />', obj.logo.url)
        return '-'


@admin.register(SEOSetting)
class SEOSettingAdmin(ModelAdmin):
    list_display = ('meta_title', 'og_title', 'updated_at')
    list_fullwidth = True
    fieldsets = (
        ('Meta Tags', {
            'fields': ('meta_title', 'meta_description'),
        }),
    ('🔗 Open Graph Share Image', {
        'fields': ('og_title', 'og_description', 'og_image', 'og_image_alt'),
    }),
        ('Advanced', {
            'fields': ('canonical_url', 'robots_txt'),
        }),
    )

    def has_add_permission(self, request):
        if SEOSetting.objects.exists():
            return False
        return super().has_add_permission(request)
