import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from cms.models import AboutMissionVision, AboutCoreValue, AboutProcessStep, AboutPageSetting

def seed_about_data():
    print("Seeding About Page data...")

    # 1. Page Settings
    setting, created = AboutPageSetting.objects.get_or_create(
        id=1,
        defaults={
            'mission_section_title': 'Mission & Vision',
            'mission_section_subtitle': '',
            'values_section_title': 'Our Core Values',
            'values_section_subtitle': '',
            'process_section_title': 'Our Simple 6-Step Process',
            'process_section_subtitle': '',
        }
    )
    if created:
        print("Created AboutPageSetting.")
    else:
        print("AboutPageSetting already exists.")

    # 2. Mission & Vision
    mv_items = [
        {
            'title': 'Our Mission',
            'description': 'Deliver flawless, high-quality photo edits that help businesses grow, sell more, and present their products with confidence.',
            'icon_name': 'Target',
            'display_order': 1,
            'is_active': True,
        },
        {
            'title': 'Our Vision',
            'description': 'A world where every brand has access to professional, affordable photo editing that elevates their visual identity and drives business results.',
            'icon_name': 'Eye',
            'display_order': 2,
            'is_active': True,
        },
    ]

    for item in mv_items:
        obj, created = AboutMissionVision.objects.get_or_create(
            title=item['title'],
            defaults=item,
        )
        if created:
            print(f"Created Mission/Vision: {obj.title}")
        else:
            print(f"Mission/Vision already exists: {obj.title}")

    # 3. Core Values
    values_data = [
        {'title': 'Quality First', 'description': 'We never compromise on quality. Every image goes through rigorous 3-stage quality assurance.', 'icon_name': 'Star', 'display_order': 1},
        {'title': 'Speed', 'description': 'We deliver most orders within 12-24 hours with express options available when you need it faster.', 'icon_name': 'Zap', 'display_order': 2},
        {'title': 'Pixel-Perfect', 'description': '100% hand-drawn clipping paths and manual retouching for precise, flawless results every time.', 'icon_name': 'Sparkles', 'display_order': 3},
        {'title': 'Secure', 'description': 'We use secure FTP, Wetransfer, Dropbox, and Google Drive to safely handle files up to 500 GB.', 'icon_name': 'Shield', 'display_order': 4},
        {'title': 'Global Reach', 'description': 'Serving brands, retailers, media agencies, and commercial photographers across the world.', 'icon_name': 'Globe', 'display_order': 5},
        {'title': 'Affordable', 'description': 'Competitive pricing starting from $0.25 per image with bulk discounts up to 40% available.', 'icon_name': 'DollarSign', 'display_order': 6},
    ]

    for val in values_data:
        obj, created = AboutCoreValue.objects.get_or_create(
            title=val['title'],
            defaults={**val, 'is_active': True},
        )
        if created:
            print(f"Created Core Value: {obj.title}")
        else:
            print(f"Core Value already exists: {obj.title}")

    # 4. Process Steps
    process_data = [
        {'step_number': '01', 'title': 'Request a Quote', 'description': 'Send us a quote request for the photographs you need edited.', 'icon_name': 'FileText', 'display_order': 1},
        {'step_number': '02', 'title': 'Get Your Quote', 'description': 'Receive an email within 30 minutes regarding cost and delivery time.', 'icon_name': 'Mail', 'display_order': 2},
        {'step_number': '03', 'title': 'Order Confirmation', 'description': 'Give us the green light. We begin working within your deadline.', 'icon_name': 'ClipboardCheck', 'display_order': 3},
        {'step_number': '04', 'title': 'Image Editing', 'description': 'Our expert editors process your images with precision and care.', 'icon_name': 'Image', 'display_order': 4},
        {'step_number': '05', 'title': 'Quality Check', 'description': 'A 3-stage quality assurance process ensures pixel-perfect results.', 'icon_name': 'CheckCircle', 'display_order': 5},
        {'step_number': '06', 'title': 'Increase Sales', 'description': 'Receive your edited images and sell more with high-quality visuals.', 'icon_name': 'TrendingUp', 'display_order': 6},
    ]

    for p in process_data:
        obj, created = AboutProcessStep.objects.get_or_create(
            step_number=p['step_number'],
            defaults={**p, 'is_active': True},
        )
        if created:
            print(f"Created Process Step: {obj.step_number} - {obj.title}")
        else:
            print(f"Process Step already exists: {obj.step_number} - {obj.title}")

    print("About Page data seeding completed successfully!")

if __name__ == '__main__':
    seed_about_data()
