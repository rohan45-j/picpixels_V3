"""
PicPixels Enterprise - Role & Permission Matrix Data Provider
Organizes all models into clean, business-oriented modules matching the sidebar.
"""

from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType

MODULE_DEFINITIONS = [
    {
        'id': 'orders_workflows',
        'title': 'Orders & Workflows',
        'icon': 'receipt_long',
        'description': 'Customer orders, revision requests, annotations, and workflow templates',
        'models': [
            ('orders', 'order', 'Orders'),
            ('orders', 'orderitem', 'Order Items'),
            ('revisions', 'revisionrequest', 'Revision Requests'),
            ('revisions', 'imageannotation', 'Image Annotations'),
            ('workflows', 'workflowtemplate', 'Workflow Templates'),
        ]
    },
    {
        'id': 'inquiries_leads',
        'title': 'Inquiries & Leads',
        'icon': 'mail',
        'description': 'Contact form submissions, trial orders, and client requests',
        'models': [
            ('cms', 'contactinquiry', 'Contact Inquiries'),
            ('cms', 'freetrial', 'Trial & Order Requests'),
            ('cms', 'productcategory', 'Product Categories'),
        ]
    },
    {
        'id': 'services_pricing',
        'title': 'Services & Pricing',
        'icon': 'handyman',
        'description': 'Service catalog, pricing cards, plans, and config sections',
        'models': [
            ('cms', 'service', 'All Services'),
            ('cms', 'servicepricingcard', 'Service Pricing Cards'),
            ('cms', 'pricingplan', 'Pricing Plans'),
            ('cms', 'pricingconfigsection', 'Pricing Config Sections'),
            ('cms', 'pricingconfigcard', 'Pricing Config Cards'),
            ('cms', 'pricingpromotionsection', 'Promotion Sections'),
        ]
    },
    {
        'id': 'portfolio_cases',
        'title': 'Portfolio & Case Studies',
        'icon': 'work_history',
        'description': 'Showcases, portfolio comparisons, gallery, and case studies',
        'models': [
            ('portfolio', 'portfolio', 'Portfolio Items'),
            ('portfolio', 'category', 'Portfolio Categories'),
            ('portfolio', 'service', 'Portfolio Services'),
            ('portfolio', 'portfoliocomparison', 'Before / After Comparisons'),
            ('case_studies', 'casestudy', 'Case Studies'),
            ('case_studies', 'casestudycategory', 'Case Study Categories'),
            ('case_studies', 'casestudytag', 'Case Study Tags'),
        ]
    },
    {
        'id': 'blog_guides',
        'title': 'Blog & Guides',
        'icon': 'newspaper',
        'description': 'Blog articles, authors, reader feedback, and user guides',
        'models': [
            ('cms', 'blogpost', 'Blog Posts'),
            ('cms', 'blogcategory', 'Blog Categories'),
            ('cms', 'blogtag', 'Blog Tags'),
            ('cms', 'author', 'Authors'),
            ('cms', 'blogfeedback', 'Reader Feedback'),
            ('guides', 'guide', 'Guides'),
            ('guides', 'guidecategory', 'Guide Categories'),
        ]
    },
    {
        'id': 'home_management',
        'title': 'Home Management',
        'icon': 'home',
        'description': 'Homepage hero, slides, stats, trusted brands, testimonials, and FAQs',
        'models': [
            ('cms', 'herosection', 'Hero Section'),
            ('cms', 'heroslide', 'Hero Slides'),
            ('cms', 'herostat', 'Hero Stats'),
            ('cms', 'brandlogo', 'Trusted Brands'),
            ('cms', 'technology', 'Technologies'),
            ('cms', 'whychoosesection', 'Why Choose Us'),
            ('cms', 'whychoosefeaturesection', 'Why Choose Features'),
            ('cms', 'whychooseitem', 'How It Works'),
            ('cms', 'testimonial', 'Testimonials'),
            ('cms', 'homepagectasection', 'Homepage CTA'),
            ('cms', 'faqcategory', 'FAQ Categories'),
            ('cms', 'faq', 'FAQs'),
            ('cms', 'teammember', 'Team Members'),
        ]
    },
    {
        'id': 'company_pages',
        'title': 'Company & Pages',
        'icon': 'auto_stories',
        'description': 'Static pages, company story, values, process, and legal policies',
        'models': [
            ('cms', 'page', 'Pages'),
            ('cms', 'pagecategory', 'Page Categories'),
            ('cms', 'aboutstorysection', 'Company Story (About Us)'),
            ('cms', 'aboutmissionvision', 'Mission & Vision'),
            ('cms', 'aboutcorevalue', 'Core Values'),
            ('cms', 'aboutprocessstep', '6-Step Process'),
            ('cms', 'aboutpagesetting', 'Section Headings'),
            ('cms', 'privacypolicypage', 'Privacy Policy'),
            ('cms', 'termsconditionpage', 'Terms & Conditions'),
        ]
    },
    {
        'id': 'media_library',
        'title': 'Media Library',
        'icon': 'perm_media',
        'description': 'Uploaded media files and asset library',
        'models': [
            ('media_library', 'mediafile', 'Media Files'),
        ]
    },
    {
        'id': 'email_notifications',
        'title': 'Email & Notifications',
        'icon': 'mark_email_unread',
        'description': 'System notifications, SMTP setup, recipient emails, and templates',
        'models': [
            ('notifications', 'notification', 'Notifications'),
            ('notifications', 'emailconfiguration', 'Email & SMTP Settings'),
            ('notifications', 'adminnotificationemail', 'Admin Recipient Emails'),
            ('notifications', 'emailtemplate', 'Email Templates'),
        ]
    },
    {
        'id': 'website_settings',
        'title': 'Website Settings',
        'icon': 'settings',
        'description': 'Site configurations, SEO settings, navigation menus, and banners',
        'models': [
            ('site_settings', 'sitesetting', 'Site Settings'),
            ('site_settings', 'seosetting', 'SEO Settings'),
            ('navigation', 'navigationitem', 'Navigation Menus'),
            ('cms', 'banner', 'Promotional Banners'),
        ]
    },
    {
        'id': 'users_roles',
        'title': 'Users & Roles',
        'icon': 'group',
        'description': 'User accounts, role creation, and permissions assignment',
        'models': [
            ('auth', 'user', 'Users'),
            ('auth', 'group', 'Roles & Permissions'),
        ]
    },
]


def build_permission_matrix(group=None):
    """
    Builds a structured dictionary of modules, models, and permissions.
    Marks permissions as 'checked' if the group already has them.
    """
    checked_ids = set()
    if group and group.pk:
        checked_ids = set(group.permissions.values_list('id', flat=True))

    # Pre-fetch all permissions in one query
    all_perms = Permission.objects.select_related('content_type').all()
    perms_map = {}
    for perm in all_perms:
        key = (perm.content_type.app_label, perm.content_type.model, perm.codename.split('_')[0])
        perms_map[key] = perm

    total_perms = 0
    total_checked = 0
    modules_data = []

    for mod in MODULE_DEFINITIONS:
        mod_rows = []
        mod_total = 0
        mod_checked = 0

        for app_label, model_name, display_name in mod['models']:
            row_perms = {}
            row_all_checked = True
            has_any_perm = False

            for action in ['view', 'add', 'change', 'delete']:
                perm = perms_map.get((app_label, model_name, action))
                if perm:
                    has_any_perm = True
                    is_checked = perm.id in checked_ids
                    mod_total += 1
                    total_perms += 1
                    if is_checked:
                        mod_checked += 1
                        total_checked += 1
                    else:
                        row_all_checked = False

                    row_perms[action] = {
                        'id': perm.id,
                        'name': perm.name,
                        'codename': perm.codename,
                        'checked': is_checked,
                    }
                else:
                    row_perms[action] = None

            if has_any_perm:
                mod_rows.append({
                    'display_name': display_name,
                    'app_label': app_label,
                    'model_name': model_name,
                    'perms': row_perms,
                    'all_checked': row_all_checked and (mod_total > 0),
                })

        modules_data.append({
            'id': mod['id'],
            'title': mod['title'],
            'icon': mod['icon'],
            'description': mod['description'],
            'rows': mod_rows,
            'total_perms': mod_total,
            'checked_perms': mod_checked,
            'all_checked': (mod_total > 0) and (mod_total == mod_checked),
        })

    return {
        'modules': modules_data,
        'total_perms': total_perms,
        'total_checked': total_checked,
    }
