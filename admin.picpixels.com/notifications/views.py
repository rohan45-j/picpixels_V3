from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification
from .serializers import NotificationSerializer, NotificationMarkReadSerializer, NotificationCreateSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def get_queryset(self):
        qs = Notification.objects.all()
        read_filter = self.request.query_params.get('filter')
        if read_filter == 'unread':
            qs = qs.filter(is_read=False)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(message__icontains=search))
        return qs[:100]

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(is_read=False).count()
        return Response({'unread_count': count})

    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        serializer = NotificationMarkReadSerializer(data=request.data)
        if serializer.is_valid():
            ids = serializer.validated_data.get('ids')
            if ids:
                Notification.objects.filter(id__in=ids).update(is_read=True)
            else:
                Notification.objects.filter(is_read=False).update(is_read=True)
            return Response({'status': 'marked_read'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def mark_one_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked_read'})

    @action(detail=False, methods=['post'])
    def create_notification(self, request):
        serializer = NotificationCreateSerializer(data=request.data)
        if serializer.is_valid():
            notification = Notification.objects.create(
                title=serializer.validated_data['title'],
                message=serializer.validated_data['message'],
                type=serializer.validated_data['type'],
                related_id=serializer.validated_data.get('related_id', None),
            )
            try:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    "notifications",
                    {
                        "type": "notify",
                        "message": NotificationSerializer(notification).data,
                    },
                )
            except Exception:
                pass
            return Response(NotificationSerializer(notification).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
