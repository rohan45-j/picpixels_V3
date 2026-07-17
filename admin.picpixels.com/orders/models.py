import uuid
from django.db import models
from users.models import UserProfile
from workflows.models import WorkflowTemplate

class Order(models.Model):
    ORDER_TYPE_CHOICES = [
        ('image_editing', 'Image Editing'),
        ('cgi_3d', 'CGI & 3D Modeling'),
        ('ai_models', 'AI Fashion Models'),
        ('video_editing', 'Video Editing'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Approval / Payment'),
        ('in_progress', 'In Progress'),
        ('review', 'In Review by Client'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(UserProfile, on_delete=models.RESTRICT, related_name='orders')
    workflow_template = models.ForeignKey(WorkflowTemplate, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    order_type = models.CharField(max_length=30, choices=ORDER_TYPE_CHOICES, default='image_editing')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')
    turnaround_speed_hours = models.IntegerField(default=48) # 3, 24, 48
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_images = models.IntegerField(default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    special_instructions = models.TextField(blank=True, null=True)
    tracking_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - {self.profile.user.email} ({self.status})"

class OrderItem(models.Model):
    STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('retouching', 'Retouching'),
        ('quality_check', 'Quality Check'),
        ('review_pending', 'Review Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected / Needs Revision'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    filename = models.CharField(max_length=255)
    original_url = models.TextField()
    edited_url = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='uploaded')
    file_size = models.IntegerField() # in bytes
    width = models.IntegerField(blank=True, null=True)
    height = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.filename} - Order {self.order.id} ({self.status})"
