from django.db import models
from django.utils.text import slugify
from ckeditor.fields import RichTextField


class GuideCategory(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    description = models.TextField(blank=True, default='', help_text='Brief description of this category (for internal reference).')
    is_active = models.BooleanField(default=True, db_index=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Guide Category'
        verbose_name_plural = 'Guide Categories'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Guide(models.Model):
    # ── Basic Information ──
    title = models.CharField(max_length=500, help_text='The title of the guide.')
    slug = models.SlugField(
        max_length=550, unique=True, blank=True,
        help_text='URL-friendly identifier. Auto-generated from title if left blank.',
    )
    category = models.ForeignKey(
        GuideCategory, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='guides', help_text='Select a category for this guide.',
    )
    short_description = models.TextField(
        blank=True, default='',
        help_text='A brief excerpt shown on listing cards and in search results.',
    )
    reading_time = models.IntegerField(
        null=True, blank=True,
        help_text='Estimated reading time in minutes. Auto-calculated from content if left blank.',
    )
    sort_order = models.IntegerField(default=0, help_text='Display order (lower numbers appear first).')

    # ── Hero Information ──
    hero_badge_text = models.CharField(
        max_length=200, blank=True, default='',
        help_text='Optional badge text displayed above the title (e.g. "New" or "Updated").',
    )
    hero_subtitle = models.TextField(
        blank=True, default='',
        help_text='Optional subtitle displayed below the title in the hero section.',
    )

    # ── Featured Image ──
    featured_image = models.ImageField(
        upload_to='guides/', blank=True, null=True,
        help_text='Upload a featured image. Recommended size: 1600×900px (16:9 ratio).',
    )
    featured_image_alt = models.CharField(
        max_length=500, blank=True, default='',
        help_text='Descriptive alt text for the featured image (important for accessibility and SEO).',
    )
    featured_image_caption = models.CharField(
        max_length=500, blank=True, default='',
        help_text='Optional caption displayed below the featured image.',
    )

    # ── Content ──
    full_content = RichTextField(
        blank=True, default='',
        help_text='Write the full guide content here. Use Heading 2 and Heading 3 for sections — these are automatically used to generate the Table of Contents.',
        config_name='default',
    )

    # ── SEO ──
    meta_title = models.CharField(
        max_length=500, blank=True, default='',
        help_text='Custom title tag for search engines. Defaults to the guide title if left blank.',
    )
    meta_description = models.TextField(
        blank=True, default='',
        help_text='Meta description for search engine result pages.',
    )
    meta_keywords = models.TextField(
        blank=True, default='',
        help_text='Comma-separated keywords for SEO (e.g. "guide, tutorial, CGI, product rendering").',
    )
    canonical_url = models.URLField(
        max_length=500, blank=True, default='',
        help_text='Optional canonical URL if this content is syndicated elsewhere.',
    )
    og_image = models.ImageField(
        upload_to='guides/og/', blank=True, null=True,
        help_text='Optional Open Graph image for social sharing. Recommended: 1200×630px.',
    )

    # ── Publish Settings ──
    is_published = models.BooleanField(default=False, db_index=True, help_text='Make this guide visible on the website.')
    featured = models.BooleanField(default=False, db_index=True, help_text='Show this guide in the featured section.')
    author = models.CharField(
        max_length=300, blank=True, default='',
        help_text='Name of the author or content creator.',
    )
    publish_date = models.DateField(
        blank=True, null=True,
        help_text='The date this guide was published. Auto-set to today when first published.',
    )

    # ── Timestamps ──
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', '-created_at']
        verbose_name = 'Guide'
        verbose_name_plural = 'Guides'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)
            slug = base
            counter = 1
            while Guide.objects.filter(slug=slug).exists():
                slug = f'{base}-{counter}'
                counter += 1
            self.slug = slug
        if self.reading_time is None or self.reading_time == 0:
            word_count = len(self.full_content.split()) if self.full_content else 0
            self.reading_time = max(1, round(word_count / 200))
        super().save(*args, **kwargs)
