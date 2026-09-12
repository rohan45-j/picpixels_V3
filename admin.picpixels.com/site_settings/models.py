from django.db import models
from cms.image_guidelines import IMG


class SiteSetting(models.Model):
    site_name = models.CharField(max_length=200, default='Pixelz-ZTS')
    tagline = models.CharField(max_length=300, blank=True)
    logo = models.ImageField(upload_to='site/', blank=True, null=True, help_text=IMG['site_logo'])
    logo_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the site logo')
    favicon = models.ImageField(upload_to='site/', blank=True, null=True, help_text=IMG['favicon'])
    favicon_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the favicon')
    support_email = models.EmailField(blank=True)
    support_phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    social_links = models.JSONField(default=dict, blank=True,
                                    help_text='JSON object of social platform URLs')
    copyright_text = models.CharField(max_length=200, blank=True)

    # Footer: Location Based Services
    footer_location_title = models.CharField(
        max_length=200,
        default='Location Based Services',
        help_text='Title for location services widget in footer'
    )
    footer_locations = models.TextField(
        blank=True,
        default='Texas\nCalifornia\nFlorida\nNew York',
        help_text='Locations list (one per line). Format: "Location Name" or "Location Name | /services?location=slug"'
    )

    # Footer: Corporate Office (USA)
    usa_office_title = models.CharField(
        max_length=150,
        blank=True,
        default='Corporate Office – USA',
        help_text='Title for USA corporate office (optional, leave blank to hide)'
    )
    usa_office_phone = models.CharField(
        max_length=100,
        blank=True,
        default='+1 409 419 3704',
        help_text='Phone number for USA office'
    )
    usa_office_email = models.CharField(
        max_length=150,
        blank=True,
        default='info@picpixels.com',
        help_text='Email address for USA office'
    )
    usa_office_address = models.TextField(
        blank=True,
        default='3150 Roswell Rd. NW #1004, Atlanta, GA 30305, USA',
        help_text='Physical address for USA office'
    )

    # Footer: Production House (Bangladesh)
    bd_office_title = models.CharField(
        max_length=150,
        blank=True,
        default='Production House – Bangladesh',
        help_text='Title for Bangladesh production house (optional, leave blank to hide)'
    )
    bd_office_phone = models.CharField(
        max_length=100,
        blank=True,
        default='+880 1622915832',
        help_text='Phone number for Bangladesh office'
    )
    bd_office_email = models.CharField(
        max_length=150,
        blank=True,
        default='info@picpixels.com',
        help_text='Email address for Bangladesh office'
    )
    bd_office_address = models.TextField(
        blank=True,
        default='71&45, House, Road-28, Dhaka 1230, Bangladesh',
        help_text='Physical address for Bangladesh office'
    )

    # Third-Party Tracking & Marketing Scripts
    google_tag_manager_id = models.CharField(
        max_length=50, blank=True, default='',
        help_text='Google Tag Manager Container ID (e.g. GTM-XXXXXXX)'
    )
    google_analytics_id = models.CharField(
        max_length=50, blank=True, default='',
        help_text='Google Analytics 4 Measurement ID (e.g. G-XXXXXXXXXX)'
    )
    google_search_console_code = models.CharField(
        max_length=255, blank=True, default='',
        help_text='Google Search Console verification code or meta tag content'
    )
    facebook_pixel_id = models.CharField(
        max_length=50, blank=True, default='',
        help_text='Meta / Facebook Pixel ID (e.g. 123456789012345)'
    )
    custom_head_scripts = models.TextField(
        blank=True, default='',
        help_text='Custom scripts/tags to inject inside <head> (e.g. tracking scripts, meta tags)'
    )
    custom_body_start_scripts = models.TextField(
        blank=True, default='',
        help_text='Custom scripts to inject immediately after <body> opening tag (e.g. GTM noscript)'
    )
    custom_body_end_scripts = models.TextField(
        blank=True, default='',
        help_text='Custom scripts to inject before </body> closing tag (e.g. chat widgets, analytics)'
    )
    organization_schema = models.TextField(
        blank=True, default='',
        help_text='Global Organization / LocalBusiness JSON-LD Schema (leave empty for auto-generated schema)'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Setting'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return self.site_name

    def save(self, *args, **kwargs):
        if not self.pk and SiteSetting.objects.exists():
            return
        super().save(*args, **kwargs)


class SEOSetting(models.Model):
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    og_title = models.CharField(max_length=200, blank=True)
    og_description = models.TextField(blank=True)
    og_image = models.ImageField(upload_to='seo/', blank=True, null=True, help_text=IMG['og_image'])
    og_image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the OG image')
    canonical_url = models.URLField(blank=True)
    robots_txt = models.TextField(
        blank=True,
        default='User-agent: *\nDisallow:\nSitemap: /sitemap.xml',
        help_text='Custom robots.txt content',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'SEO Setting'
        verbose_name_plural = 'SEO Settings'

    def __str__(self):
        return self.meta_title or 'SEO Settings'

    def save(self, *args, **kwargs):
        if not self.pk and SEOSetting.objects.exists():
            return
        super().save(*args, **kwargs)
