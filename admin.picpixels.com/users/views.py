from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.models import User, Group, Permission
from django.utils.decorators import method_decorator
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from .models import UserProfile, SubscriptionPlan, Subscription, Transaction
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    UserProfileSerializer, RegisterSerializer, SubscriptionPlanSerializer,
    PasswordResetSerializer, EmailVerificationSerializer, UserSerializer,
    SubscriptionSerializer, TransactionSerializer, CustomTokenObtainSerializer,
    PermissionSerializer, GroupSerializer, CurrentUserSerializer,
)

CACHE_TTL = getattr(settings, 'PUBLIC_CACHE_TTL', 60)


class NoCacheOnWriteMixin:
    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if request.method == 'GET':
            response['Cache-Control'] = f'public, max-age={CACHE_TTL}, s-maxage={CACHE_TTL * 2}, stale-while-revalidate={CACHE_TTL * 10}'
        else:
            response['Cache-Control'] = 'no-store'
        return response


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            profile = serializer.save()
            profile_serializer = UserProfileSerializer(profile)
            return Response({
                "message": "User registered successfully.",
                "profile": profile_serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetSerializer

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            s = URLSafeTimedSerializer(settings.SECRET_KEY)
            token = s.dumps(email, salt='password-reset')
            send_mail(
                "Password Reset",
                f"Use this token to reset your password: {token}",
                "no-reply@example.com",
                [email],
                fail_silently=False,
            )
            return Response({"message": "Password reset email sent."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailVerificationView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = EmailVerificationSerializer

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            token = serializer.validated_data['token']
            s = URLSafeTimedSerializer(settings.SECRET_KEY)
            try:
                data = s.loads(token, salt='email-verify', max_age=86400)
                if data != email:
                    raise BadSignature
            except (BadSignature, SignatureExpired):
                return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(NoCacheOnWriteMixin, generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = UserProfile.objects.select_related('user').get_or_create(user=self.request.user)
        return profile


class SubscriptionPlanListView(NoCacheOnWriteMixin, generics.ListAPIView):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]


class SubscriptionPlanViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserAdminViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.select_related('profile').all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ['email', 'username', 'first_name', 'last_name']


class UserProfileAdminViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = UserProfile.objects.select_related('user').all().order_by('-created_at')
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ['user__email', 'company_name', 'role']


class SubscriptionViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = Subscription.objects.select_related('plan', 'profile__user').all().order_by('-created_at')
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']


class TransactionViewSet(NoCacheOnWriteMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Transaction.objects.select_related('profile__user').all().order_by('-created_at')
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['type', 'status']


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = CurrentUserSerializer(request.user)
        return Response(serializer.data)


class GroupViewSet(NoCacheOnWriteMixin, viewsets.ModelViewSet):
    queryset = Group.objects.prefetch_related('permissions').all().order_by('name')
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ['name']


class PermissionListView(NoCacheOnWriteMixin, generics.ListAPIView):
    queryset = Permission.objects.select_related('content_type').all().order_by('content_type__app_label', 'codename')
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAdminUser]


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainSerializer
    permission_classes = [permissions.AllowAny]
