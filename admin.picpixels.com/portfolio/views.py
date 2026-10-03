from django.db import models as db_models
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Service, Portfolio
from .serializers import CategorySerializer, ServiceSerializer, PortfolioSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True).order_by('homepage_sort_order', 'sort_order', 'name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.query_params.get('homepage') == 'true':
            qs = qs.filter(show_on_homepage=True)
        return qs


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


from rest_framework.pagination import PageNumberPagination

class PortfolioPagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 100


class PortfolioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Portfolio.objects.filter(is_published=True, category__is_active=True).select_related('category', 'service')
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = PortfolioPagination
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
        """Return admin-defined portfolio items for the Home page showcase."""
        qs = (Portfolio.objects.filter(is_published=True, show_on_homepage=True)
              .select_related('category', 'service')
              .order_by('homepage_sort_order', 'sort_order', '-created_at'))
        if not qs.exists():
            qs = (Portfolio.objects.filter(is_published=True, featured=True)
                  .select_related('category', 'service')
                  .order_by('homepage_sort_order', 'sort_order', '-created_at')[:8])
        if not qs.exists():
            qs = (Portfolio.objects.filter(is_published=True)
                  .select_related('category', 'service')
                  .order_by('sort_order', '-created_at')[:6])
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


