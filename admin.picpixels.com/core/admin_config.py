from django import forms
from django.contrib import admin
from django.db import models
from unfold.admin import ModelAdmin as UnfoldModelAdmin
from core.widgets import CustomToggleSwitch


class BaseModelAdmin(UnfoldModelAdmin):
    """
    Base ModelAdmin with modern SaaS-style UI enhancements.
    Applies CustomToggleSwitch widget to all BooleanFields globally.
    """
    formfield_overrides = {
        **getattr(UnfoldModelAdmin, 'formfield_overrides', {}),
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    
    list_fullwidth = True
    
    class Media:
        css = {
            'all': ('admin/css/custom_admin.css', 'admin/css/custom.css', 'admin/css/custom_table.css'),
        }
        js = ('admin/js/toggle.js', 'admin/js/theme.js', 'admin/js/sidebar.js')


class BaseTabularInline(admin.TabularInline):
    """Base inline with modern styling."""
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    
    class Media:
        css = {
            'all': ('admin/css/custom_admin.css', 'admin/css/custom.css', 'admin/css/custom_table.css'),
        }
        js = ('admin/js/toggle.js',)


class BaseStackedInline(admin.StackedInline):
    """Base stacked inline with modern styling."""
    formfield_overrides = {
        models.BooleanField: {'widget': CustomToggleSwitch},
    }
    
    class Media:
        css = {
            'all': ('admin/css/custom_admin.css', 'admin/css/custom.css', 'admin/css/custom_table.css'),
        }
        js = ('admin/js/toggle.js',)