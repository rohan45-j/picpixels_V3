from rest_framework import serializers
from .models import Category, Service, Portfolio, PortfolioGallery, PortfolioComparison


class CategorySerializer(serializers.ModelSerializer):
    portfolio_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'is_active', 'portfolio_count']

    def get_portfolio_count(self, obj):
        return obj.portfolios.filter(is_published=True).count()


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name', 'slug']


class PortfolioGallerySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioGallery
        fields = ['id', 'image', 'image_url', 'alt_text', 'sort_order']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class PortfolioComparisonSerializer(serializers.ModelSerializer):
    before_image_url = serializers.SerializerMethodField()
    after_image_url = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioComparison
        fields = ['id', 'before_image', 'before_image_alt', 'before_image_url', 'after_image', 'after_image_alt', 'after_image_url', 'label', 'sort_order']

    def get_before_image_url(self, obj):
        if obj.before_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.before_image.url)
            return obj.before_image.url
        return None

    def get_after_image_url(self, obj):
        if obj.after_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.after_image.url)
            return obj.after_image.url
        return None


class PortfolioSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True, default=None)
    service_slug = serializers.CharField(source='service.slug', read_only=True, default=None)
    featured_image_url = serializers.SerializerMethodField()
    before_image_url = serializers.SerializerMethodField()
    after_image_url = serializers.SerializerMethodField()
    gallery = PortfolioGallerySerializer(many=True, read_only=True)
    comparisons = PortfolioComparisonSerializer(many=True, read_only=True)
    prev_project = serializers.SerializerMethodField()
    next_project = serializers.SerializerMethodField()

    class Meta:
        model = Portfolio
        fields = [
            'id', 'title', 'slug',
            'category', 'category_name', 'category_slug',
            'service', 'service_name', 'service_slug',
            'featured_image', 'featured_image_alt', 'featured_image_url',
            'before_image', 'before_image_alt', 'before_image_url',
            'after_image', 'after_image_alt', 'after_image_url',
            'short_description', 'full_description',
            'client', 'completion_date', 'project_url',
            'featured', 'gallery', 'comparisons',
            'meta_title', 'meta_description',
            'prev_project', 'next_project',
            'created_at', 'updated_at',
        ]

    def get_featured_image_url(self, obj):
        if obj.featured_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
            return obj.featured_image.url
        return None

    def get_before_image_url(self, obj):
        if obj.before_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.before_image.url)
            return obj.before_image.url
        return None

    def get_after_image_url(self, obj):
        if obj.after_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.after_image.url)
            return obj.after_image.url
        return None

    def get_prev_project(self, obj):
        qs = Portfolio.objects.filter(is_published=True, category__is_active=True).order_by('sort_order', '-created_at')
        items = list(qs.values('id', 'title', 'slug'))
        try:
            ids = [x['id'] for x in items]
            idx = ids.index(obj.id)
            if idx > 0:
                return {'title': items[idx - 1]['title'], 'slug': items[idx - 1]['slug']}
        except ValueError:
            pass
        return None

    def get_next_project(self, obj):
        qs = Portfolio.objects.filter(is_published=True, category__is_active=True).order_by('sort_order', '-created_at')
        items = list(qs.values('id', 'title', 'slug'))
        try:
            ids = [x['id'] for x in items]
            idx = ids.index(obj.id)
            if idx < len(items) - 1:
                return {'title': items[idx + 1]['title'], 'slug': items[idx + 1]['slug']}
        except ValueError:
            pass
        return None
