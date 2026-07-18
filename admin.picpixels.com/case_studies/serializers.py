from rest_framework import serializers
from django.conf import settings
from .models import CaseStudyCategory, CaseStudy, CaseStudyTag, CaseStudyImage, CaseStudyTestimonial


class CaseStudyCategorySerializer(serializers.ModelSerializer):
    case_study_count = serializers.SerializerMethodField()

    class Meta:
        model = CaseStudyCategory
        fields = ['id', 'name', 'slug', 'is_active', 'case_study_count']

    def get_case_study_count(self, obj):
        qs = obj.case_studies.all()
        if not settings.DEBUG:
            qs = qs.filter(is_published=True)
        return qs.count()


class CaseStudyTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseStudyTag
        fields = ['id', 'name', 'slug']


class CaseStudyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = CaseStudyImage
        fields = ['id', 'image', 'image_url', 'alt_text', 'caption', 'sort_order']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f"{settings.FRONTEND_URL.rstrip('/')}{obj.image.url}"
        return None


class CaseStudyTestimonialSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = CaseStudyTestimonial
        fields = ['id', 'author_name', 'author_role', 'company', 'photo', 'photo_url', 'quote', 'rating']

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return f"{settings.FRONTEND_URL.rstrip('/')}{obj.photo.url}"
        return None


class CaseStudyListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    category_slug = serializers.CharField(source='category.slug', read_only=True, default='')
    featured_image_url = serializers.SerializerMethodField()
    hero_banner_url = serializers.SerializerMethodField()
    tags = CaseStudyTagSerializer(many=True, read_only=True)

    class Meta:
        model = CaseStudy
        fields = [
            'id', 'title', 'slug', 'category', 'category_name', 'category_slug',
            'tags', 'featured_image', 'featured_image_alt', 'featured_image_url',
            'hero_banner', 'hero_banner_alt', 'hero_banner_url',
            'excerpt', 'client_name', 'client_logo', 'industry', 'country',
            'publish_date', 'reading_time', 'featured',
            'created_at', 'updated_at',
        ]

    def get_featured_image_url(self, obj):
        if obj.featured_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
            return f"{settings.FRONTEND_URL.rstrip('/')}{obj.featured_image.url}"
        return None

    def get_hero_banner_url(self, obj):
        if obj.hero_banner:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.hero_banner.url)
            return f"{settings.FRONTEND_URL.rstrip('/')}{obj.hero_banner.url}"
        return None


class CaseStudyDetailSerializer(CaseStudyListSerializer):
    gallery_images = CaseStudyImageSerializer(many=True, read_only=True)
    testimonials = CaseStudyTestimonialSerializer(many=True, read_only=True)
    full_content = serializers.CharField(read_only=True)
    introduction = serializers.CharField(read_only=True)
    project_overview = serializers.CharField(read_only=True)
    challenges = serializers.CharField(read_only=True)
    solution = serializers.CharField(read_only=True)
    scope_of_work = serializers.JSONField(read_only=True)
    process_workflow = serializers.CharField(read_only=True)
    results = serializers.CharField(read_only=True)
    statistics = serializers.JSONField(read_only=True)
    services_provided = serializers.CharField(read_only=True)
    technologies_used = serializers.CharField(read_only=True)
    project_duration = serializers.CharField(read_only=True)
    completion_date = serializers.DateField(read_only=True)
    brand_values = serializers.CharField(read_only=True)
    project_goals = serializers.CharField(read_only=True)
    meta_title = serializers.CharField(read_only=True)
    meta_description = serializers.CharField(read_only=True)
    canonical_url = serializers.URLField(read_only=True)
    og_image = serializers.ImageField(read_only=True)
    status = serializers.CharField(read_only=True)
    prev_case_study = serializers.SerializerMethodField()
    next_case_study = serializers.SerializerMethodField()
    related_case_studies = serializers.SerializerMethodField()

    class Meta(CaseStudyListSerializer.Meta):
        fields = CaseStudyListSerializer.Meta.fields + [
            'gallery_images', 'testimonials', 'full_content',
            'introduction', 'project_overview', 'challenges', 'solution',
            'scope_of_work', 'process_workflow', 'results', 'statistics',
            'services_provided', 'technologies_used',
            'project_duration', 'completion_date',
            'brand_values', 'project_goals',
            'meta_title', 'meta_description', 'canonical_url', 'og_image',
            'status',
            'prev_case_study', 'next_case_study', 'related_case_studies',
        ]

    def _ordered_qs(self):
        return CaseStudy.objects.select_related('category').filter(
            is_published=True, category__is_active=True
        ).order_by('sort_order', '-created_at')

    def get_prev_case_study(self, obj):
        qs = self._ordered_qs()
        try:
            prev = qs.filter(sort_order__lt=obj.sort_order).last()
            if not prev:
                prev = qs.filter(created_at__lt=obj.created_at).last()
            if prev and prev.pk != obj.pk:
                return {'title': prev.title, 'slug': prev.slug}
        except CaseStudy.DoesNotExist:
            pass
        return None

    def get_next_case_study(self, obj):
        qs = self._ordered_qs()
        try:
            next_item = qs.filter(sort_order__gt=obj.sort_order).first()
            if not next_item:
                next_item = qs.filter(created_at__gt=obj.created_at).first()
            if next_item and next_item.pk != obj.pk:
                return {'title': next_item.title, 'slug': next_item.slug}
        except CaseStudy.DoesNotExist:
            pass
        return None

    def get_related_case_studies(self, obj):
        if not obj.category:
            return []
        related = CaseStudy.objects.select_related('category').filter(
            category=obj.category, is_published=True
        ).exclude(pk=obj.pk)[:3]
        return CaseStudyListSerializer(related, many=True, context=self.context).data
