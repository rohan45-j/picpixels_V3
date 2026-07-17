from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ('filename', 'original_url', 'edited_url', 'status', 'file_size')
    readonly_fields = ('file_size',)


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = ('id_short', 'profile', 'order_type', 'status_badge', 'total_price', 'turnaround_speed_hours', 'created_at')
    list_filter = ('status', 'order_type', 'created_at')
    list_filter_submit = True
    search_fields = ('id', 'profile__user__email', 'tracking_number', 'special_instructions')
    inlines = [OrderItemInline]
    readonly_fields = ('total_price', 'total_images', 'unit_price')
    list_fullwidth = True
    fieldsets = (
        ('Client Information', {
            'fields': ('profile',),
        }),
        ('Order Details', {
            'fields': ('order_type', 'status', 'workflow_template'),
        }),
        ('Pricing', {
            'fields': ('unit_price', 'total_images', 'total_price', 'turnaround_speed_hours'),
        }),
        ('Additional Information', {
            'fields': ('special_instructions', 'tracking_number'),
        }),
    )

    @display(description='Order ID')
    def id_short(self, obj):
        return str(obj.id)[:8]

    @display(description='Status')
    def status_badge(self, obj):
        colors = {
            'draft': '#9ca3af', 'pending': '#f59e0b', 'in_progress': '#3b82f6',
            'review': '#8b5cf6', 'completed': '#10b981', 'cancelled': '#ef4444',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background:{}15;color:{};padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:600">{}</span>',
            color, color, obj.get_status_display()
        )


@admin.register(OrderItem)
class OrderItemAdmin(ModelAdmin):
    list_display = ('filename', 'order_link', 'status_badge', 'file_size', 'created_at')
    list_filter = ('status', 'created_at')
    list_filter_submit = True
    search_fields = ('filename', 'order__id')
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('order', 'filename', 'status'),
        }),
        ('Files', {
            'fields': ('original_url', 'edited_url'),
        }),
        ('Metadata', {
            'fields': ('file_size', 'width', 'height'),
        }),
    )

    @display(description='Order')
    def order_link(self, obj):
        return format_html('<a href="{}">{}</a>', obj.order.get_admin_url(), str(obj.order.id)[:8])

    @display(description='Status')
    def status_badge(self, obj):
        colors = {
            'uploaded': '#3b82f6', 'retouching': '#8b5cf6', 'quality_check': '#f59e0b',
            'review_pending': '#f97316', 'approved': '#10b981', 'rejected': '#ef4444',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background:{}15;color:{};padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:600">{}</span>',
            color, color, obj.get_status_display()
        )
