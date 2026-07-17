from rest_framework import viewsets, permissions
from .models import NavigationItem
from .serializers import NavigationItemSerializer


class NavigationItemViewSet(viewsets.ModelViewSet):
    queryset = NavigationItem.objects.all()
    serializer_class = NavigationItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    ordering = ['order']
    filterset_fields = ['location', 'is_active']

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if request.method == 'GET':
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        else:
            response['Cache-Control'] = 'no-store'
        return response


class PublicNavigationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NavigationItem.objects.filter(is_active=True, parent__isnull=True).select_related('parent').prefetch_related('children')
    serializer_class = NavigationItemSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['location']

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response
