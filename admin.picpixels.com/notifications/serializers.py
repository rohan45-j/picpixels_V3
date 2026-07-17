from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    time_ago = serializers.SerializerMethodField()
    created_at_display = serializers.DateTimeField(source='created_at', read_only=True, format='%Y-%m-%d %H:%M')

    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'type', 'type_display', 'related_id', 'is_read', 'created_at', 'created_at_display', 'time_ago']

    def get_time_ago(self, obj):
        from django.utils import timezone
        now = timezone.now()
        diff = now - obj.created_at
        if diff.days > 7:
            return obj.created_at.strftime('%b %d, %Y')
        if diff.days > 0:
            return f'{diff.days}d ago'
        if diff.seconds >= 3600:
            return f'{diff.seconds // 3600}h ago'
        if diff.seconds >= 60:
            return f'{diff.seconds // 60}m ago'
        return 'Just now'


class NotificationMarkReadSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.IntegerField(), required=False)


class NotificationCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    message = serializers.CharField()
    type = serializers.ChoiceField(choices=[c[0] for c in Notification.NOTIFICATION_TYPES])
    related_id = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
