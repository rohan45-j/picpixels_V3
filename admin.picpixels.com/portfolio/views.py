from django.db import models as db_models
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Service, Portfolio
from .serializers import CategorySerializer, ServiceSerializer, PortfolioSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class PortfolioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Portfolio.objects.filter(is_published=True, category__is_active=True).select_related('category', 'service')
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        if category:
            qs = qs.filter(category__slug=category)
        if search:
            qs = qs.filter(
                db_models.Q(title__icontains=search) |
                db_models.Q(short_description__icontains=search) |
                db_models.Q(client__icontains=search)
            )
        return qs

    @action(detail=False, methods=['get'])
    def homepage(self, request):
        qs = (Portfolio.objects.filter(is_published=True, featured=True)
              .select_related('category', 'service')[:8])
        if not qs:
            qs = (Portfolio.objects.filter(is_published=True)
                  .select_related('category', 'service')[:8])
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
