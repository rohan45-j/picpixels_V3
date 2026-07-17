from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import WorkflowTemplate


@admin.register(WorkflowTemplate)
class WorkflowTemplateAdmin(ModelAdmin):
    list_display = ('name', 'profile', 'file_format', 'background_type', 'shadow_type', 'dpi', 'color_profile')
    list_filter = ('file_format', 'background_type', 'shadow_type', 'color_profile')
    list_filter_submit = True
    search_fields = ('name', 'profile__user__email')
    list_fullwidth = True
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'profile'),
        }),
        ('File Configuration', {
            'fields': ('file_format', 'dpi', 'color_profile'),
        }),
        ('Background Settings', {
            'fields': ('background_type', 'background_color_hex'),
        }),
        ('Dimensions & Margins', {
            'fields': ('margin_percentage', 'crop_width', 'crop_height'),
        }),
        ('Shadow Effects', {
            'fields': ('shadow_type',),
        }),
    )

    @display(description='Format')
    def file_format(self, obj):
        colors = {'jpg': '#3b82f6', 'png': '#10b981', 'tiff': '#f59e0b', 'psd': '#8b5cf6'}
        color = colors.get(obj.file_format, '#6b7280')
        return format_html(
            '<span style="background:{}15;color:{};padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:600">{}</span>',
            color, color, obj.get_file_format_display()
        )

    @display(description='Background')
    def background_type(self, obj):
        colors = {'transparent': '#8b5cf6', 'white': '#10b981', 'custom_hex': '#f59e0b'}
        color = colors.get(obj.background_type, '#6b7280')
        return format_html(
            '<span style="background:{}15;color:{};padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:600">{}</span>',
            color, color, obj.get_background_type_display()
        )

    @display(description='Shadow')
    def shadow_type(self, obj):
        colors = {'none': '#9ca3af', 'drop_shadow': '#3b82f6', 'reflection': '#10b981', 'natural': '#8b5cf6'}
        color = colors.get(obj.shadow_type, '#6b7280')
        return format_html(
            '<span style="background:{}15;color:{};padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:600">{}</span>',
            color, color, obj.get_shadow_type_display()
        )
