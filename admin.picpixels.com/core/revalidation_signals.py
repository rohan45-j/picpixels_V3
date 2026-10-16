"""
Django signals that automatically trigger Next.js on-demand revalidation
whenever CMS content is saved or deleted from the admin panel.

This eliminates the delay between admin changes and frontend visibility.
"""
import logging
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache

logger = logging.getLogger(__name__)


def _get_revalidator():
    """Lazy import to avoid circular imports at startup."""
    from core.revalidation import trigger_revalidation
    return trigger_revalidation


def _invalidate_and_revalidate(sender, instance, **kwargs):
    """
    Common handler: clear Django's server-side cache, then trigger
    Next.js on-demand revalidation.
    """
    model_name = sender.__name__
    
    # Clear Django's consolidated homepage cache
    cache.delete('consolidated_homepage_data_v1')
    
    # Trigger Next.js revalidation
    try:
        trigger = _get_revalidator()
        trigger(model_name, instance=instance)
    except Exception as e:
        logger.warning(f"[Revalidation Signal] Failed for {model_name}: {e}")


# ──────────────────────────────────────────────────────────────
# CMS Models
# ──────────────────────────────────────────────────────────────

def _connect_cms_signals():
    """Connect signals for all CMS models. Called from AppConfig.ready()."""
    try:
        from cms.models import (
            Page, Section, Banner, Service, Testimonial,
            BlogCategory, BlogTag, BlogPost, BlogContentSection,
            FAQCategory, FAQ, ContactInquiry, TeamMember, BrandLogo,
            HeroSection, HeroSlide, HeroStat, PricingPlan, Technology,
            PricingPromotionSection,
            PricingConfigSection, PricingConfigDropdownOption,
            PricingConfigCard, PricingConfigCardPrice, PricingConfigCTA,
            ServiceGalleryImage, ServiceContentSection, ServiceHeroImage,
            WhyChooseSection, WhyChooseItem,
            WhyChooseFeatureSection, WhyChooseFeatureItem,
            HomepageCTASection,
            AboutMissionVision, AboutCoreValue, AboutProcessStep,
            AboutPageSetting, AboutStorySection,
            PrivacyPolicyPage, PrivacyPolicySection,
            TermsConditionPage, TermsClause,
            ProductCategory,
        )
        
        cms_models = [
            Page, Section, Banner, Service, Testimonial,
            BlogCategory, BlogTag, BlogPost, BlogContentSection,
            FAQCategory, FAQ, TeamMember, BrandLogo,
            HeroSection, HeroSlide, HeroStat, PricingPlan, Technology,
            PricingPromotionSection,
            PricingConfigSection, PricingConfigDropdownOption,
            PricingConfigCard, PricingConfigCardPrice, PricingConfigCTA,
            ServiceGalleryImage, ServiceContentSection, ServiceHeroImage,
            WhyChooseSection, WhyChooseItem,
            WhyChooseFeatureSection, WhyChooseFeatureItem,
            HomepageCTASection,
            AboutMissionVision, AboutCoreValue, AboutProcessStep,
            AboutPageSetting, AboutStorySection,
            PrivacyPolicyPage, PrivacyPolicySection,
            TermsConditionPage, TermsClause,
            ProductCategory,
        ]
        
        for model in cms_models:
            post_save.connect(
                _invalidate_and_revalidate,
                sender=model,
                dispatch_uid=f'revalidate_{model.__name__}_save',
            )
            post_delete.connect(
                _invalidate_and_revalidate,
                sender=model,
                dispatch_uid=f'revalidate_{model.__name__}_delete',
            )
        
        logger.info(f"[Revalidation] Connected signals for {len(cms_models)} CMS models")
    except ImportError as e:
        logger.warning(f"[Revalidation] Could not connect CMS signals: {e}")


def _connect_portfolio_signals():
    """Connect signals for portfolio models."""
    try:
        from portfolio.models import Portfolio, Category
        
        for model in [Portfolio, Category]:
            post_save.connect(
                _invalidate_and_revalidate,
                sender=model,
                dispatch_uid=f'revalidate_{model.__name__}_save',
            )
            post_delete.connect(
                _invalidate_and_revalidate,
                sender=model,
                dispatch_uid=f'revalidate_{model.__name__}_delete',
            )
        
        logger.info("[Revalidation] Connected signals for Portfolio models")
    except ImportError as e:
        logger.warning(f"[Revalidation] Could not connect Portfolio signals: {e}")


def _connect_case_study_signals():
    """Connect signals for case study models."""
    try:
        from case_studies.models import CaseStudy, CaseStudyCategory
        
        for model in [CaseStudy, CaseStudyCategory]:
            post_save.connect(
                _invalidate_and_revalidate,
                sender=model,
                dispatch_uid=f'revalidate_{model.__name__}_save',
            )
            post_delete.connect(
                _invalidate_and_revalidate,
                sender=model,
                dispatch_uid=f'revalidate_{model.__name__}_delete',
            )
        
        logger.info("[Revalidation] Connected signals for CaseStudy models")
    except ImportError as e:
        logger.warning(f"[Revalidation] Could not connect CaseStudy signals: {e}")


def _connect_guide_signals():
    """Connect signals for guide models."""
    try:
        from guides.models import Guide, GuideCategory
        
        for model in [Guide, GuideCategory]:
            post_save.connect(
                _invalidate_and_revalidate,
                sender=model,
                dispatch_uid=f'revalidate_{model.__name__}_save',
            )
            post_delete.connect(
                _invalidate_and_revalidate,
                sender=model,
                dispatch_uid=f'revalidate_{model.__name__}_delete',
            )
        
        logger.info("[Revalidation] Connected signals for Guide models")
    except ImportError as e:
        logger.warning(f"[Revalidation] Could not connect Guide signals: {e}")


def _connect_navigation_signals():
    """Connect signals for navigation models."""
    try:
        from navigation.models import NavigationItem
        
        post_save.connect(
            _invalidate_and_revalidate,
            sender=NavigationItem,
            dispatch_uid='revalidate_NavigationItem_save',
        )
        post_delete.connect(
            _invalidate_and_revalidate,
            sender=NavigationItem,
            dispatch_uid='revalidate_NavigationItem_delete',
        )
        
        logger.info("[Revalidation] Connected signals for Navigation models")
    except ImportError as e:
        logger.warning(f"[Revalidation] Could not connect Navigation signals: {e}")


def _connect_site_settings_signals():
    """Connect signals for site settings models."""
    try:
        from site_settings.models import SiteSetting, SEOSetting
        
        for model in [SiteSetting, SEOSetting]:
            post_save.connect(
                _invalidate_and_revalidate,
                sender=model,
                dispatch_uid=f'revalidate_{model.__name__}_save',
            )
        
        logger.info("[Revalidation] Connected signals for SiteSettings models")
    except ImportError as e:
        logger.warning(f"[Revalidation] Could not connect SiteSettings signals: {e}")


def connect_all_revalidation_signals():
    """
    Connect all revalidation signals. Should be called from core AppConfig.ready().
    """
    _connect_cms_signals()
    _connect_portfolio_signals()
    _connect_case_study_signals()
    _connect_guide_signals()
    _connect_navigation_signals()
    _connect_site_settings_signals()
    logger.info("[Revalidation] All signal handlers connected")
