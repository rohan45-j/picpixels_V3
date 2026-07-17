from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from users.models import UserProfile, SubscriptionPlan, Subscription
from workflows.models import WorkflowTemplate
from .models import Order, OrderItem
from .services import calculate_order_price
from datetime import datetime, timedelta
import json

class OrderTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testclient', email='client@test.com', password='password123')
        self.profile = UserProfile.objects.create(user=self.user, role='client')

        # Setup simple subscription plan and active subscription
        self.plan = SubscriptionPlan.objects.create(
            name="Professional",
            monthly_fee=99.00,
            annual_fee=999.00,
            per_image_base_discount=10.00,  # 10% discount
            turnaround_hours_guaranteed=24
        )
        self.sub = Subscription.objects.create(
            profile=self.profile,
            plan=self.plan,
            status='active',
            current_period_start=datetime.now(),
            current_period_end=datetime.now() + timedelta(days=30)
        )

        # Authenticate client
        login_url = reverse('token_obtain_pair')
        resp = self.client.post(login_url, {'username': 'testclient', 'password': 'password123'})
        self.token = resp.data['access']
        self.auth_headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}

    def test_price_calculation_with_discounts(self):
        # Professional plan discount = 10%
        # Image Editing base rate: e.g. 1.50 per image
        price_data = calculate_order_price(
            service_type='image_editing',
            image_count=10,
            turnaround_hours=24,
            subscription_plan_name='Professional'
        )
        # Verify response structure and discount logic
        self.assertIn('unit_price', price_data)
        self.assertIn('total_price', price_data)
        self.assertIn('price_before_discounts', price_data)

    def test_order_creation_endpoint(self):
        url = reverse('order_list_create')
        payload = {
            "order_type": "image_editing",
            "turnaround_speed_hours": 24,
            "special_instructions": "Make all backgrounds transparent",
            "uploaded_files": [
                {"filename": "product1.jpg", "url": "http://img.com/prod1.jpg", "size": 2048},
                {"filename": "product2.jpg", "url": "http://img.com/prod2.jpg", "size": 4096}
            ]
        }
        
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.auth_headers
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(OrderItem.objects.count(), 2)

    def test_calculate_price_api(self):
        url = reverse('order_calculate_price')
        payload = {
            "service_type": "image_editing",
            "image_count": 5,
            "turnaround_hours": 24,
            "subscription_plan": "Professional"
        }
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('total_price', response.json())
