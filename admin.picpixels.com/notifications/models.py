from django.db import models
from django.conf import settings


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('contact_inquiry', 'Contact Us Inquiry'),
        ('free_trial', 'Free Trial Request'),
        ('new_order', 'New Order'),
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

    def get_related_admin_url(self):
        if not self.related_id:
            return None
        if self.type == 'contact_inquiry':
            return f"/admin/cms/contactinquiry/{self.related_id}/change/"
        elif self.type in ('free_trial', 'quote_request'):
            return f"/admin/cms/freetrial/{self.related_id}/change/"
        elif self.type == 'new_order':
            return f"/admin/orders/order/{self.related_id}/change/"
        elif self.type == 'user_registration':
            return f"/admin/auth/user/{self.related_id}/change/"
        return None


class EmailConfiguration(models.Model):
    is_active = models.BooleanField(
        default=False,
        help_text="Enable or disable automated email sending globally."
    )
    smtp_host = models.CharField(
        max_length=255,
        default='smtp.gmail.com',
        help_text="SMTP server host (e.g. smtp.gmail.com for Google / Gmail)"
    )
    smtp_port = models.IntegerField(
        default=587,
        help_text="SMTP port (typically 587 for TLS, or 465 for SSL)"
    )
    smtp_use_tls = models.BooleanField(
        default=True,
        help_text="Use TLS connection (recommended for port 587)"
    )
    smtp_use_ssl = models.BooleanField(
        default=False,
        help_text="Use SSL connection (recommended for port 465)"
    )
    smtp_user = models.CharField(
        max_length=255,
        blank=True,
        help_text="Google/Gmail account email address (e.g. yourstudio@gmail.com)"
    )
    smtp_password = models.CharField(
        max_length=255,
        blank=True,
        help_text="Google App Password (16-letter App Password generated in Google Account > Security > 2-Step Verification > App Passwords)"
    )
    from_name = models.CharField(
        max_length=150,
        default='PicPixels',
        help_text="Sender display name (e.g. 'PicPixels Retouching Studio')"
    )
    from_email = models.EmailField(
        blank=True,
        help_text="From email address. If empty, smtp_user will be used."
    )

    # Multiple Admin Recipients
    admin_emails = models.TextField(
        blank=True,
        default='',
        help_text="Recipient email addresses for admin notification alerts. Enter multiple emails separated by commas or new lines."
    )
    notify_admins_on_order = models.BooleanField(
        default=True,
        help_text="Send email alert to all admin emails when a new Order Request is submitted."
    )
    notify_admins_on_trial = models.BooleanField(
        default=True,
        help_text="Send email alert to all admin emails when a Free Trial is requested."
    )
    notify_admins_on_contact = models.BooleanField(
        default=True,
        help_text="Send email alert to all admin emails when a Contact Us message is received."
    )

    # Client Auto-Reply Toggle
    auto_reply_to_clients = models.BooleanField(
        default=True,
        help_text="Send automated confirmation/acknowledgement email to clients upon submission."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Email & SMTP Configuration'
        verbose_name_plural = 'Email & SMTP Configuration'

    def __str__(self):
        status = "Active" if self.is_active else "Disabled"
        return f"Email Configuration ({status} - {self.smtp_host})"

    def save(self, *args, **kwargs):
        if not self.smtp_host:
            self.smtp_host = 'smtp.gmail.com'
        if not self.pk and EmailConfiguration.objects.exists():
            return
        super().save(*args, **kwargs)


    def get_admin_recipient_list(self, event_type=None):
        """
        Get all active admin recipient emails from AdminNotificationEmail
        records and legacy admin_emails textfield.
        """
        emails = set()

        # 1. Query dedicated AdminNotificationEmail model
        recipients_qs = AdminNotificationEmail.objects.filter(is_active=True)
        if event_type == 'order_request':
            recipients_qs = recipients_qs.filter(notify_on_order=True)
        elif event_type == 'free_trial':
            recipients_qs = recipients_qs.filter(notify_on_trial=True)
        elif event_type == 'contact_inquiry':
            recipients_qs = recipients_qs.filter(notify_on_contact=True)

        for r in recipients_qs:
            if r.email and '@' in r.email:
                emails.add(r.email.strip().lower())

        # 2. Parse legacy textarea admin_emails
        if self.admin_emails:
            raw_list = self.admin_emails.replace('\r\n', '\n').replace(',', '\n').split('\n')
            for e in raw_list:
                clean = e.strip().lower()
                if clean and '@' in clean:
                    emails.add(clean)

        return list(emails)


class AdminNotificationEmail(models.Model):
    email_config = models.ForeignKey(
        EmailConfiguration,
        on_delete=models.CASCADE,
        related_name='recipient_emails',
        null=True, blank=True,
        help_text="Associated Email Configuration"
    )
    email = models.EmailField(
        help_text="Admin recipient email address"
    )
    name = models.CharField(
        max_length=150,
        blank=True,
        default='',
        help_text="Name or role of this admin (e.g. 'Rohan - Founder', 'Support Lead')"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Enable or pause sending notification emails to this address"
    )
    notify_on_order = models.BooleanField(
        default=True,
        help_text="Receive alerts when a client submits an Order Request"
    )
    notify_on_trial = models.BooleanField(
        default=True,
        help_text="Receive alerts when a client requests a Free Trial"
    )
    notify_on_contact = models.BooleanField(
        default=True,
        help_text="Receive alerts when a client submits a Contact Us message"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Admin Notification Email'
        verbose_name_plural = 'Admin Notification Emails'
        ordering = ['-created_at']

    def __str__(self):
        if self.name:
            return f"{self.name} <{self.email}>"
        return self.email


class EmailTemplate(models.Model):

    TEMPLATE_TYPES = [
        ('client_order_request', 'Client Auto-Reply: Order Request Confirmation'),
        ('client_free_trial', 'Client Auto-Reply: Free Trial Confirmation'),
        ('client_contact_inquiry', 'Client Auto-Reply: Contact Us Confirmation'),
        ('admin_order_alert', 'Admin Alert: New Order Request Received'),
        ('admin_trial_alert', 'Admin Alert: New Free Trial Received'),
        ('admin_contact_alert', 'Admin Alert: New Contact Us Message'),
    ]

    template_type = models.CharField(
        max_length=40,
        choices=TEMPLATE_TYPES,
        unique=True,
        help_text="Type of email notification"
    )
    subject = models.CharField(
        max_length=255,
        help_text="Email subject line. Supports variables like {client_name}, {service_name}, {site_name}, {order_id}"
    )
    body_html = models.TextField(
        help_text="HTML email content. Supports dynamic variables: {client_name}, {client_email}, {client_phone}, {service_name}, {package_price}, {country}, {company_name}, {order_id}, {requirements}, {drive_link}, {site_name}, {support_email}, {admin_link}"
    )
    body_text = models.TextField(
        blank=True,
        help_text="Plain text fallback for email clients that do not support HTML"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this email template is active"
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Email Template'
        verbose_name_plural = 'Email Templates'
        ordering = ['template_type']

    def __str__(self):
        return f"{self.get_template_type_display()} ({'Active' if self.is_active else 'Inactive'})"

