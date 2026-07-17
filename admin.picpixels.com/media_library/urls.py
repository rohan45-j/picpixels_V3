from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MediaFileViewSet, PublicMediaViewSet

router = DefaultRouter()
router.register(r'files', MediaFileViewSet)

urlpatterns = [
    path('', PublicMediaViewSet.as_view({'get': 'list'}), name='public-media'),
    path('', include(router.urls)),
]
