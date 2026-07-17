from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from orders.models import Order
from cms.models import ContactInquiry, FreeTrial


def broadcast_notification(notification):
    from .serializers import NotificationSerializer
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "notifications",
            {
                "type": "notify",
                "message": NotificationSerializer(notification).data,
            },
        )
    except Exception:
        pass


@receiver(post_save, sender=Order)
def handle_new_order(sender, instance, created, **kwargs):
    from .models import Notification
    if created:
        notification = Notification.objects.create(
            title="New Order Received",
            message=f"New order received from {instance.profile.user.email} (ID: {instance.id})",
            type="new_order",
            related_id=str(instance.id),
        )
        broadcast_notification(notification)
    elif instance.status == 'completed':
        notification = Notification.objects.create(
            title="Order Completed",
            message=f"Order {instance.id} has been marked as completed.",
            type="new_order",
            related_id=str(instance.id),
        )
        broadcast_notification(notification)
    elif instance.status == 'cancelled':
        notification = Notification.objects.create(
            title="Order Cancelled",
            message=f"Order {instance.id} has been cancelled.",
            type="new_order",
            related_id=str(instance.id),
        )
        broadcast_notification(notification)


@receiver(post_save, sender=ContactInquiry)
def handle_contact_inquiry(sender, instance, created, **kwargs):
    from .models import Notification
    if created:
        notification = Notification.objects.create(
            title="New Contact Inquiry",
            message=f"New inquiry from {instance.name} ({instance.subject})",
            type="contact_inquiry",
            related_id=str(instance.id),
        )
        broadcast_notification(notification)


@receiver(post_save, sender=FreeTrial)
def handle_free_trial(sender, instance, created, **kwargs):
    from .models import Notification
    if created:
        notification = Notification.objects.create(
            title="New Quote Request",
            message=f"New quotation request from {instance.full_name} ({instance.email})",
            type="quote_request",
            related_id=str(instance.id),
        )
        broadcast_notification(notification)


@receiver(post_save, sender=User)
def handle_user_registration(sender, instance, created, **kwargs):
    from .models import Notification
    if created:
        notification = Notification.objects.create(
            title="New User Registration",
            message=f"New user registered: {instance.email}",
            type="user_registration",
            related_id=str(instance.id),
        )
        broadcast_notification(notification)
