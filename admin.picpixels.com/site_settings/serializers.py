from rest_framework import serializers
from .models import SiteSetting, SEOSetting


class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = '__all__'
        extra_kwargs = {
            'recaptcha_secret_key': {'write_only': True},
        }


class SEOSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SEOSetting
        fields = '__all__'
