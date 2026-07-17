from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from unfold.admin import ModelAdmin
from unfold.decorators import display
from unfold.widgets import UnfoldBooleanSwitchWidget
from .models import NavigationItem


@admin.register(NavigationItem)
class NavigationItemAdmin(ModelAdmin):
    list_display = ('label', 'location_badge', 'parent', 'order', 'is_active_status', 'opens_in_new_tab')
    list_filter = ('location', 'is_active')
    list_filter_submit = True
    search_fields = ('label', 'url', 'css_class')
    list_editable = ('order',)
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('label', 'url', 'location', 'parent', 'order'),
        }),
        ('Display Options', {
            'fields': ('icon', 'css_class'),
        }),
        ('Behavior', {
            'fields': ('is_active', 'opens_in_new_tab'),
        }),
    )
    formfield_overrides = {
        'is_active': {'widget': UnfoldBooleanSwitchWidget},
    }

    @display(description='Location')
    def location_badge(self, obj):
        colors = {
            'header': '#3b82f6',
            'footer': '#10b981',
            'mega_menu': '#8b5cf6',
        }
        color = colors.get(obj.location, '#6b7280')
        return format_html(
            '<span style="background:{}15;color:{};padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:600">{}</span>',
            color, color, obj.get_location_display()
        )

    @display(description='Active')
    def is_active_status(self, obj):
        if obj.is_active:
            return mark_safe('<span style="color:#10b981">Active</span>')
        return mark_safe('<span style="color:#ef4444">Inactive</span>')
