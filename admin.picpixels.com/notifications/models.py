from django.db import models
from django.conf import settings


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('new_order', 'New Order'),
        ('contact_inquiry', 'Contact Inquiry'),
        ('quote_request', 'Quote Request'),
        ('support_message', 'Support Message'),
        ('payment_completed', 'Payment Completed'),
        ('payment_failed', 'Payment Failed'),
        ('refund_requested', 'Refund Requested'),
        ('user_registration', 'User Registration'),
        ('user_update', 'User Account Update'),
        ('settings_updated', 'Settings Updated'),
        ('backup_completed', 'Backup Completed'),
        ('security_alert', 'Security Alert'),
        ('system', 'System Notification'),
    ]

    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES, default='system')
    related_id = models.CharField(max_length=255, blank=True, null=True, help_text="ID of the related object (order, user, etc.)")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return f"[{self.get_type_display()}] {self.title}"
