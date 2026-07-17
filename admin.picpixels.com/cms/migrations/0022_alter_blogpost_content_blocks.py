from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0021_alter_blogcontentsection_template'),
    ]

    operations = [
        migrations.AlterField(
            model_name='blogpost',
            name='content_blocks',
            field=models.JSONField(blank=True, default=list, help_text='Modular content blocks array. Supported types: heading, text, image, image_with_text, gallery, code, callout, faq, list, table, step, divider, stats, quote, cta, full_width_image'),
        ),
    ]
