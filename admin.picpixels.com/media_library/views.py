from rest_framework import viewsets, permissions, parsers, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django.conf import settings
from django.utils.decorators import method_decorator
from .models import MediaFile
from .serializers import MediaFileSerializer

CACHE_TTL = getattr(settings, 'PUBLIC_CACHE_TTL', 60)


class NoCacheOnWriteMixin:
    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if request.method == 'GET':
            response['Cache-Control'] = f'public, max-age={CACHE_TTL}, s-maxage={CACHE_TTL * 2}, stale-while-revalidate={CACHE_TTL * 10}'
        else:
            response['Cache-Control'] = 'no-store'
        return response


class MediaFileViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = MediaFile.objects.select_related('uploaded_by').all()
    serializer_class = MediaFileSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    filterset_fields = ['file_type']
    search_fields = ['title', 'alt_text']
    ordering = ['-created_at']

    @extend_schema(
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'file': {'type': 'string', 'format': 'binary'},
                    'title': {'type': 'string'},
                    'alt_text': {'type': 'string'},
                },
            },
        },
    )
    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=400)

        data = request.data.copy()
        data['file_size'] = file_obj.size
        data['mime_type'] = file_obj.content_type or ''
        data['uploaded_by'] = request.user.id if request.user.is_authenticated else None

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class PublicMediaViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = MediaFile.objects.select_related('uploaded_by').all()
    serializer_class = MediaFileSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['file_type']
    ordering = ['-created_at']
