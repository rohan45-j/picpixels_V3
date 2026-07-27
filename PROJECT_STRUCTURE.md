# PicPixels — Project Structure & Tech Stack

## Overview
Two-part platform: **Django backend** (admin/api) + **Next.js frontend** (public site + client dashboard) for a professional photo editing service.

---

## Tech Stack

### Frontend (`picpixels/`)
| Technology | Version |
|---|---|
| Next.js (App Router) | 15.5.3 |
| React | 19.1.1 |
| TypeScript | 6.0.3 |
| Tailwind CSS | 4.3.2 |
| Framer Motion | 12.39.0 |
| GSAP | 3.15.0 |
| Lucide React | 1.17.0 |

### Backend (`admin.picpixels.com/`)
| Technology | Version |
|---|---|
| Django | 5.2.15 |
| Python | 3.12.10 |
| Django REST Framework | 3.17.1 |
| SimpleJWT (JWT Auth) | 5.5.1 |
| django-unfold (Admin UI) | 0.91.0 |
| Django Channels (WebSocket) | 4.3.2 |
| PostgreSQL (prod) / SQLite (dev) | — |
| Redis (prod) / LocMem (dev) | — |
| CKEditor | 6.7.3 |
| drf-spectacular (API docs) | 0.29.0 |

### Deployment
- Backend: CloudLinux + Passenger WSGI (shared hosting)
- Frontend: Next.js (Vercel-compatible, custom `server.js`)
- Docker: PostgreSQL + pgAdmin for local dev

---

## Project Structure

```
Live_Code/
├── picpixels/                          # Next.js Frontend
│   ├── src/
│   │   ├── app/                        # App Router pages
│   │   │   ├── (dashboard)/            #   Dashboard layout group
│   │   │   ├── (marketing)/            #   Marketing layout group
│   │   │   ├── about/                  #   About page
│   │   │   ├── api/                    #   API routes (login, order)
│   │   │   ├── blog/                   #   Blog (list + [slug])
│   │   │   ├── book-demo/              #   Book a demo
│   │   │   ├── careers/                #   Careers
│   │   │   ├── case-studies/           #   Case studies (list + [slug])
│   │   │   ├── contact/                #   Contact
│   │   │   ├── dashboard/              #   Client dashboard
│   │   │   │   ├── api-ftp/            #     API/FTP access
│   │   │   │   ├── media/              #     Media library
│   │   │   │   ├── new-order/          #     New order
│   │   │   │   ├── notifications/      #     Notifications
│   │   │   │   ├── orders/             #     Orders (list + [id])
│   │   │   │   ├── overview/           #     Overview
│   │   │   │   └── retoucher/          #     Retoucher workspace
│   │   │   ├── faq/                    #   FAQ
│   │   │   ├── forgot-password/        #   Forgot password
│   │   │   ├── free-trial/             #   Free trial
│   │   │   ├── guid/                   #   Guides (list + [slug])
│   │   │   ├── login/                  #   Login
│   │   │   ├── order-summary/          #   Order summary
│   │   │   ├── portfolio/              #   Portfolio (list + [slug])
│   │   │   ├── press/                  #   Press
│   │   │   ├── pricing/                #   Pricing
│   │   │   ├── privacy/                #   Privacy policy
│   │   │   ├── services/               #   Services (list + [slug])
│   │   │   ├── support/                #   Support
│   │   │   ├── terms/                  #   Terms of service
│   │   │   ├── error.tsx               #   Error boundary
│   │   │   ├── globals.css             #   Global styles (Tailwind v4)
│   │   │   ├── layout.tsx              #   Root layout
│   │   │   ├── not-found.tsx           #   404
│   │   │   └── page.tsx                #   Home page
│   │   ├── components/
│   │   │   ├── animations/             #   Reveal.tsx
│   │   │   ├── layout/                 #   Header (mega menu), Footer
│   │   │   ├── media/                  #   BeforeAfterSlider, HeroCarousel, Gallery, OptimizedImage
│   │   │   └── ui/                     #   31 UI components
│   │   ├── features/                   # Feature-specific components
│   │   │   ├── blog/                   #   BlockRenderer
│   │   │   ├── home/                   #   Hero, StackedServices
│   │   │   ├── portfolio/              #   PortfolioGrid
│   │   │   ├── pricing/                #   PricingConfigurator
│   │   │   └── services/               #   Service sections (brands, feedback, E-E-A-T, pricing, process, tools, why-choose, why-need)
│   │   ├── lib/                        #   fetch.ts
│   │   ├── services/                   #   notifications-api.ts, public-api.ts
│   │   ├── store/                      #   SiteSettingsContext.tsx
│   │   ├── styles/                     #   animations.css, 28 CSS modules
│   │   └── types/                      #   index.ts
│   ├── public/                         # Static assets
│   ├── server.js                       # Production HTTP server
│   ├── app.js                          # Dev HTTP server
│   ├── next.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── admin.picpixels.com/                # Django Backend
│   ├── core/                           # Project config
│   │   ├── settings.py                 #   Main settings (608 lines)
│   │   ├── urls.py                     #   Root URL routing
│   │   ├── asgi.py                     #   WebSocket (Daphne)
│   │   ├── wsgi.py                     #   WSGI (Passenger)
│   │   ├── admin_config.py             #   Base admin classes
│   │   └── context_processors.py       #   Template context
│   │
│   ├── users/                          # User management
│   │   └── models: UserProfile, Subscription, SubscriptionPlan, Transaction
│   │
│   ├── cms/                            # Content management (largest app)
│   │   └── models (30+): HeroSection, Service, BlogPost, Author, FAQ,
│   │       Testimonial, TeamMember, BrandLogo, PricingPlan, PricingConfig*,
│   │       WhyChoose*, ContactInquiry, FreeTrial, Page, Section, etc.
│   │
│   ├── orders/                         # Order system
│   │   └── models: Order, OrderItem
│   │
│   ├── workflows/                      # Workflow templates
│   │   └── models: WorkflowTemplate
│   │
│   ├── portfolio/                      # Portfolio
│   │   └── models: Portfolio, Category, Service, PortfolioGallery, PortfolioComparison
│   │
│   ├── case_studies/                   # Case studies
│   │   └── models: CaseStudy, CaseStudyCategory, CaseStudyTag, CaseStudyImage, CaseStudyTestimonial
│   │
│   ├── guides/                         # Guides / tutorials
│   │   └── models: Guide, GuideCategory
│   │
│   ├── navigation/                     # Navigation menus
│   │   └── models: NavigationItem
│   │
│   ├── media_library/                  # Media files
│   │   └── models: MediaFile
│   │
│   ├── notifications/                  # Notifications + WebSocket
│   │   ├── models: Notification
│   │   └── consumers.py: NotificationConsumer (ws/notifications/)
│   │
│   ├── revisions/                      # Image revision requests
│   │   └── models: RevisionRequest, ImageAnnotation
│   │
│   ├── site_settings/                  # Site & SEO settings
│   │   └── models: SiteSetting (singleton), SEOSetting (singleton)
│   │
│   ├── templates/                      # Django templates (admin customizations)
│   ├── static/                         # Static files (CSS, JS)
│   ├── media/                          # User-uploaded files
│   ├── scripts/                        # Data seeding scripts
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
```

---

## API Endpoints (all under `/api/v1/`)

| Prefix | App | Auth |
|---|---|---|
| `users/` | User profiles, auth | JWT |
| `workflows/` | Workflow templates | JWT |
| `orders/` | Orders & order items | JWT |
| `revisions/` | Revision requests & annotations | JWT |
| `notifications/` | Notifications + unread count | JWT/Public |
| `cms/` | All CMS content (hero, services, blog, pricing, faq, etc.) | Public |
| `settings/` | Site settings, SEO | Public |
| `navigation/` | Navigation menu items | Public |
| `media/` | Media library | JWT |
| `portfolio/` | Portfolio items | Public |
| `case-studies/` | Case studies | Public |
| `guides/` | Guides | Public |

WebSocket: `ws/notifications/`

API Docs: `http://localhost:8000/api/docs/` (Swagger UI)

---

## Dev Servers

| Service | URL | Command |
|---|---|---|
| Django API | `http://localhost:8000` | `python manage.py runserver 0.0.0.0:8000` |
| Next.js Frontend | `http://localhost:3000` | `npm run dev` (in `picpixels/`) |
| PostgreSQL | `localhost:5432` | `docker-compose up` |
| pgAdmin | `http://localhost:5050` | `docker-compose up` |

---

## Key Conventions

- **Frontend:** App Router, `src/` alias (`@/`), Tailwind v4 (CSS-based config), CSS Modules, client/server component separation
- **Backend:** DRF ViewSets + routers, JWT auth, django-unfold admin, JSON fields for flexible content, singleton models via `django-solo` pattern
- **Caching:** Public API responses cached for 60s
- **Images:** Next.js `<Image>` with remote patterns for Unsplash, admin.picpixels.com, localhost
