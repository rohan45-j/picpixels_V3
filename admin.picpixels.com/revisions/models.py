import uuid
from django.db import models
from users.models import UserProfile
from orders.models import OrderItem

class RevisionRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='revisions')
    requested_by = models.ForeignKey(UserProfile, on_delete=models.RESTRICT, related_name='requested_revisions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    feedback_text = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Revision {self.id} for Item {self.order_item.filename} ({self.status})"

class ImageAnnotation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    revision = models.ForeignKey(RevisionRequest, on_delete=models.CASCADE, related_name='annotations')
    x_percentage = models.DecimalField(max_digits=5, decimal_places=2) # 0.00 to 100.00
    y_percentage = models.DecimalField(max_digits=5, decimal_places=2) # 0.00 to 100.00
    width_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00) # For box select
    height_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00) # For box select
    comment = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Annotation on Revision {self.revision.id} at ({self.x_percentage}%, {self.y_percentage}%)"
