# Generated by Django 5.0.6 on 2024-06-21 19:46

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='FuelType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('price_per_liter', models.DecimalField(decimal_places=2, max_digits=10)),
            ],
        ),
        migrations.CreateModel(
            name='Station',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('latitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('longitude', models.DecimalField(decimal_places=6, max_digits=9)),
            ],
        ),
        migrations.CreateModel(
            name='Pump',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=50)),
                ('fuel_types', models.ManyToManyField(related_name='pumps', to='sales.fueltype')),
                ('station', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pumps', to='sales.station')),
            ],
        ),
        migrations.CreateModel(
            name='Sale',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('invoice_name', models.CharField(max_length=255)),
                ('invoice_nit', models.CharField(max_length=20)),
                ('customer', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=254)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('current_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('quantity', models.DecimalField(decimal_places=2, max_digits=10)),
                ('date_time', models.DateTimeField(auto_now_add=True)),
                ('fuel_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales', to='sales.fueltype')),
                ('pump', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales', to='sales.pump')),
            ],
        ),
        migrations.CreateModel(
            name='FuelStock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.DecimalField(decimal_places=2, max_digits=10)),
                ('fuel_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='fuel_stocks', to='sales.fueltype')),
                ('station', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='fuel_stocks', to='sales.station')),
            ],
        ),
    ]
