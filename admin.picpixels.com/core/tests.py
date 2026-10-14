import json
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from cms.models import Service

User = get_user_model()


class AdminQuickUpdateTests(TestCase):
    def setUp(self):
        self.client = Client()
        # Create a test service
        self.service = Service.objects.create(
            title='Test Quick Service',
            slug='test-quick-service',
            description='Test service description',
            is_active=True,
            show_in_mega_menu=False,
            order=1,
        )

        # Create normal staff user with cms permission
        self.staff_user = User.objects.create_user(
            username='staffuser',
            password='password123',
            is_staff=True,
        )
        content_type = ContentType.objects.get_for_model(Service)
        change_perm = Permission.objects.get(content_type=content_type, codename='change_service')
        self.staff_user.user_permissions.add(change_perm)

        # Create unprivileged user
        self.plain_user = User.objects.create_user(
            username='plainuser',
            password='password123',
            is_staff=False,
        )

        # Create staff user without cms permission
        self.no_perm_staff = User.objects.create_user(
            username='nopermstaff',
            password='password123',
            is_staff=True,
        )

    def test_anonymous_access_forbidden(self):
        resp = self.client.post(
            '/admin/quick-update/',
            data=json.dumps({
                'app_label': 'cms',
                'model_name': 'service',
                'object_id': self.service.id,
                'field_name': 'is_active',
                'value': False,
            }),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 403)

    def test_non_staff_forbidden(self):
        self.client.login(username='plainuser', password='password123')
        resp = self.client.post(
            '/admin/quick-update/',
            data=json.dumps({
                'app_label': 'cms',
                'model_name': 'service',
                'object_id': self.service.id,
                'field_name': 'is_active',
                'value': False,
            }),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 403)

    def test_staff_without_permission_forbidden(self):
        self.client.login(username='nopermstaff', password='password123')
        resp = self.client.post(
            '/admin/quick-update/',
            data=json.dumps({
                'app_label': 'cms',
                'model_name': 'service',
                'object_id': self.service.id,
                'field_name': 'is_active',
                'value': False,
            }),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 403)

    def test_toggle_boolean_success(self):
        self.client.login(username='staffuser', password='password123')
        resp = self.client.post(
            '/admin/quick-update/',
            data=json.dumps({
                'app_label': 'cms',
                'model_name': 'service',
                'object_id': self.service.id,
                'field_name': 'is_active',
                'value': False,
            }),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data['success'])
        self.assertFalse(data['value'])

        self.service.refresh_from_db()
        self.assertFalse(self.service.is_active)

    def test_update_order_success(self):
        self.client.login(username='staffuser', password='password123')
        resp = self.client.post(
            '/admin/quick-update/',
            data=json.dumps({
                'app_label': 'cms',
                'model_name': 'service',
                'object_id': self.service.id,
                'field_name': 'order',
                'value': 42,
            }),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['value'], 42)

        self.service.refresh_from_db()
        self.assertEqual(self.service.order, 42)

    def test_invalid_model_error(self):
        self.client.login(username='staffuser', password='password123')
        resp = self.client.post(
            '/admin/quick-update/',
            data=json.dumps({
                'app_label': 'cms',
                'model_name': 'nonexistentmodel',
                'object_id': self.service.id,
                'field_name': 'is_active',
                'value': False,
            }),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 403)  # fails perm check first for non-existent model

    def test_service_admin_form_available_locations_bound_field(self):
        """ServiceAdminForm with LocationPickerWidget must not raise TypeError when bound field is accessed."""
        from cms.admin import ServiceAdminForm
        form = ServiceAdminForm(data={
            'title': self.service.title,
            'slug': self.service.slug,
            'description': 'Valid description',
            'price': '5.00',
            'order': '0',
            'available_locations': '["Texas", "Florida"]',
            'schema_type': 'Service',
            'is_active': True,
        }, instance=self.service)
        widget_rendered = form['available_locations'].as_widget()
        self.assertIn('Texas', widget_rendered)
        self.assertTrue(form.is_valid(), f"Form errors: {form.errors}")
        self.assertEqual(form.cleaned_data['available_locations'], ['Texas', 'Florida'])

