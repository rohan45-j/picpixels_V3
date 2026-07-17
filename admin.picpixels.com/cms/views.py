from rest_framework import viewsets, permissions, parsers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from django.core.files.storage import default_storage
from drf_spectacular.utils import extend_schema, OpenApiParameter
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.conf import settings

from .models import (
    Page, Section, Banner, Service, Testimonial,
    BlogCategory, BlogTag, BlogPost, BlogContentSection,
    FAQCategory, FAQ, ContactInquiry, TeamMember, BrandLogo,
    HeroSection, PricingPlan, Technology, Author, PricingPromotionSection,
    PricingConfigSection, PricingConfigCard,
    ServiceUnitRange, ServicePricingCard, ServicePricingCardPrice,
    FreeTrial, FreeTrialAttachment,
    WhyChooseSection, WhyChooseFeatureSection,
)
from .serializers import (
    PageSerializer, SectionSerializer, BannerSerializer,
    ServiceSerializer, ServiceListSerializer, TestimonialSerializer,
    BlogCategorySerializer, BlogTagSerializer,
    BlogPostSerializer, BlogPostListSerializer, BlogContentSectionSerializer,
    FAQCategorySerializer, FAQSerializer,
    ContactInquirySerializer, TeamMemberSerializer, BrandLogoSerializer,
    HeroSectionSerializer, PricingPlanSerializer, TechnologySerializer,
    PricingConfigSectionSerializer, PricingPromotionSectionSerializer,
    AuthorSerializer,
    ServicePricingSerializer,
    FreeTrialSerializer,
    WhyChooseSectionSerializer,
    WhyChooseFeatureSectionSerializer,
)


CACHE_TTL = getattr(settings, 'PUBLIC_CACHE_TTL', 60)
DEBUG = getattr(settings, 'DEBUG', False)


class NoCacheOnWriteMixin:
    """Add cache control headers to allow CDN caching for GET, disable for mutations.
    In DEBUG mode, caching is disabled entirely so admin changes appear immediately."""

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if request.method == 'GET' and not DEBUG:
            response['Cache-Control'] = f'public, max-age={CACHE_TTL}, s-maxage={CACHE_TTL * 2}, stale-while-revalidate={CACHE_TTL * 10}'
        else:
            response['Cache-Control'] = 'no-store'
        return response


class PageViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = Page.objects.all().defer('content').only('title', 'slug', 'meta_title', 'meta_description')
    serializer_class = PageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filterset_fields = ['slug']


class SectionViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class BannerViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    ordering = ['order']


class ServiceViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    ordering = ['order']
    lookup_field = 'slug'
    search_fields = ['title', 'short_description', 'description']
    filterset_fields = ['is_active', 'is_featured', 'show_in_mega_menu', 'show_on_homepage', 'show_in_footer', 'slug']

    def get_queryset(self):
        qs = Service.objects.prefetch_related('gallery_images', 'content_sections', 'hero_images',
                                              'eeat', 'brand_logos',
                                              'why_need_features',
                                              'process_steps',
                                              'why_choose_cards',
                                              'tools',
                                              'pricing_tier_cards',
                                              'client_feedbacks').all()
        qs = qs.prefetch_related(models.Prefetch(
            'faqs',
            queryset=FAQ.objects.filter(is_active=True).order_by('order'),
        ))
        qs = qs.only('id', 'title', 'slug', 'short_description', 'description', 'features', 'icon', 'image',
                      'hero_subtitle', 'hero_background', 'hero_cta_text', 'hero_cta_link',
                      'price', 'order', 'seo_title', 'seo_description',
                      'brand_section_title', 'why_need_section_title', 'why_need_section_description',
                      'process_section_title', 'why_choose_title', 'tools_section_title',
                       'pricing_title', 'pricing_badge_text', 'pricing_heading', 'pricing_description',
                       'pricing_starting_price', 'pricing_unit', 'pricing_notes', 'pricing_features',
                       'pricing_cta_text', 'pricing_cta_link', 'pricing_cta2_text', 'pricing_cta2_link',
                      'show_in_mega_menu', 'show_on_homepage', 'show_in_footer', 'show_in_related',
                      'is_active', 'is_featured', 'created_at', 'updated_at')
        if self.request.query_params.get('all') != '1':
            qs = qs.filter(is_active=True)
        return qs.order_by('order')

    def get_serializer_class(self):
        if self.action == 'list' and self.request.query_params.get('brief') == '1':
            return ServiceListSerializer
        return ServiceSerializer

    @method_decorator(cache_page(CACHE_TTL * 2))
    @action(detail=False, methods=['get'])
    def mega_menu(self, request):
        qs = Service.objects.filter(is_active=True, show_in_mega_menu=True).order_by('order')
        qs = qs.only('id', 'title', 'slug', 'short_description', 'icon', 'image', 'price', 'order')
        serializer = ServiceListSerializer(qs, many=True)
        return Response(serializer.data)

    @method_decorator(cache_page(CACHE_TTL))
    @action(detail=False, methods=['get'])
    def homepage(self, request):
        qs = Service.objects.filter(is_active=True, show_on_homepage=True, is_featured=True).order_by('order')
        qs = qs.only('id', 'title', 'slug', 'short_description', 'description', 'features', 'icon', 'image', 'price', 'order', 'is_featured')
        serializer = ServiceListSerializer(qs, many=True)
        return Response(serializer.data)

    @method_decorator(cache_page(CACHE_TTL * 2))
    @action(detail=False, methods=['get'])
    def footer(self, request):
        qs = Service.objects.filter(is_active=True, show_in_footer=True).order_by('order')
        qs = qs.only('id', 'title', 'slug')
        serializer = ServiceListSerializer(qs, many=True)
        return Response(serializer.data)

    @method_decorator(cache_page(CACHE_TTL))
    @action(detail=False, methods=['get'])
    def pricing(self, request):
        qs = Service.objects.filter(is_active=True).prefetch_related(
            models.Prefetch('unit_ranges', queryset=ServiceUnitRange.objects.filter(is_active=True)),
            models.Prefetch('pricing_cards', queryset=ServicePricingCard.objects.filter(is_active=True).prefetch_related(
                models.Prefetch('prices', queryset=ServicePricingCardPrice.objects.select_related('unit_range'))
            ))
        )
        serializer = ServicePricingSerializer(qs, many=True)
        return Response(serializer.data)


class HeroSectionViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = HeroSection.objects.prefetch_related('slides', 'stats').filter(is_active=True)
    serializer_class = HeroSectionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class TestimonialViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    ordering = ['order']

    def get_queryset(self):
        qs = Testimonial.objects.all()
        if self.request.query_params.get('all') != '1':
            qs = qs.filter(is_active=True)
        return qs.order_by('order')


class AuthorViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Author.objects.filter(is_active=True)
    serializer_class = AuthorSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    search_fields = ['name', 'designation']


class BlogCategoryViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    ordering = ['order']


class BlogTagViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = BlogTag.objects.all()
    serializer_class = BlogTagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class BlogPostViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filterset_fields = ['category', 'is_featured', 'is_trending', 'is_published', 'status']
    search_fields = ['title', 'excerpt', 'short_description', 'content']

    def get_queryset(self):
        qs = BlogPost.objects.select_related('category', 'author_profile').prefetch_related(
            'content_sections', 'tags', 'document_blocks',
        ).all()
        if self.request.query_params.get('all') != '1':
            qs = qs.filter(status='published', is_published=True)
        return qs.order_by('-published_at', '-created_at')

    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'latest':
            return BlogPostListSerializer
        return BlogPostSerializer

    @method_decorator(cache_page(CACHE_TTL))
    @action(detail=False, methods=['get'])
    def latest(self, request):
        qs = BlogPost.objects.filter(status='published', is_published=True).select_related(
            'category', 'author_profile'
        ).prefetch_related('tags').order_by('-published_at')[:4]
        serializer = BlogPostListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class BlogContentViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = BlogContentSection.objects.all()
    serializer_class = BlogContentSectionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['blog_post', 'template']
    ordering = ['order']


class FAQCategoryViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = FAQCategory.objects.all()
    serializer_class = FAQCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    ordering = ['order']


class FAQViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    ordering = ['order']
    filterset_fields = ['category', 'service', 'is_contact_faq']

    def get_queryset(self):
        qs = FAQ.objects.all()
        if self.request.query_params.get('all') != '1':
            qs = qs.filter(is_active=True)
        return qs.order_by('order')


class ContactInquiryViewSet(viewsets.ModelViewSet):
    queryset = ContactInquiry.objects.all()
    serializer_class = ContactInquirySerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class TeamMemberViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    ordering = ['order']

    def get_queryset(self):
        qs = TeamMember.objects.all()
        if self.request.query_params.get('all') != '1':
            qs = qs.filter(is_active=True)
        return qs.order_by('order')


class BrandLogoViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = BrandLogo.objects.filter(is_active=True)
    serializer_class = BrandLogoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class PricingPlanViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = PricingPlan.objects.all()
    serializer_class = PricingPlanSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['is_active']
    ordering_fields = ['order']
    ordering = ['order']


class TechnologyViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = Technology.objects.all()
    serializer_class = TechnologySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    ordering_fields = ['display_order']
    ordering = ['display_order']

    def get_queryset(self):
        qs = Technology.objects.all()
        if self.request.query_params.get('all') != '1':
            qs = qs.filter(is_active=True)
        return qs.order_by('display_order')


class MediaUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    @extend_schema(
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'file': {'type': 'string', 'format': 'binary'},
                },
            },
        },
    )
    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=400)

        file_name = default_storage.save(f'uploads/{file_obj.name}', file_obj)
        file_url = default_storage.url(file_name)
        full_url = request.build_absolute_uri(file_url)

        return Response({
            'filename': file_obj.name,
            'url': full_url,
            'size': file_obj.size,
        }, status=201)


class PricingConfigSectionViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = PricingConfigSection.objects.prefetch_related(
        'dropdown_options', 'cta',
        models.Prefetch('cards', queryset=PricingConfigCard.objects.prefetch_related('prices__unit_range')),
    ).filter(is_active=True)
    serializer_class = PricingConfigSectionSerializer
    permission_classes = [permissions.AllowAny]


class PricingPromotionViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = PricingPromotionSection.objects.filter(is_active=True)
    serializer_class = PricingPromotionSectionSerializer
    permission_classes = [permissions.AllowAny]
    ordering_fields = ['display_order']
    ordering = ['display_order']





class FreeTrialViewSet(viewsets.ModelViewSet):
    queryset = FreeTrial.objects.prefetch_related('attachments').all()
    serializer_class = FreeTrialSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def perform_create(self, serializer):
        instance = serializer.save()
        files = self.request.FILES.getlist('files')
        for f in files:
            FreeTrialAttachment.objects.create(
                free_trial=instance,
                file=f,
                original_filename=f.name,
            )


class WhyChooseSectionViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = WhyChooseSection.objects.prefetch_related('items').filter(is_active=True)
    serializer_class = WhyChooseSectionSerializer
    permission_classes = [permissions.AllowAny]


class WhyChooseFeatureSectionViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = WhyChooseFeatureSection.objects.prefetch_related('items').filter(is_active=True)
    serializer_class = WhyChooseFeatureSectionSerializer
    permission_classes = [permissions.AllowAny]
