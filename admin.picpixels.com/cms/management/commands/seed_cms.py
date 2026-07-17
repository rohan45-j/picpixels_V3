import os
from datetime import datetime, timezone
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from cms.models import (
    Page, Section, Banner, Service, Testimonial,
    BlogCategory, BlogTag,
    BlogPost, BlogContentSection, FAQCategory, FAQ, TeamMember, BrandLogo,
    PricingPlan,
)
from site_settings.models import SiteSetting, SEOSetting
from navigation.models import NavigationItem


class Command(BaseCommand):
    help = "Seed CMS, Site Settings, Navigation, and SEO content for PicPicxels"

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Starting seeding CMS data..."))

        if not SiteSetting.objects.exists():
            SiteSetting.objects.create(
                site_name="PicPicxels",
                tagline="Professional Photo Editing Services at Affordable Pricing",
                support_email="info@picpicxels.com",
                support_phone="+880 1622915832",
                address="71&45, House, Road-28, Dhaka 1230, Bangladesh",
                social_links={
                    "facebook": "https://www.facebook.com/picpicxelsLTD",
                    "linkedin": "https://www.linkedin.com/company/photoexpert-bd/",
                    "instagram": "https://www.instagram.com/picpicxelsltd/",
                    "pinterest": "https://www.pinterest.com/picpicxels/",
                },
                copyright_text="© 2026 PicPicxels. All Right Reserved.",
            )
            self.stdout.write(self.style.SUCCESS("Created SiteSetting."))
        else:
            self.stdout.write("SiteSetting already exists.")

        if not SEOSetting.objects.exists():
            SEOSetting.objects.create(
                meta_title="PicPicxels | Professional Photo Editing Services",
                meta_description="Get pixel-perfect photo editing services at affordable pricing. Clipping path, background removal, ghost mannequin, retouching, color correction & more. 5M+ images edited.",
                og_title="PicPicxels | Professional Photo Editing Services at Affordable Pricing",
                og_description="Get pixel-perfect photo editing services with quality as our top priority. We edited over 5m+ images for brands, retailers, media agencies, and commercial photographers.",
                canonical_url="https://www.picpicxels.com",
            )
            self.stdout.write(self.style.SUCCESS("Created SEOSetting."))
        else:
            self.stdout.write("SEOSetting already exists.")

        if not NavigationItem.objects.exists():
            home = NavigationItem.objects.create(label="Home", url="/", location="header", order=10)
            services = NavigationItem.objects.create(label="Services", url="/services", location="header", order=20, css_class="mega-menu")
            pricing = NavigationItem.objects.create(label="Pricing", url="/pricing", location="header", order=30)
            contact = NavigationItem.objects.create(label="Contact US", url="/contact", location="header", order=40)
            trial = NavigationItem.objects.create(label="Free Trial", url="/free-trial", location="header", order=50, css_class="btn-primary")

            NavigationItem.objects.create(label="Clipping Path Service", url="/services/clipping-path-service", location="mega_menu", parent=services, order=10, icon="✂️")
            NavigationItem.objects.create(label="Background Removal Service", url="/services/background-removal-service", location="mega_menu", parent=services, order=20, icon="📄")
            NavigationItem.objects.create(label="Image Masking Service", url="/services/image-masking-service", location="mega_menu", parent=services, order=30, icon="🎭")
            NavigationItem.objects.create(label="Shadow Creation Service", url="/services/shadow-creation-service", location="mega_menu", parent=services, order=40, icon="📄")
            NavigationItem.objects.create(label="Ghost Mannequin Service", url="/services/ghost-mannequin-service", location="mega_menu", parent=services, order=50, icon="👻")
            NavigationItem.objects.create(label="Image Retouching Service", url="/services/image-retouching-service", location="mega_menu", parent=services, order=60, icon="🖼️")
            NavigationItem.objects.create(label="Color Correction Service", url="/services/color-correction-service", location="mega_menu", parent=services, order=70, icon="🎨")
            NavigationItem.objects.create(label="Ecommerce Image Editing", url="/services/ecommerce-image-editing", location="mega_menu", parent=services, order=80, icon="🛍️")
            NavigationItem.objects.create(label="Jewelry Image Editing", url="/services/jewelry-image-editing", location="mega_menu", parent=services, order=90, icon="💎")
            NavigationItem.objects.create(label="Car Image Editing", url="/services/car-image-editing", location="mega_menu", parent=services, order=100, icon="🚗")

            NavigationItem.objects.create(label="About Us", url="/about", location="footer", order=10)
            NavigationItem.objects.create(label="Contact", url="/contact", location="footer", order=20)
            NavigationItem.objects.create(label="Blog", url="/blog", location="footer", order=30)
            NavigationItem.objects.create(label="Privacy Policy", url="/privacy", location="footer", order=40)
            NavigationItem.objects.create(label="Terms of Service", url="/terms", location="footer", order=50)

            self.stdout.write(self.style.SUCCESS("Created NavigationItems."))
        else:
            self.stdout.write("NavigationItems already exist.")

        if not BrandLogo.objects.exists():
            BrandLogo.objects.create(name="Amazon", order=10)
            BrandLogo.objects.create(name="eBay", order=20)
            BrandLogo.objects.create(name="Etsy", order=30)
            BrandLogo.objects.create(name="Shopify", order=40)
            BrandLogo.objects.create(name="Walmart", order=50)
            BrandLogo.objects.create(name="Alibaba", order=60)
            self.stdout.write(self.style.SUCCESS("Created BrandLogos."))
        else:
            self.stdout.write("BrandLogos already exist.")

        if not Service.objects.exists():
            Service.objects.create(
                title="Clipping Path Service",
                slug="clipping-path-service",
                short_description="Pixel-perfect clipping path service for precise background removal.",
                description="Pixel-perfect clipping path service for precise background removal. 100% accuracy with double quality check.",
                icon="✂️",
                order=10
            )
            Service.objects.create(
                title="Background Removal Service",
                slug="background-removal-service",
                short_description="Professional background removal for white, transparent, or custom backgrounds.",
                description="Professional background removal for white, transparent, or custom backgrounds.",
                icon="📄",
                order=20
            )
            Service.objects.create(
                title="Image Masking Service",
                slug="image-masking-service",
                short_description="Precise isolation of complex subjects including hair, fur, and transparent objects.",
                description="Precise isolation of complex subjects, including hair, fur, and transparent objects.",
                icon="🎭",
                order=30
            )
            Service.objects.create(
                title="Shadow Creation Service",
                slug="shadow-creation-service",
                short_description="Natural-looking shadow creation to add depth and realism to your product images.",
                description="Natural-looking shadow creation to add depth and realism to your product images.",
                icon="📄",
                order=40
            )
            Service.objects.create(
                title="Ghost Mannequin Service",
                slug="ghost-mannequin-service",
                short_description="Invisible mannequin effect with neck joint, symmetry, and dummy removal.",
                description="Invisible mannequin effect with neck joint, symmetry, and dummy removal.",
                icon="👻",
                order=50
            )
            Service.objects.create(
                title="Image Retouching Service",
                slug="image-retouching-service",
                short_description="Professional retouching - dust removal, skin smoothing, wrinkle fixing & more.",
                description="Professional retouching - dust removal, skin smoothing, wrinkle fixing & more.",
                icon="🖼️",
                order=60
            )
            Service.objects.create(
                title="Color Correction Service",
                slug="color-correction-service",
                short_description="Accurate color enhancement for a cohesive product collection.",
                description="Accurate color correction and enhancement for a cohesive product collection.",
                icon="🎨",
                order=70
            )
            Service.objects.create(
                title="Ecommerce Image Editing",
                slug="ecommerce-image-editing",
                short_description="Complete product photo editing for online sellers - background, shadow, resizing.",
                description="Complete product photo editing for online sellers - background, shadow, resizing.",
                icon="🛍️",
                order=80
            )
            Service.objects.create(
                title="Jewelry Image Editing",
                slug="jewelry-image-editing",
                short_description="High-end jewelry retouching - clarity, shine, and detail enhancement.",
                description="High-end jewelry retouching services. Enhance clarity, brilliance, and details of diamonds, gemstones, gold, and silver products for ecommerce stores.",
                icon="💎",
                order=90
            )
            Service.objects.create(
                title="Car Image Editing",
                slug="car-image-editing",
                short_description="Showroom-ready vehicle photos with background replacement and reflections.",
                description="Professional car image editing and background removal. Showroom-ready vehicle photos with custom background replacement, shadows, reflections, and color correction.",
                icon="🚗",
                order=100
            )
            self.stdout.write(self.style.SUCCESS("Created Services."))
        else:
            self.stdout.write("Services already exist.")

        if not Testimonial.objects.exists():
            Testimonial.objects.create(
                client_name="Anna Jakson",
                client_role="CEO",
                company="PixelCraft Studios",
                text="Awesome Work! They are great artist! Pleased work with them. Highly recommended.",
                rating=5,
                order=10
            )
            Testimonial.objects.create(
                client_name="Micheal Jalil Khan",
                client_role="Marketing Manager",
                company="Creative Edge Agency",
                text="Great end result. A pleasure to continue doing business with.",
                rating=5,
                order=20
            )
            Testimonial.objects.create(
                client_name="Ananta Jalil",
                client_role="Art Director",
                company="Visionary Media",
                text="I got their service very fast, Quality is great.",
                rating=5,
                order=30
            )
            Testimonial.objects.create(
                client_name="Adam Cheis",
                client_role="Creative Lead",
                company="BrightBox Studios",
                text="This is literally the best image editing company. They do excellent work.",
                rating=5,
                order=40
            )
            Testimonial.objects.create(
                client_name="Melisa Pomero",
                client_role="Photographer",
                company="Lens & Light Co.",
                text="The service is so fast, of great quality and also very affordable.",
                rating=5,
                order=50
            )
            Testimonial.objects.create(
                client_name="Tommy Lee",
                client_role="Studio Manager",
                company="Focus Collective",
                text="They accept pressure in a regular part of their job.",
                rating=5,
                order=60
            )
            self.stdout.write(self.style.SUCCESS("Created Testimonials."))
        else:
            self.stdout.write("Testimonials already exist.")

        if not FAQCategory.objects.exists():
            gen_cat = FAQCategory.objects.create(name="General Questions", order=10)
            billing_cat = FAQCategory.objects.create(name="Pricing & Orders", order=20)

            FAQ.objects.create(
                question="What is the largest file size I can upload?",
                answer="File sizes should be kept under 64 MB per image for smooth processing. JPG format is preferred. Contact us for larger files or specific requirements.",
                category=gen_cat,
                order=10
            )
            FAQ.objects.create(
                question="Can I test your work quality?",
                answer="Absolutely! Send us your raw files (up to 3 images), and let us process your image according to your requirements. Contact us to discuss your needs.",
                category=gen_cat,
                order=20
            )
            FAQ.objects.create(
                question="How long does it take to deliver an image?",
                answer="Our aim is for a swift turnaround, usually delivering edited images within 12-24 hours for standard projects. Larger volumes or complex tasks may take longer.",
                category=billing_cat,
                order=10
            )
            FAQ.objects.create(
                question="Will you provide a discount for bulk images?",
                answer="Certainly! We extend discounts for bulk image orders, providing a generous discount of up to 40%.",
                category=billing_cat,
                order=20
            )
            self.stdout.write(self.style.SUCCESS("Created FAQs and Categories."))
        else:
            self.stdout.write("FAQs already exist.")

        if not TeamMember.objects.exists():
            TeamMember.objects.create(name="Rohan Ahmed", role="Founder & CEO", bio="Visionary leader with 10+ years in photo editing industry.", order=10)
            TeamMember.objects.create(name="Sara Khan", role="Head of Operations", bio="Ensuring quality delivery and client satisfaction.", order=20)
            TeamMember.objects.create(name="David Islam", role="Lead Retoucher", bio="Expert in high-end photo retouching and color correction.", order=30)
            self.stdout.write(self.style.SUCCESS("Created TeamMembers."))
        else:
            self.stdout.write("Team Members already exist.")

        if not BlogCategory.objects.exists():
            cat_industry = BlogCategory.objects.create(name="Industry Tips", order=10)
            cat_guides = BlogCategory.objects.create(name="Photo Editing Guides", order=20)

            BlogTag.objects.create(name="Clipping Path")
            BlogTag.objects.create(name="Photo Retouching")
            BlogTag.objects.create(name="E-commerce")

            post = BlogPost.objects.create(
                title="Why Professional Photo Editing Matters for Your E-commerce Business",
                excerpt="Learn how professional image editing can boost your sales and brand perception.",
                content="<p>In the competitive world of e-commerce, product images are the first thing customers notice. Professional photo editing can significantly impact your conversion rates and brand perception.</p>",
                category=cat_industry,
                author="PicPicxels Team",
                is_featured=True,
                is_published=True,
            )

            self.stdout.write(self.style.SUCCESS("Created BlogPosts, Categories, and Tags."))
        else:
            self.stdout.write("BlogPosts already exist.")

        # Create a detailed dummy blog post for testing
        dummy_post, created = BlogPost.objects.get_or_create(
            slug="ultimate-guide-product-photo-editing",
            defaults={
                "title": "The Ultimate Guide to Product Photo Editing for E-Commerce",
                "short_description": "Learn the complete workflow for professional product photo editing — from raw image selection to final delivery.",
                "content": """<h2>Introduction to Product Photo Editing</h2>
<p>In the competitive world of e-commerce, high-quality product images are the cornerstone of a successful online store. Professional photo editing transforms ordinary product shots into compelling visuals that drive conversions and build brand trust.</p>
<p>Whether you are selling clothing, electronics, or home goods, the quality of your product images directly impacts your bottom line. Studies show that 93% of consumers consider visual appearance to be the deciding factor in a purchase decision.</p>

<h2>Why Professional Editing Matters</h2>
<p>Investing in professional product photo editing offers numerous benefits for e-commerce businesses:</p>
<ul>
<li><strong>Increased Conversion Rates:</strong> High-quality images can boost conversion rates by up to 40%.</li>
<li><strong>Consistent Brand Image:</strong> Maintain a cohesive look across your entire product catalog.</li>
<li><strong>Reduced Returns:</strong> Accurate color representation reduces the likelihood of returns due to color mismatch.</li>
<li><strong>Competitive Advantage:</strong> Stand out from competitors who use unedited or poorly edited images.</li>
<li><strong>Time Savings:</strong> Focus on your core business while professionals handle image processing.</li>
</ul>

<h2>Essential Photo Editing Techniques</h2>
<p>Master these fundamental techniques to elevate your product photography:</p>
<ul>
<li><strong>Background Removal:</strong> Create clean, white backgrounds that meet marketplace requirements for Amazon, eBay, and Shopify.</li>
<li><strong>Color Correction:</strong> Ensure accurate and consistent colors across your entire product line.</li>
<li><strong>Shadow Creation:</strong> Add natural-looking shadows that give depth and dimension to your products.</li>
<li><strong>Ghost Mannequin Effect:</strong> Create a professional clothing presentation that shows the garment's true fit and shape.</li>
<li><strong>Image Retouching:</strong> Remove dust, scratches, and imperfections for flawless product images.</li>
</ul>

<h2>The Complete Workflow</h2>
<p>Follow this systematic approach to ensure consistent, high-quality results every time:</p>
<ol>
<li><strong>Image Selection:</strong> Choose the best raw images with proper lighting and composition.</li>
<li><strong>Color Calibration:</strong> Ensure your monitor is calibrated for accurate color reproduction.</li>
<li><strong>Batch Processing:</strong> Use automated tools for repetitive tasks while maintaining quality control.</li>
<li><strong>Quality Assurance:</strong> Implement a multi-step review process to catch any issues before delivery.</li>
<li><strong>File Optimization:</strong> Export images in the right format and size for web use without sacrificing quality.</li>
</ol>
<p>By implementing this workflow, you can process hundreds of product images per day while maintaining consistent quality across your entire catalog.</p>

<h2>Common Mistakes to Avoid</h2>
<p>Even experienced editors can fall into these common traps. Here is what to watch out for:</p>
<ul>
<li><strong>Over-editing:</strong> Too much processing can make images look unnatural and unappealing.</li>
<li><strong>Inconsistent Lighting:</strong> Ensure all images in your catalog have consistent lighting and color temperature.</li>
<li><strong>Ignoring Shadows:</strong> Products without shadows can appear to float, reducing perceived quality.</li>
<li><strong>Wrong File Formats:</strong> Using the wrong format can slow down your website or reduce image quality.</li>
<li><strong>Skipping QA:</strong> Always review images before publishing to catch errors early.</li>
</ul>
<p>Avoiding these mistakes will help you maintain a professional appearance that builds customer trust and drives sales.</p>

<h2>Choosing the Right Editing Partner</h2>
<p>When selecting a photo editing service provider, consider these key factors:</p>
<ul>
<li><strong>Experience and Portfolio:</strong> Review their previous work, especially in your product category.</li>
<li><strong>Turnaround Time:</strong> Ensure they can meet your deadlines without compromising quality.</li>
<li><strong>Quality Control:</strong> Ask about their QC process and revision policies.</li>
<li><strong>Pricing Structure:</strong> Compare pricing models — per-image vs. hourly — to find the best value.</li>
<li><strong>Communication:</strong> Choose a partner who is responsive and understands your specific requirements.</li>
</ul>
<p>At PicPicxels, we combine technical expertise with a commitment to quality, ensuring your product images always look their best.</p>

<h2>Conclusion</h2>
<p>Professional product photo editing is an investment that pays for itself through increased sales, reduced returns, and stronger brand perception. By following the techniques and workflow outlined in this guide, you can transform your e-commerce product images and give your business the competitive edge it deserves.</p>
<p>Ready to get started? Contact PicPicxels today for a free trial and experience the difference professional photo editing can make for your e-commerce business.</p>""",
                "category": BlogCategory.objects.first(),
                "author": "PicPicxels Team",
                "author_bio": "Your trusted partner for professional e-commerce photo editing.",
                "is_featured": True,
                "is_published": True,
                "is_trending": True,
                "published_at": datetime.now(timezone.utc),
                "reading_time": 8,
                "meta_title": "The Ultimate Guide to Product Photo Editing for E-Commerce | PicPicxels",
                "meta_description": "Learn the complete workflow for professional product photo editing — from raw image selection to final delivery. Boost your e-commerce sales with expert editing tips.",
                "og_title": "The Ultimate Guide to Product Photo Editing for E-Commerce",
                "og_description": "Master product photo editing for e-commerce. Learn background removal, color correction, shadow creation, and more. Expert guide by PicPicxels.",
                "focus_keyword": "product photo editing",
                "secondary_keywords": ["e-commerce photo editing", "product image editing", "commercial photo retouching", "Amazon photo requirements"],
                "faq_schema": [
                    {"question": "What is product photo editing?", "answer": "Product photo editing is the process of enhancing and optimizing product images for e-commerce use. It includes background removal, color correction, shadow creation, retouching, and format optimization to make products look professional and appealing to online shoppers."},
                    {"question": "Why is product photo editing important for e-commerce?", "answer": "Professional product photo editing is crucial because high-quality images directly impact conversion rates, reduce returns, and build brand trust. Studies show that 93% of consumers consider visual appearance as the key factor in purchase decisions, and well-edited images can boost conversions by up to 40%."},
                ],
            },
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f"Created dummy blog post '{dummy_post.title}' (ID: {dummy_post.id})."))

            BlogContentSection.objects.get_or_create(
                blog_post=dummy_post,
                order=1,
                defaults={
                    "template": "full_width",
                    "heading": "Getting Started with Product Photo Editing",
                    "content": """<p>Product photo editing is an essential skill for any e-commerce business owner. Whether you are selling on Amazon, eBay, Shopify, or your own website, the quality of your product images can make or break a sale. In this comprehensive guide, we will walk you through everything you need to know about professional product photo editing.</p><p>From basic background removal to advanced color correction techniques, we cover the complete workflow that professional e-commerce editors use to create stunning product images that drive sales.</p>""",
                },
            )
            self.stdout.write(self.style.SUCCESS("Created BlogContentSection #1 (full_width)."))

            BlogContentSection.objects.get_or_create(
                blog_post=dummy_post,
                order=2,
                defaults={
                    "template": "image_left",
                    "heading": "Essential Tools and Software",
                    "content": """<p>To achieve professional results, you need the right tools. Here are the essential software and tools used by professional product photo editors:</p><ul><li><strong>Adobe Photoshop:</strong> Industry-standard for detailed retouching and compositing.</li><li><strong>Adobe Lightroom:</strong> Excellent for batch processing and color correction.</li><li><strong>Capture One:</strong> Professional-grade tethering and color grading.</li><li><strong>GIMP:</strong> Free open-source alternative for basic editing needs.</li></ul><p>At PicPicxels, we use the latest versions of these tools combined with custom scripts and AI-powered automation to deliver consistent, high-quality results at scale.</p>""",
                },
            )
            self.stdout.write(self.style.SUCCESS("Created BlogContentSection #2 (image_left)."))

            BlogContentSection.objects.get_or_create(
                blog_post=dummy_post,
                order=3,
                defaults={
                    "template": "image_right",
                    "heading": "Meeting Marketplace Requirements",
                    "content": """<p>Each e-commerce marketplace has specific image requirements that you must follow:</p><ul><li><strong>Amazon:</strong> Main image must have pure white background (RGB 255,255,255), product must cover at least 85% of the frame, and images should be at least 1000px on the longest side.</li><li><strong>eBay:</strong> At least 1600px on the longest side for zoom functionality, JPEG format preferred.</li><li><strong>Shopify:</strong> 2048x2048px recommended for best results across all themes, square aspect ratio preferred.</li><li><strong>Etsy:</strong> 2000px preferred for the longest side, JPEG or PNG format.</li></ul><p>Our team at PicPicxels is familiar with all major marketplace requirements and ensures your images comply with every platform's guidelines.</p>""",
                },
            )
            self.stdout.write(self.style.SUCCESS("Created BlogContentSection #3 (image_right)."))
        else:
            self.stdout.write(f"Blog post '{dummy_post.title}' already exists (ID: {dummy_post.id}).")

        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@picpicxels.com',
                password='Admin@123'
            )
            self.stdout.write(self.style.SUCCESS("Created superuser: admin / Admin@123"))
        else:
            self.stdout.write("Superuser 'admin' already exists.")

        if not Page.objects.filter(slug="home").exists():
            Page.objects.create(
                title="Homepage",
                slug="home",
                meta_title="PicPicxels | Professional Photo Editing Services",
                meta_description="Get pixel-perfect photo editing services at affordable pricing.",
                content=[
                    {
                        "type": "hero",
                        "data": {
                            "title": "Photo Editing Services at Affordable Pricing",
                            "subtitle": "Get pixel-perfect photo editing services with quality as our top priority.",
                            "cta_primary_text": "Free Trial",
                            "cta_primary_link": "/free-trial",
                            "cta_secondary_text": "See Pricing",
                            "cta_secondary_link": "/pricing"
                        }
                    },
                    {
                        "type": "services",
                        "data": {
                            "title": "Our Most Popular Photo Editing Services",
                            "subtitle": "Spend less on awesome product photo editing with us. We are available 24/7."
                        }
                    },
                    {
                        "type": "testimonials",
                        "data": {
                            "title": "Clients Feedback",
                            "subtitle": "Our Clients & Reviews"
                        }
                    }
                ]
            )
            self.stdout.write(self.style.SUCCESS("Created Dynamic CMS 'home' Page."))
        else:
            self.stdout.write("Dynamic CMS 'home' Page already exists.")

        # ──────────────────────
        # Seed Pricing Plans
        # ──────────────────────
        if not PricingPlan.objects.exists():
            plans = [
                {
                    "title": "Starter",
                    "slug": "starter",
                    "price_monthly": 0.25,
                    "price_yearly": 0.20,
                    "description": "Perfect for freelancers and small businesses getting started with professional image editing.",
                    "features": [
                        "Hand-drawn clipping path",
                        "Background removal & change",
                        "Shadow creation (natural/drop)",
                        "Basic color correction",
                        "E-commerce product editing",
                        "Free revisions within 48h",
                        "24–48 hour turnaround",
                        "Email support",
                    ],
                    "is_popular": False,
                    "button_text": "Start Free Trial",
                    "button_link": "/free-trial",
                    "order": 1,
                    "is_active": True,
                },
                {
                    "title": "Professional",
                    "slug": "professional",
                    "price_monthly": 0.50,
                    "price_yearly": 0.40,
                    "description": "The ideal plan for growing businesses that need consistent, high-volume editing.",
                    "features": [
                        "Everything in Starter, plus:",
                        "Photo retouching & restoration",
                        "Ghost mannequin effect",
                        "Image masking (layer/alpha)",
                        "Advanced color correction & grading",
                        "Bulk image processing",
                        "Jewelry & accessory editing",
                        "12–24 hour turnaround",
                        "Priority email & chat support",
                        "Dedicated account manager",
                    ],
                    "is_popular": True,
                    "button_text": "Start Free Trial",
                    "button_link": "/free-trial",
                    "order": 2,
                    "is_active": True,
                },
                {
                    "title": "Enterprise",
                    "slug": "enterprise",
                    "price_monthly": 1.00,
                    "price_yearly": None,
                    "description": "Custom solutions for large-scale operations requiring dedicated resources and rapid turnaround.",
                    "features": [
                        "Everything in Professional, plus:",
                        "Custom workflow setup",
                        "API integration",
                        "Priority support (24/7)",
                        "Same-day delivery",
                        "Multiple quality assurance passes",
                        "Dedicated team of editors",
                        "Custom reporting & analytics",
                        "SLA guarantee",
                        "Volume-based pricing",
                    ],
                    "is_popular": False,
                    "button_text": "Contact Sales",
                    "button_link": "/contact",
                    "order": 3,
                    "is_active": True,
                },
            ]
            for plan_data in plans:
                PricingPlan.objects.create(**plan_data)
            self.stdout.write(self.style.SUCCESS(f"Created {len(plans)} Pricing Plans."))
        else:
            self.stdout.write("Pricing Plans already exist.")

        self.stdout.write(self.style.SUCCESS("CMS seeding completed successfully!"))
