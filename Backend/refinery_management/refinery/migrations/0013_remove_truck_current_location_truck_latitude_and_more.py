# Generated by Django 5.0.6 on 2024-07-11 03:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('refinery', '0012_solicitud_liters'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='truck',
            name='current_location',
        ),
        migrations.AddField(
            model_name='truck',
            name='latitude',
            field=models.DecimalField(decimal_places=6, default=0, max_digits=9),
        ),
        migrations.AddField(
            model_name='truck',
            name='longitude',
            field=models.DecimalField(decimal_places=6, default=0, max_digits=9),
        ),
    ]
