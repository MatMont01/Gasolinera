# serializers.py
from rest_framework import serializers
from .models import Station, FuelType, Pump, FuelStock, Sale
import requests
from django.conf import settings


class FuelTypeSerializer(serializers.ModelSerializer):
    stations = serializers.PrimaryKeyRelatedField(many=True, queryset=Station.objects.all(), write_only=True)
    station_details = serializers.SerializerMethodField(read_only=True)
    initial_quantity = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True)

    class Meta:
        model = FuelType
        fields = ['id', 'name', 'price_per_liter', 'stations', 'station_details', 'initial_quantity']

    def get_station_details(self, obj):
        return StationSerializer(obj.stations, many=True).data

    def create(self, validated_data):
        stations = validated_data.pop('stations')
        initial_quantity = validated_data.pop('initial_quantity')
        fuel_type = super().create(validated_data)
        fuel_type.stations.set(stations)

        # Crear stock inicial para cada estación asignada
        for station in stations:
            FuelStock.objects.create(station=station, fuel_type=fuel_type, quantity=initial_quantity)

        return fuel_type


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = '__all__'


class PumpSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pump
        fields = '__all__'


class FuelStockSerializer(serializers.ModelSerializer):
    station = StationSerializer(read_only=True)
    fuel_type = FuelTypeSerializer(read_only=True)
    station_id = serializers.IntegerField(write_only=True)
    fuel_type_name = serializers.CharField(write_only=True)
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        model = FuelStock
        fields = ['id', 'station_id', 'fuel_type_name', 'quantity', 'station', 'fuel_type']

    def validate_fuel_type_name(self, value):
        if not FuelType.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("Fuel type not found")
        return value

    def create(self, validated_data):
        station_id = validated_data.get('station_id')
        fuel_type_name = validated_data.get('fuel_type_name')
        quantity = validated_data.get('quantity')

        try:
            station = Station.objects.get(id=station_id)
            fuel_type = FuelType.objects.get(name=fuel_type_name)
        except Station.DoesNotExist:
            raise serializers.ValidationError("Station not found")
        except FuelType.DoesNotExist:
            raise serializers.ValidationError("Fuel type not found")

        fuel_stock, created = FuelStock.objects.get_or_create(station=station, fuel_type=fuel_type)
        fuel_stock.quantity += quantity
        fuel_stock.save()

        return fuel_stock


    def validate_station(self, value):
        user = self.context['request'].user
        try:
            token = self.context['request'].headers.get('Authorization').split(' ')[1]
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{settings.ACCESS_SYSTEM_URL}/api/stations/{value.id}/assigned_users/",
                                    headers=headers)
            response.raise_for_status()
            assigned_users = response.json()
            if not any(u['id'] == user.id for u in assigned_users):
                raise serializers.ValidationError("You do not have permission to assign stock to this station.")
        except requests.RequestException as e:
            raise serializers.ValidationError(f"Failed to validate station assignment: {str(e)}")
        return value


class SaleSerializer(serializers.ModelSerializer):
    fuel_type_name = serializers.CharField(source='fuel_type.name', read_only=True)
    fuel_type = serializers.CharField()

    class Meta:
        model = Sale
        fields = ['id', 'invoice_name', 'invoice_nit', 'customer', 'email', 'amount', 'current_price', 'quantity',
                  'date_time', 'is_canceled', 'fuel_type', 'fuel_type_name', 'pump']
        read_only_fields = ['fuel_type_name']

    def validate(self, data):
        try:
            pump = Pump.objects.get(id=data['pump'])
        except Pump.DoesNotExist:
            raise serializers.ValidationError("Pump not found")

        try:
            fuel_type = FuelType.objects.get(name=data['fuel_type'])
        except FuelType.DoesNotExist:
            raise serializers.ValidationError("Fuel type not found")

        if not pump.fuel_types.filter(id=fuel_type.id).exists():
            raise serializers.ValidationError("Fuel type not available in the specified pump")

        return data
