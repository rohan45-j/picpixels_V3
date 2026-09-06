from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from users.models import UserProfile
from .models import Page, BlogPost, ContactInquiry, Service, ServiceHeroImage, ServiceGalleryImage
import json

class CMSAPITests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testadmin', email='admin@test.com', password='password123')
        self.profile = UserProfile.objects.create(user=self.user, role='admin')
        
        # Authenticated client setup
        login_url = reverse('token_obtain_pair')
        resp = self.client.post(login_url, {'username': 'testadmin', 'password': 'password123'})
        self.token = resp.data['access']
        self.auth_headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}

        # Create sample page
        self.page = Page.objects.create(
            title="Home",
            meta_title="Premium Image Retouching",
            meta_description="Best retouching service",
            content=[{"type": "hero", "data": {"headline": "Visual excellence"}}]
        )

    def test_get_page_list_public(self):
        url = reverse('page-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        # Check that page title is in response
        data = response.json()
        self.assertEqual(data['results'][0]['title'], 'Home')

    def test_get_page_detail_public(self):
        url = reverse('page-detail', kwargs={'slug': 'home'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['meta_title'], 'Premium Image Retouching')

    def test_blog_post_slug_auto_generation(self):
        post = BlogPost.objects.create(
            title="My First Blog Post",
            excerpt="Excerpt text",
            content="Full content here."
        )
        self.assertEqual(post.slug, "my-first-blog-post")

    def test_contact_inquiry_creation_public(self):
        url = reverse('contactinquiry-list')
        payload = {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "subject": "Help Needed",
            "message": "I would like to inquire about CGI services."
        }
        response = self.client.post(url, data=payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ContactInquiry.objects.count(), 1)

    def test_contact_inquiry_list_protected(self):
        url = reverse('contactinquiry-list')
        
        # Unauthorized check
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)
        
        # Authorized check
        response = self.client.get(url, **self.auth_headers)
        self.assertEqual(response.status_code, 200)

    def test_media_upload_endpoint(self):
        url = reverse('media_upload')
        
        # Unauthorized check
        response = self.client.post(url)
        self.assertEqual(response.status_code, 401)
        
        # Simple upload mock
        from django.core.files.uploadedfile import SimpleUploadedFile
        test_file = SimpleUploadedFile("test_img.png", b"file_content", content_type="image/png")
        
        response = self.client.post(url, {'file': test_file}, **self.auth_headers)
        self.assertEqual(response.status_code, 201)
        self.assertIn('url', response.json())
        self.assertEqual(response.json()['filename'], 'test_img.png')


class ServiceBulkUploadTests(TestCase):
    """Tests for the Service Admin bulk upload save_model logic."""

    def setUp(self):
        self.client = Client()
        self.admin_user = User.objects.create_superuser(
            username='superadmin', email='super@test.com', password='adminpass123'
        )
        self.client.login(username='superadmin', password='adminpass123')
        self.service = Service.objects.create(
            title='Background Removal',
            slug='background-removal',
            description='Professional background removal service.',
            price=5.00,
        )

    def _make_request(self, bulk_json=''):
        """Build a minimal fake POST request for save_model testing."""
        from django.test import RequestFactory
        from django.contrib.messages.storage.fallback import FallbackStorage
        factory = RequestFactory()
        data = {
            'title': self.service.title,
            'slug': self.service.slug,
            'description': 'Updated description',
            'price': '5.00',
            'order': '0',
            'features': '[]',
            'pricing_features': '[]',
        }
        if bulk_json:
            data['bulk_uploads_json'] = bulk_json
        request = factory.post(
            '/admin/cms/service/{}/change/'.format(self.service.pk), data
        )
        request.user = self.admin_user
        # Attach messages middleware so messages.warning/error work
        setattr(request, 'session', 'session')
        setattr(request, '_messages', FallbackStorage(request))
        return request

    def _get_admin_instance(self):
        from django.contrib import admin
        return admin.site._registry[Service]

    def test_save_model_no_bulk_data(self):
        """Service saves normally without bulk_uploads_json."""
        admin_instance = self._get_admin_instance()
        request = self._make_request()
        admin_instance.save_model(request, self.service, form=None, change=True)
        self.service.refresh_from_db()
        self.assertIsNotNone(self.service.pk)
        self.assertEqual(self.service.title, 'Background Removal')

    def test_save_model_empty_bulk_json(self):
        """Empty or invalid bulk_uploads_json should not crash."""
        admin_instance = self._get_admin_instance()
        request = self._make_request(bulk_json='not valid json')
        admin_instance.save_model(request, self.service, form=None, change=True)
        self.service.refresh_from_db()
        self.assertIsNotNone(self.service.pk)

    def test_save_model_empty_bulk_data_object(self):
        """Empty JSON object {} should save normally."""
        admin_instance = self._get_admin_instance()
        request = self._make_request(bulk_json='{}')
        admin_instance.save_model(request, self.service, form=None, change=True)
        self.service.refresh_from_db()
        self.assertIsNotNone(self.service.pk)

    def test_service_hero_image_model_fields(self):
        """Verify ServiceHeroImage model has the expected fields."""
        hero = ServiceHeroImage.objects.create(
            service=self.service,
            alt_text='Test hero',
            order=1,
            is_active=True,
        )
        self.assertEqual(hero.service, self.service)
        self.assertEqual(hero.alt_text, 'Test hero')
        self.assertEqual(hero.order, 1)
        self.assertTrue(hero.is_active)

    def test_service_gallery_image_model_fields(self):
        """Verify ServiceGalleryImage model fields for portfolio type."""
        gallery = ServiceGalleryImage.objects.create(
            service=self.service,
            gallery_type='portfolio',
            category='ecommerce',
            alt_text='Gallery image',
            caption='Product shot',
            is_featured=True,
            is_visible=True,
            order=1,
        )
        self.assertEqual(gallery.gallery_type, 'portfolio')
        self.assertEqual(gallery.category, 'ecommerce')
        self.assertEqual(gallery.alt_text, 'Gallery image')
        self.assertEqual(gallery.caption, 'Product shot')
        self.assertTrue(gallery.is_featured)
        self.assertTrue(gallery.is_visible)

    def test_service_gallery_image_before_after_fields(self):
        """Verify ServiceGalleryImage model fields for before/after type."""
        gallery = ServiceGalleryImage.objects.create(
            service=self.service,
            gallery_type='before_after',
            before_image_alt='Before alt text',
            after_image_alt='After alt text',
            caption='Comparison shot',
            is_featured=False,
            is_visible=True,
            order=1,
        )
        self.assertEqual(gallery.gallery_type, 'before_after')
        self.assertEqual(gallery.before_image_alt, 'Before alt text')
        self.assertEqual(gallery.after_image_alt, 'After alt text')
        self.assertEqual(gallery.caption, 'Comparison shot')

    def test_hero_images_ordering(self):
        """Hero images should be ordered by the order field."""
        for i in range(3):
            ServiceHeroImage.objects.create(
                service=self.service,
                order=3 - i,  # 3, 2, 1
                is_active=True,
            )
        heroes = list(ServiceHeroImage.objects.filter(service=self.service))
        self.assertEqual(heroes[0].order, 1)
        self.assertEqual(heroes[1].order, 2)
        self.assertEqual(heroes[2].order, 3)

    def test_gallery_images_ordering(self):
        """Gallery images should be ordered by the order field."""
        for i in range(3):
            ServiceGalleryImage.objects.create(
                service=self.service,
                gallery_type='portfolio',
                order=3 - i,
                is_visible=True,
            )
        gallery = list(ServiceGalleryImage.objects.filter(service=self.service))
        self.assertEqual(gallery[0].order, 1)
        self.assertEqual(gallery[1].order, 2)
        self.assertEqual(gallery[2].order, 3)

    def test_service_cascade_delete_hero(self):
        """Deleting a service should cascade-delete its hero images."""
        ServiceHeroImage.objects.create(service=self.service, order=1, is_active=True)
        ServiceHeroImage.objects.create(service=self.service, order=2, is_active=True)
        self.assertEqual(ServiceHeroImage.objects.filter(service=self.service).count(), 2)
        self.service.delete()
        self.assertEqual(ServiceHeroImage.objects.count(), 0)

    def test_service_cascade_delete_gallery(self):
        """Deleting a service should cascade-delete its gallery images."""
        ServiceGalleryImage.objects.create(
            service=self.service, gallery_type='portfolio', order=1, is_visible=True
        )
        ServiceGalleryImage.objects.create(
            service=self.service, gallery_type='before_after', order=2, is_visible=True
        )
        self.assertEqual(ServiceGalleryImage.objects.filter(service=self.service).count(), 2)
        self.service.delete()
        self.assertEqual(ServiceGalleryImage.objects.count(), 0)

    def test_gallery_type_choices(self):
        """Gallery type must be one of: before_after, portfolio, case_study."""
        valid_types = ['before_after', 'portfolio', 'case_study']
        for gt in valid_types:
            self.assertIn(gt, [c[0] for c in ServiceGalleryImage.GALLERY_TYPE_CHOICES])

    def test_bulk_uploads_json_field_not_in_model(self):
        """bulk_uploads_json is a form-only field, not a model field."""
        self.assertFalse(hasattr(self.service, 'bulk_uploads_json'))
        # The hidden textarea is added by JS in the template
        self.assertNotIn('bulk_uploads_json', [f.name for f in Service._meta.get_fields()])

    def test_admin_includes_hero_inline(self):
        """ServiceAdmin should include ServiceHeroImageInline."""
        from .admin import ServiceAdmin
        from .admin import ServiceHeroImageInline
        self.assertIn(ServiceHeroImageInline, ServiceAdmin.inlines)

    def test_admin_includes_gallery_inline(self):
        """ServiceAdmin should include ServiceGalleryImageInline."""
        from .admin import ServiceAdmin
        from .admin import ServiceGalleryImageInline
        self.assertIn(ServiceGalleryImageInline, ServiceAdmin.inlines)

    def test_admin_media_includes_bulk_upload_js(self):
        """ServiceAdmin.Media.js should include the bulk upload script and image enhancer script."""
        from .admin import ServiceAdmin
        self.assertIn('admin/js/service_bulk_upload.js', ServiceAdmin.Media.js)
        self.assertIn('admin/js/service_admin_image_enhancer.js', ServiceAdmin.Media.js)

    def test_admin_media_includes_bulk_upload_css(self):
        """ServiceAdmin.Media.css should include the bulk upload stylesheet and image enhancer stylesheet."""
        from .admin import ServiceAdmin
        self.assertIn('admin/css/service_bulk_upload.css', ServiceAdmin.Media.css['all'])
        self.assertIn('admin/css/service_admin_image_enhancer.css', ServiceAdmin.Media.css['all'])

    def test_admin_change_form_template(self):
        """ServiceAdmin should use the custom change form template."""
        from .admin import ServiceAdmin
        self.assertEqual(ServiceAdmin.change_form_template, 'admin/cms/service/change_form.html')

    def test_multiple_services_independent_hero_images(self):
        """Hero images from one service should not affect another."""
        service2 = Service.objects.create(
            title='Photo Retouching',
            slug='photo-retouching',
            description='Professional photo retouching.',
            price=8.00,
        )
        ServiceHeroImage.objects.create(service=self.service, order=1, is_active=True)
        ServiceHeroImage.objects.create(service=service2, order=1, is_active=True)

        self.assertEqual(ServiceHeroImage.objects.filter(service=self.service).count(), 1)
        self.assertEqual(ServiceHeroImage.objects.filter(service=service2).count(), 1)

    def test_multiple_services_independent_gallery(self):
        """Gallery images from one service should not affect another."""
        service2 = Service.objects.create(
            title='Color Correction',
            slug='color-correction',
            description='Professional color correction.',
            price=3.00,
        )
        ServiceGalleryImage.objects.create(
            service=self.service, gallery_type='portfolio', order=1, is_visible=True
        )
        ServiceGalleryImage.objects.create(
            service=service2, gallery_type='portfolio', order=1, is_visible=True
        )

        self.assertEqual(ServiceGalleryImage.objects.filter(service=self.service).count(), 1)
        self.assertEqual(ServiceGalleryImage.objects.filter(service=service2).count(), 1)

    def test_existing_records_not_affected_by_new_save(self):
        """Existing hero/gallery records should survive a new save without bulk data."""
        ServiceHeroImage.objects.create(service=self.service, order=1, is_active=True)
        ServiceGalleryImage.objects.create(
            service=self.service, gallery_type='portfolio', order=1, is_visible=True
        )
        hero_count_before = ServiceHeroImage.objects.filter(service=self.service).count()
        gallery_count_before = ServiceGalleryImage.objects.filter(service=self.service).count()

        admin_instance = self._get_admin_instance()
        request = self._make_request()
        admin_instance.save_model(request, self.service, form=None, change=True)

        self.assertEqual(
            ServiceHeroImage.objects.filter(service=self.service).count(),
            hero_count_before,
        )
        self.assertEqual(
            ServiceGalleryImage.objects.filter(service=self.service).count(),
            gallery_count_before,
        )

    def test_service_admin_form_features_bound_field(self):
        """ServiceAdminForm with TagInputWidget should not raise TypeError when accessing bound field value."""
        import json
        from cms.admin import ServiceAdminForm
        data = {
            'title': self.service.title,
            'slug': self.service.slug,
            'description': 'Valid description',
            'price': '5.00',
            'order': '0',
            'features': json.dumps(['Feature A', 'Feature B']),
            'pricing_features': json.dumps(['Pricing 1']),
            'is_active': True,
        }
        form = ServiceAdminForm(data=data, instance=self.service)
        self.assertTrue(form.is_valid(), f"Form errors: {form.errors}")
        # Evaluating bound field value must not raise TypeError
        self.assertIsNotNone(form['features'].value())
        self.assertEqual(form.cleaned_data['features'], ['Feature A', 'Feature B'])
        self.assertEqual(form.cleaned_data['pricing_features'], ['Pricing 1'])

