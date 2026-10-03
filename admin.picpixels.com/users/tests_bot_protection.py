import json
import time
from unittest.mock import patch, MagicMock
from io import BytesIO
from django.test import TestCase, Client, override_settings
from django.urls import reverse
from django.contrib.auth.models import User
from core.captcha import verify_bot_protection, verify_cloudflare_turnstile


TEST_TURNSTILE_SECRET = '1x0000000000000000000000000000000AA'
REAL_MOCK_SECRET = '0x4AAAAAAtestsecretkey'


class BotProtectionServiceTests(TestCase):
    """Unit tests for core/captcha.py bot verification service."""

    def test_honeypot_field_rejected(self):
        data = {'website_hp': 'bot_spam_value', 'email': 'test@example.com'}
        is_valid, err_msg = verify_bot_protection(None, data)
        self.assertFalse(is_valid)
        self.assertIn("Automated submission detected", err_msg)

    def test_submission_too_fast_rejected(self):
        # Submission under 600ms
        data = {'form_loaded_at': time.time() - 0.2, 'email': 'test@example.com'}
        is_valid, err_msg = verify_bot_protection(None, data)
        self.assertFalse(is_valid)
        self.assertIn("Submission was too fast", err_msg)

    @override_settings(CLOUDFLARE_TURNSTILE_SECRET_KEY=TEST_TURNSTILE_SECRET)
    def test_turnstile_test_token_success(self):
        data = {'cf_turnstile_response': 'valid-test-token', 'form_loaded_at': time.time() - 2.0}
        is_valid, err_msg = verify_bot_protection(None, data)
        self.assertTrue(is_valid)
        self.assertEqual(err_msg, "")

    @override_settings(CLOUDFLARE_TURNSTILE_SECRET_KEY=TEST_TURNSTILE_SECRET)
    def test_turnstile_missing_token_rejected(self):
        data = {'email': 'test@example.com', 'form_loaded_at': time.time() - 2.0}
        is_valid, err_msg = verify_bot_protection(None, data)
        self.assertFalse(is_valid)
        self.assertIn("Security check required", err_msg)

    @override_settings(CLOUDFLARE_TURNSTILE_SECRET_KEY=TEST_TURNSTILE_SECRET)
    def test_turnstile_invalid_token_rejected(self):
        data = {'cf_turnstile_response': 'invalid-token', 'form_loaded_at': time.time() - 2.0}
        is_valid, err_msg = verify_bot_protection(None, data)
        self.assertFalse(is_valid)
        self.assertIn("Security verification failed", err_msg)

    @override_settings(CLOUDFLARE_TURNSTILE_SECRET_KEY=REAL_MOCK_SECRET)
    @patch('urllib.request.urlopen')
    def test_turnstile_upstream_mock_success(self, mock_urlopen):
        # Mock successful Cloudflare Turnstile response
        mock_resp = MagicMock()
        mock_resp.read.return_value = json.dumps({"success": True}).encode('utf-8')
        mock_resp.__enter__.return_value = mock_resp
        mock_urlopen.return_value = mock_resp

        is_valid, err_msg = verify_cloudflare_turnstile('client-token-123', REAL_MOCK_SECRET)
        self.assertTrue(is_valid)
        self.assertEqual(err_msg, "")

    @override_settings(CLOUDFLARE_TURNSTILE_SECRET_KEY=REAL_MOCK_SECRET)
    @patch('urllib.request.urlopen')
    def test_turnstile_upstream_mock_failure(self, mock_urlopen):
        # Mock failed Cloudflare Turnstile response
        mock_resp = MagicMock()
        mock_resp.read.return_value = json.dumps({
            "success": False,
            "error-codes": ["invalid-input-response"]
        }).encode('utf-8')
        mock_resp.__enter__.return_value = mock_resp
        mock_urlopen.return_value = mock_resp

        is_valid, err_msg = verify_cloudflare_turnstile('fake-token', REAL_MOCK_SECRET)
        self.assertFalse(is_valid)
        self.assertIn("Security verification failed", err_msg)


from django.core.cache import cache

@override_settings(CLOUDFLARE_TURNSTILE_SECRET_KEY=TEST_TURNSTILE_SECRET)
class ProtectedEndpointsTests(TestCase):
    """Integration tests for endpoints protected by CAPTCHA."""

    def setUp(self):
        cache.clear()
        self.client = Client()
        self.user = User.objects.create_user(
            username='user@test.com',
            email='user@test.com',
            password='Password123!'
        )

    def tearDown(self):
        cache.clear()

    def test_register_without_captcha_rejected(self):
        url = reverse('auth_register')
        payload = {
            'email': 'newuser@test.com',
            'password': 'SecurePassword123!',
            'first_name': 'New',
            'last_name': 'User',
            'form_loaded_at': time.time() - 2.0,
        }
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn("Security check required", response.json().get('detail', ''))

    def test_register_with_valid_captcha_succeeds(self):
        url = reverse('auth_register')
        payload = {
            'email': 'newuser@test.com',
            'password': 'SecurePassword123!',
            'first_name': 'New',
            'last_name': 'User',
            'cf_turnstile_response': 'valid-token',
            'form_loaded_at': time.time() - 2.0,
        }
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email='newuser@test.com').exists())

    def test_login_without_captcha_rejected(self):
        url = reverse('token_obtain_pair')
        payload = {
            'username': 'user@test.com',
            'password': 'Password123!',
            'form_loaded_at': time.time() - 2.0,
        }
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn("Security check required", response.json().get('detail', ''))

    def test_login_with_valid_captcha_succeeds(self):
        url = reverse('token_obtain_pair')
        payload = {
            'username': 'user@test.com',
            'password': 'Password123!',
            'cf_turnstile_response': 'valid-token',
            'form_loaded_at': time.time() - 2.0,
        }
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.json())

    def test_password_reset_without_captcha_rejected(self):
        url = reverse('password_reset')
        payload = {
            'email': 'user@test.com',
            'form_loaded_at': time.time() - 2.0,
        }
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn("Security check required", response.json().get('detail', ''))

    def test_password_reset_with_valid_captcha_succeeds(self):
        url = reverse('password_reset')
        payload = {
            'email': 'user@test.com',
            'cf_turnstile_response': 'valid-token',
            'form_loaded_at': time.time() - 2.0,
        }
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)

    def test_contact_inquiry_without_captcha_rejected(self):
        url = '/api/v1/cms/contacts/'
        payload = {
            'name': 'Spam Bot',
            'email': 'bot@spam.com',
            'message': 'Buy cheap meds',
            'form_loaded_at': time.time() - 2.0,
        }
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn("Security check required", response.json().get('detail', ''))

    def test_contact_inquiry_with_valid_captcha_succeeds(self):
        url = '/api/v1/cms/contacts/'
        payload = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'subject': 'General Inquiry',
            'message': 'Hello, I need photo editing.',
            'cf_turnstile_response': 'valid-token',
            'form_loaded_at': time.time() - 2.0,
        }
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def test_password_reset_rate_limit_throttled(self):
        url = reverse('password_reset')
        payload = {
            'email': 'user@test.com',
            'cf_turnstile_response': 'valid-token',
            'form_loaded_at': time.time() - 2.0,
        }
        # First 3 should succeed (limit is 3/minute)
        for _ in range(3):
            self.client.post(url, data=json.dumps(payload), content_type='application/json')
        
        # 4th should be throttled
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 429)
        self.assertIn("detail", response.json())
