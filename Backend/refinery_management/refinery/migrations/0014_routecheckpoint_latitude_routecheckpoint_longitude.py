# Generated by Django 5.0.6 on 2024-07-11 10:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('refinery', '0013_remove_truck_current_location_truck_latitude_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='routecheckpoint',
            name='latitude',
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name='routecheckpoint',
            name='longitude',
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
    ]
