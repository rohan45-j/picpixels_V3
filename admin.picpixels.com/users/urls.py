from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, UserProfileView, SubscriptionPlanListView,
    PasswordResetView, EmailVerificationView, LoginView,
    SubscriptionPlanViewSet, UserAdminViewSet, UserProfileAdminViewSet,
    SubscriptionViewSet, TransactionViewSet,
    CurrentUserView, GroupViewSet, PermissionListView,
)

router = DefaultRouter()
router.register(r'admin/users', UserAdminViewSet)
router.register(r'admin/profiles', UserProfileAdminViewSet)
router.register(r'plans/manage', SubscriptionPlanViewSet)
router.register(r'subscriptions', SubscriptionViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'roles', GroupViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('plans/', SubscriptionPlanListView.as_view(), name='subscription_plans'),
    path('permissions/', PermissionListView.as_view(), name='permissions_list'),
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('email-verification/', EmailVerificationView.as_view(), name='email_verification'),
    path('', include(router.urls)),
]
