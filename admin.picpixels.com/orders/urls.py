from django.urls import path
from .views import OrderListCreateView, OrderRetrieveUpdateDestroyView, CalculatePriceView

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order_list_create'),
    path('<uuid:pk>/', OrderRetrieveUpdateDestroyView.as_view(), name='order_detail'),
    path('calculate/', CalculatePriceView.as_view(), name='order_calculate_price'),
]
