from django.db import models
from django.utils.text import slugify


class CaseStudyCategory(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Case Study Category'
        verbose_name_plural = 'Case Study Categories'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class CaseStudyTag(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        verbose_name = 'Case Study Tag'
        verbose_name_plural = 'Case Study Tags'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class CaseStudy(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('scheduled', 'Scheduled'),
    ]

    title = models.CharField(max_length=500)
    slug = models.SlugField(max_length=550, unique=True, blank=True)
    excerpt = models.TextField(blank=True, default='', help_text='Short summary shown in listing cards')
    introduction = models.TextField(blank=True, default='', help_text='Opening paragraph for the detail page hero')

    category = models.ForeignKey(
        CaseStudyCategory, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='case_studies'
    )
    tags = models.ManyToManyField(CaseStudyTag, blank=True, related_name='case_studies')

    featured_image = models.ImageField(upload_to='case_studies/', blank=True, null=True)
    featured_image_alt = models.CharField(max_length=500, blank=True, default='')
    hero_banner = models.ImageField(upload_to='case_studies/hero/', blank=True, null=True, help_text='Large hero background image')
    hero_banner_alt = models.CharField(max_length=500, blank=True, default='')
    og_image = models.ImageField(upload_to='case_studies/og/', blank=True, null=True)

    short_description = models.TextField(blank=True, default='')
    full_content = models.TextField(blank=True, default='')

    # Client & Project Info
    client_name = models.CharField(max_length=300, blank=True, default='')
    client_logo = models.ImageField(upload_to='case_studies/clients/', blank=True, null=True)
    industry = models.CharField(max_length=200, blank=True, default='')
    country = models.CharField(max_length=200, blank=True, default='')
    brand_values = models.TextField(blank=True, default='', help_text='Brand values, mission, vision')
    project_goals = models.TextField(blank=True, default='')
    services_provided = models.TextField(blank=True, default='')
    technologies_used = models.TextField(blank=True, default='')
    project_duration = models.CharField(max_length=200, blank=True, default='')
    completion_date = models.DateField(blank=True, null=True)
    reading_time = models.IntegerField(default=0, help_text='Estimated reading time in minutes')

    # Section Content
    project_overview = models.TextField(blank=True, default='')
    challenges = models.TextField(blank=True, default='')
    solution = models.TextField(blank=True, default='')
    scope_of_work = models.JSONField(blank=True, null=True, default=list, help_text='Array of scope items e.g. ["Hero renders", "Lifestyle renders"]')
    process_workflow = models.TextField(blank=True, default='')
    results = models.TextField(blank=True, default='')
    statistics = models.JSONField(blank=True, null=True, default=list, help_text='Array of {value, label, suffix} objects')

    # Publishing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    publish_date = models.DateField(blank=True, null=True)
    is_published = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)
    sort_order = models.IntegerField(default=0)

    # SEO
    meta_title = models.CharField(max_length=500, blank=True, default='')
    meta_description = models.TextField(blank=True, default='')
    canonical_url = models.URLField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Case Study'
        verbose_name_plural = 'Case Studies'
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)
            slug = base
            counter = 1
            while CaseStudy.objects.filter(slug=slug).exists():
                slug = f'{base}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class CaseStudyImage(models.Model):
    case_study = models.ForeignKey(
        CaseStudy, on_delete=models.CASCADE, related_name='gallery_images'
    )
    image = models.ImageField(upload_to='case_studies/gallery/', blank=True, null=True)
    alt_text = models.CharField(max_length=500, blank=True, default='')
    caption = models.CharField(max_length=500, blank=True, default='')
    sort_order = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Case Study Gallery Image'
        verbose_name_plural = 'Case Study Gallery Images'
        ordering = ['sort_order']

    def __str__(self):
        return f"Image for {self.case_study.title}"


class CaseStudyTestimonial(models.Model):
    case_study = models.ForeignKey(
        CaseStudy, on_delete=models.CASCADE, related_name='testimonials'
    )
    author_name = models.CharField(max_length=300)
    author_role = models.CharField(max_length=300, blank=True, default='')
    company = models.CharField(max_length=300, blank=True, default='')
    photo = models.ImageField(upload_to='case_studies/testimonials/', blank=True, null=True)
    quote = models.TextField()
    rating = models.IntegerField(default=5, help_text='1-5 stars')

    class Meta:
        verbose_name = 'Case Study Testimonial'
        verbose_name_plural = 'Case Study Testimonials'

    def __str__(self):
        return f'Testimonial by {self.author_name} for {self.case_study.title}'
