from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from django.utils.decorators import method_decorator
from .models import Order
from .serializers import OrderSerializer
from .services import calculate_order_price

CACHE_TTL = getattr(settings, 'PUBLIC_CACHE_TTL', 60)


class NoCacheOnWriteMixin:
    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if request.method == 'GET':
            response['Cache-Control'] = f'public, max-age={CACHE_TTL}, s-maxage={CACHE_TTL * 2}, stale-while-revalidate={CACHE_TTL * 10}'
        else:
            response['Cache-Control'] = 'no-store'
        return response


class OrderListCreateView(NoCacheOnWriteMixin, generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or (hasattr(user, 'profile') and user.profile.role in ['admin', 'manager']):
            return Order.objects.select_related('profile', 'workflow_template').prefetch_related('items').all().order_by('-created_at')
        return Order.objects.filter(profile=user.profile).select_related('profile', 'workflow_template').prefetch_related('items').order_by('-created_at')


class OrderRetrieveUpdateDestroyView(NoCacheOnWriteMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or (hasattr(user, 'profile') and user.profile.role in ['admin', 'manager']):
            return Order.objects.select_related('profile', 'workflow_template').prefetch_related('items').all()
        return Order.objects.filter(profile=user.profile).select_related('profile', 'workflow_template').prefetch_related('items')


class CalculatePriceView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        service_type = request.data.get('service_type')
        image_count = request.data.get('image_count')
        turnaround_hours = request.data.get('turnaround_hours')
        subscription_plan = request.data.get('subscription_plan', 'Solo')

        if not service_type or image_count is None or not turnaround_hours:
            return Response(
                {"error": "Missing required fields: service_type, image_count, turnaround_hours"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            pricing = calculate_order_price(
                service_type=service_type,
                image_count=image_count,
                turnaround_hours=turnaround_hours,
                subscription_plan_name=subscription_plan
            )
            return Response(pricing, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
