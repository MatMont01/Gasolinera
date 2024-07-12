import requests
from rest_framework import serializers
from .models import Truck, Route, RouteCheckpoint, Solicitud, FuelType

class FuelTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FuelType
        fields = '__all__'

class TruckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Truck
        fields = '__all__'

    def validate_plate(self, value):
        if Truck.objects.filter(plate=value).exists():
            raise serializers.ValidationError("A truck with this plate already exists.")
        return value

class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ['id', 'truck', 'date', 'name', 'fuel_type', 'liters', 'price_per_liter', 'completed']


class RouteCheckpointSerializer(serializers.ModelSerializer):
    fuel_type_name = serializers.CharField(source='route.fuel_type.name', read_only=True)

    class Meta:
        model = RouteCheckpoint
        fields = ['id', 'station_id', 'liters_delivered', 'delivered', 'route', 'station_name', 'route_name', 'latitude', 'longitude', 'fuel_type_name']

    def get_station_name(self, obj):
        try:
            response = requests.get(f"http://localhost:8001/api/stations/{obj.station_id}/")
            if response.status_code == 200:
                return response.json().get('name')
        except requests.RequestException:
            return None

    def get_route_name(self, obj):
        return obj.route.name

class SolicitudSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solicitud
        fields = '__all__'
