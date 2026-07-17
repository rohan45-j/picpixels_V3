from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from users.models import UserProfile
from .models import WorkflowTemplate
import json

class WorkflowTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', email='user@test.com', password='password123')
        self.profile = UserProfile.objects.create(user=self.user, role='client')

        # Authenticate user
        login_url = reverse('token_obtain_pair')
        resp = self.client.post(login_url, {'username': 'testuser', 'password': 'password123'})
        self.token = resp.data['access']
        self.auth_headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}

    def test_workflow_template_creation_and_listing(self):
        # Create template
        create_url = reverse('workflow_list_create')
        payload = {
            "name": "E-Commerce Packshot",
            "file_format": "png",
            "background_type": "transparent",
            "margin_percentage": 15,
            "crop_width": 1200,
            "crop_height": 1200,
            "shadow_type": "drop_shadow"
        }
        
        response = self.client.post(
            create_url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.auth_headers
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(WorkflowTemplate.objects.count(), 1)
        self.assertEqual(WorkflowTemplate.objects.first().name, "E-Commerce Packshot")

        # List templates
        response = self.client.get(create_url, **self.auth_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 1)
