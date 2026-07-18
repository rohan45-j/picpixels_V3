from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import RevisionRequest, ImageAnnotation


class ImageAnnotationInline(admin.TabularInline):
    model = ImageAnnotation
    extra = 0
    fields = ('comment', 'x_percentage', 'y_percentage', 'width_percentage', 'height_percentage')
    readonly_fields = ('x_percentage', 'y_percentage', 'width_percentage', 'height_percentage')


@admin.register(RevisionRequest)
class RevisionRequestAdmin(ModelAdmin):
    list_select_related = ('order_item__order', 'requested_by__user')
    list_display = ('id_short', 'order_item', 'requested_by', 'status_badge', 'annotation_count', 'created_at')
    list_filter = ('status', 'created_at')
    list_filter_submit = True
    search_fields = ('order_item__filename', 'requested_by__user__email', 'feedback_text')
    inlines = [ImageAnnotationInline]
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('order_item', 'requested_by', 'status'),
        }),
        ('Feedback', {
            'fields': ('feedback_text',),
        }),
    )

    @display(description='Revision ID')
    def id_short(self, obj):
        return str(obj.id)[:8]

    @display(description='Status')
    def status_badge(self, obj):
        colors = {'pending': '#f59e0b', 'in_progress': '#3b82f6', 'resolved': '#10b981'}
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background:{}15;color:{};padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:600">{}</span>',
            color, color, obj.get_status_display()
        )

    @display(description='Annotations')
    def annotation_count(self, obj):
        count = obj.annotations.count()
        return str(count) if count else '-'


@admin.register(ImageAnnotation)
class ImageAnnotationAdmin(ModelAdmin):
    list_display = ('revision', 'comment_short', 'position_display', 'created_at')
    search_fields = ('comment',)
    list_fullwidth = True
    readonly_fields = ('revision', 'x_percentage', 'y_percentage', 'width_percentage', 'height_percentage', 'created_at')
    fieldsets = (
        (None, {
            'fields': ('revision', 'comment'),
        }),
        ('Position', {
            'fields': ('x_percentage', 'y_percentage', 'width_percentage', 'height_percentage'),
        }),
    )

    @display(description='Comment')
    def comment_short(self, obj):
        return (obj.comment[:50] + '...') if len(obj.comment) > 50 else obj.comment

    @display(description='Position')
    def position_display(self, obj):
        return f'({obj.x_percentage}%, {obj.y_percentage}%)'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
