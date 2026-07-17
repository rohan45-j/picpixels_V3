from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteSettingViewSet, SEOSettingViewSet

router = DefaultRouter()
router.register(r'site', SiteSettingViewSet)
router.register(r'seo', SEOSettingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
