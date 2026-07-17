from rest_framework import serializers
from .models import WorkflowTemplate

class WorkflowTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowTemplate
        fields = '__all__'
        read_only_fields = ('profile',)

    def create(self, validated_data):
        # Assign authenticated user's profile
        user = self.context['request'].user
        validated_data['profile'] = user.profile
        return super().create(validated_data)
