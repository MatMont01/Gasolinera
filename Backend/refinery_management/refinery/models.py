from django.db import models

class FuelType(models.Model):
    name = models.CharField(max_length=255, unique=True)
    price_per_liter = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class Truck(models.Model):
    plate = models.CharField(max_length=20, unique=True)
    driver_id = models.IntegerField(null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, default=0)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, default=0)
    in_use = models.BooleanField(default=False)

    def __str__(self):
        return self.plate

class Route(models.Model):
    truck = models.ForeignKey(Truck, related_name='routes', on_delete=models.CASCADE)
    date = models.DateField()
    name = models.CharField(max_length=255)
    fuel_type = models.ForeignKey(FuelType, on_delete=models.CASCADE)
    liters = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_liter = models.DecimalField(max_digits=10, decimal_places=2)
    completed = models.BooleanField(default=False)

    def check_completion(self):
        if all(cp.delivered for cp in self.checkpoints.all()):
            self.completed = True
            self.save()

class RouteCheckpoint(models.Model):
    route = models.ForeignKey(Route, related_name='checkpoints', on_delete=models.CASCADE)
    station_id = models.IntegerField()
    liters_delivered = models.DecimalField(max_digits=10, decimal_places=2)
    delivered = models.BooleanField(default=False)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    station_name = models.CharField(max_length=100, null=True, blank=True)
    route_name = models.CharField(max_length=100, null=True, blank=True)

class Solicitud(models.Model):
    station_id = models.IntegerField()
    pump_id = models.IntegerField()
    fuel_type = models.ForeignKey(FuelType, on_delete=models.CASCADE)
    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    route = models.ForeignKey(Route, related_name='solicitudes', on_delete=models.SET_NULL, null=True, blank=True)
    liters = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
