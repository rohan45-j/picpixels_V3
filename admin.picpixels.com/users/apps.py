from django.apps import AppConfig


class UsersConfig(AppConfig):
    name = 'users'

    def ready(self):
        from django.db import models
        from unfold.admin import ModelAdmin
        from core.widgets import CustomToggleSwitch

        if not hasattr(ModelAdmin, 'formfield_overrides') or ModelAdmin.formfield_overrides is None:
            ModelAdmin.formfield_overrides = {}
        
        ModelAdmin.formfield_overrides = {
            **ModelAdmin.formfield_overrides,
            models.BooleanField: {'widget': CustomToggleSwitch},
        }
