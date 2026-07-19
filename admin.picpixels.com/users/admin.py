from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from unfold.admin import ModelAdmin
from unfold.decorators import display
from core.widgets import ModernDateTimeWidget
from .models import SubscriptionPlan, UserProfile, Subscription, Transaction


class SubscriptionInline(admin.TabularInline):
    model = Subscription
    extra = 0
    fields = ('plan', 'status', 'current_period_start', 'current_period_end')
    readonly_fields = ('current_period_start', 'current_period_end')


class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0
    fields = ('amount', 'type', 'status', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(ModelAdmin):
    list_display = ('name', 'monthly_fee', 'annual_fee', 'turnaround_hours_guaranteed', 'features_count')
    search_fields = ('name',)
    list_editable = ('monthly_fee', 'annual_fee')
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('name',),
        }),
        ('Pricing', {
            'fields': ('monthly_fee', 'annual_fee', 'per_image_base_discount'),
        }),
        ('Service Level', {
            'fields': ('turnaround_hours_guaranteed', 'features'),
        }),
    )

    def features_count(self, obj):
        if obj.features:
            return len(obj.features)
        return 0
    features_count.short_description = 'Features'


@admin.register(UserProfile)
class UserProfileAdmin(ModelAdmin):
    list_select_related = ('user',)
    list_display = ('user', 'company_name', 'role_badge', 'credits', 'subscription_status', 'created_at')
    list_filter = ('role', 'created_at')
    list_filter_submit = True
    search_fields = ('user__email', 'user__username', 'company_name', 'phone_number')
    inlines = [SubscriptionInline, TransactionInline]
    list_fullwidth = True
    fieldsets = (
        ('User Account', {
            'fields': ('user',),
        }),
        ('Profile Information', {
            'fields': ('company_name', 'phone_number', 'website', 'role'),
        }),
        ('Billing & Credits', {
            'fields': ('stripe_customer_id', 'credits'),
        }),
    )

    @display(description='Role')
    def role_badge(self, obj):
        colors = {'client': '#3b82f6', 'retoucher': '#8b5cf6', 'manager': '#f59e0b', 'admin': '#ef4444'}
        color = colors.get(obj.role, '#6b7280')
        return format_html(
            '<span style="background:{}15;color:{};padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:600">{}</span>',
            color, color, obj.get_role_display()
        )

    @display(description='Subscription')
    def subscription_status(self, obj):
        active_sub = obj.subscriptions.filter(status='active').first()
        if active_sub:
            return format_html('<span style="color:#10b981">Active - {}</span>', active_sub.plan.name)
        return mark_safe('<span style="color:#9ca3af">No active plan</span>')


@admin.register(Subscription)
class SubscriptionAdmin(ModelAdmin):
    list_select_related = ('profile__user', 'plan')
    list_display = ('profile', 'plan', 'status_badge', 'current_period_start', 'current_period_end')
    list_filter = ('status', 'current_period_end')
    list_filter_submit = True
    search_fields = ('profile__user__email', 'plan__name')
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('profile', 'plan', 'status'),
        }),
        ('Period', {
            'fields': ('current_period_start', 'current_period_end', 'cancel_at_period_end'),
        }),
    )

    @display(description='Status')
    def status_badge(self, obj):
        colors = {'active': '#10b981', 'paused': '#f59e0b', 'cancelled': '#ef4444', 'past_due': '#f97316', 'inactive': '#9ca3af'}
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background:{}15;color:{};padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:600">{}</span>',
            color, color, obj.get_status_display()
        )

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name in ('current_period_start', 'current_period_end'):
            formfield.widget = ModernDateTimeWidget()
        return formfield


@admin.register(Transaction)
class TransactionAdmin(ModelAdmin):
    list_select_related = ('profile__user',)
    list_display = ('profile', 'amount_display', 'type_badge', 'status_badge', 'description', 'created_at')
    list_filter = ('type', 'status', 'created_at')
    list_filter_submit = True
    search_fields = ('profile__user__email', 'stripe_invoice_id', 'description')
    list_fullwidth = True
    fieldsets = (
        (None, {
            'fields': ('profile', 'amount', 'type', 'status'),
        }),
        ('Details', {
            'fields': ('stripe_invoice_id', 'description'),
        }),
    )

    @display(description='Amount')
    def amount_display(self, obj):
        return f'${obj.amount:.2f}'

    @display(description='Type')
    def type_badge(self, obj):
        colors = {'subscription': '#3b82f6', 'image_charge': '#8b5cf6', 'credits_topup': '#10b981', 'refund': '#ef4444'}
        color = colors.get(obj.type, '#6b7280')
        return format_html(
            '<span style="background:{}15;color:{};padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:600">{}</span>',
            color, color, obj.get_type_display()
        )

    @display(description='Status')
    def status_badge(self, obj):
        colors = {'pending': '#f59e0b', 'completed': '#10b981', 'failed': '#ef4444', 'refunded': '#8b5cf6'}
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background:{}15;color:{};padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:600">{}</span>',
            color, color, obj.get_status_display()
        )
