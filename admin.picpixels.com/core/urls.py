from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from cms.views import HomepageDataView


def cached_media_serve(request, path, document_root=None, show_indexes=False):
    response = serve(request, path, document_root=document_root, show_indexes=show_indexes)
    response['Cache-Control'] = 'public, max-age=86400, stale-while-revalidate=604800'
    return response


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/homepage/', HomepageDataView.as_view(), name='homepage-data'),
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
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', cached_media_serve, {'document_root': settings.MEDIA_ROOT}),
    ]

