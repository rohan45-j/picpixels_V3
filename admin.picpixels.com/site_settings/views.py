from rest_framework import viewsets, permissions
from django.conf import settings
from .models import SiteSetting, SEOSetting
from .serializers import SiteSettingSerializer, SEOSettingSerializer

CACHE_TTL = getattr(settings, 'PUBLIC_CACHE_TTL', 60)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or request.user.is_superuser or
            getattr(request.user.profile, 'role', '') == 'admin'
        )


class SiteSettingViewSet(viewsets.ModelViewSet):
    queryset = SiteSetting.objects.all()
    serializer_class = SiteSettingSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        if SiteSetting.objects.exists() and not self.request.data.get('force'):
            return
        serializer.save()

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if request.method == 'GET':
            response['Cache-Control'] = 'public, max-age=5, s-maxage=0, must-revalidate'
        else:
            response['Cache-Control'] = 'no-store'
        return response


class SEOSettingViewSet(viewsets.ModelViewSet):
    queryset = SEOSetting.objects.all()
    serializer_class = SEOSettingSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        if SEOSetting.objects.exists() and not self.request.data.get('force'):
            return
        serializer.save()

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if request.method == 'GET':
            response['Cache-Control'] = f'public, max-age={CACHE_TTL * 10}, s-maxage={CACHE_TTL * 20}, stale-while-revalidate={CACHE_TTL * 60}'
        else:
            response['Cache-Control'] = 'no-store'
        return response
