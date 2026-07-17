from django.conf import settings
from django.db import models
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CaseStudyCategory, CaseStudy
from .serializers import (
    CaseStudyCategorySerializer,
    CaseStudyListSerializer,
    CaseStudyDetailSerializer,
)


class CaseStudyCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CaseStudyCategory.objects.filter(is_active=True)
    serializer_class = CaseStudyCategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class CaseStudyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CaseStudy.objects.none()
    serializer_class = CaseStudyListSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CaseStudyDetailSerializer
        return CaseStudyListSerializer

    def get_queryset(self):
        qs = CaseStudy.objects.all()
        if not settings.DEBUG:
            qs = qs.filter(is_published=True, category__is_active=True)
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        ordering = self.request.query_params.get('ordering', 'newest')
        if category:
            qs = qs.filter(category__slug=category)
        if search:
            qs = qs.filter(
                models.Q(title__icontains=search) |
                models.Q(excerpt__icontains=search) |
                models.Q(client_name__icontains=search) |
                models.Q(industry__icontains=search) |
                models.Q(services_provided__icontains=search)
            )
        if ordering == 'oldest':
            qs = qs.order_by('sort_order', 'created_at')
        elif ordering == 'featured':
            qs = qs.order_by('-featured', 'sort_order', '-created_at')
        else:
            qs = qs.order_by('sort_order', '-created_at')
        return qs

    @action(detail=False, permission_classes=[permissions.AllowAny])
    def homepage(self, request):
        qs = self.get_queryset().filter(featured=True)[:6]
        if not qs:
            qs = self.get_queryset()[:6]
        serializer = CaseStudyListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, permission_classes=[permissions.AllowAny], url_path='homepage-section')
    def homepage_section(self, request):
        qs = self.get_queryset()
        serializer = CaseStudyListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)
