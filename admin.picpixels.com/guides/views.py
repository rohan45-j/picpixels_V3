from django.conf import settings
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import GuideCategory, Guide
from .serializers import (
    GuideCategorySerializer,
    GuideListSerializer,
    GuideDetailSerializer,
)


class GuideCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GuideCategory.objects.filter(is_active=True)
    serializer_class = GuideCategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class GuideViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Guide.objects.none()
    serializer_class = GuideListSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return GuideDetailSerializer
        return GuideListSerializer

    def get_queryset(self):
        qs = Guide.objects.all()
        if not settings.DEBUG:
            qs = qs.filter(is_published=True, category__is_active=True)
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        if category:
            qs = qs.filter(category__slug=category)
        if search:
            qs = qs.filter(title__icontains=search)
        return qs

    @action(detail=False, permission_classes=[permissions.AllowAny])
    def homepage(self, request):
        qs = self.get_queryset().filter(featured=True)[:6]
        if not qs:
            qs = self.get_queryset()[:6]
        serializer = GuideListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)
