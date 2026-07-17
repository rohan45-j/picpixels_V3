import os
from django.db import models
from django.conf import settings
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from cms.image_guidelines import IMG


class MediaFile(models.Model):
    FILE_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('document', 'Document'),
        ('other', 'Other'),
    ]

    file = models.FileField(upload_to='media/%Y/%m/', help_text=IMG['media_file'])
    thumbnail = models.ImageField(upload_to='media/thumbnails/%Y/%m/', blank=True, null=True, help_text=IMG['media_thumbnail'])
    title = models.CharField(max_length=200, blank=True)
    alt_text = models.CharField(max_length=200, blank=True)
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES, blank=True)
    mime_type = models.CharField(max_length=50, blank=True)
    file_size = models.IntegerField(default=0)
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Media File'
        verbose_name_plural = 'Media Files'

    def __str__(self):
        return self.title or os.path.basename(self.file.name)

    def save(self, *args, **kwargs):
        if not self.file_type and self.file:
            ext = os.path.splitext(self.file.name)[1].lower()
            image_exts = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'}
            video_exts = {'.mp4', '.webm', '.avi', '.mov', '.mkv'}
            doc_exts = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv', '.json'}
            if ext in image_exts:
                self.file_type = 'image'
            elif ext in video_exts:
                self.file_type = 'video'
            elif ext in doc_exts:
                self.file_type = 'document'
            else:
                self.file_type = 'other'

        if self.file_type == 'image' and self.file and not self.thumbnail:
            self._generate_thumbnail()

        super().save(*args, **kwargs)

    def _generate_thumbnail(self):
        try:
            img = Image.open(self.file.path)
            img.thumbnail((300, 300))
            thumb_io = BytesIO()
            img.save(thumb_io, format=img.format or 'JPEG', quality=85)
            thumb_name = f'thumb_{os.path.basename(self.file.name)}'
            self.thumbnail.save(thumb_name, ContentFile(thumb_io.getvalue()), save=False)
        except Exception:
            pass
