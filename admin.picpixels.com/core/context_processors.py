from django.db.models import Count, Sum
from datetime import timedelta
from django.utils import timezone
from django.core.cache import cache
from site_settings.models import SiteSetting


_SITE_SETTINGS_CACHE_KEY = 'site_settings_context'
_NAV_ITEMS_CACHE_KEY = 'nav_items_context'
_DASHBOARD_CACHE_KEY = 'admin_dashboard_stats'
_DASHBOARD_CACHE_TTL = 300

from django.conf import settings as django_settings


def site_settings(request):
    settings = cache.get(_SITE_SETTINGS_CACHE_KEY)
    if settings is None:
        try:
            settings = SiteSetting.objects.first()
            if settings:
                cache.set(_SITE_SETTINGS_CACHE_KEY, settings, 300)
        except Exception:
            settings = None

    frontend_url = getattr(django_settings, 'FRONTEND_URL', 'https://picpixels.com').rstrip('/')
    if request:
        try:
            host = request.get_host().lower()
            if 'localhost' not in host and '127.0.0.1' not in host:
                if 'localhost' in frontend_url or '127.0.0.1' in frontend_url:
                    frontend_url = 'https://picpixels.com'
        except Exception:
            pass

    return {
        'site_settings': settings,
        'frontend_url': frontend_url,
    }


def navigation_items(request):
    # Admin panel uses UNFOLD sidebar, never public header navigation items. Skip for speed!
    if request and request.path.startswith('/admin'):
        return {'nav_items': []}

    items = cache.get(_NAV_ITEMS_CACHE_KEY)
    if items is None:
        try:
            from navigation.models import NavigationItem
            items = list(NavigationItem.objects.filter(
                is_active=True, location='header'
            ).order_by('order').select_related('parent'))
            cache.set(_NAV_ITEMS_CACHE_KEY, items, 300)
        except Exception:
            items = []
    return {'nav_items': items}


def admin_dashboard_stats(request):
    # Only compute dashboard stats on the actual dashboard home page (/admin or /admin/)
    if not request or request.path.rstrip('/') != '/admin':
        return {}

    stats = cache.get(_DASHBOARD_CACHE_KEY)
    if stats is not None:
        return {'dashboard_stats': stats}

    from cms.models import (
        Page, Banner, Service, Testimonial, BlogPost,
        ContactInquiry, TeamMember, BrandLogo, FAQ,
        BlogCategory, BlogTag, FAQCategory, PricingPlan
    )
    from orders.models import Order
    from users.models import UserProfile, Subscription, Transaction
    from navigation.models import NavigationItem
    from media_library.models import MediaFile
    from workflows.models import WorkflowTemplate
    from revisions.models import RevisionRequest
    from django.db.models import Count, Q

    now = timezone.now()
    month_ago = now - timedelta(days=30)
    week_ago = now - timedelta(days=7)

    # 1. Orders aggregation (1 query instead of 8)
    orders_agg = Order.objects.aggregate(
        total=Count('id'),
        pending=Count('id', filter=Q(status='pending')),
        in_progress=Count('id', filter=Q(status='in_progress')),
        completed=Count('id', filter=Q(status='completed')),
        cancelled=Count('id', filter=Q(status='cancelled')),
        this_month=Count('id', filter=Q(created_at__gte=month_ago)),
        this_week=Count('id', filter=Q(created_at__gte=week_ago)),
        completed_this_month=Count('id', filter=Q(created_at__gte=month_ago, status='completed')),
    )

    # 2. Contacts aggregation (1 query instead of 5)
    contacts_agg = ContactInquiry.objects.aggregate(
        total=Count('id'),
        unread=Count('id', filter=Q(is_read=False)),
        this_month=Count('id', filter=Q(created_at__gte=month_ago)),
        this_week=Count('id', filter=Q(created_at__gte=week_ago)),
    )

    # 3. Blogs aggregation (1 query instead of 4)
    blogs_agg = BlogPost.objects.aggregate(
        published=Count('id', filter=Q(is_published=True)),
        draft=Count('id', filter=Q(is_published=False)),
        featured=Count('id', filter=Q(is_featured=True)),
    )

    # 4. Services aggregation (1 query instead of 2)
    services_agg = Service.objects.aggregate(
        total=Count('id'),
        active=Count('id', filter=Q(is_active=True)),
    )

    # 5. Pricing plans aggregation (1 query instead of 3)
    plans_agg = PricingPlan.objects.aggregate(
        total=Count('id'),
        active=Count('id', filter=Q(is_active=True)),
        popular=Count('id', filter=Q(is_popular=True)),
    )

    # 6. Team members aggregation (1 query instead of 2)
    team_agg = TeamMember.objects.aggregate(
        total=Count('id'),
        active=Count('id', filter=Q(is_active=True)),
        inactive=Count('id', filter=Q(is_active=False)),
    )

    stats = {
        # Core content
        'total_pages': Page.objects.count(),
        'total_banners': Banner.objects.count(),
        'total_services': services_agg['total'],
        'active_services': services_agg['active'],
        'total_testimonials': Testimonial.objects.filter(is_active=True).count(),

        # Blog breakdown
        'total_blog_posts': blogs_agg['published'],
        'draft_blog_posts': blogs_agg['draft'],
        'featured_blog_posts': blogs_agg['featured'],
        'total_blog_categories': BlogCategory.objects.count(),
        'total_blog_tags': BlogTag.objects.count(),
        'recent_blog_posts': list(BlogPost.objects.filter(is_published=True).order_by('-published_at')[:5]),

        # Contact inquiries
        'total_contacts': contacts_agg['total'],
        'unread_contacts': contacts_agg['unread'],
        'recent_contacts': list(ContactInquiry.objects.filter(is_read=False).order_by('-created_at')[:5]),

        # Orders
        'total_orders': orders_agg['total'],
        'pending_orders': orders_agg['pending'],
        'in_progress_orders': orders_agg['in_progress'],
        'completed_orders': orders_agg['completed'],
        'cancelled_orders': orders_agg['cancelled'],
        'recent_orders': list(Order.objects.order_by('-created_at')[:5]),

        # Growth
        'orders_this_month': orders_agg['this_month'],
        'orders_this_week': orders_agg['this_week'],
        'contacts_this_month': contacts_agg['this_month'],
        'contacts_this_week': contacts_agg['this_week'],
        'revenue_this_month': orders_agg['completed_this_month'],
        'order_monthly': [],
        'contacts_monthly': [],

        # Users & subscriptions
        'total_users': UserProfile.objects.count(),
        'active_users': UserProfile.objects.filter(user__is_active=True).count(),
        'total_plans': plans_agg['total'],
        'active_plans': plans_agg['active'],
        'popular_plans': plans_agg['popular'],
        'total_subscriptions': Subscription.objects.filter(status='active').count(),
        'total_transactions': Transaction.objects.count(),

        # Team & branding
        'total_team': team_agg['active'],
        'team_inactive': team_agg['inactive'],
        'total_brands': BrandLogo.objects.count(),

        # FAQ
        'total_faqs': FAQ.objects.filter(is_active=True).count(),
        'total_faq_categories': FAQCategory.objects.count(),

        # Media & infra
        'total_media': MediaFile.objects.count(),
        'total_nav_items': NavigationItem.objects.filter(is_active=True).count(),
        'total_workflows': WorkflowTemplate.objects.count(),
        'total_revisions': RevisionRequest.objects.count(),
    }

    cache.set(_DASHBOARD_CACHE_KEY, stats, 600)
    return {'dashboard_stats': stats}

