from rest_framework import serializers
from .models import RevisionRequest, ImageAnnotation

class ImageAnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageAnnotation
        fields = '__all__'
        read_only_fields = ('revision',)

class RevisionRequestSerializer(serializers.ModelSerializer):
    annotations = ImageAnnotationSerializer(many=True, required=False)

    class Meta:
        model = RevisionRequest
        fields = ('id', 'order_item', 'requested_by', 'status', 'feedback_text', 'created_at', 'annotations')
        read_only_fields = ('requested_by',)

    def create(self, validated_data):
        annotations_data = validated_data.pop('annotations', [])
        profile = self.context['request'].user.profile
        revision = RevisionRequest.objects.create(requested_by=profile, **validated_data)

        for anno_data in annotations_data:
            ImageAnnotation.objects.create(revision=revision, **anno_data)

        # Update order item status to rejected (meaning revision requested)
        item = validated_data['order_item']
        item.status = 'rejected'
        item.save()

        return revision
