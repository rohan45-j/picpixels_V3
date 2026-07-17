from django.contrib.auth.models import User, Group, Permission
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile, SubscriptionPlan, Subscription, Transaction


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'


class SubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = '__all__'

    def get_plan_name(self, obj):
        return obj.plan.name if obj.plan else ''

    def get_user_email(self, obj):
        return obj.profile.user.email if obj.profile else ''


class TransactionSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = '__all__'

    def get_user_email(self, obj):
        return obj.profile.user.email if obj.profile else ''


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    plan_name = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ('id', 'user', 'company_name', 'phone_number', 'website', 'role', 'credits', 'plan_name', 'created_at')

    def get_plan_name(self, obj):
        active_sub = obj.subscriptions.filter(status='active').first()
        return active_sub.plan.name if active_sub else 'Guest / Solo'


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    company_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    website = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        profile = UserProfile.objects.create(
            user=user,
            company_name=validated_data.get('company_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            website=validated_data.get('website', ''),
            role='client'
        )
        return profile


class CustomTokenObtainSerializer(TokenObtainSerializer):
    username_field = 'username'

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password,
            )
            if not user:
                user = User.objects.filter(email=username).first()
                if user:
                    user = authenticate(
                        request=self.context.get('request'),
                        username=user.username,
                        password=password,
                    )
            if not user or not user.is_active:
                raise serializers.ValidationError('No active account found with the given credentials.')

            refresh = RefreshToken.for_user(user)
            data = {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                }
            }
            return data
        raise serializers.ValidationError('Username/email and password are required.')


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user with this email.")
        return value


class EmailVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField()


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'content_type']


class GroupSerializer(serializers.ModelSerializer):
    permissions = serializers.PrimaryKeyRelatedField(many=True, queryset=Permission.objects.all())
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'user_count']

    def get_user_count(self, obj):
        return obj.user_set.count()


class CurrentUserSerializer(serializers.ModelSerializer):
    groups = serializers.StringRelatedField(many=True)
    all_permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'is_staff', 'is_superuser', 'groups', 'all_permissions']

    def get_all_permissions(self, obj):
        return list(obj.get_all_permissions())
