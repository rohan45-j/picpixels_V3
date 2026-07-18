from rest_framework import serializers
from django.conf import settings
from .models import GuideCategory, Guide


class GuideCategorySerializer(serializers.ModelSerializer):
    guide_count = serializers.SerializerMethodField()

    class Meta:
        model = GuideCategory
        fields = ['id', 'name', 'slug', 'description', 'is_active', 'guide_count']

    def get_guide_count(self, obj):
        qs = obj.guides.all()
        if not settings.DEBUG:
            qs = qs.filter(is_published=True)
        return qs.count()


class GuideListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    category_slug = serializers.CharField(source='category.slug', read_only=True, default='')
    featured_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Guide
        fields = [
            'id', 'title', 'slug', 'category', 'category_name', 'category_slug',
            'featured_image', 'featured_image_alt', 'featured_image_url',
            'featured_image_caption',
            'short_description', 'reading_time',
            'hero_badge_text', 'hero_subtitle',
            'author',
            'publish_date', 'featured', 'sort_order',
            'created_at', 'updated_at',
        ]

    def get_featured_image_url(self, obj):
        if obj.featured_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
            return f"{settings.FRONTEND_URL.rstrip('/')}{obj.featured_image.url}"
        return None


class GuideDetailSerializer(GuideListSerializer):
    full_content = serializers.CharField(read_only=True)
    meta_title = serializers.CharField(read_only=True)
    meta_description = serializers.CharField(read_only=True)
    meta_keywords = serializers.CharField(read_only=True)
    canonical_url = serializers.URLField(read_only=True)
    og_image_url = serializers.SerializerMethodField()
    prev_guide = serializers.SerializerMethodField()
    next_guide = serializers.SerializerMethodField()
    related_guides = serializers.SerializerMethodField()

    class Meta(GuideListSerializer.Meta):
        fields = GuideListSerializer.Meta.fields + [
            'full_content', 'meta_title', 'meta_description',
            'meta_keywords', 'canonical_url', 'og_image_url',
            'prev_guide', 'next_guide', 'related_guides',
        ]

    def get_og_image_url(self, obj):
        if obj.og_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.og_image.url)
            return f"{settings.FRONTEND_URL.rstrip('/')}{obj.og_image.url}"
        return None

    def _ordered_qs(self):
        return Guide.objects.select_related('category').filter(
            is_published=True, category__is_active=True
        ).order_by('sort_order', '-created_at')

    def get_prev_guide(self, obj):
        qs = self._ordered_qs()
        prev = qs.filter(sort_order__lt=obj.sort_order).last()
        if not prev:
            prev = qs.filter(created_at__lt=obj.created_at).last()
        if prev and prev.pk != obj.pk:
            return {'title': prev.title, 'slug': prev.slug}
        return None

    def get_next_guide(self, obj):
        qs = self._ordered_qs()
        next_item = qs.filter(sort_order__gt=obj.sort_order).first()
        if not next_item:
            next_item = qs.filter(created_at__gt=obj.created_at).first()
        if next_item and next_item.pk != obj.pk:
            return {'title': next_item.title, 'slug': next_item.slug}
        return None

    def get_related_guides(self, obj):
        if not obj.category:
            return []
        related = Guide.objects.select_related('category').filter(
            category=obj.category, is_published=True
        ).exclude(pk=obj.pk)[:3]
        return GuideListSerializer(related, many=True, context=self.context).data
