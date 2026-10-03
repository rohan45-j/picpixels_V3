import random
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from portfolio.models import Portfolio, Category, Service

PORTFOLIO_ITEMS = [
    # Fashion & Apparel (Category 1)
    {
        "category": "Apparel & Fashion",
        "service": "Ghost Mannequin",
        "title": "Nordic Wool Overcoat 3D Mannequin Removal",
        "client": "Vanguard Outerwear Oslo",
        "short_description": "Clean neckline reconstruction, symmetric drape alignment, and subtle drop shadow for premium winter catalog.",
        "full_description": "Extensive ghost mannequin processing on heavy wool overcoats. Reconstructed the interior collar and label lining, balanced shadow density, and removed all fabric creases for high-resolution e-commerce zoom.",
        "featured": True,
        "sort_order": 1,
    },
    {
        "category": "Apparel & Fashion",
        "service": "Clipping Path",
        "title": "Silk Evening Gown Edge Clipping & Masking",
        "client": "Maison Éléganza Paris",
        "short_description": "Sub-pixel precision pen tool clipping around delicate lace fringes and translucent organza sleeves.",
        "full_description": "Multi-layer alpha channel masking combined with hand-drawn vector paths to preserve every micro-fiber along transparent silk hems.",
        "featured": True,
        "sort_order": 2,
    },
    {
        "category": "Apparel & Fashion",
        "service": "Color Correction",
        "title": "Athletic Windbreaker Multi-Colorway Variants",
        "client": "Apex Performance Athletics",
        "short_description": "Pantone-matched color grading across 12 vibrant seasonal colorways from a single master shot.",
        "full_description": "Saved the client $8,000 in photography costs by transforming one studio sample into twelve accurate chromatic variants matching Pantone TCX standards.",
        "featured": False,
        "sort_order": 3,
    },
    {
        "category": "Apparel & Fashion",
        "service": "Photo Retouching",
        "title": "Cashmere Knitwear Texture & Crease Clean-up",
        "client": "Haven & Co. Knitwear",
        "short_description": "Wrinkle smoothing and fiber de-fuzzing while retaining natural organic wool grain.",
        "full_description": "Frequency separation workflow to eliminate transit wrinkles and stray lint without compromising tactile cashmere softness.",
        "featured": False,
        "sort_order": 4,
    },
    {
        "category": "Apparel & Fashion",
        "service": "Ghost Mannequin",
        "title": "Tailored Linen Blazer Hollow-Man Hollow Removal",
        "client": "Sartorial Row London",
        "short_description": "Inner lining stitch matching and lapel roll restoration for summer bespoke suits.",
        "full_description": "Seamless joint blending between front shot and inner neck insert with natural curvature perspective matching.",
        "featured": False,
        "sort_order": 5,
    },

    # Jewelry & Luxury (Category 2)
    {
        "category": "Jewelry & Watches",
        "service": "Photo Retouching",
        "title": "18K Rose Gold Diamond Solitaire High-End Polish",
        "client": "Aura Fine Jewelers NYC",
        "short_description": "Specular glare enhancement, prong symmetry restoration, and zero-defect metal polish.",
        "full_description": "Multi-exposure focus stacking clean-up, facet-by-facet light reflection painting, and micro-dust eradication for billboard resolution print.",
        "featured": True,
        "sort_order": 6,
    },
    {
        "category": "Jewelry & Watches",
        "service": "Shadow Creation",
        "title": "Swiss Chronograph Floating Cast & Reflection Shadow",
        "client": "Chronos Horology Geneva",
        "short_description": "Dual-layer soft drop shadow with realistic crystal glass dial luminescence.",
        "full_description": "Engineered custom elliptical drop shadows simulating physical diffuse lightbox conditions to ground luxury timepieces on clean white backgrounds.",
        "featured": True,
        "sort_order": 7,
    },
    {
        "category": "Jewelry & Watches",
        "service": "Clipping Path",
        "title": "Platinum Tennis Bracelet Fine Link Isolation",
        "client": "Lumina Diamonds Antwerp",
        "short_description": "Over 140 vector anchor points per link isolating platinum basket settings flawlessly.",
        "full_description": "Ultra-complex hand-drawn vector clipping paths separating intricate link openings and safety clasps from velvet display busts.",
        "featured": False,
        "sort_order": 8,
    },
    {
        "category": "Jewelry & Watches",
        "service": "Color Correction",
        "title": "Emerald & Sapphire Cushion Cut Hue Balancing",
        "client": "Verdant Gemological London",
        "short_description": "Selective saturation calibration to reflect true pavilion brilliance without chromatic fringing.",
        "full_description": "Hue angle adjustments matching laboratory gem certs, eliminating blue UV bounce from studio flashes.",
        "featured": False,
        "sort_order": 9,
    },

    # Footwear & Leather Goods (Category 3)
    {
        "category": "Footwear & Leather",
        "service": "Photo Retouching",
        "title": "Full-Grain Leather Oxford Shoe Shape Symmetry",
        "client": "Crockett & Sons Northampton",
        "short_description": "Sole edge smoothing, toe-box crease softening, and mirror burnish reflection.",
        "full_description": "Balanced the arch perspective, evened out welt stitching irregularities, and created rich patina tonal gradients.",
        "featured": True,
        "sort_order": 10,
    },
    {
        "category": "Footwear & Leather",
        "service": "Shadow Creation",
        "title": "Running Sneaker Dynamic Floating Shadow Effect",
        "client": "Velocity Athletics Oregon",
        "short_description": "Dynamic multi-tier drop and contact shadow producing motion feel for runner hero banners.",
        "full_description": "Created realistic depth with dual contact points and feathered ambient occlusion matching 45-degree key light direction.",
        "featured": False,
        "sort_order": 11,
    },
    {
        "category": "Footwear & Leather",
        "service": "Clipping Path",
        "title": "Hiking Boot Tread & Lace Loop Precise Extraction",
        "client": "Alpinist Gear Boulder",
        "short_description": "Rigorous vector cutout navigating deep Vibram lug grooves and open metal D-ring eyelets.",
        "full_description": "Isolated aggressive mountain boot silhouettes across complex outdoor shoot backdrops for clean catalog staging.",
        "featured": False,
        "sort_order": 12,
    },
    {
        "category": "Footwear & Leather",
        "service": "Photo Retouching",
        "title": "Suede Chelsea Boot Nap Clean-up & Color Depth",
        "client": "Cobblestone Bootmakers",
        "short_description": "Even suede nap tone, elastic gusset de-linting, and pull-tab alignment.",
        "full_description": "Surface texture recovery after harsh studio lighting, bringing out velvety suede depth.",
        "featured": False,
        "sort_order": 13,
    },

    # Beauty & Cosmetics (Category 4)
    {
        "category": "Beauty & Cosmetics",
        "service": "Photo Retouching",
        "title": "Matte Lipstick Bullet & Case Reflection Clean-up",
        "client": "Velvet Luxe Cosmetics",
        "short_description": "Poreless bullet tip contouring, magnetic case scratch removal, and glossy band shine.",
        "full_description": "Perfected lipstick tip slope, smoothed micro-wax air bubbles, and generated crystal-clear gold rim reflections.",
        "featured": True,
        "sort_order": 14,
    },
    {
        "category": "Beauty & Cosmetics",
        "service": "Color Correction",
        "title": "Skincare Foundation 40-Shade Swatch Calibration",
        "client": "PureSkin Laboratories SF",
        "short_description": "Strict hex code skin tone matching across 40 foundation bottles and arm swatches.",
        "full_description": "Calibrated undertones (cool, neutral, warm) using spectral measurement references for accurate online shade finders.",
        "featured": False,
        "sort_order": 15,
    },
    {
        "category": "Beauty & Cosmetics",
        "service": "Shadow Creation",
        "title": "Frosted Glass Serum Dropper Bottle Refraction Shadow",
        "client": "Botanica Organics Sydney",
        "short_description": "Soft gradient contact shadow paired with translucent glass bottom caustics.",
        "full_description": "Synthesized realistic optical caustic highlights underneath amber glass bottles for luxury apothecary branding.",
        "featured": False,
        "sort_order": 16,
    },
    {
        "category": "Beauty & Cosmetics",
        "service": "Clipping Path",
        "title": "Mascara Wand Micro-Bristle Fine Channel Isolation",
        "client": "LashArchitect Milan",
        "short_description": "Sub-millimeter bristle hair masking without halo artifacts against dark and light backgrounds.",
        "full_description": "Combined edge detection with hand-drawn vector paths to keep individual silicone bristle tips crisp.",
        "featured": False,
        "sort_order": 17,
    },

    # Furniture & Home Decor (Category 5)
    {
        "category": "Furniture & Interior",
        "service": "Clipping Path",
        "title": "Mid-Century Rattan Lounge Chair Intricate Cutout",
        "client": "ScandiLiving Stockholm",
        "short_description": "Hundreds of cane weave negative spaces cleanly isolated for architectural composites.",
        "full_description": "Meticulously cleared over 300 background voids within hand-woven rattan backing, outputting seamless PNG and PSD files.",
        "featured": False,
        "sort_order": 18,
    },
    {
        "category": "Furniture & Interior",
        "service": "Photo Retouching",
        "title": "Solid Walnut Dining Table Grain & Gloss Enhancement",
        "client": "Arbor Craft Woodworks",
        "short_description": "Stray reflection removal, grain clarity accentuation, and matte oil sheen balancing.",
        "full_description": "Removed wide studio softbox reflections from polished tabletop while amplifying organic walnut curl patterns.",
        "featured": False,
        "sort_order": 19,
    },
    {
        "category": "Furniture & Interior",
        "service": "Shadow Creation",
        "title": "Modular Velvet Sectional Sofa Natural Floor Occlusion",
        "client": "Moda Living Melbourne",
        "short_description": "Expansive ambient floor shadow matching natural room window lighting angle.",
        "full_description": "Created realistic 3-step feathered floor contact shadow anchoring a 5-piece sectional couch naturally on pure white.",
        "featured": False,
        "sort_order": 20,
    },
    {
        "category": "Furniture & Interior",
        "service": "Color Correction",
        "title": "Ceramic Table Lamp Base Color Harmony Variants",
        "client": "Luce & Forma Milan",
        "short_description": "Rendered Terracotta, Matte Olive, and Cobalt glaze variations from white bisque master.",
        "full_description": "Converted single raw studio shot into complete interior designer palette catalog assets.",
        "featured": False,
        "sort_order": 21,
    },

    # Electronics & Consumer Tech (Category 6)
    {
        "category": "Electronics & Tech",
        "service": "Photo Retouching",
        "title": "Wireless ANC Headphones Matte & Metallic Finish",
        "client": "SonicStream Audio Berlin",
        "short_description": "Anodized aluminum polish, headband stitch tightening, and ear-cushion seam smoothing.",
        "full_description": "Erased factory molding lines, dust motes from silicone pads, and created sleek gradient reflections on metallic earcups.",
        "featured": False,
        "sort_order": 22,
    },
    {
        "category": "Electronics & Tech",
        "service": "Clipping Path",
        "title": "Mechanical Gaming Keyboard Cable & Keycap Extraction",
        "client": "KeyForge Peripherals Tokyo",
        "short_description": "Crisp per-key edge isolation and braided cable vector pathing.",
        "full_description": "Isolated 104 keycaps, RGB diffuse trim, and coiled aviator cable without jagged edge degradation.",
        "featured": False,
        "sort_order": 23,
    },
    {
        "category": "Electronics & Tech",
        "service": "Shadow Creation",
        "title": "Smart Home Hub 360 Floating Soft Shadow",
        "client": "OmniSense IoT Austin",
        "short_description": "Clean circular contact shadow for interactive 360-degree rotating web player.",
        "full_description": "Delivered standardized drop shadow geometry across 36 turntable frames for interactive web viewing.",
        "featured": False,
        "sort_order": 24,
    },

    # Automotive & Accessories (Category 7)
    {
        "category": "Automotive & Industrial",
        "service": "Photo Retouching",
        "title": "Forged Monoblock Alloy Wheel Precision Polish",
        "client": "Apex Motorsport Wheels Munich",
        "short_description": "Machined face shine enhancement, caliper reflection clean-up, and tire tread deepening.",
        "full_description": "Removed shop floor reflections from chrome lip, deepened satin black spokes, and eliminated tire mold tags.",
        "featured": False,
        "sort_order": 25,
    },
    {
        "category": "Automotive & Industrial",
        "service": "Clipping Path",
        "title": "Carbon Fiber Aero Wing Endplate & Stanchion Cutout",
        "client": "Velox Aero Engineering",
        "short_description": "Precision cutout preserving twill carbon weave contrast along aerodynamic trailing edges.",
        "full_description": "Separated complex racecar aero wing components from track paddock background for official distributor parts catalog.",
        "featured": False,
        "sort_order": 26,
    },
]


class Command(BaseCommand):
    help = 'Seed bulk portfolio items with categories and services'

    def handle(self, *args, **options):
        # 1. Ensure categories exist
        category_map = {}
        category_names = [
            ("Apparel & Fashion", 1),
            ("Jewelry & Watches", 2),
            ("Footwear & Leather", 3),
            ("Beauty & Cosmetics", 4),
            ("Furniture & Interior", 5),
            ("Electronics & Tech", 6),
            ("Automotive & Industrial", 7),
        ]
        for name, order in category_names:
            slug = slugify(name)
            cat, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={"name": name, "sort_order": order, "is_active": True}
            )
            category_map[name] = cat

        # 2. Ensure services exist
        service_map = {}
        service_names = [
            "Clipping Path", "Ghost Mannequin", "Photo Retouching",
            "Color Correction", "Shadow Creation", "Image Masking"
        ]
        for i, sname in enumerate(service_names):
            slug = slugify(sname)
            srv, _ = Service.objects.get_or_create(
                slug=slug,
                defaults={"name": sname, "sort_order": i + 1}
            )
            service_map[sname] = srv

        # 3. Create or update portfolio items
        created_count = 0
        updated_count = 0
        for item_data in PORTFOLIO_ITEMS:
            cat = category_map[item_data["category"]]
            srv = service_map.get(item_data["service"])
            title = item_data["title"]
            slug = slugify(title)

            portfolio, created = Portfolio.objects.update_or_create(
                slug=slug,
                defaults={
                    "title": title,
                    "category": cat,
                    "service": srv,
                    "client": item_data["client"],
                    "short_description": item_data["short_description"],
                    "full_description": item_data["full_description"],
                    "featured": item_data["featured"],
                    "is_published": True,
                    "sort_order": item_data["sort_order"],
                    "meta_title": f"{title} | PicPixels Portfolio",
                    "meta_description": item_data["short_description"],
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        total = Portfolio.objects.count()
        published = Portfolio.objects.filter(is_published=True).count()
        featured = Portfolio.objects.filter(featured=True, is_published=True).count()

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded bulk portfolio: {created_count} created, {updated_count} updated.\n"
            f"Total items in DB: {total} (Published: {published}, Featured on Home: {featured})"
        ))
