from django.db import models


class NavigationItem(models.Model):
    LOCATION_CHOICES = [
        ('header', 'Header'),
        ('footer', 'Footer'),
        ('mega_menu', 'Mega Menu'),
    ]
    label = models.CharField(max_length=100)
    url = models.CharField(max_length=500, blank=True, help_text='Internal path or external URL')
    location = models.CharField(max_length=20, choices=LOCATION_CHOICES, default='header')
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True,
        related_name='children',
    )
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)
    opens_in_new_tab = models.BooleanField(default=False)
    icon = models.CharField(max_length=50, blank=True, help_text='Material icon name')
    css_class = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['location', 'parent_id', 'order']
        verbose_name = 'Navigation Item'
        verbose_name_plural = 'Navigation Items'

    def __str__(self):
        return self.label
