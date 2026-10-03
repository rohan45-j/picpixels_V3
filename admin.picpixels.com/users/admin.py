from django import forms
from django.contrib import admin
from django.contrib.auth.models import User, Group, Permission
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin, GroupAdmin as BaseGroupAdmin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from unfold.admin import ModelAdmin
from unfold.decorators import display
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm
from .models import UserProfile
from .permissions_matrix import build_permission_matrix

# Set verbose names on Group so it displays as "Roles & Permissions" / "Role"
Group._meta.verbose_name = 'Role'
Group._meta.verbose_name_plural = 'Roles & Permissions'

# Re-register User and Group with clean Unfold styling
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass


# ─────────────────────────────────────────────────────────────────────────────
# User Admin Forms & Customization
# ─────────────────────────────────────────────────────────────────────────────

class StandardUserCreationForm(UserCreationForm):
    role = forms.ModelChoiceField(
        queryset=Group.objects.all().order_by('name'),
        required=False,
        label='Assigned Role',
        empty_label='— Select a Role —',
        help_text='Select the primary role to grant module permissions to this user.'
    )
    email = forms.EmailField(required=True, label='Email Address')
    first_name = forms.CharField(required=False, label='First Name')
    last_name = forms.CharField(required=False, label='Last Name')

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'role')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data.get('first_name', '')
        user.last_name = self.cleaned_data.get('last_name', '')
        role = self.cleaned_data.get('role')
        if role and role.name in ['Administrator', 'Manager', 'Editor', 'Retoucher']:
            user.is_staff = True
        if commit:
            user.save()
            if role:
                user.groups.set([role])
            UserProfile.objects.get_or_create(
                user=user,
                defaults={'role': role.name.lower() if role else 'client'}
            )
        return user


class StandardUserChangeForm(UserChangeForm):
    role = forms.ModelChoiceField(
        queryset=Group.objects.all().order_by('name'),
        required=False,
        label='Assigned Role',
        empty_label='— Select a Role —',
        help_text='Select the role to define this user\'s access permissions.'
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Suppress individual permission checklists from User form per user request
        if 'user_permissions' in self.fields:
            del self.fields['user_permissions']
        if 'groups' in self.fields:
            del self.fields['groups']
        if self.instance and self.instance.pk:
            current_role = self.instance.groups.first()
            if current_role:
                self.fields['role'].initial = current_role

    def save(self, commit=True):
        user = super().save(commit=commit)
        role = self.cleaned_data.get('role')
        if role:
            user.groups.set([role])
            if role.name in ['Administrator', 'Manager', 'Editor', 'Retoucher']:
                user.is_staff = True
                user.save(update_fields=['is_staff'])
            if hasattr(user, 'profile'):
                user.profile.role = role.name.lower()
                user.profile.save(update_fields=['role'])
        else:
            user.groups.clear()
        return user


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin, ModelAdmin):
    form = StandardUserChangeForm
    add_form = StandardUserCreationForm
    change_password_form = AdminPasswordChangeForm
    list_display = ('username', 'email', 'full_name', 'role_badge', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'groups')
    list_filter_submit = True
    list_fullwidth = True
    readonly_fields = ('last_login', 'date_joined')
    inlines = []

    fieldsets = (
        ('Account Credentials', {
            'fields': ('username', 'password'),
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email'),
        }),
        ('Role & Access Control', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser'),
            'description': 'Assign user role. All module permissions are inherited directly from this role.',
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',),
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if 'role' in form.cleaned_data:
            role = form.cleaned_data.get('role')
            if role:
                obj.groups.set([role])
                if role.name in ['Administrator', 'Manager', 'Editor', 'Retoucher']:
                    if not obj.is_staff:
                        obj.is_staff = True
                        obj.save(update_fields=['is_staff'])
                if hasattr(obj, 'profile'):
                    obj.profile.role = role.name.lower()
                    obj.profile.save(update_fields=['role'])
            else:
                obj.groups.clear()

    @display(description='Full Name')
    def full_name(self, obj):
        name = obj.get_full_name()
        return name if name else '-'

    @display(description='Role')
    def role_badge(self, obj):
        role = obj.groups.first()
        if role:
            colors = {
                'Administrator': ('#ef4444', '#fee2e2'),
                'Manager': ('#f59e0b', '#fef3c7'),
                'Editor': ('#10b981', '#d1fae5'),
                'Retoucher': ('#8b5cf6', '#ede9fe'),
                'Client': ('#3b82f6', '#dbeafe'),
            }
            fg, bg = colors.get(role.name, ('#3b82f6', '#eff6ff'))
            return format_html(
                '<span style="background:{};color:{};border:1px solid {}80;padding:3px 10px;border-radius:9999px;font-size:0.75rem;font-weight:700">{}</span>',
                bg, fg, fg, role.name
            )
        return mark_safe('<span style="color:#94a3af;font-size:0.75rem;font-weight:500">No Role Assigned</span>')


# ─────────────────────────────────────────────────────────────────────────────
# Role & Permission Matrix Admin
# ─────────────────────────────────────────────────────────────────────────────

class CustomGroupAdminForm(forms.ModelForm):
    permissions = forms.ModelMultipleChoiceField(
        queryset=Permission.objects.all(),
        required=False,
        widget=forms.MultipleHiddenInput(),
    )

    class Meta:
        model = Group
        fields = ('name', 'permissions')


@admin.register(Group)
class CustomGroupAdmin(BaseGroupAdmin, ModelAdmin):
    form = CustomGroupAdminForm
    change_form_template = 'admin/auth/group/change_form.html'
    list_display = ('name', 'users_count', 'permissions_count')
    search_fields = ('name',)
    list_fullwidth = True

    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        extra_context = extra_context or {}
        group = self.get_object(request, object_id) if object_id else None
        extra_context['permission_matrix'] = build_permission_matrix(group)
        return super().changeform_view(request, object_id, form_url, extra_context=extra_context)

    @display(description='Assigned Users')
    def users_count(self, obj):
        count = obj.user_set.count()
        return format_html(
            '<span style="background:#f3f4f6;color:#374151;padding:3px 10px;border-radius:9999px;font-weight:600;font-size:0.75rem;">{} users</span>',
            count
        )

    @display(description='Module Permissions')
    def permissions_count(self, obj):
        count = obj.permissions.count()
        return format_html(
            '<span style="background:#eff6ff;color:#2563eb;padding:3px 10px;border-radius:9999px;font-weight:600;font-size:0.75rem;">{} permissions</span>',
            count
        )
