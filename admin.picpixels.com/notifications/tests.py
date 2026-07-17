from django.test import TestCase, Client
from django.urls import reverse
import json

class NotificationTriggerViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('notification_trigger')

    def test_trigger_success(self):
        payload = {'message': {'text': 'Test notification'}}
        response = self.client.post(self.url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, {'status': 'sent'})

    def test_trigger_invalid_json(self):
        response = self.client.post(self.url, data='invalid json', content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(response.content, {'error': 'Invalid JSON'})
