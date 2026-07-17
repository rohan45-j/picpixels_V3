from rest_framework import generics, permissions
from django.conf import settings
from django.utils.decorators import method_decorator
from .models import WorkflowTemplate
from .serializers import WorkflowTemplateSerializer

CACHE_TTL = getattr(settings, 'PUBLIC_CACHE_TTL', 60)


class NoCacheOnWriteMixin:
    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if request.method == 'GET':
            response['Cache-Control'] = f'public, max-age={CACHE_TTL}, s-maxage={CACHE_TTL * 2}, stale-while-revalidate={CACHE_TTL * 10}'
        else:
            response['Cache-Control'] = 'no-store'
        return response


class WorkflowTemplateListCreateView(NoCacheOnWriteMixin, generics.ListCreateAPIView):
    serializer_class = WorkflowTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or (hasattr(user, 'profile') and user.profile.role in ['admin', 'manager']):
            return WorkflowTemplate.objects.select_related('profile').all().order_by('-created_at')
        return WorkflowTemplate.objects.filter(profile=user.profile).select_related('profile').order_by('-created_at')


class WorkflowTemplateRetrieveUpdateDestroyView(NoCacheOnWriteMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkflowTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or (hasattr(user, 'profile') and user.profile.role in ['admin', 'manager']):
            return WorkflowTemplate.objects.select_related('profile').all()
        return WorkflowTemplate.objects.filter(profile=user.profile).select_related('profile')
