from django.test import TestCase, Client
from django.urls import reverse
from django.core import mail
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from django.conf import settings
from django.contrib.auth.models import User
from users.models import UserProfile
from cms.models import Page

class PasswordResetViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user_email = 'testuser@example.com'
        # Create a real auth user
        self.auth_user = User.objects.create_user(username='testuser', email=self.user_email, password='testpass')
        UserProfile.objects.create(user=self.auth_user, role='client')

    def test_password_reset_email_sent(self):
        response = self.client.post('/api/users/password-reset/', {'email': self.user_email}, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        # Email should be captured in outbox (console backend stores in mail.outbox)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Password Reset', mail.outbox[0].subject)
        self.assertIn('Use this token to reset your password', mail.outbox[0].body)

class EmailVerificationViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.email = 'verify@example.com'
        self.user = User.objects.create_user(username='verifyuser', email=self.email, password='testpass')
        UserProfile.objects.create(user=self.user, role='client')
        self.serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
        self.token = self.serializer.dumps(self.email, salt='email-verify')

    def test_email_verification_success(self):
        response = self.client.post('/api/users/email-verification/', {'email': self.email, 'token': self.token}, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Email verified successfully', response.json().get('message', ''))

    def test_email_verification_invalid_token(self):
        response = self.client.post('/api/users/email-verification/', {'email': self.email, 'token': 'invalidtoken'}, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid or expired token', response.json().get('error', ''))

class PageModelTest(TestCase):
    def test_seo_fields(self):
        page = Page.objects.create(
            title='Test Page',
            slug='test-page',
            meta_title='Meta Title',
            seo_title='SEO Title',
            seo_description='SEO Description',
            content={},
        )
        self.assertEqual(page.seo_title, 'SEO Title')
        self.assertEqual(page.seo_description, 'SEO Description')
