from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PageViewSet, SectionViewSet, BannerViewSet,
    ServiceViewSet, HeroSectionViewSet, TestimonialViewSet,
    AuthorViewSet,
    BlogCategoryViewSet, BlogTagViewSet,
    BlogPostViewSet, BlogContentViewSet,
    FAQCategoryViewSet, FAQViewSet,
    ContactInquiryViewSet, TeamMemberViewSet, BrandLogoViewSet,
    PricingPlanViewSet, TechnologyViewSet, MediaUploadView,
    PricingConfigSectionViewSet, PricingPromotionViewSet, FreeTrialViewSet,
    WhyChooseSectionViewSet, WhyChooseFeatureSectionViewSet,
)

router = DefaultRouter()
router.register(r'pages', PageViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'banners', BannerViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'hero', HeroSectionViewSet)
router.register(r'testimonials', TestimonialViewSet)
router.register(r'blog/authors', AuthorViewSet)
router.register(r'blog/categories', BlogCategoryViewSet)
router.register(r'blog/tags', BlogTagViewSet)
router.register(r'blog/posts', BlogPostViewSet)
router.register(r'blog/sections', BlogContentViewSet)
router.register(r'faq/categories', FAQCategoryViewSet)
router.register(r'faqs', FAQViewSet)
router.register(r'contacts', ContactInquiryViewSet)
router.register(r'team', TeamMemberViewSet)
router.register(r'brands', BrandLogoViewSet)
router.register(r'pricing', PricingPlanViewSet)
router.register(r'technologies', TechnologyViewSet)
router.register(r'pricing-config', PricingConfigSectionViewSet)
router.register(r'pricing-promotions', PricingPromotionViewSet)
router.register(r'free-trials', FreeTrialViewSet)
router.register(r'why-choose-us', WhyChooseSectionViewSet)
router.register(r'why-choose-features', WhyChooseFeatureSectionViewSet)

urlpatterns = [
    path('media/upload/', MediaUploadView.as_view(), name='media_upload'),
    path('', include(router.urls)),
]
