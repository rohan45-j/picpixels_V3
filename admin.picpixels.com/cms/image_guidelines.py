"""
Image upload guidelines derived from the ACTUAL frontend implementation.
Each entry specifies the exact CSS rendering context found in the frontend codebase.

Source: frontend audit of all image-rendering components at
  E:\Rohan\PP\Img_Editor_Website\frontend\src
"""

IMG = {

    # ────────────────────────────────────────────
    # HOMEPAGE HERO SLIDER (4:3 crop | Hero.tsx)
    # ────────────────────────────────────────────

    'hero_slide': (
        'Recommended Size: 1600 × 1200 px\n'
        'Aspect Ratio: 4:3 (rendered as aspect-ratio: 4/3)\n'
        'Display Usage: Homepage Hero Slider (Hero.tsx)\n'
        'Rendering: object-fit: cover, overflow: hidden\n'
        'Desktop: 2-column grid layout\n'
        'Tablet (<=992px): Single column, max-width 520px\n'
        'Mobile (<=576px): Full width with reduced padding\n'
        'Safe Area: Keep important content within center 70%\n'
        '  — Image is cropped on all viewports via overflow:hidden'
    ),
    'hero_section_bg': (
        'Recommended Size: 1920 × 1080 px\n'
        'Aspect Ratio: 16:9 (background-size: cover)\n'
        'Display Usage: Homepage Hero decorative background\n'
        'Rendering: ::before pseudo-element, background-size: cover\n'
        'Opacity: 0.15 (decorative only, dark overlay on top)\n'
        'Safe Area: Decorative only — image is heavily overlaid\n'
        '  — Any subject will be barely visible through dark overlay'
    ),

    # ────────────────────────────────────────────
    # HOMEPAGE BANNER
    # ────────────────────────────────────────────

    'banner': (
        'Recommended Size: 1920 × 1080 px\n'
        'Aspect Ratio: 16:9\n'
        'Display Usage: Full-width top banner on homepage\n'
        'Rendering: object-fit: cover\n'
        'Safe Area: Keep text/CTA within center 60%\n'
        '  — Image is cropped at all breakpoints'
    ),

    # ────────────────────────────────────────────
    # SERVICE PAGES — HERO CAROUSEL (4:3 | HeroCarousel.tsx)
    # ────────────────────────────────────────────

    'service_hero_bg': (
        'Recommended Size: 1600 × 1200 px\n'
        'Aspect Ratio: 4:3 (heroRight container has aspect-ratio: 4/3)\n'
        'Display Usage: Service detail page hero background\n'
        'Rendering: object-fit: cover, overflow: hidden (HeroCarousel.tsx)\n'
        'Desktop: Split layout (text left, image right)\n'
        'Mobile (<=968px): Single column, image stacks below text\n'
        'Safe Area: Keep focal point within center 70%\n'
        '  — Image fills its container at all sizes'
    ),
    'service_hero_slide': (
        'Recommended Size: 1600 × 1200 px\n'
        'Aspect Ratio: 4:3\n'
        'Display Usage: Service hero carousel slides (HeroCarousel.tsx)\n'
        'Rendering: object-fit: cover, overflow: hidden\n'
        'Same layout as hero background above\n'
        'Safe Area: Center 70%\n'
        '  — Images are full-width, cropped on all devices'
    ),

    # ────────────────────────────────────────────
    # SERVICE CARDS & THUMBNAILS
    # ────────────────────────────────────────────

    'service_thumbnail': (
        'Recommended Size: 800 × 600 px\n'
        'Aspect Ratio: ~4:3 (no CSS aspect-ratio set; height: 192px / 12rem)\n'
        'Display Usage: Service cards in homepage + services listing + mega menu\n'
        'Components: ServiceCard.tsx (h-48), StackedServices.tsx, homepage.module.css\n'
        'Rendering: object-fit: cover, overflow: hidden\n'
        'Card Grid: 1-col mobile → 2-col (>=640px) → 3-col (>=1024px) → 4-col (>=1280px)\n'
        'Stacked Service: height clamp(280px, 40vh, 380px), 45-55% card width\n'
        'Homepage section: fixed height 240px\n'
        'Safe Area: Keep subject within center 70%\n'
        '  — Image is cropped via object-fit:cover on all devices'
    ),

    # ────────────────────────────────────────────
    # SERVICE DETAIL — CONTENT SECTIONS
    # ────────────────────────────────────────────

    'service_content': (
        'Recommended Size: 1200 × 800 px\n'
        'Aspect Ratio: 3:2 (no fixed CSS ratio; height: 400px)\n'
        'Display Usage: Service detail content sections (services/[slug]/page.tsx)\n'
        'Rendering: width: 100%, height: 400px, object-fit: cover\n'
        'Desktop: 2-column grid (text + image)\n'
        'Mobile (<=900px): Single column, image stacks below text\n'
        'Hover: scale(1.03) transform on image\n'
        'Safe Area: Center 70% — subject will be cropped at height boundary\n'
        '  — Ensures uniform section height regardless of image proportions'
    ),

    # ────────────────────────────────────────────
    # SERVICE GALLERY — BEFORE/AFTER SLIDER (4:3 | BeforeAfterSlider.tsx)
    # ────────────────────────────────────────────

    'service_gallery': (
        'Recommended Size: 1600 × 1200 px\n'
        'Aspect Ratio: 4:3 (aspect-ratio: 4/3 on slider container)\n'
        'Display Usage: Service gallery — single images\n'
        'Components: BeforeAfterSlider.tsx, ServiceGalleryImage model\n'
        'Rendering: object-fit: cover, overflow: hidden, clip-path on before image\n'
        'Grid: 3-col desktop → 2-col (<=1024px) → 1-col (<=640px)\n'
        'Safe Area: Center 70%\n'
        '  — Interactive comparison slider; user drags to reveal before/after'
    ),
    'service_before_after': (
        'Recommended Size: 1600 × 1200 px\n'
        'Aspect Ratio: 4:3 (aspect-ratio: 4/3)\n'
        'Display Usage: Service gallery — BEFORE/AFTER comparison pair\n'
        'Component: BeforeAfterSlider.tsx\n'
        'Rendering: Two <img> elements, object-fit: cover, clip-path overlay\n'
        'Interactive: Slider handle for user to drag and compare\n'
        'Same grid behavior: 3/2/1 columns\n'
        'CRITICAL: Both images MUST have identical framing / angle / lighting\n'
        'Safe Area: Center 70% — slider clips the before image\n'
        '  — Any misalignment between images will be obvious to users'
    ),

    # ────────────────────────────────────────────
    # BLOG — FEATURED / CARD IMAGES
    # ────────────────────────────────────────────

    'blog_featured': (
        'Recommended Size: 1600 × 900 px\n'
        'Aspect Ratio: 16:9 (featured cards), 16:10 (regular cards)\n'
        'Display Usage: Blog listing card thumbnails (BlogClient.tsx)\n'
        'Rendering: object-fit: cover, overflow: hidden\n'
        'Featured card: aspect-ratio: 16/9, hover scale(1.04)\n'
        'Regular card: aspect-ratio: 16/10, hover scale(1.05)\n'
        'Related post card: aspect-ratio: 16/9, hover scale(1.04)\n'
        'Grid: auto-fill minmax(340px, 1fr), single column (<=768px)\n'
        'Safe Area: Center 70%\n'
        '  — Works across 3 different card layouts with slight ratio variations'
    ),
    'blog_hero': (
        'Recommended Size: 1920 × 1080 px\n'
        'Aspect Ratio: 16:9 (max-height: 480px with width: 100%)\n'
        'Display Usage: Blog detail hero / featured image\n'
        'Rendering: object-fit: cover, max-height: 480px, border-radius: 14px\n'
        'Safe Area: Keep focal point within center 70%\n'
        '  — Full-width image cropped to max 480px height'
    ),
    'blog_content': (
        'Recommended Size: 1200 × 900 px\n'
        'Aspect Ratio: 4:3 (various; intrinsic height or fixed 240px in gallery)\n'
        'Display Usage: Inline images within blog article content (BlockRenderer.tsx)\n'
        'Rendering Modes:\n'
        '  — Standard: max-width: 100%, intrinsic height maintained\n'
        '  — Gallery: width: 100%, height: 240px fixed, object-fit: cover\n'
        '  — Full-width: width: 100%, height: auto\n'
        'Gallery grid: 2-col desktop → 1-col (<=640px)\n'
        'Safe Area: Center 70%\n'
        '  — Gallery items are cropped to 240px height; others show full image'
    ),

    # ────────────────────────────────────────────
    # PORTFOLIO — GALLERY & COMPARISON
    # ────────────────────────────────────────────

    'portfolio_featured': (
        'Recommended Size: 1200 × 900 px\n'
        'Aspect Ratio: 4:3 (aspect-ratio: 4/3)\n'
        'Display Usage: Portfolio grid card thumbnails (PortfolioGallery.tsx)\n'
        'Rendering: object-fit: cover, overflow: hidden\n'
        'Grid: 5-col (>1199px) → 3-col (768-1199px) → 2-col (<=767px)\n'
        'Hover: scale(1.08) transform\n'
        'Safe Area: Center 70%\n'
        '  — Consistent grid framing across all viewports'
    ),
    'portfolio_gallery': (
        'Recommended Size: 1200 × 900 px\n'
        'Aspect Ratio: 4:3\n'
        'Display Usage: Portfolio detail gallery (PortfolioGallery.tsx)\n'
        'Rendering: object-fit: cover, overflow: hidden\n'
        'Same grid behavior as portfolio featured\n'
        'Safe Area: Center 70%\n'
        '  — All gallery images share the same crop area'
    ),
    'portfolio_before_after': (
        'Recommended Size: 1600 × 1000 px\n'
        'Aspect Ratio: 16:10 (aspect-ratio: 16/10, border-radius: 16px)\n'
        'Display Usage: Portfolio BEFORE/AFTER comparison (BeforeAfter.tsx)\n'
        'Rendering: Two <img> elements, object-fit: cover, clip-path overlay\n'
        'Interactive slider: User drags handle to reveal comparison\n'
        'CRITICAL: Both images MUST have identical framing / angle / lighting\n'
        'Safe Area: Center 70% — slider reveals different portions\n'
        '  — Any mismatch in composition will be visually jarring'
    ),

    # ────────────────────────────────────────────
    # PROFILE / AVATAR IMAGES (1:1 circle crop)
    # ────────────────────────────────────────────

    'testimonial_avatar': (
        'Recommended Size: 200 × 200 px\n'
        'Aspect Ratio: 1:1 (square, border-radius: 50%)\n'
        'Display Usage: Testimonial circular avatar (TestimonialCarousel.tsx)\n'
        'Rendering: object-fit: cover, border-radius: 50%, overflow: hidden\n'
        'Desktop: 90 × 90 px circle\n'
        'Mobile (<=600px): 70 × 70 px circle\n'
        'Safe Area: Center face with adequate headroom\n'
        '  — Image is aggressively cropped to a small circle'
    ),
    'team_photo': (
        'Recommended Size: 400 × 400 px\n'
        'Aspect Ratio: 1:1 (square)\n'
        'Display Usage: Team member profile photo\n'
        'Rendering: Circular or rounded crop\n'
        'Frame face centered with shoulders visible\n'
        'Safe Area: Center 50% — outer edges may be cropped'
    ),
    'author_photo': (
        'Recommended Size: 200 × 200 px\n'
        'Aspect Ratio: 1:1 (square, border-radius: 50%)\n'
        'Display Usage: Blog post author avatar\n'
        'Components: blog/[slug]/page.tsx\n'
        'Rendering: object-fit: cover, border-radius: 50%\n'
        'Hero avatar: 40 × 40 px\n'
        'Author card: 52 × 52 px\n'
        'Safe Area: Center face — small display size means tight crop\n'
        '  — Ensure face is centered and well-lit, with minimal background'
    ),

    # ────────────────────────────────────────────
    # PRICING CARDS
    # ────────────────────────────────────────────

    'pricing_card': (
        'Recommended Size: 600 × 400 px\n'
        'Aspect Ratio: 3:2 (no fixed CSS ratio; fixed container height)\n'
        'Display Usage: Pricing plan card image (PricingClient.tsx)\n'
        'Rendering: object-fit: cover, overflow: hidden\n'
        'Container height: 160px desktop → 130px (<=768px) → 110px (<=480px)\n'
        'Safe Area: Center 70%\n'
        '  — Fixed-height container crops images of varying proportions'
    ),
    'pricing_config_card': (
        'Recommended Size: 800 × 600 px\n'
        'Aspect Ratio: 4:3 (no fixed CSS ratio; fixed container height)\n'
        'Display Usage: Pricing configurator card image (PricingConfigurator.tsx)\n'
        'Rendering: object-fit: contain (NOT cover — full image visible)\n'
        'Container height: 280px desktop → 200px (<=640px)\n'
        'Hover: scale(1.05)\n'
        'Safe Area: Entire image visible (object-fit: contain)\n'
        '  — Background/edges will be visible if image doesn\'t fill container'
    ),

    # ────────────────────────────────────────────
    # BRANDING & LOGOS
    # ────────────────────────────────────────────

    'site_logo': (
        'Recommended Size: SVG preferred, PNG min 144 × 72 px\n'
        'Aspect Ratio: Landscape / horizontal (no fixed ratio)\n'
        'Display Usage: Site logo in header + footer\n'
        'Header: height: 36px, object-fit: contain\n'
        'Footer: intrinsic dimensions\n'
        'FORMAT: SVG strongly preferred for crisp rendering at all sizes\n'
        '  — PNG/JPG may appear pixelated on retina displays'
    ),
    'favicon': (
        'Recommended Size: 96 × 96 px (1:1 square)\n'
        'Format: ICO or PNG\n'
        'Display Usage: Browser tab icon, bookmark favicon\n'
        'Safe Area: Entire area — designs must be legible at 16px\n'
        '  — Keep design extremely simple with high contrast'
    ),
    'brand_logo': (
        'Recommended Size: SVG preferred, PNG min 260 × 64 px\n'
        'Aspect Ratio: Landscape / horizontal (constrained to 130 × 32 px max)\n'
        'Display Usage: Trust bar / brand logo carousel (BrandLogos.tsx)\n'
        'Rendering: Cell 160 × 48 px, SVG max 130 × 32 px\n'
        'FORMAT: SVG strongly preferred for crisp rendering\n'
        '  — If PNG, ensure logo is legible at 32px height'
    ),
    'technology_icon': (
        'Recommended Size: SVG preferred, PNG min 120 × 120 px\n'
        'Aspect Ratio: 1:1 (square; displayed in circular container)\n'
        'Display Usage: Technology expertise grid (TechExpertiseSection.tsx)\n'
        'Rendering: object-fit: contain in circular container\n'
        'Circle: 100px desktop → 80px (<=768px) → 64px (<=480px)\n'
        'Logo max: 60 × 60 px\n'
        'FORMAT: SVG strongly preferred\n'
        '  — Icons are small; crisp vector art looks much better'
    ),

    # ────────────────────────────────────────────
    # SOCIAL SHARE (Platform-specific dimensions)
    # ────────────────────────────────────────────

    'og_image': (
        'Recommended Size: 1200 × 630 px\n'
        'Aspect Ratio: 1.91:1\n'
        'Display Usage: Facebook / LinkedIn / Slack / Discord link previews\n'
        'Safe Area: Keep text and branding within center 80%\n'
        '  — Twitter/X previews may crop top/bottom\n'
        '  — Minimum: 600 × 315 px; Maximum: 1200 × 630 px'
    ),
    'twitter_image': (
        'Recommended Size: 1200 × 600 px\n'
        'Aspect Ratio: 2:1\n'
        'Display Usage: X/Twitter large summary card\n'
        'Safe Area: Keep key visuals in center safe area\n'
        '  — Large card format; avoid text in bottom 20%\n'
        '  — Twitter may add overlay text at bottom'
    ),

    # ────────────────────────────────────────────
    # MEDIA LIBRARY
    # ────────────────────────────────────────────

    'media_file': (
        'Type: General-purpose file upload\n'
        'Accepted Formats: JPG, PNG, WebP, GIF, SVG, MP4, WebM, PDF, DOC, DOCX\n'
        'Max File Size: 10 MB\n'
        'Dashboard thumbnail: 140 × 140 px crop, object-fit: cover\n'
        'Recommendation: Upload highest resolution available\n'
        '  — Files are stored at original resolution for admin use'
    ),
    'media_thumbnail': (
        'Auto-generated 300 × 300 px thumbnail.\n'
        'Do NOT upload manually — created automatically from uploaded files.'
    ),

    # ────────────────────────────────────────────
    # DOCUMENT UPLOADS (admin-only)
    # ────────────────────────────────────────────

    'free_trial_attachment': (
        'Type: File attachment for free trial requests\n'
        'Accepted Formats: JPG, PNG, PDF, DOC, DOCX, ZIP\n'
        'Max File Size: 20 MB\n'
        'This is an admin-facing upload — no frontend rendering'
    ),
    'blog_document': (
        'Type: Downloadable document for blog posts\n'
        'Accepted Formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX\n'
        'Max File Size: 20 MB\n'
        'Displayed as download link, NOT rendered inline'
    ),
}
