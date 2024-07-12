# models.py
from django.db import models


class Station(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)


class FuelType(models.Model):
    name = models.CharField(max_length=255, unique=True)
    price_per_liter = models.DecimalField(max_digits=10, decimal_places=2)
    stations = models.ManyToManyField(Station, related_name='fuel_types')


class Pump(models.Model):
    code = models.CharField(max_length=50)
    station = models.ForeignKey(Station, related_name='pumps', on_delete=models.CASCADE)
    fuel_types = models.ManyToManyField(FuelType, related_name='pumps')


class FuelStock(models.Model):
    station = models.ForeignKey(Station, related_name='fuel_stocks', on_delete=models.CASCADE)
    fuel_type = models.ForeignKey(FuelType, related_name='fuel_stocks', on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)


class Sale(models.Model):
    invoice_name = models.CharField(max_length=255)
    invoice_nit = models.CharField(max_length=20)
    customer = models.CharField(max_length=255)
    email = models.EmailField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    fuel_type = models.ForeignKey(FuelType, related_name='sales', on_delete=models.CASCADE)
    pump = models.ForeignKey(Pump, related_name='sales', on_delete=models.CASCADE)
    date_time = models.DateTimeField(auto_now_add=True)
    is_canceled = models.BooleanField(default=False)
