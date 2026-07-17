import uuid
from django.db import models
from users.models import UserProfile

class WorkflowTemplate(models.Model):
    FORMAT_CHOICES = [
        ('jpg', 'JPEG'),
        ('png', 'PNG'),
        ('tiff', 'TIFF'),
        ('psd', 'PSD'),
    ]
    BACKGROUND_CHOICES = [
        ('transparent', 'Transparent'),
        ('white', 'White'),
        ('custom_hex', 'Custom Hex Color'),
    ]
    SHADOW_CHOICES = [
        ('none', 'No Shadow'),
        ('drop_shadow', 'Drop Shadow'),
        ('reflection', 'Reflection Shadow'),
        ('natural', 'Natural Shadow'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='workflows')
    name = models.CharField(max_length=100)
    file_format = models.CharField(max_length=20, choices=FORMAT_CHOICES, default='png')
    background_type = models.CharField(max_length=30, choices=BACKGROUND_CHOICES, default='transparent')
    background_color_hex = models.CharField(max_length=7, blank=True, null=True) # e.g. '#FFFFFF'
    margin_percentage = models.IntegerField(default=10)
    crop_width = models.IntegerField(blank=True, null=True)
    crop_height = models.IntegerField(blank=True, null=True)
    shadow_type = models.CharField(max_length=30, choices=SHADOW_CHOICES, default='none')
    dpi = models.IntegerField(default=72)
    color_profile = models.CharField(max_length=30, default='sRGB')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.profile.user.email} - {self.name}"
