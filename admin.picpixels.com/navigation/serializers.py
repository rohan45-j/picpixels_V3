from rest_framework import serializers
from .models import NavigationItem


class NavigationItemSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = NavigationItem
        fields = '__all__'

    def get_children(self, obj):
        children = obj.children.filter(is_active=True).order_by('order')
        return NavigationItemSerializer(children, many=True).data
