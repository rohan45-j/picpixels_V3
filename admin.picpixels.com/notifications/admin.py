from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin
from .models import Notification


class ModuleListFilter(admin.SimpleListFilter):
    title = _('Module')
    parameter_name = 'module'

    MODULE_MAP = {
        'commerce': ['new_order', 'payment_completed', 'payment_failed', 'refund_requested'],
        'support':  ['contact_inquiry', 'quote_request', 'support_message'],
        'users':    ['user_registration', 'user_update'],
        'system':   ['settings_updated', 'backup_completed', 'security_alert', 'system'],
    }

    def lookups(self, request, model_admin):
        return [
            ('commerce', _('Commerce')),
            ('support', _('Support')),
            ('users', _('Users')),
            ('system', _('System')),
        ]

    def queryset(self, request, queryset):
        value = self.value()
        if value in self.MODULE_MAP:
            return queryset.filter(type__in=self.MODULE_MAP[value])
        return queryset


@admin.register(Notification)
class NotificationAdmin(ModelAdmin):
    list_display = ['title', 'type', 'is_read', 'created_at']
    list_filter = [ModuleListFilter, 'type', 'is_read', 'created_at']
    search_fields = ['title', 'message']
    date_hierarchy = 'created_at'
    actions = ['mark_as_read', 'mark_as_unread']

    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Mark selected as read"

    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
    mark_as_unread.short_description = "Mark selected as unread"
