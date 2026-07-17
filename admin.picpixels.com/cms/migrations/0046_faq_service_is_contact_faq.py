from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0045_whychoosefeaturesection_whychoosefeatureitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='faq',
            name='is_contact_faq',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='faq',
            name='service',
            field=models.ForeignKey(
                null=True, blank=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='faqs', to='cms.service',
            ),
        ),
    ]
