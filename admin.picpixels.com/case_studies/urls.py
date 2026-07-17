from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'items', views.CaseStudyViewSet)
router.register(r'categories', views.CaseStudyCategoryViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
