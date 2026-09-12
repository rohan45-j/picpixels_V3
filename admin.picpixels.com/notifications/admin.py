from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html, mark_safe
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display, action
import os
import urllib.parse
from .models import Notification


def get_related_submission(notification):
    if not notification.related_id:
        return None
    try:
        from cms.models import FreeTrial, ContactInquiry
        if notification.type in ('free_trial', 'quote_request'):
            return ('free_trial', FreeTrial.objects.prefetch_related('attachments').filter(id=notification.related_id).first())
        elif notification.type == 'contact_inquiry':
            return ('contact_inquiry', ContactInquiry.objects.filter(id=notification.related_id).first())
    except Exception:
        return None
    return None


class ModuleListFilter(admin.SimpleListFilter):
    title = _('Source / Module')
    parameter_name = 'module'

    MODULE_MAP = {
        'leads':    ['contact_inquiry', 'free_trial', 'quote_request'],
        'commerce': ['new_order', 'payment_completed', 'payment_failed', 'refund_requested'],
        'users':    ['user_registration', 'user_update'],
        'system':   ['settings_updated', 'backup_completed', 'security_alert', 'system'],
    }

    def lookups(self, request, model_admin):
        return [
            ('leads', _('Leads & Forms (Contact, Free Trial)')),
            ('commerce', _('Commerce & Orders')),
            ('users', _('Users & Accounts')),
            ('system', _('System & Alerts')),
        ]

    def queryset(self, request, queryset):
        value = self.value()
        if value in self.MODULE_MAP:
            return queryset.filter(type__in=self.MODULE_MAP[value])
        return queryset


@admin.register(Notification)
class NotificationAdmin(ModelAdmin):
    list_display = ['source_badge', 'title_display', 'files_indicator', 'message_preview', 'action_button', 'is_read', 'created_at']
    list_filter = [ModuleListFilter, 'type', 'is_read', 'created_at']
    list_editable = ['is_read']
    search_fields = ['title', 'message', 'related_id']
    date_hierarchy = 'created_at'
    actions = ['mark_as_read', 'mark_as_unread']
    readonly_fields = ('created_at', 'submitted_files_preview', 'related_submission_details')

    fieldsets = (
        ('📁 Attached Client Files & Media Assets (Images, ZIP, Drive)', {
            'fields': ('submitted_files_preview',),
            'description': 'View submitted images, download ZIP/other files, or open cloud drive folders provided by the client.',
        }),
        ('📋 Client & Order Information', {
            'fields': ('related_submission_details',),
            'description': 'Client contact information, WhatsApp chat, package price, and project requirements.',
        }),
        ('🔔 Notification Details', {
            'fields': ('title', 'type', 'is_read', 'message', 'related_id', 'created_at'),
        }),
    )

    @display(description=_('Source'))
    def source_badge(self, obj):
        badge_configs = {
            'free_trial': ('Free Trial', '#6366f1', 'rocket_launch'),
            'contact_inquiry': ('Contact Us', '#ea580c', 'mail'),
            'new_order': ('New Order', '#059669', 'shopping_cart'),
            'quote_request': ('Order Request', '#059669', 'shopping_bag'),
            'user_registration': ('New User', '#0284c7', 'person_add'),
            'support_message': ('Support', '#7c3aed', 'support_agent'),
            'payment_completed': ('Payment', '#059669', 'payments'),
            'payment_failed': ('Failed Pay', '#dc2626', 'error'),
            'system': ('System', '#6b7280', 'notifications'),
        }
        label, color, icon = badge_configs.get(obj.type, (obj.get_type_display(), '#6b7280', 'notifications'))
        return format_html(
            '<span style="background:{0}18;color:{0};border:1px solid {0}38;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;">'
            '<span class="material-symbols-outlined" style="font-size:13px;line-height:1;">{1}</span>{2}'
            '</span>',
            color, icon, label
        )

    @display(description=_('Title & Sender'))
    def title_display(self, obj):
        return format_html(
            '<div style="font-weight:600;font-size:13px;">{}</div>',
            obj.title
        )

    @display(description=_('Files'))
    def files_indicator(self, obj):
        rel = get_related_submission(obj)
        if not rel:
            return format_html('<span style="color:#94a3b8;font-size:11px;">—</span>')
        rel_type, instance = rel
        if not instance or rel_type != 'free_trial':
            return format_html('<span style="color:#94a3b8;font-size:11px;">—</span>')
        count = instance.attachments.count()
        has_drive = bool(instance.drive_link)
        badges = []
        if count > 0:
            badges.append(f'<span style="background:#0284c718;color:#0284c7;border:1px solid #0284c738;padding:2px 7px;border-radius:9999px;font-size:11px;font-weight:700;white-space:nowrap;">📎 {count} file{"s" if count > 1 else ""}</span>')
        if has_drive:
            badges.append('<span style="background:#8b5cf618;color:#7c3aed;border:1px solid #8b5cf638;padding:2px 7px;border-radius:9999px;font-size:11px;font-weight:700;white-space:nowrap;">☁️ Drive</span>')
        if not badges:
            return format_html('<span style="color:#94a3b8;font-size:11px;">None</span>')
        return format_html('<div style="display:flex;gap:4px;flex-wrap:wrap;">{}</div>', mark_safe(''.join(badges)))

    @display(description=_('Details / Message'))
    def message_preview(self, obj):
        msg = obj.message or ''
        preview = msg if len(msg) <= 100 else msg[:97] + '...'
        return format_html(
            '<span style="color:#64748b;font-size:12px;" title="{}">{}</span>',
            msg, preview
        )

    @display(description=_('Action'))
    def action_button(self, obj):
        url = obj.get_related_admin_url()
        if not url:
            return format_html('<span style="color:#94a3b8;font-size:11px;">—</span>')

        btn_labels = {
            'contact_inquiry': ('View Inquiry', '#ea580c'),
            'free_trial': ('View Free Trial', '#6366f1'),
            'quote_request': ('View Order Request', '#059669'),
            'new_order': ('View Order', '#059669'),
            'user_registration': ('View User', '#0284c7'),
        }
        text, color = btn_labels.get(obj.type, ('View Details', '#2563eb'))

        return format_html(
            '<a href="{}" style="background:{};color:#ffffff;padding:4px 11px;border-radius:6px;font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px;text-decoration:none;white-space:nowrap;">'
            '{} <span style="font-size:12px;">↗</span></a>',
            url, color, text
        )

    @display(description=_('Submitted Files & Media Assets'))
    def submitted_files_preview(self, obj):
        rel = get_related_submission(obj)
        if not rel:
            return format_html(
                '<div style="padding:12px;background:rgba(148,163,184,0.1);border-radius:8px;color:#64748b;font-size:13px;">'
                'No related order or trial record linked to this notification (ID: {}).'
                '</div>',
                obj.related_id or 'None'
            )

        rel_type, instance = rel
        if not instance:
            return format_html(
                '<div style="padding:12px;background:rgba(239,68,68,0.1);border-radius:8px;color:#dc2626;font-size:13px;">'
                'Related record #{} could not be found.'
                '</div>',
                obj.related_id
            )

        if rel_type == 'contact_inquiry':
            return format_html(
                '<div style="padding:12px;background:rgba(148,163,184,0.1);border-radius:8px;color:#64748b;font-size:13px;">'
                'Contact inquiries do not have direct file uploads.'
                '</div>'
            )

        # FreeTrial / Order Request
        html_blocks = []

        # 1. Drive Link (if present)
        if instance.drive_link:
            html_blocks.append(format_html(
                '<div style="margin-bottom:16px;padding:12px 16px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.3);border-radius:8px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">'
                '  <div style="display:flex;align-items:center;gap:10px;">'
                '    <span style="font-size:24px;">☁️</span>'
                '    <div>'
                '      <strong style="font-size:13px;display:block;">Google Drive / Cloud Folder Link:</strong>'
                '      <span style="font-size:12px;color:#2563eb;word-break:break-all;">{}</span>'
                '    </div>'
                '  </div>'
                '  <a href="{}" target="_blank" rel="noopener noreferrer" style="background:#2563eb;color:#ffffff;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:6px;">'
                '    Open Cloud Folder ↗'
                '  </a>'
                '</div>',
                instance.drive_link,
                instance.drive_link
            ))

        attachments = list(instance.attachments.all())
        if attachments:
            cards = []
            image_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg', '.tif', '.tiff')
            archive_extensions = ('.zip', '.rar', '.7z', '.tar', '.gz')

            for att in attachments:
                if not att.file:
                    continue
                file_url = att.file.url
                filename = att.original_filename or os.path.basename(att.file.name)
                ext = os.path.splitext(filename)[1].lower()

                # Calculate formatted size
                file_size_str = ""
                try:
                    if hasattr(att.file, 'size') and att.file.size:
                        size_bytes = att.file.size
                        for unit in ['B', 'KB', 'MB', 'GB']:
                            if abs(size_bytes) < 1024.0:
                                file_size_str = f"{size_bytes:3.1f} {unit}"
                                break
                            size_bytes /= 1024.0
                except Exception:
                    file_size_str = ""

                if ext in image_extensions:
                    cards.append(format_html(
                        '<div style="background:rgba(248,250,252,0.9);border:1px solid rgba(203,213,225,0.8);border-radius:10px;padding:12px;width:240px;display:flex;flex-direction:column;gap:8px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">'
                        '  <div style="width:100%;height:140px;border-radius:6px;overflow:hidden;background:rgba(0,0,0,0.04);display:flex;align-items:center;justify-content:center;border:1px solid rgba(226,232,240,0.8);">'
                        '    <a href="{0}" target="_blank" title="View Full Image">'
                        '      <img src="{0}" alt="{1}" style="width:100%;height:140px;object-fit:cover;display:block;" />'
                        '    </a>'
                        '  </div>'
                        '  <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="{1}">{1}</div>'
                        '  <div style="font-size:11px;color:#64748b;">Size: {2}</div>'
                        '  <div style="display:flex;gap:6px;margin-top:auto;">'
                        '    <a href="{0}" target="_blank" style="flex:1;text-align:center;background:#0284c7;color:#fff;padding:5px 8px;border-radius:5px;font-size:11px;font-weight:600;text-decoration:none;">View ↗</a>'
                        '    <a href="{0}" download="{1}" style="flex:1;text-align:center;background:#059669;color:#fff;padding:5px 8px;border-radius:5px;font-size:11px;font-weight:600;text-decoration:none;">Download ⬇</a>'
                        '  </div>'
                        '</div>',
                        file_url, filename, file_size_str or "Unknown"
                    ))
                elif ext in archive_extensions:
                    cards.append(format_html(
                        '<div style="background:rgba(248,250,252,0.9);border:1px solid rgba(203,213,225,0.8);border-radius:10px;padding:14px;width:240px;display:flex;flex-direction:column;gap:10px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">'
                        '  <div style="display:flex;align-items:center;gap:10px;">'
                        '    <span style="font-size:32px;">🗜️</span>'
                        '    <div style="overflow:hidden;">'
                        '      <span style="background:#0284c720;color:#0284c7;font-weight:700;font-size:10px;padding:2px 6px;border-radius:4px;text-transform:uppercase;">{3} Archive</span>'
                        '      <div style="font-size:12px;font-weight:600;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="{1}">{1}</div>'
                        '      <div style="font-size:11px;color:#64748b;">Size: {2}</div>'
                        '    </div>'
                        '  </div>'
                        '  <a href="{0}" download="{1}" style="text-align:center;background:#059669;color:#fff;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;display:block;margin-top:auto;">Download Archive ⬇</a>'
                        '</div>',
                        file_url, filename, file_size_str or "Unknown", ext.replace('.', '')
                    ))
                else:
                    cards.append(format_html(
                        '<div style="background:rgba(248,250,252,0.9);border:1px solid rgba(203,213,225,0.8);border-radius:10px;padding:14px;width:240px;display:flex;flex-direction:column;gap:10px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">'
                        '  <div style="display:flex;align-items:center;gap:10px;">'
                        '    <span style="font-size:30px;">📄</span>'
                        '    <div style="overflow:hidden;">'
                        '      <span style="background:#7c3aed20;color:#7c3aed;font-weight:700;font-size:10px;padding:2px 6px;border-radius:4px;text-transform:uppercase;">{3}</span>'
                        '      <div style="font-size:12px;font-weight:600;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="{1}">{1}</div>'
                        '      <div style="font-size:11px;color:#64748b;">Size: {2}</div>'
                        '    </div>'
                        '  </div>'
                        '  <div style="display:flex;gap:6px;margin-top:auto;">'
                        '    <a href="{0}" target="_blank" style="flex:1;text-align:center;background:#0284c7;color:#fff;padding:5px 8px;border-radius:5px;font-size:11px;font-weight:600;text-decoration:none;">View ↗</a>'
                        '    <a href="{0}" download="{1}" style="flex:1;text-align:center;background:#059669;color:#fff;padding:5px 8px;border-radius:5px;font-size:11px;font-weight:600;text-decoration:none;">Download ⬇</a>'
                        '  </div>'
                        '</div>',
                        file_url, filename, file_size_str or "Unknown", ext.replace('.', '') or 'File'
                    ))

            html_blocks.append(format_html(
                '<div>'
                '  <div style="font-size:12px;font-weight:700;color:#475569;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">Attached Files ({0})</div>'
                '  <div style="display:flex;flex-wrap:wrap;gap:12px;">{1}</div>'
                '</div>',
                len(attachments),
                mark_safe("".join(cards))
            ))

        if not instance.drive_link and not attachments:
            html_blocks.append(format_html(
                '<div style="padding:14px;background:rgba(148,163,184,0.08);border:1px dashed rgba(148,163,184,0.4);border-radius:8px;color:#64748b;font-size:13px;text-align:center;">'
                'No client files or drive links were submitted with this order.'
                '</div>'
            ))

        return mark_safe("".join(html_blocks))

    @display(description=_('Client & Order Details'))
    def related_submission_details(self, obj):
        rel = get_related_submission(obj)
        if not rel:
            return format_html('<span style="color:#94a3b8;">No related details available.</span>')

        rel_type, instance = rel
        if not instance:
            return format_html('<span style="color:#dc2626;">Related record not found.</span>')

        if rel_type == 'contact_inquiry':
            return format_html(
                '<div style="background:rgba(248,250,252,0.9);border:1px solid rgba(203,213,225,0.7);border-radius:10px;padding:16px;">'
                '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid rgba(226,232,240,0.8);padding-bottom:10px;">'
                '    <strong style="font-size:15px;color:#ea580c;">Contact Us Inquiry #{0}</strong>'
                '    <a href="/admin/cms/contactinquiry/{0}/change/" style="background:#ea580c;color:#fff;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;">Open Inquiry ↗</a>'
                '  </div>'
                '  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px;font-size:13px;margin-bottom:14px;">'
                '    <div><span style="color:#64748b;">Sender Name:</span> <strong>{1}</strong></div>'
                '    <div><span style="color:#64748b;">Email:</span> <a href="mailto:{2}" style="color:#2563eb;font-weight:600;">{2}</a></div>'
                '    <div><span style="color:#64748b;">Subject:</span> <strong>{3}</strong></div>'
                '  </div>'
                '  <div style="background:rgba(0,0,0,0.03);padding:12px;border-radius:6px;border:1px solid rgba(226,232,240,0.8);">'
                '    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Message:</div>'
                '    <div style="font-size:13px;white-space:pre-wrap;color:#334155;">{4}</div>'
                '  </div>'
                '</div>',
                instance.id, instance.name, instance.email, instance.subject, instance.message
            )

        # FreeTrial / Order Request
        is_order = (instance.request_type == 'order_request')
        type_badge = (
            '<span style="background:#10b98118;color:#059669;border:1px solid #10b98138;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;">🛒 Order Request</span>'
            if is_order else
            '<span style="background:#6366f118;color:#6366f1;border:1px solid #6366f138;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;">🚀 Free Trial</span>'
        )

        # Phone communication links
        phone_html = mark_safe('<span style="color:#94a3b8;">Not provided</span>')
        if instance.phone_number:
            clean_num = ''.join(c for c in instance.phone_number if c.isdigit() or c == '+')
            topic = "your order request" if is_order else "your free trial request"
            wa_text = urllib.parse.quote(f"Hello {instance.full_name}, thank you for {topic} with PicPixels for '{instance.product_name}'. We are working on your files.")
            wa_link = f"https://wa.me/{clean_num.replace('+', '')}?text={wa_text}"
            sms_link = f"sms:{clean_num}?body={wa_text}"
            phone_html = format_html(
                '<div style="display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;">'
                '  <strong>{}</strong>'
                '  <a href="{}" target="_blank" style="background:#25D366;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;text-decoration:none;">💬 WhatsApp</a>'
                '  <a href="{}" style="background:#0284c7;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;text-decoration:none;">✉️ SMS</a>'
                '</div>',
                instance.phone_number, wa_link, sms_link
            )

        admin_url = f"/admin/cms/freetrial/{instance.id}/change/"

        return format_html(
            '<div style="background:rgba(248,250,252,0.9);border:1px solid rgba(203,213,225,0.7);border-radius:10px;padding:16px;">'
            '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid rgba(226,232,240,0.8);padding-bottom:10px;flex-wrap:wrap;gap:8px;">'
            '    <div style="display:flex;align-items:center;gap:10px;">'
            '      {0}'
            '      <span style="font-size:13px;color:#64748b;">Record #{1} • Submitted: {2}</span>'
            '    </div>'
            '    <a href="{3}" style="background:#059669;color:#fff;padding:5px 14px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">'
            '      Open in Trial & Order Requests ↗'
            '    </a>'
            '  </div>'
            '  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px;font-size:13px;margin-bottom:14px;">'
            '    <div><span style="color:#64748b;">Client Name:</span> <strong style="color:#0f172a;font-size:14px;">{4}</strong></div>'
            '    <div><span style="color:#64748b;">Email Address:</span> <a href="mailto:{5}" style="color:#2563eb;font-weight:600;">{5}</a></div>'
            '    <div><span style="color:#64748b;">Phone / Quick Chat:</span> {6}</div>'
            '    <div><span style="color:#64748b;">Country:</span> <strong>{7}</strong></div>'
            '    <div><span style="color:#64748b;">Company:</span> <strong>{8}</strong></div>'
            '    <div><span style="color:#64748b;">Service / Package:</span> <strong style="color:#0284c7;">{9}</strong></div>'
            '    <div><span style="color:#64748b;">Agreed / Package Price:</span> <strong style="color:#059669;font-size:14px;">{10}</strong></div>'
            '    <div><span style="color:#64748b;">Product Category:</span> <strong>{11}</strong></div>'
            '  </div>'
            '  <div style="background:rgba(0,0,0,0.03);padding:12px 14px;border-radius:6px;border:1px solid rgba(226,232,240,0.8);">'
            '    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Client Instructions / Project Requirements:</div>'
            '    <div style="font-size:13px;white-space:pre-wrap;color:#334155;">{12}</div>'
            '  </div>'
            '</div>',
            mark_safe(type_badge),
            instance.id,
            instance.created_at.strftime("%b %d, %Y at %I:%M %p") if instance.created_at else "",
            admin_url,
            instance.full_name,
            instance.email,
            phone_html,
            instance.country or "Not specified",
            instance.company_name or "—",
            instance.product_name or "—",
            instance.package_price or "—",
            instance.get_product_category_display() if hasattr(instance, 'get_product_category_display') else instance.product_category,
            instance.project_requirements or "None provided"
        )

    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Mark selected as read"

    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
    mark_as_unread.short_description = "Mark selected as unread"


from django.forms import PasswordInput, TextInput, Textarea
from django.contrib import messages
from django.urls import path, reverse
from django.shortcuts import redirect
from .models import EmailConfiguration, EmailTemplate, AdminNotificationEmail


class AdminNotificationEmailInline(TabularInline):
    model = AdminNotificationEmail
    extra = 1
    fields = ('email', 'name', 'notify_on_order', 'notify_on_trial', 'notify_on_contact', 'is_active')
    verbose_name = 'Admin Recipient'
    verbose_name_plural = 'Admin Recipient Emails'


@admin.register(AdminNotificationEmail)
class AdminNotificationEmailAdmin(ModelAdmin):
    list_display = ['email', 'name', 'is_active', 'notify_on_order', 'notify_on_trial', 'notify_on_contact', 'created_at']
    list_filter = ['is_active', 'notify_on_order', 'notify_on_trial', 'notify_on_contact']
    list_editable = ['is_active', 'notify_on_order', 'notify_on_trial', 'notify_on_contact']
    search_fields = ['email', 'name']


@admin.register(EmailConfiguration)
class EmailConfigurationAdmin(ModelAdmin):
    list_display = ['status_badge', 'smtp_host', 'smtp_user', 'from_name', 'admin_recipients_display', 'updated_at']
    readonly_fields = ['status_overview_card', 'setup_guide', 'admin_recipients_display', 'client_auto_reply_info']
    actions_list = ['send_test_email_action']
    actions_detail = ['send_test_email_action']
    inlines = [AdminNotificationEmailInline]

    fieldsets = (
        ('📊 System Overview & Live Status', {
            'fields': ('status_overview_card',),
            'description': 'Current state of your email delivery service and quick actions.',
        }),
        ('⚙️ Service Switch', {
            'fields': ('is_active',),
            'description': 'Turn this ON when you are ready to enable sending automated emails to admins and clients.',
        }),
        ('🔑 Google / Gmail SMTP Credentials', {
            'fields': (
                'setup_guide',
                ('smtp_host', 'smtp_port'),
                ('smtp_use_tls', 'smtp_use_ssl'),
                'smtp_user',
                'smtp_password',
                ('from_name', 'from_email'),
            ),
            'description': 'Configure your Google Workspace or Gmail account. A 16-character App Password is required by Google.',
        }),
        ('👥 Multiple Admin Email Recipients (Alerts)', {
            'fields': (
                'admin_recipients_display',
                'admin_emails',
                ('notify_admins_on_order', 'notify_admins_on_trial', 'notify_admins_on_contact'),
            ),
            'description': 'Enter all administrator email addresses that should receive email alerts whenever a client submits an order or inquiry.',
        }),
        ('✉️ Client Automated Confirmation (Auto-Responder)', {
            'fields': (
                'auto_reply_to_clients',
                'client_auto_reply_info',
            ),
            'description': 'Automatically send branded confirmation emails to clients immediately after they submit a form.',
        }),
    )

    def formfield_for_dbfield(self, db_field, **kwargs):
        if db_field.name == 'smtp_password':
            kwargs['widget'] = PasswordInput(
                render_value=True,
                attrs={
                    'placeholder': 'e.g. abcd efgh ijkl mnop (spaces auto-removed)',
                    'style': 'font-family: monospace; letter-spacing: 2px; font-size: 14px;',
                }
            )
        elif db_field.name == 'smtp_user':
            kwargs['widget'] = TextInput(attrs={'placeholder': 'e.g. info@picpixels.com or yourgmail@gmail.com'})
        elif db_field.name == 'smtp_host':
            kwargs['widget'] = TextInput(attrs={'placeholder': 'smtp.gmail.com'})
        elif db_field.name == 'from_name':
            kwargs['widget'] = TextInput(attrs={'placeholder': 'PicPixels Retouching Studio'})
        elif db_field.name == 'from_email':
            kwargs['widget'] = TextInput(attrs={'placeholder': 'info@picpixels.com (leave blank to use SMTP User)'})
        elif db_field.name == 'admin_emails':
            kwargs['widget'] = Textarea(attrs={
                'rows': 3,
                'placeholder': "admin@picpixels.com\nmanager@picpixels.com\noperations@picpixels.com",
                'style': 'font-family: monospace; font-size: 13px;',
            })
        return super().formfield_for_dbfield(db_field, **kwargs)

    def save_model(self, request, obj, form, change):
        # Automatically clean Google App Password whitespace
        if obj.smtp_password:
            obj.smtp_password = obj.smtp_password.replace(" ", "").strip()
        super().save_model(request, obj, form, change)

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('send-test-email/', self.admin_site.admin_view(self.send_test_email_view), name='notifications_emailconfiguration_send_test'),
        ]
        return custom_urls + urls

    def send_test_email_view(self, request):
        from .email_service import send_test_email
        config = EmailConfiguration.objects.first()
        if not config:
            messages.error(request, "❌ No Email Configuration record found.")
            return redirect('admin:notifications_emailconfiguration_changelist')

        recipients = config.get_admin_recipient_list()
        target = recipients[0] if recipients else (config.from_email or config.smtp_user or request.user.email)
        if not target:
            messages.warning(request, "⚠️ Please enter at least one Admin Recipient Email or SMTP User before testing.")
            return redirect(f"/admin/notifications/emailconfiguration/{config.id}/change/")

        success, msg = send_test_email(target)
        if success:
            messages.success(request, f"🎉 {msg}")
        else:
            messages.error(request, f"❌ {msg}")
        return redirect(f"/admin/notifications/emailconfiguration/{config.id}/change/")

    @action(description=_('Send Test Email'), icon='send')
    def send_test_email_action(self, request, object_id=None):
        from .email_service import send_test_email
        config = EmailConfiguration.objects.first()
        if not config:
            messages.error(request, "❌ No Email Configuration found.")
            return redirect('admin:notifications_emailconfiguration_changelist')
        recipients = config.get_admin_recipient_list()
        target = recipients[0] if recipients else (config.from_email or config.smtp_user or request.user.email)
        if not target:
            messages.warning(request, "⚠️ Please enter at least one Admin Recipient Email or SMTP User before testing.")
            return redirect(request.path)
        success, msg = send_test_email(target)
        if success:
            messages.success(request, f"🎉 {msg}")
        else:
            messages.error(request, f"❌ {msg}")
        return redirect(request.path)

    @display(description=_('Status'))
    def status_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="background:#10b98118;color:#059669;border:1px solid #10b98138;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;">🟢 Active (Sending)</span>')
        return format_html('<span style="background:#ef444418;color:#dc2626;border:1px solid #ef444438;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;">⚪ Inactive (Draft)</span>')

    @display(description=_('System Status & Overview'))
    def status_overview_card(self, obj):
        status_color = "#059669" if obj.is_active else "#64748b"
        status_bg = "#10b98118" if obj.is_active else "#f1f5f9"
        status_border = "#10b98138" if obj.is_active else "#cbd5e1"
        status_text = "🟢 Active & Delivering Emails" if obj.is_active else "⚪ Inactive (Draft Mode - Emails Paused)"

        recipients = obj.get_admin_recipient_list()
        recipients_count = len(recipients)
        test_url = "/admin/notifications/emailconfiguration/send-test-email/"
        templates_url = "/admin/notifications/emailtemplate/"

        alert_html = ""
        if not obj.smtp_user or not obj.smtp_password:
            alert_html = (
                '<div style="margin-top:14px;padding:12px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;color:#991b1b;display:flex;align-items:center;gap:10px;font-size:13px;">'
                '  <span style="font-size:22px;">⚠️</span>'
                '  <div>'
                '    <strong>Action Required:</strong> Enter your Gmail in <strong>Smtp user</strong> and 16-character Google App Password in <strong>Smtp password</strong> below and click <strong>Save</strong>. Until credentials are saved, emails cannot be sent.'
                '  </div>'
                '</div>'
            )
        return format_html(
            '<div style="background:linear-gradient(to bottom, #ffffff, #f8fafc);border:1px solid #cbd5e1;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">'
            '  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:16px;">'
            '    <div>'
            '      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">'
            '        <span style="font-size:24px;">📧</span>'
            '        <strong style="font-size:16px;color:#0f172a;">Google / SMTP Email Control Center</strong>'
            '        <span style="background:{0};color:{1};border:1px solid {2};padding:3px 12px;border-radius:9999px;font-size:11px;font-weight:700;">{3}</span>'
            '      </div>'
            '      <div style="font-size:12px;color:#64748b;">Host: <strong>{4}:{5}</strong> ({6}) • Sender: <strong>{7}</strong></div>'
            '    </div>'
            '    <div style="display:flex;gap:8px;flex-wrap:wrap;">'
            '      <a href="{8}" style="background:#059669;color:#ffffff;padding:7px 16px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:6px;box-shadow:0 1px 2px rgba(0,0,0,0.05);">'
            '        ⚡ Send Test Email Now'
            '      </a>'
            '      <a href="{9}" style="background:#2563eb;color:#ffffff;padding:7px 16px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:6px;">'
            '        📝 Email Templates ↗'
            '      </a>'
            '    </div>'
            '  </div>'
            '  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;">'
            '    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">'
            '      <div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Admin Alerts</div>'
            '      <div style="font-size:14px;font-weight:700;color:#0f172a;margin-top:2px;">{10} Admin(s) Configured</div>'
            '      <div style="font-size:11px;color:#059669;margin-top:2px;">Orders: {11} • Trials: {12}</div>'
            '    </div>'
            '    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">'
            '      <div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Client Auto-Reply</div>'
            '      <div style="font-size:14px;font-weight:700;color:{13};margin-top:2px;">{14}</div>'
            '      <div style="font-size:11px;color:#64748b;margin-top:2px;">Automated receipt on submission</div>'
            '    </div>'
            '    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">'
            '      <div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Google Auth</div>'
            '      <div style="font-size:14px;font-weight:700;color:#0284c7;margin-top:2px;">{15}</div>'
            '      <div style="font-size:11px;color:#64748b;margin-top:2px;">App Password Auth</div>'
            '    </div>'
            '  </div>'
            '  {16}'
            '</div>',
            status_bg, status_color, status_border, status_text,
            obj.smtp_host or "smtp.gmail.com", obj.smtp_port, "TLS" if obj.smtp_use_tls else ("SSL" if obj.smtp_use_ssl else "Plain"),
            obj.smtp_user or "Not set",
            test_url, templates_url,
            recipients_count,
            "ON" if obj.notify_admins_on_order else "OFF",
            "ON" if obj.notify_admins_on_trial else "OFF",
            "#059669" if obj.auto_reply_to_clients else "#64748b",
            "Enabled (Auto-Confirming)" if obj.auto_reply_to_clients else "Disabled",
            "Configured" if (obj.smtp_user and obj.smtp_password) else "Incomplete",
            mark_safe(alert_html)
        )



    @display(description=_('Google App Password Setup Guide'))
    def setup_guide(self, obj):
        return mark_safe(
            '<div style="background:rgba(239,246,255,0.85);border:1px solid rgba(191,219,254,0.9);border-radius:10px;padding:18px;color:#1e3a8a;margin-bottom:8px;">'
            '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">'
            '    <div style="font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px;">'
            '      <span>🔑</span> 4-Step Google / Gmail App Password Setup'
            '    </div>'
            '    <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" style="background:#2563eb;color:#ffffff;padding:5px 12px;border-radius:6px;font-size:11px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">'
            '      Open Google App Passwords ↗'
            '    </a>'
            '  </div>'
            '  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px;font-size:12px;line-height:1.5;">'
            '    <div style="background:#ffffff;border:1px solid #bfdbfe;border-radius:6px;padding:10px;">'
            '      <strong style="color:#1d4ed8;display:block;margin-bottom:3px;">1. Enable 2-Step Verification</strong>'
            '      Go to your Google Account > Security and ensure 2-Step Verification is active.'
            '    </div>'
            '    <div style="background:#ffffff;border:1px solid #bfdbfe;border-radius:6px;padding:10px;">'
            '      <strong style="color:#1d4ed8;display:block;margin-bottom:3px;">2. Visit App Passwords</strong>'
            '      Search "App Passwords" in your Google Account or use the direct blue button above.'
            '    </div>'
            '    <div style="background:#ffffff;border:1px solid #bfdbfe;border-radius:6px;padding:10px;">'
            '      <strong style="color:#1d4ed8;display:block;margin-bottom:3px;">3. Generate 16-Letter Code</strong>'
            '      Name it "PicPixels" and click Create. Google will show a 16-character code.'
            '    </div>'
            '    <div style="background:#ffffff;border:1px solid #bfdbfe;border-radius:6px;padding:10px;">'
            '      <strong style="color:#1d4ed8;display:block;margin-bottom:3px;">4. Paste & Save</strong>'
            '      Paste into <strong>SMTP Password</strong> below. Spaces are automatically removed for you.'
            '    </div>'
            '  </div>'
            '  <div style="margin-top:10px;font-size:11px;color:#3b82f6;">'
            '    💡 <em>Standard Gmail Settings: Host: <code>smtp.gmail.com</code> • Port: <code>587</code> • Use TLS: <code>ON</code></em>'
            '  </div>'
            '</div>'
        )

    @display(description=_('Current Active Admin Recipients'))
    def admin_recipients_display(self, obj):
        recipients = obj.get_admin_recipient_list()
        if not recipients:
            return mark_safe(
                '<div style="padding:10px 14px;background:rgba(254,242,242,0.8);border:1px solid rgba(254,202,202,0.8);border-radius:8px;color:#b91c1c;font-size:12px;">'
                '⚠️ <strong>No admin email recipients entered yet.</strong> Enter your admin emails in the box below to receive instant alerts for new orders and inquiries.'
                '</div>'
            )
        badges = [
            f'<div style="background:#ffffff;color:#1e40af;border:1px solid #bfdbfe;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:6px;box-shadow:0 1px 2px rgba(0,0,0,0.03);">'
            f'<span>✉️</span> {e}'
            f'</div>'
            for e in recipients
        ]
        return format_html(
            '<div style="background:rgba(248,250,252,0.9);border:1px solid #cbd5e1;border-radius:8px;padding:12px;">'
            '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">'
            '    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Active Recipient List ({0}):</div>'
            '    <a href="/admin/notifications/adminnotificationemail/" style="background:#2563eb;color:#ffffff;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">'
            '      👥 Manage & Add Admin Recipients ↗'
            '    </a>'
            '  </div>'
            '  <div style="display:flex;flex-wrap:wrap;gap:6px;">{1}</div>'
            '</div>',
            len(recipients),
            mark_safe(''.join(badges))
        )

    @display(description=_('Client Auto-Reply Information'))
    def client_auto_reply_info(self, obj):
        return mark_safe(
            '<div style="background:rgba(240,253,244,0.8);border:1px solid rgba(187,247,208,0.8);border-radius:8px;padding:14px;font-size:12px;color:#166534;">'
            '  <div style="font-weight:700;font-size:13px;margin-bottom:4px;display:flex;align-items:center;gap:6px;">'
            '    <span>✅</span> Automated Client Acknowledgement'
            '  </div>'
            '  <p style="margin:0 0 10px 0;line-height:1.5;">'
            '    Whenever a client submits an <strong>Order Request</strong>, <strong>Free Trial</strong>, or <strong>Contact Us</strong> form, a branded confirmation email is sent to them automatically.'
            '  </p>'
            '  <a href="/admin/notifications/emailtemplate/" style="background:#059669;color:#ffffff;padding:5px 12px;border-radius:6px;font-size:11px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">'
            '    Customize Client Email Templates & Subjects ↗'
            '  </a>'
            '</div>'
        )

    def has_add_permission(self, request):
        return not EmailConfiguration.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False



@admin.register(EmailTemplate)
class EmailTemplateAdmin(ModelAdmin):
    list_display = ['template_type_badge', 'subject', 'is_active', 'updated_at']
    list_filter = ['template_type', 'is_active']
    list_editable = ['is_active']
    readonly_fields = ['tags_guide']

    fieldsets = (
        ('Template Information', {
            'fields': ('template_type', 'is_active', 'subject'),
        }),
        ('Dynamic Variables Reference', {
            'fields': ('tags_guide',),
            'description': 'You can insert these dynamic tags anywhere into the subject or body to personalize emails.',
        }),
        ('Email Body (HTML & Plain Text)', {
            'fields': ('body_html', 'body_text'),
        }),
    )

    @display(description=_('Template Type'))
    def template_type_badge(self, obj):
        colors = {
            'client_order_request': ('#059669', 'shopping_bag'),
            'client_free_trial': ('#6366f1', 'rocket_launch'),
            'client_contact_inquiry': ('#ea580c', 'mail'),
            'admin_order_alert': ('#059669', 'notifications_active'),
            'admin_trial_alert': ('#6366f1', 'notifications_active'),
            'admin_contact_alert': ('#ea580c', 'notifications_active'),
        }
        color, icon = colors.get(obj.template_type, ('#64748b', 'email'))
        return format_html(
            '<span style="background:{0}18;color:{0};border:1px solid {0}38;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:5px;">'
            '<span class="material-symbols-outlined" style="font-size:13px;line-height:1;">{1}</span>{2}'
            '</span>',
            color, icon, obj.get_template_type_display()
        )

    @display(description=_('Available Dynamic Tags'))
    def tags_guide(self, obj):
        return mark_safe(
            '<div style="background:rgba(248,250,252,0.9);border:1px solid rgba(203,213,225,0.7);border-radius:8px;padding:14px;font-size:12px;">'
            '  <div style="font-weight:700;color:#334155;margin-bottom:8px;">Available Variables:</div>'
            '  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:8px;">'
            '    <div><code style="background:#e2e8f0;padding:2px 6px;border-radius:4px;color:#0f172a;font-weight:600;">{client_name}</code> — Client full name</div>'
            '    <div><code style="background:#e2e8f0;padding:2px 6px;border-radius:4px;color:#0f172a;font-weight:600;">{client_email}</code> — Client email</div>'
            '    <div><code style="background:#e2e8f0;padding:2px 6px;border-radius:4px;color:#0f172a;font-weight:600;">{client_phone}</code> — Client phone/WhatsApp</div>'
            '    <div><code style="background:#e2e8f0;padding:2px 6px;border-radius:4px;color:#0f172a;font-weight:600;">{service_name}</code> — Service / Package</div>'
            '    <div><code style="background:#e2e8f0;padding:2px 6px;border-radius:4px;color:#0f172a;font-weight:600;">{package_price}</code> — Agreed package price</div>'
            '    <div><code style="background:#e2e8f0;padding:2px 6px;border-radius:4px;color:#0f172a;font-weight:600;">{country}</code> — Client country</div>'
            '    <div><code style="background:#e2e8f0;padding:2px 6px;border-radius:4px;color:#0f172a;font-weight:600;">{company_name}</code> — Company name</div>'
            '    <div><code style="background:#e2e8f0;padding:2px 6px;border-radius:4px;color:#0f172a;font-weight:600;">{order_id}</code> — Submission reference ID</div>'
            '    <div><code style="background:#e2e8f0;padding:2px 6px;border-radius:4px;color:#0f172a;font-weight:600;">{requirements}</code> — Instructions / Notes</div>'
            '    <div><code style="background:#e2e8f0;padding:2px 6px;border-radius:4px;color:#0f172a;font-weight:600;">{site_name}</code> — PicPixels</div>'
            '    <div><code style="background:#e2e8f0;padding:2px 6px;border-radius:4px;color:#0f172a;font-weight:600;">{support_email}</code> — Support email</div>'
            '    <div><code style="background:#e2e8f0;padding:2px 6px;border-radius:4px;color:#0f172a;font-weight:600;">{admin_link}</code> — Admin panel URL</div>'
            '  </div>'
            '</div>'
        )


