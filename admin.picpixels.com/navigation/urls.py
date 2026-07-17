from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NavigationItemViewSet, PublicNavigationViewSet

router = DefaultRouter()
router.register(r'items', NavigationItemViewSet)

urlpatterns = [
    path('', PublicNavigationViewSet.as_view({'get': 'list'}), name='public-navigation'),
    path('', include(router.urls)),
]
