from rest_framework import serializers
from .models import MediaFile


class MediaFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaFile
        fields = '__all__'
        read_only_fields = ('file_type', 'mime_type', 'file_size', 'width', 'height', 'thumbnail')
