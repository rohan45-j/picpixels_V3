from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/users/', include('users.urls')),
    path('api/v1/workflows/', include('workflows.urls')),
    path('api/v1/orders/', include('orders.urls')),
    path('api/v1/revisions/', include('revisions.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/v1/cms/', include('cms.urls')),
    path('api/v1/settings/', include('site_settings.urls')),
    path('api/v1/navigation/', include('navigation.urls')),
    path('api/v1/media/', include('media_library.urls')),
    path('api/v1/portfolio/', include('portfolio.urls')),
    path('api/v1/case-studies/', include('case_studies.urls')),
    path('api/v1/guides/', include('guides.urls')),

    # API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
