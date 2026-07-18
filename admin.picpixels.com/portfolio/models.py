from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from cms.image_guidelines import IMG


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    is_active = models.BooleanField(default=True, help_text="Designates whether this category should be displayed on the frontend.")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['sort_order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Service(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Service'
        verbose_name_plural = 'Services'
        ordering = ['sort_order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Portfolio(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name='portfolios'
    )
    service = models.ForeignKey(
        Service, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='portfolios'
    )
    featured_image = models.ImageField(upload_to='portfolio/', blank=True, null=True, help_text=IMG['portfolio_featured'])
    featured_image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the featured image')
    before_image = models.ImageField(upload_to='portfolio/before/', blank=True, null=True, help_text=IMG['portfolio_before_after'])
    before_image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the before image')
    after_image = models.ImageField(upload_to='portfolio/after/', blank=True, null=True, help_text=IMG['portfolio_before_after'])
    after_image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the after image')
    short_description = models.TextField(blank=True)
    full_description = models.TextField(blank=True)
    client = models.CharField(max_length=200, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    project_url = models.URLField(blank=True)
    is_published = models.BooleanField(default=True, db_index=True)
    featured = models.BooleanField(default=False, db_index=True, help_text='Show on homepage')
    sort_order = models.PositiveIntegerField(default=0)
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Portfolio Item'
        verbose_name_plural = 'Portfolio Items'
        ordering = ['sort_order', '-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)
            slug = base
            counter = 1
            while Portfolio.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class PortfolioGallery(models.Model):
    portfolio = models.ForeignKey(
        Portfolio, on_delete=models.CASCADE, related_name='gallery'
    )
    image = models.ImageField(upload_to='portfolio/gallery/', help_text=IMG['portfolio_gallery'])
    alt_text = models.CharField(max_length=200, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Gallery Image'
        verbose_name_plural = 'Gallery Images'
        ordering = ['sort_order']

    def __str__(self):
        return f'{self.portfolio.title} - Image {self.sort_order}'


class PortfolioComparison(models.Model):
    portfolio = models.ForeignKey(
        Portfolio, on_delete=models.CASCADE, related_name='comparisons'
    )
    before_image = models.ImageField(upload_to='portfolio/before/', blank=True, null=True, help_text=IMG['portfolio_before_after'])
    before_image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the before image')
    after_image = models.ImageField(upload_to='portfolio/after/', blank=True, null=True, help_text=IMG['portfolio_before_after'])
    after_image_alt = models.CharField(max_length=200, blank=True, help_text='Alt text for the after image')
    label = models.CharField(max_length=100, blank=True, help_text='Optional label (e.g. "Retouching Result")')
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Before/After Pair'
        verbose_name_plural = 'Before/After Pairs'
        ordering = ['sort_order']

    def __str__(self):
        return f'{self.portfolio.title} - Pair {self.sort_order}'
