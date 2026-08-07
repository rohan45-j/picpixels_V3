import os
import environ
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DEBUG=(bool, False),
    SECRET_KEY=(str, 'django-insecure-dev-key-change-in-production'),
    CORS_ALLOWED_ORIGINS=(list, [
    "https://picpixels.com",
    "https://www.picpixels.com",
    "https://admin.picpixels.com",
]),
    DB_HOST=(str, ''),
    DB_NAME=(str, 'img_editor_db'),
    DB_USER=(str, 'postgres'),
    DB_PASSWORD=(str, 'postgres'),
    DB_PORT=(str, '5432'),
    REDIS_URL=(str, ''),
    EMAIL_HOST=(str, ''),
    EMAIL_PORT=(int, 587),
    EMAIL_HOST_USER=(str, ''),
    EMAIL_HOST_PASSWORD=(str, ''),
    EMAIL_USE_TLS=(bool, True),
    DEFAULT_FROM_EMAIL=(str, 'noreply@picpicxels.com'),
    FRONTEND_URL=(str, 'https://picpixels.com'),
)

environ.Env.read_env(BASE_DIR / '.env')

SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')

# ✅ FIXED: ALLOWED_HOSTS (no crash if .env missing)
ALLOWED_HOSTS = env.list(
    'ALLOWED_HOSTS',
    default=[
        "admin.picpixels.com",
        "www.admin.picpixels.com",
        "picpixels.com",
        "www.picpixels.com",
        "localhost",
        "127.0.0.1",
    ]
)

FRONTEND_URL = env(
    'FRONTEND_URL',
    default='https://picpixels.com'
)

_frontend_url = FRONTEND_URL
if _frontend_url:
    _parsed = _frontend_url.replace('https://', '').replace('http://', '').split('/')[0]
    if _parsed and _parsed not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(_parsed)

# ── Security Settings ──────────────────────────────────────────
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    env('FRONTEND_URL'),
]
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_CONTENT_TYPE_NOSNIFF = True

INSTALLED_APPS = [
    # Unfold must come before django.contrib.admin
    'unfold',
    'unfold.contrib.filters',
    'unfold.contrib.forms',
    'unfold.contrib.inlines',
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'channels',
    'drf_spectacular',
    'django_filters',
    'ckeditor',

    'users',
    'workflows',
    'orders',
    'cms',
    'notifications',
    'revisions',
    'site_settings',
    'navigation',
    'media_library',
    'portfolio',
    'case_studies',
    'guides',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.gzip.GZipMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'core.context_processors.site_settings',
                'core.context_processors.navigation_items',
                'core.context_processors.admin_dashboard_stats',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION = 'core.asgi.application'

# Database
DB_HOST = env('DB_HOST')
if DB_HOST:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': env('DB_NAME'),
            'USER': env('DB_USER'),
            'PASSWORD': env('DB_PASSWORD'),
            'HOST': DB_HOST,
            'PORT': env('DB_PORT'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

WHITENOISE_MAX_AGE = 31536000 if not DEBUG else 0
WHITENOISE_USE_FINDERS = True
WHITENOISE_MANIFEST_STRICT = False

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------------------------------------------------------------------------
# Email
# ---------------------------------------------------------------------------
if env('EMAIL_HOST'):
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = env('EMAIL_HOST')
    EMAIL_PORT = env('EMAIL_PORT')
    EMAIL_HOST_USER = env('EMAIL_HOST_USER')
    EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')
    EMAIL_USE_TLS = env('EMAIL_USE_TLS')
else:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL')

# ---------------------------------------------------------------------------
# Channels
# ---------------------------------------------------------------------------
REDIS_URL = env('REDIS_URL')
if REDIS_URL:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {"hosts": [REDIS_URL]},
        },
    }
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': REDIS_URL,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            },
            'KEY_PREFIX': 'picpicxels',
        }
    }
else:
    CHANNEL_LAYERS = {
        "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"},
    }
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'picpicxels-cache',
        }
    }

PUBLIC_CACHE_TTL = 60
CACHE_MIDDLEWARE_SECONDS = PUBLIC_CACHE_TTL
CACHE_MIDDLEWARE_KEY_PREFIX = 'picpicxels'

# Database connection pooling
CONN_MAX_AGE = 60 if not DEBUG else 0

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
_cors_origins = env('CORS_ALLOWED_ORIGINS')
if _frontend_url and _frontend_url not in _cors_origins:
    _cors_origins.append(_frontend_url)
CORS_ALLOWED_ORIGINS = _cors_origins
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']
CORS_ALLOW_HEADERS = [
    'accept', 'authorization', 'content-type', 'x-requested-with',
]
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True

# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ] if not DEBUG else [],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '500/hour',
        'user': '5000/hour',
    } if not DEBUG else {},
}

# ---------------------------------------------------------------------------
# Simple JWT
# ---------------------------------------------------------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# ---------------------------------------------------------------------------
# drf-spectacular (API Docs)
# ---------------------------------------------------------------------------
SPECTACULAR_SETTINGS = {
    'TITLE': 'Pixelz-ZTS API',
    'DESCRIPTION': 'Image editing, 3D/CGI, and AI fashion model platform',
    'VERSION': 'v1',
    'SERVE_INCLUDE_SCHEMA': False,
    'SCHEMA_PATH_PREFIX': '/api/v1/',
}

# ---------------------------------------------------------------------------
# CKEditor
# ---------------------------------------------------------------------------
CKEDITOR_CONFIGS = {
    'default': {
        'toolbar': 'full',
        'height': 400,
        'width': '100%',
        'extraPlugins': ','.join(['codesnippet', 'image2', 'uploadimage']),
    },
}

# ---------------------------------------------------------------------------
# Unfold Admin
# ---------------------------------------------------------------------------
UNFOLD = {
    "SITE_TITLE": "PicPicxels Admin",
    "SITE_HEADER": "PicPicxels",
    "SITE_SUBHEADER": "Content Management System",
    "SITE_FAVICONS": [],
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "THEME": "light",
    "ENVIRONMENT": "PicPicxels Enterprise",
    "ENVIRONMENT_TITLE_PREFIX": "show",
    "SHOW_BACK_BUTTON": True,
    "SHOW_LANGUAGES": False,
    "STYLES": [
        "/static/admin/css/custom.css",
        "/static/admin/css/custom_admin.css",
        "/static/admin/css/custom_table.css",
        "/static/admin/css/dashboard-redesign.css",
        "/static/admin/css/light-mode-fix.css",
    ],
    "SCRIPTS": [
        "/static/admin/js/sidebar.js",
        "/static/admin/js/toggle.js",
    ],
    "COMMAND": {
        "search_models": True,
        "show_history": True,
    },
    "COLORS": {
        "primary": {
            "50": "255 247 237",
            "100": "255 237 213",
            "200": "254 215 170",
            "300": "253 186 116",
            "400": "251 146 60",
            "500": "255 138 80",
            "600": "234 88 12",
            "700": "194 65 12",
            "800": "154 52 18",
            "900": "124 45 18",
            "950": "67 20 7",
        },
        "font": {
            "subtle-light": "148 163 184",
            "subtle-dark": "148 163 184",
            "default-light": "71 85 105",
            "default-dark": "203 208 218",
            "important-light": "15 23 42",
            "important-dark": "255 255 255",
        },
    },
    "EXTENSIONS": {
        "tab_translations": {
            "form": "Content",
            "tab_1": "SEO",
            "tab_2": "Settings",
        },
    },
    "LOGIN": {
        "image": None,
        "redirect_after": None,
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "Dashboard",
                "icon": "dashboard",
                "separator": True,
                "collapsible": False,
                "items": [
                    {"title": "Overview", "icon": "dashboard", "link": "/admin/"},
                ],
            },
            {
                "title": "Home Management",
                "icon": "home",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "Hero Section",        "icon": "movie_creation", "link": "/admin/cms/herosection/"},
                    {"title": "Hero Slides",         "icon": "slideshow",      "link": "/admin/cms/heroslide/"},
                    {"title": "Hero Stats",          "icon": "leaderboard",    "link": "/admin/cms/herostat/"},
                    {"title": "Trusted Brands",       "icon": "photo",          "link": "/admin/cms/brandlogo/"},
                    {"title": "Technologies",        "icon": "biotech",        "link": "/admin/cms/technology/"},
                    {"title": "Why Choose Us",       "icon": "thumb_up",       "link": "/admin/cms/whychoosesection/"},
                    {"title": "Why Choose Features", "icon": "checklist",      "link": "/admin/cms/whychoosefeaturesection/"},
                    {"title": "How It Works Items",  "icon": "timeline",       "link": "/admin/cms/whychooseitem/"},
                    {"title": "Testimonials",        "icon": "format_quote",   "link": "/admin/cms/testimonial/"},
                    {"title": "Team Members",        "icon": "group",          "link": "/admin/cms/teammember/"},
                    {"title": "FAQ Categories",      "icon": "bookmark",       "link": "/admin/cms/faqcategory/"},
                    {"title": "FAQs",                "icon": "quiz",           "link": "/admin/cms/faq/"},
                ],
            },
            {
                "title": "Services",
                "icon": "handyman",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "All Services",            "icon": "handyman",       "link": "/admin/cms/service/"},
                    {"title": "Content Sections",         "icon": "article",        "link": "/admin/cms/servicecontentsection/"},
                    {"title": "Gallery Images",           "icon": "photo_library",  "link": "/admin/cms/servicegalleryimage/"},
                    {"title": "Hero Images",              "icon": "image",          "link": "/admin/cms/serviceheroimage/"},
                    {"title": "Service Pricing Cards",    "icon": "credit_card",    "link": "/admin/cms/servicepricingcard/"},
                    {"title": "Service Pricing Card Prices","icon": "attach_money", "link": "/admin/cms/servicepricingcardprice/"},
                    {"title": "Service Unit Ranges",      "icon": "linear_scale",   "link": "/admin/cms/serviceunitrange/"},
                ],
            },
            {
                "title": "Pricing",
                "icon": "sell",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "Pricing Plans",              "icon": "sell",           "link": "/admin/cms/pricingplan/"},
                    {"title": "Config Sections",             "icon": "tune",           "link": "/admin/cms/pricingconfigsection/"},
                    {"title": "Config Cards",                "icon": "credit_card",    "link": "/admin/cms/pricingconfigcard/"},
                    {"title": "Dropdown Options",            "icon": "arrow_drop_down_circle","link": "/admin/cms/pricingconfigdropdownoption/"},
                    {"title": "Card Prices",                 "icon": "attach_money",   "link": "/admin/cms/pricingconfigcardprice/"},
                    {"title": "Promotion Sections",          "icon": "celebration",    "link": "/admin/cms/pricingpromotionsection/"},
                ],
            },
            {
                "title": "Case Studies",
                "icon": "work_history",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "All Case Studies", "icon": "description",     "link": "/admin/case_studies/casestudy/"},
                    {"title": "Categories",        "icon": "category",       "link": "/admin/case_studies/casestudycategory/"},
                    {"title": "Tags",              "icon": "label",          "link": "/admin/case_studies/casestudytag/"},
                ],
            },
            {
                "title": "Portfolio",
                "icon": "folder",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "Portfolio Items",  "icon": "folder_open",   "link": "/admin/portfolio/portfolio/"},
                    {"title": "Categories",       "icon": "category",      "link": "/admin/portfolio/category/"},
                    {"title": "Services",         "icon": "handyman",      "link": "/admin/portfolio/service/"},
                    {"title": "Gallery Images",   "icon": "photo_library", "link": "/admin/portfolio/portfoliogallery/"},
                    {"title": "Before / After",   "icon": "compare",       "link": "/admin/portfolio/portfoliocomparison/"},
                ],
            },
            {
                "title": "Guides",
                "icon": "menu_book",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "All Guides",    "icon": "book",      "link": "/admin/guides/guide/"},
                    {"title": "Categories",    "icon": "category",  "link": "/admin/guides/guidecategory/"},
                ],
            },
            {
                "title": "Blog",
                "icon": "newspaper",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "Blog Posts",       "icon": "newspaper",  "link": "/admin/cms/blogpost/"},
                    {"title": "Categories",        "icon": "category",  "link": "/admin/cms/blogcategory/"},
                    {"title": "Tags",              "icon": "label",     "link": "/admin/cms/blogtag/"},
                    {"title": "Authors",           "icon": "edit_note", "link": "/admin/cms/author/"},
                    {"title": "Content Sections",  "icon": "layers",    "link": "/admin/cms/blogcontentsection/"},
                    {"title": "Document Blocks",   "icon": "description","link": "/admin/cms/blogdocumentblock/"},
                ],
            },
            {
                "title": "Media Library",
                "icon": "perm_media",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "All Media Files", "icon": "perm_media", "link": "/admin/media_library/mediafile/"},
                ],
            },
            {
                "title": "Contact Management",
                "icon": "mail",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "Contact Inquiries",   "icon": "mail",          "link": "/admin/cms/contactinquiry/"},
                    {"title": "Free Trial Requests", "icon": "rocket_launch", "link": "/admin/cms/freetrial/"},
                ],
            },
            {
                "title": "Website Settings",
                "icon": "settings",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "Site Settings",     "icon": "settings",       "link": "/admin/site_settings/sitesetting/"},
                    {"title": "SEO Settings",      "icon": "travel_explore", "link": "/admin/site_settings/seosetting/"},
                    {"title": "Navigation Menus",  "icon": "menu",           "link": "/admin/navigation/navigationitem/"},
                    {"title": "Notifications",     "icon": "notifications",  "link": "/admin/notifications/notification/"},
                    {"title": "Pages",             "icon": "description",    "link": "/admin/cms/page/"},
                    {"title": "Banners",           "icon": "view_carousel",  "link": "/admin/cms/banner/"},
                    {"title": "Sections",          "icon": "layers",         "link": "/admin/cms/section/"},
                ],
            },
            {
                "title": "Commerce",
                "icon": "shopping_cart",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "Orders",       "icon": "receipt_long",  "link": "/admin/orders/order/"},
                    {"title": "Order Items",  "icon": "inventory_2",   "link": "/admin/orders/orderitem/"},
                    {"title": "Revisions",    "icon": "rate_review",   "link": "/admin/revisions/revisionrequest/"},
                    {"title": "Annotations",  "icon": "edit",          "link": "/admin/revisions/imageannotation/"},
                ],
            },
            {
                "title": "Workflows",
                "icon": "account_tree",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "Templates", "icon": "account_tree", "link": "/admin/workflows/workflowtemplate/"},
                ],
            },
            {
                "title": "Users & Roles",
                "icon": "group",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "Users",             "icon": "badge",            "link": "/admin/auth/user/"},
                    {"title": "User Profiles",     "icon": "account_circle",   "link": "/admin/users/userprofile/"},
                    {"title": "Groups",            "icon": "groups",           "link": "/admin/auth/group/"},
                    {"title": "Subscription Plans","icon": "workspace_premium","link": "/admin/users/subscriptionplan/"},
                    {"title": "Subscriptions",     "icon": "payments",         "link": "/admin/users/subscription/"},
                    {"title": "Transactions",      "icon": "receipt",          "link": "/admin/users/transaction/"},
                ],
            },
        ],
    },
    "TABS": [
        {
            "models": ["cms.page"],
            "items": [
                {"title": "All Pages", "link": "/admin/cms/page/"},
            ],
        },
        {
            "models": ["cms.blogpost"],
            "items": [
                {"title": "All Posts", "link": "/admin/cms/blogpost/"},
                {"title": "Published", "link": "/admin/cms/blogpost/?is_published__exact=1"},
                {"title": "Drafts",    "link": "/admin/cms/blogpost/?is_published__exact=0"},
            ],
        },
    ],
}
