from django.db.models import Count, Sum
from datetime import timedelta
from django.utils import timezone
from site_settings.models import SiteSetting


def site_settings(request):
    try:
        settings = SiteSetting.objects.first()
    except Exception:
        settings = None
    return {'site_settings': settings}


def navigation_items(request):
    try:
        from navigation.models import NavigationItem
        items = NavigationItem.objects.filter(
            is_active=True, location='header'
        ).order_by('order').select_related('parent')
        return {'nav_items': items}
    except Exception:
        return {'nav_items': []}


def admin_dashboard_stats(request):
    if not request.path.startswith('/admin/'):
        return {}

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

    now = timezone.now()
    month_ago = now - timedelta(days=30)
    week_ago = now - timedelta(days=7)
    six_months_ago = now - timedelta(days=180)
    year_ago = now - timedelta(days=365)

    orders = Order.objects.all()
    contacts = ContactInquiry.objects.all()
    blogs = BlogPost.objects.all()
    services = Service.objects.all()
    faqs = FAQ.objects.filter(is_active=True)

    def monthly_counts(queryset, date_field='created_at'):
        months = []
        for i in range(5, -1, -1):
            start = now.replace(day=1) - timedelta(days=30 * i)
            if i > 0:
                end = now.replace(day=1) - timedelta(days=30 * (i - 1))
            else:
                end = now
            count = queryset.filter(**{f'{date_field}__gte': start, f'{date_field}__lt': end}).count()
            months.append({'month': start.strftime('%b'), 'count': count})
        return months

    return {
        'dashboard_stats': {
            # Core content
            'total_pages': Page.objects.count(),
            'total_banners': Banner.objects.count(),
            'total_services': services.count(),
            'active_services': services.filter(is_active=True).count(),
            'total_testimonials': Testimonial.objects.filter(is_active=True).count(),

            # Blog breakdown
            'total_blog_posts': blogs.filter(is_published=True).count(),
            'draft_blog_posts': blogs.filter(is_published=False).count(),
            'featured_blog_posts': blogs.filter(is_featured=True).count(),
            'total_blog_categories': BlogCategory.objects.count(),
            'total_blog_tags': BlogTag.objects.count(),
            'recent_blog_posts': blogs.filter(is_published=True).order_by('-published_at')[:5],

            # Contact inquiries
            'total_contacts': contacts.count(),
            'unread_contacts': contacts.filter(is_read=False).count(),
            'recent_contacts': contacts.filter(is_read=False).order_by('-created_at')[:5],

            # Orders
            'total_orders': orders.count(),
            'pending_orders': orders.filter(status='pending').count(),
            'in_progress_orders': orders.filter(status='in_progress').count(),
            'completed_orders': orders.filter(status='completed').count(),
            'cancelled_orders': orders.filter(status='cancelled').count(),
            'recent_orders': orders.order_by('-created_at')[:5],

            # Growth
            'orders_this_month': orders.filter(created_at__gte=month_ago).count(),
            'orders_this_week': orders.filter(created_at__gte=week_ago).count(),
            'contacts_this_month': contacts.filter(created_at__gte=month_ago).count(),
            'contacts_this_week': contacts.filter(created_at__gte=week_ago).count(),
            'revenue_this_month': orders.filter(
                created_at__gte=month_ago, status='completed'
            ).count(),
            'order_monthly': monthly_counts(orders, 'created_at'),
            'contacts_monthly': monthly_counts(contacts, 'created_at'),

            # Users & subscriptions
            'total_users': UserProfile.objects.count(),
            'active_users': UserProfile.objects.filter(user__is_active=True).count(),
            'total_plans': PricingPlan.objects.count(),
            'active_plans': PricingPlan.objects.filter(is_active=True).count(),
            'popular_plans': PricingPlan.objects.filter(is_popular=True).count(),
            'total_subscriptions': Subscription.objects.filter(status='active').count(),
            'total_transactions': Transaction.objects.count(),

            # Team & branding
            'total_team': TeamMember.objects.filter(is_active=True).count(),
            'team_inactive': TeamMember.objects.filter(is_active=False).count(),
            'total_brands': BrandLogo.objects.count(),

            # FAQ
            'total_faqs': faqs.count(),
            'total_faq_categories': FAQCategory.objects.count(),

            # Media & infra
            'total_media': MediaFile.objects.count(),
            'total_nav_items': NavigationItem.objects.filter(is_active=True).count(),
            'total_workflows': WorkflowTemplate.objects.count(),
            'total_revisions': RevisionRequest.objects.count(),
        }
    }
