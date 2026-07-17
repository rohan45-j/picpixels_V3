from django.contrib import admin
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta

from unfold.admin import ModelAdmin
from cms.models import Page, Banner, Service, Testimonial, BlogPost, ContactInquiry
from orders.models import Order
from users.models import UserProfile


class CoreAdminSite(admin.AdminSite):
    site_title = 'PicPicxels Admin'
    site_header = 'PicPicxels'
    index_title = 'Dashboard'


def get_dashboard_stats():
    now = timezone.now()
    month_ago = now - timedelta(days=30)

    return {
        'total_pages': Page.objects.count(),
        'total_banners': Banner.objects.count(),
        'total_services': Service.objects.count(),
        'total_testimonials': Testimonial.objects.filter(is_active=True).count(),
        'total_blog_posts': BlogPost.objects.filter(is_published=True).count(),
        'total_contacts': ContactInquiry.objects.count(),
        'unread_contacts': ContactInquiry.objects.filter(is_read=False).count(),
        'total_orders': Order.objects.count(),
        'pending_orders': Order.objects.filter(status='pending').count(),
        'in_progress_orders': Order.objects.filter(status='in_progress').count(),
        'recent_orders': Order.objects.order_by('-created_at')[:5],
        'recent_contacts': ContactInquiry.objects.filter(is_read=False).order_by('-created_at')[:5],
        'total_users': UserProfile.objects.count(),
        'active_users': UserProfile.objects.filter(role='client').count(),
        'orders_this_month': Order.objects.filter(created_at__gte=month_ago).count(),
        'contacts_this_month': ContactInquiry.objects.filter(created_at__gte=month_ago).count(),
    }
