from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import MediaFile


@admin.register(MediaFile)
class MediaFileAdmin(ModelAdmin):
    list_select_related = ('uploaded_by',)
    list_display = ('title', 'file_type_badge', 'file_size_display', 'thumbnail_preview', 'uploaded_by', 'created_at')
    list_filter = ('file_type', 'created_at')
    list_filter_submit = True
    search_fields = ('title', 'alt_text', 'mime_type')
    readonly_fields = ('file_type', 'mime_type', 'file_size', 'width', 'height', 'thumbnail', 'created_at', 'updated_at')
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('file', 'title', 'alt_text'),
        }),
        ('Metadata', {
            'fields': ('file_type', 'mime_type', 'file_size', 'width', 'height'),
        }),
        ('Thumbnail', {
            'fields': ('thumbnail',),
        }),
        ('Audit', {
            'fields': ('uploaded_by', 'created_at', 'updated_at'),
        }),
    )

    @display(description='Type')
    def file_type_badge(self, obj):
        colors = {'image': '#3b82f6', 'video': '#8b5cf6', 'document': '#f59e0b', 'other': '#6b7280'}
        color = colors.get(obj.file_type, '#6b7280')
        return format_html(
            '<span style="background:{}15;color:{};padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:600">{}</span>',
            color, color, obj.get_file_type_display()
        )

    @display(description='Size')
    def file_size_display(self, obj):
        if obj.file_size > 1048576:
            return f'{obj.file_size / 1048576:.1f} MB'
        elif obj.file_size > 1024:
            return f'{obj.file_size / 1024:.1f} KB'
        return f'{obj.file_size} B'

    @display(description='Preview')
    def thumbnail_preview(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" style="width:48px;height:48px;border-radius:6px;object-fit:cover" />', obj.thumbnail.url)
        return mark_safe('<span style="color:#9ca3af">No thumb</span>')
