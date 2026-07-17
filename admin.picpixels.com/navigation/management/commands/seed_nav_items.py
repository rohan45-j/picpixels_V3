from django.core.management.base import BaseCommand
from navigation.models import NavigationItem


DEFAULT_HEADER_ITEMS = [
    {'label': 'Home',       'url': '/',          'order': 10},
    {'label': 'About Us',   'url': '/about',     'order': 20},
    {'label': 'Services',   'url': '/services',  'order': 30},
    {'label': 'Portfolio',  'url': '/portfolio', 'order': 40},
    {'label': 'Pricing',    'url': '/pricing',   'order': 50},
    {'label': 'Blog',       'url': '/blog',      'order': 60},
    {'label': 'Contact Us', 'url': '/contact',   'order': 70},
]


class Command(BaseCommand):
    help = 'Seed default navigation items'

    def handle(self, *args, **options):
        created = 0
        skipped = 0
        for item in DEFAULT_HEADER_ITEMS:
            _, is_new = NavigationItem.objects.update_or_create(
                label=item['label'],
                location='header',
                defaults={
                    'url': item['url'],
                    'order': item['order'],
                    'is_active': True,
                }
            )
            if is_new:
                created += 1
            else:
                skipped += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Done. Created {created}, updated {skipped} navigation items.'
            )
        )
