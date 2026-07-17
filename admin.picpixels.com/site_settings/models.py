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
