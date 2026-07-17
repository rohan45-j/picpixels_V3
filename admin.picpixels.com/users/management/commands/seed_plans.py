from django.core.management.base import BaseCommand
from users.models import SubscriptionPlan

class Command(BaseCommand):
    help = 'Seeds initial subscription plans: Solo, Professional, Enterprise'

    def handle(self, *args, **kwargs):
        plans_data = [
            {
                'name': 'Solo',
                'monthly_fee': 9.00,
                'annual_fee': 86.00,
                'per_image_base_discount': 0.00,
                'turnaround_hours_guaranteed': 48,
                'features': {
                    'description': 'Best for low-volume image needs.',
                    'limit_images_per_month': 150,
                    'advanced_retouching': False,
                    'priority_support': False,
                }
            },
            {
                'name': 'Professional',
                'monthly_fee': 95.00,
                'annual_fee': 912.00,
                'per_image_base_discount': 15.00,
                'turnaround_hours_guaranteed': 24,
                'features': {
                    'description': 'Designed for fast growing e-commerce brands.',
                    'limit_images_per_month': 1500,
                    'advanced_retouching': True,
                    'priority_support': True,
                }
            },
            {
                'name': 'Enterprise',
                'monthly_fee': 1995.00,
                'annual_fee': 19152.00,
                'per_image_base_discount': 30.00,
                'turnaround_hours_guaranteed': 3,
                'features': {
                    'description': 'Custom workflows, dedicated retouchers, absolute scaling.',
                    'limit_images_per_month': 99999,
                    'advanced_retouching': True,
                    'priority_support': True,
                    'dedicated_account_manager': True,
                }
            }
        ]

        for p_data in plans_data:
            plan, created = SubscriptionPlan.objects.get_or_create(
                name=p_data['name'],
                defaults=p_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Successfully seeded plan: {plan.name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Plan {plan.name} already exists. Skipping."))
