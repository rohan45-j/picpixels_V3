import logging
import threading
from django.core.mail import get_connection, EmailMultiAlternatives
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


DEFAULT_TEMPLATES = {
    'client_order_request': {
        'subject': "Order Request Received: We're Reviewing Your Project! - {site_name}",
        'body_html': """
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Order Request Received!</h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Thank you for choosing {site_name}</p>
    </div>
    <div style="padding: 28px 24px;">
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Hello <strong>{client_name}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        We have successfully received your order request for <strong>{service_name}</strong>. Our retouching specialists are now reviewing your project requirements and submitted files.
      </p>

      <div style="background: #f1f5f9; border-radius: 8px; padding: 18px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Order Summary</h3>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Order Ref:</td>
            <td style="padding: 4px 0; font-weight: 600; text-align: right;">#{order_id}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Service:</td>
            <td style="padding: 4px 0; font-weight: 600; text-align: right;">{service_name}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Price:</td>
            <td style="padding: 4px 0; font-weight: 700; color: #059669; text-align: right;">{package_price}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Country:</td>
            <td style="padding: 4px 0; font-weight: 600; text-align: right;">{country}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        <strong>What happens next?</strong><br>
        Our team will inspect your images and instructions. We will get back to you via email or WhatsApp shortly with an update.
      </p>

      <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        <p style="margin: 0;">Have urgent questions? Reply to this email or contact us at <a href="mailto:{support_email}" style="color: #059669; text-decoration: none;">{support_email}</a>.</p>
        <p style="margin: 6px 0 0 0;">© {site_name}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
""",
        'body_text': "Hello {client_name},\n\nWe have received your order request for {service_name} (#{order_id}). Our team is reviewing your files and requirements.\n\nPrice: {package_price}\nCountry: {country}\n\nWe will get back to you shortly.\n\nBest regards,\n{site_name}\n{support_email}",
    },

    'client_free_trial': {
        'subject': "Free Trial Request Received - {site_name}",
        'body_html': """
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Free Trial Request Received! 🚀</h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Thank you for trying {site_name}</p>
    </div>
    <div style="padding: 28px 24px;">
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Hello <strong>{client_name}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Thank you for requesting a free trial for <strong>{service_name}</strong>! We are excited to show you the quality and speed of our retouching services.
      </p>

      <div style="background: #f8fafc; border-radius: 8px; padding: 18px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <h3 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Request Details</h3>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Service:</strong> {service_name}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Trial ID:</strong> #{order_id}</p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Our production artists are processing your test images. You will receive the finished retouched files directly to this email address within our standard turnaround time.
      </p>

      <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        <p style="margin: 0;">Questions? Reach out to our team at <a href="mailto:{support_email}" style="color: #6366f1; text-decoration: none;">{support_email}</a>.</p>
        <p style="margin: 6px 0 0 0;">© {site_name}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
""",
        'body_text': "Hello {client_name},\n\nThank you for requesting a free trial for {service_name} (#{order_id}) at {site_name}.\n\nOur team is working on your sample images. We will send the completed files to this email address soon.\n\nBest regards,\n{site_name}\n{support_email}",
    },

    'client_contact_inquiry': {
        'subject': "Thank You For Contacting Us - {site_name}",
        'body_html': """
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Message Received! ✉️</h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">We'll get back to you shortly</p>
    </div>
    <div style="padding: 28px 24px;">
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Hello <strong>{client_name}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Thank you for getting in touch with <strong>{site_name}</strong>. We have received your inquiry regarding <em>"{service_name}"</em>.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        A representative from our team will review your message and respond to you as soon as possible.
      </p>

      <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        <p style="margin: 0;">Need immediate assistance? Email us at <a href="mailto:{support_email}" style="color: #ea580c; text-decoration: none;">{support_email}</a>.</p>
        <p style="margin: 6px 0 0 0;">© {site_name}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
""",
        'body_text': "Hello {client_name},\n\nThank you for reaching out to {site_name}. We have received your inquiry regarding '{service_name}'.\n\nA team member will review your message and reply soon.\n\nBest regards,\n{site_name}\n{support_email}",
    },

    'admin_order_alert': {
        'subject': "🚨 New Order Request: {client_name} - {service_name} ({package_price})",
        'body_html': """
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06);">
    <div style="background: #059669; padding: 20px 24px; color: #ffffff;">
      <h2 style="margin: 0; font-size: 18px; font-weight: 700;">🛒 New Order Request Received</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Submission #{order_id}</p>
    </div>
    <div style="padding: 24px;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; color: #64748b; width: 140px;">Client Name:</td>
          <td style="padding: 8px 0; font-weight: 600;">{client_name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; color: #64748b;">Client Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:{client_email}" style="color: #2563eb; font-weight: 600;">{client_email}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; color: #64748b;">Phone / WhatsApp:</td>
          <td style="padding: 8px 0; font-weight: 600;">{client_phone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; color: #64748b;">Country / Company:</td>
          <td style="padding: 8px 0;">{country} {company_name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; color: #64748b;">Service / Package:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #0284c7;">{service_name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; color: #64748b;">Agreed Price:</td>
          <td style="padding: 8px 0; font-weight: 800; color: #059669; font-size: 16px;">{package_price}</td>
        </tr>
      </table>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <strong style="font-size: 12px; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 6px;">Client Instructions:</strong>
        <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #334155; white-space: pre-wrap;">{requirements}</p>
      </div>

      <div style="text-align: center; margin: 24px 0 10px 0;">
        <a href="{admin_link}" style="background: #059669; color: #ffffff; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 700; text-decoration: none; display: inline-block;">
          Open Order in Admin Panel ↗
        </a>
      </div>
    </div>
  </div>
</body>
</html>
""",
        'body_text': "New Order Request Received:\n\nClient: {client_name} ({client_email})\nPhone: {client_phone}\nCountry: {country}\nPackage: {service_name}\nPrice: {package_price}\n\nInstructions: {requirements}\n\nView in Admin: {admin_link}",
    },

    'admin_trial_alert': {
        'subject': "🚀 New Free Trial Request: {client_name} - {service_name}",
        'body_html': """
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06);">
    <div style="background: #6366f1; padding: 20px 24px; color: #ffffff;">
      <h2 style="margin: 0; font-size: 18px; font-weight: 700;">🚀 New Free Trial Request</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Trial #{order_id}</p>
    </div>
    <div style="padding: 24px;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; color: #64748b; width: 140px;">Client Name:</td>
          <td style="padding: 8px 0; font-weight: 600;">{client_name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; color: #64748b;">Client Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:{client_email}" style="color: #2563eb; font-weight: 600;">{client_email}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; color: #64748b;">Phone / WhatsApp:</td>
          <td style="padding: 8px 0; font-weight: 600;">{client_phone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; color: #64748b;">Product / Service:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #6366f1;">{service_name}</td>
        </tr>
      </table>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <strong style="font-size: 12px; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 6px;">Client Instructions:</strong>
        <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #334155; white-space: pre-wrap;">{requirements}</p>
      </div>

      <div style="text-align: center; margin: 24px 0 10px 0;">
        <a href="{admin_link}" style="background: #6366f1; color: #ffffff; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 700; text-decoration: none; display: inline-block;">
          Open Free Trial in Admin Panel ↗
        </a>
      </div>
    </div>
  </div>
</body>
</html>
""",
        'body_text': "New Free Trial Request Received:\n\nClient: {client_name} ({client_email})\nPhone: {client_phone}\nProduct: {service_name}\n\nInstructions: {requirements}\n\nView in Admin: {admin_link}",
    },

    'admin_contact_alert': {
        'subject': "✉️ New Contact Us Message: {client_name} - {service_name}",
        'body_html': """
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06);">
    <div style="background: #ea580c; padding: 20px 24px; color: #ffffff;">
      <h2 style="margin: 0; font-size: 18px; font-weight: 700;">✉️ New Contact Us Message</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Inquiry #{order_id}</p>
    </div>
    <div style="padding: 24px;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; color: #64748b; width: 140px;">Sender:</td>
          <td style="padding: 8px 0; font-weight: 600;">{client_name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; color: #64748b;">Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:{client_email}" style="color: #2563eb; font-weight: 600;">{client_email}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; color: #64748b;">Subject:</td>
          <td style="padding: 8px 0; font-weight: 600;">{service_name}</td>
        </tr>
      </table>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <strong style="font-size: 12px; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 6px;">Message:</strong>
        <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #334155; white-space: pre-wrap;">{requirements}</p>
      </div>

      <div style="text-align: center; margin: 24px 0 10px 0;">
        <a href="{admin_link}" style="background: #ea580c; color: #ffffff; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 700; text-decoration: none; display: inline-block;">
          Open Inquiry in Admin Panel ↗
        </a>
      </div>
    </div>
  </div>
</body>
</html>
""",
        'body_text': "New Contact Us Message:\n\nSender: {client_name} ({client_email})\nSubject: {service_name}\n\nMessage: {requirements}\n\nView in Admin: {admin_link}",
    },
}


def get_email_connection():
    """
    Get configured SMTP connection and configuration object.
    Returns (connection, config) or (None, None).
    """
    from .models import EmailConfiguration
    config = EmailConfiguration.objects.filter(is_active=True).first()
    if not config or not config.smtp_user or not config.smtp_password:
        return None, None

    try:
        connection = get_connection(
            backend='django.core.mail.backends.smtp.EmailBackend',
            host=config.smtp_host,
            port=config.smtp_port,
            username=config.smtp_user,
            password=config.smtp_password,
            use_tls=config.smtp_use_tls,
            use_ssl=config.smtp_use_ssl,
            timeout=15,
            fail_silently=False,
        )
        return connection, config
    except Exception as exc:
        logger.error(f"[EmailService] Failed to initialize SMTP connection: {exc}")
        return None, None


def send_test_email(recipient_email):
    """
    Send a test email using active configuration to verify SMTP credentials.
    Returns (success: bool, message: str)
    """
    connection, config = get_email_connection()
    if not config:
        return False, "Email Configuration is inactive or missing SMTP User / App Password credentials."

    from_addr = f"{config.from_name} <{config.from_email or config.smtp_user}>"
    subject = f"✅ Test Email from {config.from_name} SMTP"
    body_html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #059669;">PicPixels SMTP Connected Successfully!</h2>
      <p>This is a test email confirming that your Google / SMTP credentials are configured correctly in the PicPixels Admin Panel.</p>
      <ul>
        <li><strong>SMTP Host:</strong> {config.smtp_host}:{config.smtp_port}</li>
        <li><strong>Sender:</strong> {from_addr}</li>
        <li><strong>Recipient:</strong> {recipient_email}</li>
      </ul>
      <p style="color: #64748b; font-size: 12px;">PicPixels Automated Email Verification</p>
    </div>
    """
    body_text = f"PicPixels SMTP Connected Successfully!\n\nThis is a test email sent to {recipient_email}.\nHost: {config.smtp_host}:{config.smtp_port}"

    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=body_text,
            from_email=from_addr,
            to=[recipient_email],
            connection=connection,
        )
        msg.attach_alternative(body_html, "text/html")
        msg.send(fail_silently=False)
        return True, f"Test email sent successfully to {recipient_email}!"
    except Exception as exc:
        logger.error(f"[EmailService] Test email failed: {exc}", exc_info=True)
        return False, f"SMTP Error: {str(exc)}"


def render_template(template_type, context):
    """
    Render subject and body for a given template type using database template or default fallback.
    """
    from .models import EmailTemplate

    db_template = EmailTemplate.objects.filter(template_type=template_type).first()
    if db_template:
        if not db_template.is_active:
            return None, None, None
        subject = db_template.subject
        body_html = db_template.body_html
        body_text = db_template.body_text or strip_tags(body_html)
    else:
        fallback = DEFAULT_TEMPLATES.get(template_type)
        if not fallback:
            return None, None, None
        subject = fallback['subject']
        body_html = fallback['body_html']
        body_text = fallback['body_text']

    # Interpolate dynamic tags
    for key, val in context.items():
        placeholder = f"{{{key}}}"
        str_val = str(val or '')
        subject = subject.replace(placeholder, str_val)
        body_html = body_html.replace(placeholder, str_val)
        body_text = body_text.replace(placeholder, str_val)

    return subject, body_html, body_text


def _dispatch_emails_worker(event_type, context, client_email=None):
    """
    Worker function executed in a background daemon thread.
    """
    connection, config = get_email_connection()
    if not config or not connection:
        log_msg = f"[EmailService] Email sending skipped for '{event_type}' - Smtp user or Smtp password is not configured in Email Settings."
        logger.info(log_msg)
        print(log_msg)
        return

    from_addr = f"{config.from_name} <{config.from_email or config.smtp_user}>"

    # 1. Send Client Auto-Reply
    if config.auto_reply_to_clients and client_email:
        client_tpl_type = f"client_{event_type}"
        subject, body_html, body_text = render_template(client_tpl_type, context)
        if subject and body_html:
            try:
                msg = EmailMultiAlternatives(
                    subject=subject,
                    body=body_text,
                    from_email=from_addr,
                    to=[client_email],
                    connection=connection,
                )
                msg.attach_alternative(body_html, "text/html")
                msg.send(fail_silently=False)
                logger.info(f"[EmailService] Client auto-reply sent to {client_email} for {event_type}")
                print(f"[EmailService] Client auto-reply successfully sent to {client_email}")
            except Exception as exc:
                logger.error(f"[EmailService] Failed to send client auto-reply to {client_email}: {exc}")
                print(f"[EmailService] ERROR sending client auto-reply to {client_email}: {exc}")

    # 2. Send Admin Alert
    admin_recipients = config.get_admin_recipient_list()
    should_alert_admin = (
        (event_type == 'order_request' and config.notify_admins_on_order) or
        (event_type == 'free_trial' and config.notify_admins_on_trial) or
        (event_type == 'contact_inquiry' and config.notify_admins_on_contact)
    )

    if should_alert_admin and admin_recipients:
        if event_type == 'order_request':
            admin_tpl_type = 'admin_order_alert'
        elif event_type == 'free_trial':
            admin_tpl_type = 'admin_trial_alert'
        elif event_type == 'contact_inquiry':
            admin_tpl_type = 'admin_contact_alert'

        subject, body_html, body_text = render_template(admin_tpl_type, context)
        if subject and body_html:
            try:
                msg = EmailMultiAlternatives(
                    subject=subject,
                    body=body_text,
                    from_email=from_addr,
                    to=admin_recipients,
                    connection=connection,
                )
                msg.attach_alternative(body_html, "text/html")
                msg.send(fail_silently=False)
                logger.info(f"[EmailService] Admin alert sent to {len(admin_recipients)} admin(s) for {event_type}")
                print(f"[EmailService] Admin alert successfully sent to {admin_recipients}")
            except Exception as exc:
                logger.error(f"[EmailService] Failed to send admin alert to {admin_recipients}: {exc}")
                print(f"[EmailService] ERROR sending admin alert to {admin_recipients}: {exc}")



def trigger_submission_emails(instance, submission_type):
    """
    Entry point to trigger emails asynchronously in a background thread.
    Never blocks or crashes the calling request.
    """
    try:
        from site_settings.models import SiteSetting
        site = SiteSetting.objects.first()
        site_name = site.site_name if site else "PicPixels"
        support_email = site.support_email if site and site.support_email else "support@picpixels.com"
    except Exception:
        site_name = "PicPixels"
        support_email = "support@picpixels.com"

    context = {
        'site_name': site_name,
        'support_email': support_email,
    }
    client_email = None

    if submission_type in ('order_request', 'free_trial'):
        client_email = getattr(instance, 'email', None)
        context.update({
            'client_name': getattr(instance, 'full_name', 'Valued Client'),
            'client_email': client_email or '',
            'client_phone': getattr(instance, 'phone_number', '') or 'Not provided',
            'service_name': getattr(instance, 'product_name', 'Photo Retouching Service'),
            'package_price': getattr(instance, 'package_price', '') or 'Standard Pricing',
            'country': getattr(instance, 'country', '') or 'N/A',
            'company_name': getattr(instance, 'company_name', '') or '',
            'order_id': str(getattr(instance, 'id', '')),
            'requirements': getattr(instance, 'project_requirements', '') or 'None provided',
            'drive_link': getattr(instance, 'drive_link', '') or '',
            'admin_link': f"http://127.0.0.1:8000/admin/cms/freetrial/{instance.id}/change/",
        })
    elif submission_type == 'contact_inquiry':
        client_email = getattr(instance, 'email', None)
        context.update({
            'client_name': getattr(instance, 'name', 'Valued Client'),
            'client_email': client_email or '',
            'service_name': getattr(instance, 'subject', 'General Inquiry') or 'General Inquiry',
            'requirements': getattr(instance, 'message', '') or '',
            'order_id': str(getattr(instance, 'id', '')),
            'admin_link': f"http://127.0.0.1:8000/admin/cms/contactinquiry/{instance.id}/change/",
        })

    # Launch in a daemon thread
    thread = threading.Thread(
        target=_dispatch_emails_worker,
        args=(submission_type, context, client_email),
        daemon=True
    )
    thread.start()
