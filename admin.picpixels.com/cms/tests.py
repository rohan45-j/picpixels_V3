from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from users.models import UserProfile
from .models import Page, BlogPost, ContactInquiry
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
