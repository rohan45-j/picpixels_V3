from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from django.utils.decorators import method_decorator
from .models import RevisionRequest, ImageAnnotation
from .serializers import RevisionRequestSerializer, ImageAnnotationSerializer

CACHE_TTL = getattr(settings, 'PUBLIC_CACHE_TTL', 60)


class NoCacheOnWriteMixin:
    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if request.method == 'GET':
            response['Cache-Control'] = f'public, max-age={CACHE_TTL}, s-maxage={CACHE_TTL * 2}, stale-while-revalidate={CACHE_TTL * 10}'
        else:
            response['Cache-Control'] = 'no-store'
        return response


class RevisionRequestListCreateView(NoCacheOnWriteMixin, generics.ListCreateAPIView):
    serializer_class = RevisionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or (hasattr(user, 'profile') and user.profile.role in ['admin', 'manager', 'retoucher']):
            return RevisionRequest.objects.select_related('order_item', 'requested_by').prefetch_related('annotations').all().order_by('-created_at')
        return RevisionRequest.objects.filter(requested_by=user.profile).select_related('order_item', 'requested_by').prefetch_related('annotations').order_by('-created_at')


class RevisionRequestDetailView(NoCacheOnWriteMixin, generics.RetrieveUpdateAPIView):
    serializer_class = RevisionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or (hasattr(user, 'profile') and user.profile.role in ['admin', 'manager', 'retoucher']):
            return RevisionRequest.objects.select_related('order_item', 'requested_by').prefetch_related('annotations').all()
        return RevisionRequest.objects.filter(requested_by=user.profile).select_related('order_item', 'requested_by').prefetch_related('annotations')


class AddAnnotationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, revision_id):
        try:
            user = request.user
            if user.is_staff or (hasattr(user, 'profile') and user.profile.role in ['admin', 'manager', 'retoucher']):
                revision = RevisionRequest.objects.select_related('order_item', 'requested_by').get(id=revision_id)
            else:
                revision = RevisionRequest.objects.select_related('order_item', 'requested_by').get(id=revision_id, requested_by=user.profile)
        except RevisionRequest.DoesNotExist:
            return Response({"error": "Revision Request not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ImageAnnotationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(revision=revision)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
