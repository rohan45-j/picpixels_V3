"""
Utility to trigger on-demand revalidation of the Next.js frontend
after admin content changes. Calls the /api/revalidate endpoint
with the appropriate paths and tags.
"""
import os
import json
import logging
import threading
from urllib.request import Request, urlopen
from urllib.error import URLError
from django.conf import settings

logger = logging.getLogger(__name__)

FRONTEND_URL = getattr(settings, 'FRONTEND_URL', os.environ.get('FRONTEND_URL', 'http://localhost:3000'))
REVALIDATION_SECRET = getattr(settings, 'REVALIDATION_SECRET', os.environ.get('REVALIDATION_SECRET', 'picpixels-revalidate-secret-2024'))

# Mapping: model name -> (paths to revalidate, cache tags to invalidate)
MODEL_REVALIDATION_MAP = {
    # Homepage-related models
    'HeroSection': {
        'paths': ['/', '/about'],
        'tags': ['homepage', 'hero'],
    },
    'HeroSlide': {
        'paths': ['/'],
        'tags': ['homepage', 'hero'],
    },
    'HeroStat': {
        'paths': ['/'],
        'tags': ['homepage', 'hero'],
    },
    'Service': {
        'paths': ['/', '/services', '/pricing'],
        'tags': ['homepage', 'services', 'pricing', 'navigation'],
    },
    'Testimonial': {
        'paths': ['/', '/about'],
        'tags': ['homepage', 'testimonials'],
    },
    'Technology': {
        'paths': ['/'],
        'tags': ['homepage', 'technologies'],
    },
    'BrandLogo': {
        'paths': ['/'],
        'tags': ['homepage', 'brands'],
    },
    'WhyChooseSection': {
        'paths': ['/'],
        'tags': ['homepage', 'why-choose'],
    },
    'WhyChooseItem': {
        'paths': ['/'],
        'tags': ['homepage', 'why-choose'],
    },
    'WhyChooseFeatureSection': {
        'paths': ['/'],
        'tags': ['homepage', 'why-choose-features'],
    },
    'WhyChooseFeatureItem': {
        'paths': ['/'],
        'tags': ['homepage', 'why-choose-features'],
    },
    'HomepageCTASection': {
        'paths': ['/'],
        'tags': ['homepage', 'homepage-cta'],
    },
    'PricingConfigSection': {
        'paths': ['/', '/pricing'],
        'tags': ['homepage', 'pricing'],
    },
    'PricingConfigCard': {
        'paths': ['/', '/pricing'],
        'tags': ['homepage', 'pricing'],
    },
    'PricingConfigDropdownOption': {
        'paths': ['/pricing'],
        'tags': ['pricing'],
    },
    'PricingConfigCTA': {
        'paths': ['/pricing'],
        'tags': ['pricing'],
    },
    'PricingPlan': {
        'paths': ['/pricing'],
        'tags': ['pricing'],
    },
    'PricingPromotionSection': {
        'paths': ['/pricing'],
        'tags': ['pricing'],
    },
    
    # Blog models
    'BlogPost': {
        'paths': ['/', '/blog'],
        'tags': ['homepage', 'blog'],
    },
    'BlogCategory': {
        'paths': ['/blog'],
        'tags': ['blog'],
    },
    
    # Portfolio models
    'Portfolio': {
        'paths': ['/', '/portfolio'],
        'tags': ['homepage', 'portfolio'],
    },
    'Category': {
        'paths': ['/', '/portfolio'],
        'tags': ['homepage', 'portfolio'],
    },
    
    # FAQ models
    'FAQ': {
        'paths': ['/', '/faq', '/contact'],
        'tags': ['homepage', 'faq'],
    },
    'FAQCategory': {
        'paths': ['/faq'],
        'tags': ['faq'],
    },
    
    # Case studies
    'CaseStudy': {
        'paths': ['/', '/case-studies'],
        'tags': ['homepage', 'case-studies'],
    },
    'CaseStudyCategory': {
        'paths': ['/case-studies'],
        'tags': ['case-studies'],
    },
    
    # Guides
    'Guide': {
        'paths': ['/guides'],
        'tags': ['guides'],
    },
    'GuideCategory': {
        'paths': ['/guides'],
        'tags': ['guides'],
    },
    
    # Navigation
    'NavigationItem': {
        'paths': ['/'],
        'tags': ['navigation'],
    },
    
    # Site settings
    'SiteSetting': {
        'paths': ['/'],
        'tags': ['site-settings', 'navigation'],
    },
    'SEOSetting': {
        'paths': ['/'],
        'tags': ['site-settings'],
    },
    
    # Team
    'TeamMember': {
        'paths': ['/about'],
        'tags': ['team'],
    },
    
    # About page
    'AboutPageSetting': {
        'paths': ['/about'],
        'tags': ['about'],
    },
    'AboutStorySection': {
        'paths': ['/about'],
        'tags': ['about'],
    },
    'AboutMissionVision': {
        'paths': ['/about'],
        'tags': ['about'],
    },
    'AboutCoreValue': {
        'paths': ['/about'],
        'tags': ['about'],
    },
    'AboutProcessStep': {
        'paths': ['/about'],
        'tags': ['about'],
    },
    
    # Contact
    'ContactInquiry': {
        'paths': [],
        'tags': [],
    },
    
    # CMS pages
    'Page': {
        'paths': ['/'],
        'tags': ['cms-pages'],
    },
    'Section': {
        'paths': ['/'],
        'tags': ['cms-pages'],
    },
    
    # Privacy / Terms
    'PrivacyPolicyPage': {
        'paths': ['/privacy'],
        'tags': ['privacy'],
    },
    'PrivacyPolicySection': {
        'paths': ['/privacy'],
        'tags': ['privacy'],
    },
    'TermsConditionPage': {
        'paths': ['/terms'],
        'tags': ['terms'],
    },
    'TermsClause': {
        'paths': ['/terms'],
        'tags': ['terms'],
    },
    
    # Product categories
    'ProductCategory': {
        'paths': ['/free-trial'],
        'tags': ['product-categories'],
    },
}


def _do_revalidate(paths, tags):
    """Send the revalidation request in a background thread (fire-and-forget)."""
    try:
        url = f"{FRONTEND_URL.rstrip('/')}/api/revalidate"
        payload = json.dumps({
            'secret': REVALIDATION_SECRET,
            'paths': paths,
            'tags': tags,
        }).encode('utf-8')
        
        req = Request(
            url,
            data=payload,
            headers={'Content-Type': 'application/json'},
            method='POST',
        )
        
        with urlopen(req, timeout=5) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            logger.info(f"[Revalidate] Frontend revalidation OK: {result}")
    except URLError as e:
        logger.warning(f"[Revalidate] Could not reach frontend at {FRONTEND_URL}: {e}")
    except Exception as e:
        logger.warning(f"[Revalidate] Revalidation error: {e}")


def trigger_revalidation(model_name, instance=None, extra_paths=None, extra_tags=None):
    """
    Trigger Next.js on-demand revalidation for a given model change.
    
    Runs in a background thread so it never blocks the admin save flow.
    
    Args:
        model_name: The Django model class name (e.g. 'Service', 'BlogPost')
        instance: Optional model instance (used to derive slug-specific paths)
        extra_paths: Optional list of additional paths to revalidate
        extra_tags: Optional list of additional cache tags to invalidate
    """
    config = MODEL_REVALIDATION_MAP.get(model_name, {})
    paths = list(config.get('paths', []))
    tags = list(config.get('tags', []))
    
    # Add slug-specific paths for detail pages
    if instance:
        slug = getattr(instance, 'slug', None)
        if slug:
            if model_name == 'Service':
                paths.append(f'/services/{slug}')
            elif model_name == 'BlogPost':
                paths.append(f'/blog/{slug}')
            elif model_name == 'Portfolio':
                paths.append(f'/portfolio/{slug}')
            elif model_name == 'CaseStudy':
                paths.append(f'/case-studies/{slug}')
            elif model_name in ('Guide',):
                paths.append(f'/guides/{slug}')
    
    # Merge any extra paths/tags
    if extra_paths:
        paths.extend(extra_paths)
    if extra_tags:
        tags.extend(extra_tags)
    
    # Deduplicate
    paths = list(dict.fromkeys(paths))
    tags = list(dict.fromkeys(tags))
    
    if not paths and not tags:
        return
    
    logger.info(f"[Revalidate] Triggering for {model_name}: paths={paths}, tags={tags}")
    
    # Fire-and-forget in background thread to not block admin response
    thread = threading.Thread(target=_do_revalidate, args=(paths, tags), daemon=True)
    thread.start()


def trigger_full_revalidation():
    """Revalidate the entire site (useful for bulk operations or manual trigger)."""
    logger.info("[Revalidate] Full site revalidation triggered")
    thread = threading.Thread(
        target=_do_revalidate,
        args=([], []),  # Empty = revalidates full layout
        daemon=True,
    )
    thread.start()


def manual_revalidate_view(request):
    """Admin endpoint to manually flush backend cache and revalidate frontend."""
    if not request.user.is_authenticated or not request.user.is_staff:
        from django.http import JsonResponse
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=403)
    
    from django.core.cache import cache
    from django.http import JsonResponse
    cache.delete('consolidated_homepage_data_v1')
    try:
        cache.clear()
    except Exception:
        pass
    trigger_full_revalidation()
    return JsonResponse({
        'success': True,
        'message': 'Frontend cache revalidation triggered successfully.'
    })

