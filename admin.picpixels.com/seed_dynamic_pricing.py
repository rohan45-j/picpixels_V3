import os, sys, django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from cms.models import Service, ServiceUnitRange, ServicePricingCard, ServicePricingCardPrice
from django.db import transaction

@transaction.atomic
def seed():
    if ServiceUnitRange.objects.exists():
        print("Data already exists, skipping seed.")
        return

    bg = Service.objects.get(slug="background-removal-service")
    cp = Service.objects.get(slug="clipping-path-service")
    cc = Service.objects.get(slug="color-correction-service")

    ur_data = {
        bg: [
            ("1-25 images", 0), ("26-100 images", 1), ("101-500 images", 2), ("500+ images", 3),
        ],
        cp: [
            ("1-25 images", 0), ("26-100 images", 1), ("101-500 images", 2), ("500+ images", 3),
        ],
        cc: [
            ("1-25 images", 0), ("26-100 images", 1), ("101-500 images", 2), ("500+ images", 3),
        ],
    }

    unit_ranges = {}
    for svc, ranges in ur_data.items():
        for label, order in ranges:
            ur = ServiceUnitRange.objects.create(service=svc, label=label, sort_order=order)
            unit_ranges[(svc.slug, label)] = ur

    cards_data = {
        bg: [
            ("Basic", "Simple background removal with standard edges",
             ["Up to 5MB file size", "24-hour turnaround", "Basic edge refinement", "JPEG output"],
             0, "", ""),
            ("Standard", "Advanced background removal with hair/fur detail",
             ["Up to 20MB file size", "12-hour turnaround", "Hair & fur detailing",
              "JPEG/PNG/TIFF output", "Color matching"],
             1, "Popular", "#FF8A50"),
            ("Premium", "Enterprise-grade background removal with full retouching",
             ["Unlimited file size", "6-hour turnaround", "Hair & fur detailing",
              "JPEG/PNG/TIFF/PSD output", "Color matching & grading", "Shadow creation",
              "Dedicated project manager"],
             2, "Best Value", "#10B981"),
        ],
        cp: [
            ("Basic", "Simple clipping path for basic shapes",
             ["Up to 5 paths", "24-hour turnaround", "JPEG output"],
             0, "", ""),
            ("Standard", "Multi-path clipping for complex objects",
             ["Up to 20 paths", "12-hour turnaround", "JPEG/PNG/TIFF output", "Drop shadow included"],
             1, "Popular", "#FF8A50"),
            ("Premium", "Ultra-precise clipping for any object",
             ["Unlimited paths", "6-hour turnaround", "JPEG/PNG/TIFF/PSD output",
              "Drop shadow & reflection", "Full retouching included"],
             2, "Best Value", "#10B981"),
        ],
        cc: [
            ("Basic", "Auto color correction",
             ["Auto white balance", "Exposure adjustment", "JPEG output", "24-hour turnaround"],
             0, "", ""),
            ("Standard", "Manual color grading",
             ["Manual white balance", "Exposure & contrast", "Color cast removal",
              "JPEG/TIFF output", "12-hour turnaround"],
             1, "Popular", "#FF8A50"),
            ("Premium", "Professional color grading",
             ["Full manual grading", "Skin tone matching", "Product color accuracy",
              "JPEG/TIFF/PSD output", "6-hour turnaround", "Dedicated colorist"],
             2, "Best Value", "#10B981"),
        ],
    }

    prices_map = {
        ("background-removal-service", "1-25 images"): [("Basic", 1.50, None), ("Standard", 2.50, 3.50), ("Premium", 4.50, 6.00)],
        ("background-removal-service", "26-100 images"): [("Basic", 1.20, None), ("Standard", 2.00, 3.00), ("Premium", 3.50, 5.00)],
        ("background-removal-service", "101-500 images"): [("Basic", 0.90, None), ("Standard", 1.50, 2.50), ("Premium", 2.80, 4.00)],
        ("background-removal-service", "500+ images"): [("Basic", 0.65, None), ("Standard", 1.10, 2.00), ("Premium", 2.20, 3.50)],
        ("clipping-path-service", "1-25 images"): [("Basic", 2.00, None), ("Standard", 3.50, 5.00), ("Premium", 6.00, 8.00)],
        ("clipping-path-service", "26-100 images"): [("Basic", 1.60, None), ("Standard", 2.80, 4.00), ("Premium", 5.00, 7.00)],
        ("clipping-path-service", "101-500 images"): [("Basic", 1.20, None), ("Standard", 2.20, 3.50), ("Premium", 4.00, 6.00)],
        ("clipping-path-service", "500+ images"): [("Basic", 0.90, None), ("Standard", 1.60, 2.80), ("Premium", 3.00, 5.00)],
        ("color-correction-service", "1-25 images"): [("Basic", 1.00, None), ("Standard", 2.00, 3.00), ("Premium", 3.50, 5.00)],
        ("color-correction-service", "26-100 images"): [("Basic", 0.80, None), ("Standard", 1.60, 2.50), ("Premium", 2.80, 4.00)],
        ("color-correction-service", "101-500 images"): [("Basic", 0.60, None), ("Standard", 1.20, 2.00), ("Premium", 2.20, 3.50)],
        ("color-correction-service", "500+ images"): [("Basic", 0.45, None), ("Standard", 0.90, 1.50), ("Premium", 1.60, 2.80)],
    }

    for svc, cards in cards_data.items():
        for name, desc, features, order, badge, badge_color in cards:
            card = ServicePricingCard.objects.create(
                service=svc, name=name, description=desc,
                features=features, sort_order=order,
                badge_text=badge, badge_color=badge_color,
                button_text="Select Plan"
            )
            for ur_label, _ in ur_data[svc]:
                ur = unit_ranges[(svc.slug, ur_label)]
                key = (svc.slug, ur_label)
                if key in prices_map:
                    for cname, price_val, orig_val in prices_map[key]:
                        if cname == name:
                            ServicePricingCardPrice.objects.create(
                                card=card, unit_range=ur,
                                price=price_val,
                                original_price=orig_val
                            )
                            break

    print(f"Seeded {ServiceUnitRange.objects.count()} unit ranges, "
          f"{ServicePricingCard.objects.count()} cards, "
          f"{ServicePricingCardPrice.objects.count()} prices.")

if __name__ == "__main__":
    seed()
