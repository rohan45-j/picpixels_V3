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
        ('📍 Footer: Location Based Services', {
            'fields': ('footer_location_title', 'footer_locations'),
            'description': 'Configure the Location Based Services dropdown widget in the footer. Enter one location per line (e.g. Texas, California, Florida, New York).',
        }),
        ('🏢 Footer: Office Addresses (USA & Bangladesh)', {
            'fields': (
                ('usa_office_title', 'usa_office_phone'),
                ('usa_office_email', 'usa_office_address'),
                ('bd_office_title', 'bd_office_phone'),
                ('bd_office_email', 'bd_office_address'),
            ),
            'description': 'Configure the Corporate Office (USA) and Production House (Bangladesh) contact and address details displayed in the website footer.',
        }),
        ('Social & Legal', {
            'fields': ('social_links', 'copyright_text'),
        }),
        ('📊 Third-Party Tracking & Analytics (GTM, GA4, GSC, Meta)', {
            'fields': (
                'google_tag_manager_id',
                'google_analytics_id',
                'google_search_console_code',
                'facebook_pixel_id',
            ),
            'description': 'Configure tracking codes. Enter IDs only (e.g. GTM-XXXXXXX, G-XXXXXXXXXX). The website will automatically inject the official scripts.',
        }),
        ('⚡ Custom Script Injection (<head> & <body>)', {
            'fields': (
                'custom_head_scripts',
                'custom_body_start_scripts',
                'custom_body_end_scripts',
            ),
            'description': 'Inject raw scripts or tags (HTML/JavaScript). Head scripts load before </head>, body start loads right after <body>, body end loads before </body>.',
        }),
        ('🏷️ Global Schema Markup (JSON-LD)', {
            'fields': ('organization_schema',),
            'description': 'Custom Organization or LocalBusiness JSON-LD markup. Leave empty for automatic Organization schema.',
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
