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
    from .email_service import trigger_submission_emails
    if created:
        notification = Notification.objects.create(
            title=f"Contact Us: {instance.name}",
            message=f"Name: {instance.name} | Email: {instance.email} | Subject: {instance.subject or 'No subject'}",
            type="contact_inquiry",
            related_id=str(instance.id),
        )
        broadcast_notification(notification)
        trigger_submission_emails(instance, 'contact_inquiry')


@receiver(post_save, sender=FreeTrial)
def handle_free_trial(sender, instance, created, **kwargs):
    from .models import Notification
    from .email_service import trigger_submission_emails
    if created:
        req_type = getattr(instance, 'request_type', 'free_trial')
        if req_type == 'order_request':
            price_info = f" ({instance.package_price})" if instance.package_price else ""
            details = f"Package: {instance.product_name}{price_info} | Name: {instance.full_name} | Email: {instance.email} | WhatsApp: {instance.phone_number or 'N/A'} | Country: {instance.country or 'N/A'}"
            notification = Notification.objects.create(
                title=f"Order Request: {instance.full_name}",
                message=details,
                type="quote_request",
                related_id=str(instance.id),
            )
            broadcast_notification(notification)
            trigger_submission_emails(instance, 'order_request')
        else:
            cat_display = dict(instance.PRODUCT_CATEGORIES).get(instance.product_category, instance.product_category) if hasattr(instance, 'PRODUCT_CATEGORIES') else ''
            details = f"Name: {instance.full_name} | Email: {instance.email} | Phone: {instance.phone_number or 'N/A'} | Product: {instance.product_name}"
            if cat_display:
                details += f" ({cat_display})"
            notification = Notification.objects.create(
                title=f"Free Trial: {instance.full_name}",
                message=details,
                type="free_trial",
                related_id=str(instance.id),
            )
            broadcast_notification(notification)
            trigger_submission_emails(instance, 'free_trial')



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
