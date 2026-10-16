from django.apps import AppConfig


class CmsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'cms'
    verbose_name = 'CMS'

    def ready(self):
        # Connect revalidation signals for all content models
        from core.revalidation_signals import connect_all_revalidation_signals
        connect_all_revalidation_signals()
