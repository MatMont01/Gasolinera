# Generated by Django 5.0.6 on 2024-07-09 11:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('refinery', '0011_alter_fueltype_name_alter_route_fuel_type_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='solicitud',
            name='liters',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10),
        ),
    ]
