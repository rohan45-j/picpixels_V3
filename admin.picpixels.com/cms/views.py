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
    PageCategory, Page, Section, Banner, Service, Testimonial,
    BlogCategory, BlogTag, BlogPost, BlogContentSection,
    FAQCategory, FAQ, ContactInquiry, TeamMember, BrandLogo,
    HeroSection, PricingPlan, Technology, Author, PricingPromotionSection,
    PricingConfigSection, PricingConfigCard,
    ServiceUnitRange, ServicePricingCard, ServicePricingCardPrice,
    FreeTrial, FreeTrialAttachment,
    WhyChooseSection, WhyChooseFeatureSection,
    HomepageCTASection,
    AboutMissionVision, AboutCoreValue, AboutProcessStep, AboutPageSetting,
    AboutStorySection,
    PrivacyPolicyPage, PrivacyPolicySection,
    TermsConditionPage, TermsClause,
)
from .serializers import (
    PageCategorySerializer, PageSerializer, SectionSerializer, BannerSerializer,
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
    HomepageCTASectionSerializer,
    AboutMissionVisionSerializer,
    AboutCoreValueSerializer,
    AboutProcessStepSerializer,
    AboutPageSettingSerializer,
    AboutStorySectionSerializer,
    PrivacyPolicyPageSerializer,
    PrivacyPolicySectionSerializer,
    TermsConditionPageSerializer,
    TermsClauseSerializer,
)


CACHE_TTL = getattr(settings, 'PUBLIC_CACHE_TTL', 60)
DEBUG = getattr(settings, 'DEBUG', False)


class NoCacheOnWriteMixin:
    """Add cache control headers to allow CDN caching for GET, disable for mutations.
    In DEBUG mode, caching is disabled entirely so admin changes appear immediately."""

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if request.method == 'GET' and not DEBUG:
            response['Cache-Control'] = 'public, max-age=5, s-maxage=0, must-revalidate'
        else:
            response['Cache-Control'] = 'no-store'
        return response


class PageCategoryViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = PageCategory.objects.all()
    serializer_class = PageCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    ordering = ['order', 'name']


class PageViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filterset_fields = ['slug', 'category__slug', 'category', 'is_active']


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
                      'is_active', 'is_featured', 'available_locations', 'created_at', 'updated_at')
        if self.request.query_params.get('all') != '1':
            qs = qs.filter(is_active=True)

        location_param = self.request.query_params.get('location')
        if location_param:
            loc_clean = location_param.strip().lower().replace('-', ' ')
            qs = qs.filter(
                models.Q(available_locations=[]) |
                models.Q(available_locations__isnull=True) |
                models.Q(available_locations__icontains=loc_clean)
            )

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
    filterset_fields = ['category', 'service', 'is_pricing_faq', 'is_contact_faq', 'is_portfolio_faq', 'is_homepage_faq']

    def get_queryset(self):
        qs = FAQ.objects.all()
        if self.request.query_params.get('all') != '1':
            qs = qs.filter(is_active=True)

        is_pricing = self.request.query_params.get('is_pricing_faq')
        if is_pricing is not None:
            if is_pricing.lower() in ('true', '1'):
                qs = qs.filter(is_pricing_faq=True)
            elif is_pricing.lower() in ('false', '0'):
                qs = qs.filter(is_pricing_faq=False)

        is_portfolio = self.request.query_params.get('is_portfolio_faq')
        if is_portfolio is not None:
            if is_portfolio.lower() in ('true', '1'):
                qs = qs.filter(is_portfolio_faq=True)
            elif is_portfolio.lower() in ('false', '0'):
                qs = qs.filter(is_portfolio_faq=False)

        is_homepage = self.request.query_params.get('is_homepage_faq')
        if is_homepage is not None:
            if is_homepage.lower() in ('true', '1'):
                qs = qs.filter(is_homepage_faq=True)
            elif is_homepage.lower() in ('false', '0'):
                qs = qs.filter(is_homepage_faq=False)

        is_contact = self.request.query_params.get('is_contact_faq')
        if is_contact is not None:
            if is_contact.lower() in ('true', '1'):
                qs = qs.filter(is_contact_faq=True)
            elif is_contact.lower() in ('false', '0'):
                qs = qs.filter(is_contact_faq=False)

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


class HomepageCTASectionViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = HomepageCTASection.objects.filter(is_active=True)
    serializer_class = HomepageCTASectionSerializer
    permission_classes = [permissions.AllowAny]


# ═══════════════════════════════════════════════════════════
# ABOUT PAGE VIEWSETS
# ═══════════════════════════════════════════════════════════

class AboutMissionVisionViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = AboutMissionVision.objects.filter(is_active=True).order_by('display_order', 'id')
    serializer_class = AboutMissionVisionSerializer
    permission_classes = [permissions.AllowAny]


class AboutCoreValueViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = AboutCoreValue.objects.filter(is_active=True).order_by('display_order', 'id')
    serializer_class = AboutCoreValueSerializer
    permission_classes = [permissions.AllowAny]


class AboutProcessStepViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = AboutProcessStep.objects.filter(is_active=True).order_by('display_order', 'id')
    serializer_class = AboutProcessStepSerializer
    permission_classes = [permissions.AllowAny]


class AboutPageSettingViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = AboutPageSetting.objects.all()
    serializer_class = AboutPageSettingSerializer
    permission_classes = [permissions.AllowAny]


class AboutStorySectionViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = AboutStorySection.objects.filter(is_active=True)
    serializer_class = AboutStorySectionSerializer
    permission_classes = [permissions.AllowAny]


class AboutPageDataView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        settings_obj = AboutPageSetting.objects.first()
        settings_data = AboutPageSettingSerializer(settings_obj).data if settings_obj else None
        story_obj = AboutStorySection.objects.filter(is_active=True).first()
        story_data = AboutStorySectionSerializer(story_obj, context={'request': request}).data if story_obj else None
        mission_vision = AboutMissionVision.objects.filter(is_active=True).order_by('display_order', 'id')
        core_values = AboutCoreValue.objects.filter(is_active=True).order_by('display_order', 'id')
        process_steps = AboutProcessStep.objects.filter(is_active=True).order_by('display_order', 'id')

        return Response({
            'settings': settings_data,
            'story': story_data,
            'mission_vision': AboutMissionVisionSerializer(mission_vision, many=True, context={'request': request}).data,
            'core_values': AboutCoreValueSerializer(core_values, many=True, context={'request': request}).data,
            'process_steps': AboutProcessStepSerializer(process_steps, many=True, context={'request': request}).data,
        })


# ═══════════════════════════════════════════════════════════
# LEGAL & POLICY VIEWS
# ═══════════════════════════════════════════════════════════

class PrivacyPolicyView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        page = PrivacyPolicyPage.objects.filter(is_active=True).first()
        if not page:
            return Response(None, status=status.HTTP_404_NOT_FOUND)
        serializer = PrivacyPolicyPageSerializer(page, context={'request': request})
        return Response(serializer.data)


class PrivacyPolicySectionViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = PrivacyPolicySection.objects.filter(is_active=True).order_by('display_order', 'id')
    serializer_class = PrivacyPolicySectionSerializer
    permission_classes = [permissions.AllowAny]


class TermsConditionView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        page = TermsConditionPage.objects.filter(is_active=True).first()
        if not page:
            return Response(None, status=status.HTTP_404_NOT_FOUND)
        serializer = TermsConditionPageSerializer(page, context={'request': request})
        return Response(serializer.data)


class TermsClauseViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = TermsClause.objects.filter(is_active=True).order_by('display_order', 'id')
    serializer_class = TermsClauseSerializer
    permission_classes = [permissions.AllowAny]


class HomepageDataView(APIView):
    """Consolidated homepage endpoint aggregating all sections into 1 response."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.core.cache import cache
        cache_key = 'consolidated_homepage_data_v1'
        cached = cache.get(cache_key)
        if cached and not DEBUG:
            resp = Response(cached)
            resp['Cache-Control'] = 'public, max-age=60, s-maxage=120'
            return resp

        # 1. Services
        services_qs = Service.objects.filter(is_active=True, show_on_homepage=True, is_featured=True).order_by('order')
        services_data = ServiceListSerializer(services_qs, many=True, context={'request': request}).data

        # 2. Testimonials
        testimonials_qs = Testimonial.objects.filter(is_active=True).order_by('order')
        testimonials_data = TestimonialSerializer(testimonials_qs, many=True, context={'request': request}).data

        # 3. Technologies
        technologies_qs = Technology.objects.filter(is_active=True).order_by('display_order')
        technologies_data = TechnologySerializer(technologies_qs, many=True, context={'request': request}).data

        # 4. Portfolios & Categories
        try:
            from portfolio.models import Portfolio, Category
            from portfolio.serializers import PortfolioSerializer, CategorySerializer
            portfolios_qs = Portfolio.objects.filter(is_published=True, featured=True).select_related('category', 'service')[:8]
            if not portfolios_qs:
                portfolios_qs = Portfolio.objects.filter(is_published=True).select_related('category', 'service')[:8]
            portfolios_data = PortfolioSerializer(portfolios_qs, many=True, context={'request': request}).data
            portfolio_cats_qs = Category.objects.filter(is_active=True).order_by('name')
            portfolio_cats_data = CategorySerializer(portfolio_cats_qs, many=True, context={'request': request}).data
        except Exception:
            portfolios_data = []
            portfolio_cats_data = []

        # 5. Why Choose Us
        why_choose_section = WhyChooseSection.objects.filter(is_active=True).prefetch_related('items').first()
        why_choose_data = WhyChooseSectionSerializer(why_choose_section, context={'request': request}).data if why_choose_section else None

        # 6. Latest Blogs
        blogs_qs = BlogPost.objects.filter(status='published').select_related('category', 'author_profile').order_by('-published_at')[:4]
        blogs_data = BlogPostListSerializer(blogs_qs, many=True, context={'request': request}).data

        # 7. Case Studies
        try:
            from case_studies.models import CaseStudy
            from case_studies.serializers import CaseStudyListSerializer
            case_studies_qs = CaseStudy.objects.filter(status='published', featured=True).select_related('category')[:6]
            if not case_studies_qs:
                case_studies_qs = CaseStudy.objects.filter(status='published').select_related('category')[:6]
            case_studies_data = CaseStudyListSerializer(case_studies_qs, many=True, context={'request': request}).data
        except Exception:
            case_studies_data = []

        # 8. Why Choose Features
        features_section = WhyChooseFeatureSection.objects.filter(is_active=True).prefetch_related('items').first()
        features_data = WhyChooseFeatureSectionSerializer(features_section, context={'request': request}).data if features_section else None

        # 9. Hero Data
        hero = HeroSection.objects.filter(is_active=True).prefetch_related('slides', 'stats').first()
        hero_data = HeroSectionSerializer(hero, context={'request': request}).data if hero else None

        # 10. Brand Logos
        brands_qs = BrandLogo.objects.filter(is_active=True).order_by('order')
        brands_data = BrandLogoSerializer(brands_qs, many=True, context={'request': request}).data

        # 11. Pricing Config
        pricing_config = PricingConfigSection.objects.filter(is_active=True).prefetch_related('dropdown_options', 'cards', 'card_prices').first()
        pricing_data = PricingConfigSectionSerializer(pricing_config, context={'request': request}).data if pricing_config else None

        # 12. Site Settings
        try:
            from site_settings.models import SiteSetting
            from site_settings.serializers import SiteSettingSerializer
            site_setting = SiteSetting.objects.first()
            site_settings_data = SiteSettingSerializer(site_setting, context={'request': request}).data if site_setting else None
        except Exception:
            site_settings_data = None

        # 13. Homepage CTA
        cta_section = HomepageCTASection.objects.filter(is_active=True).first()
        cta_data = HomepageCTASectionSerializer(cta_section, context={'request': request}).data if cta_section else None

        # 14. FAQs
        faqs_qs = FAQ.objects.filter(is_active=True).order_by('order')[:10]
        faqs_data = FAQSerializer(faqs_qs, many=True, context={'request': request}).data

        payload = {
            'services': services_data,
            'testimonials': testimonials_data,
            'technologies': technologies_data,
            'portfolios': portfolios_data,
            'portfolioCategories': portfolio_cats_data,
            'whyChooseUs': why_choose_data,
            'latestBlogs': blogs_data,
            'caseStudies': case_studies_data,
            'whyChooseFeatures': features_data,
            'heroData': hero_data,
            'brandLogos': brands_data,
            'pricingConfig': pricing_data,
            'siteSettings': site_settings_data,
            'homepageCTA': cta_data,
            'faqs': faqs_data,
        }

        if not DEBUG:
            cache.set(cache_key, payload, timeout=120)
        resp = Response(payload)
        resp['Cache-Control'] = 'public, max-age=60, s-maxage=120'
        return resp




