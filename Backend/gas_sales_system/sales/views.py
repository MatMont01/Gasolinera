import requests
from django.utils import timezone
from django.core.cache import cache
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS, AllowAny
from rest_framework.response import Response

from gas_sales_system import settings
from .models import Station, FuelType, Pump, FuelStock, Sale
from .serializers import StationSerializer, FuelTypeSerializer, PumpSerializer, FuelStockSerializer, SaleSerializer
from .permissions import IsStationAdminOrSellerAssignedToStation, IsStationAdmin


# views.py
from rest_framework.permissions import AllowAny

class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['get'], url_path='fuel-types', permission_classes=[AllowAny])
    def get_fuel_types(self, request, pk=None):
        station = self.get_object()
        fuel_types = FuelType.objects.filter(stations=station)
        serializer = FuelTypeSerializer(fuel_types, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='station-stocks', permission_classes=[AllowAny])
    def get_station_stocks(self, request, pk=None):
        try:
            station = Station.objects.get(pk=pk)
            stocks = FuelStock.objects.filter(station=station)
            if not stocks.exists():
                return Response({'error': 'No FuelStock matches the given query.'}, status=status.HTTP_404_NOT_FOUND)
            serializer = FuelStockSerializer(stocks, many=True)
            return Response(serializer.data)
        except Station.DoesNotExist:
            return Response({'error': 'Station not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_station_location(request, station_id):
    logger.info(f"Fetching location for station ID: {station_id}")
    try:
        station = Station.objects.get(id=station_id)
        data = {
            "latitude": station.latitude,
            "longitude": station.longitude
        }
        return Response(data, status=status.HTTP_200_OK)
    except Station.DoesNotExist:
        return Response({'error': 'Station not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return Response({'error': 'Unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FuelTypeViewSet(viewsets.ModelViewSet):
    queryset = FuelType.objects.all()
    serializer_class = FuelTypeSerializer
    permission_classes = [IsAuthenticated, IsStationAdminOrSellerAssignedToStation]

    def create(self, request, *args, **kwargs):
        stations = request.data.get('stations', [])
        fuel_type_name = request.data.get('name')
        initial_quantity = request.data.get('initial_quantity')
        valid_stations = []

        token = request.headers.get('Authorization').split(' ')[1]
        headers = {"Authorization": f"Bearer {token}"}

        for station_id in stations:
            try:
                station = Station.objects.get(id=station_id)
                response = requests.get(f"{settings.ACCESS_SYSTEM_URL}/api/stations/{station_id}/assigned_users/",
                                        headers=headers)
                response.raise_for_status()
                assigned_users = response.json()
                if any(user['id'] == request.user.id for user in assigned_users):
                    valid_stations.append(station)
                else:
                    return Response(
                        {'error': f'You do not have permission to assign fuel type to station {station_id}'},
                        status=status.HTTP_403_FORBIDDEN)
            except Station.DoesNotExist:
                return Response({'error': f'Station {station_id} not found'}, status=status.HTTP_404_NOT_FOUND)

        response = requests.get(f"{settings.REFINERY_API_URL}/fueltypes/")
        if response.status_code == 200:
            fuel_types = response.json()
            fuel_type_data = next((ft for ft in fuel_types if ft['name'].lower() == fuel_type_name.lower()), None)
            if not fuel_type_data:
                return Response({'error': f'Fuel type {fuel_type_name} not found in refinery API'},
                                status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'Error connecting to refinery API'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        fuel_type, created = FuelType.objects.get_or_create(
            name=fuel_type_data['name'],
            defaults={'price_per_liter': fuel_type_data['price_per_liter']}
        )
        fuel_type.stations.set(valid_stations)
        fuel_type.save()

        # Crear stock inicial para cada estación asignada
        for station in valid_stations:
            FuelStock.objects.create(station=station, fuel_type=fuel_type, quantity=initial_quantity)

        return Response(FuelTypeSerializer(fuel_type).data, status=status.HTTP_201_CREATED)


class PumpViewSet(viewsets.ModelViewSet):
    queryset = Pump.objects.all()
    serializer_class = PumpSerializer
    permission_classes = [IsAuthenticated, IsStationAdmin]


class FuelStockViewSet(viewsets.ModelViewSet):
    queryset = FuelStock.objects.all()
    serializer_class = FuelStockSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='add')
    def add_fuel_stock(self, request):
        try:
            station_id = request.data.get('station_id')
            fuel_type_name = request.data.get('fuel_type_name')
            quantity = float(request.data.get('quantity'))

            if not station_id or not fuel_type_name or not quantity:
                return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

            fuel_type = FuelType.objects.get(name=fuel_type_name)
            fuel_stock, created = FuelStock.objects.get_or_create(station_id=station_id, fuel_type=fuel_type)
            fuel_stock.quantity += quantity
            fuel_stock.save()

            return Response(FuelStockSerializer(fuel_stock).data, status=status.HTTP_200_OK)
        except FuelType.DoesNotExist:
            return Response({'error': 'Fuel type not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


import logging

logger = logging.getLogger(__name__)


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().order_by('-date_time')
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated, IsStationAdminOrSellerAssignedToStation]

    def create(self, request, *args, **kwargs):
        data = request.data
        token = None

        try:
            logger.info('Sale Data: %s', data)
            pump = Pump.objects.get(id=data['pump'])
            fuel_type_name = data['fuel_type']
            fuel_type = FuelType.objects.get(name=fuel_type_name)

            if not pump.fuel_types.filter(id=fuel_type.id).exists():
                logger.error('Fuel type not available in the specified pump')
                return Response({'error': 'Fuel type not available in the specified pump'},
                                status=status.HTTP_400_BAD_REQUEST)

            stock = FuelStock.objects.get(station=pump.station, fuel_type=fuel_type)

            if stock.quantity < data['quantity']:
                logger.error('Not enough stock')
                return Response({'error': 'Not enough stock'}, status=status.HTTP_400_BAD_REQUEST)

            price_per_liter = cache.get(f'fuel_price_{fuel_type.id}')
            if not price_per_liter:
                try:
                    token = self.request.headers.get('Authorization').split(' ')[1]
                    headers = {"Authorization": f"Bearer {token}"}
                    response = requests.get(f"{settings.REFINERY_API_URL}/fueltypes/", headers=headers)
                    response.raise_for_status()
                    fuel_types = response.json()
                    fuel_type_data = next((ft for ft in fuel_types if ft['name'].lower() == fuel_type_name.lower()),
                                          None)
                    if not fuel_type_data:
                        logger.error('Fuel type not found in refinery API')
                        return Response({'error': 'Fuel type not found in refinery API'},
                                        status=status.HTTP_404_NOT_FOUND)
                    price_per_liter = fuel_type_data['price_per_liter']
                    cache.set(f'fuel_price_{fuel_type.id}', price_per_liter, timeout=3600)
                except requests.RequestException as e:
                    logger.error('Failed to get fuel type price: %s', str(e))
                    return Response({'error': f'Failed to get fuel type price: {str(e)}'},
                                    status=status.HTTP_400_BAD_REQUEST)

            amount = float(data['quantity']) * float(price_per_liter)

            stock.quantity -= data['quantity']
            stock.save()

            date_time = data.get('date_time', timezone.now())

            sale = Sale.objects.create(
                invoice_name=data['invoice_name'],
                invoice_nit=data['invoice_nit'],
                customer=data['customer'],
                email=data['email'],
                amount=amount,
                current_price=price_per_liter,
                quantity=data['quantity'],
                fuel_type=fuel_type,
                pump=pump,
                date_time=date_time
            )

            if stock.quantity == 0:
                if not token:
                    token = self.request.headers.get('Authorization').split(' ')[1]
                self.request_refuel(pump.station.id, fuel_type.name, pump.id, token,
                                    1000)  # Establecer 1000 litros por defecto

            return Response(SaleSerializer(sale).data, status=status.HTTP_201_CREATED)
        except Pump.DoesNotExist:
            logger.error('Pump not found')
            return Response({'error': 'Pump not found'}, status=status.HTTP_404_NOT_FOUND)
        except FuelType.DoesNotExist:
            logger.error('Fuel type not found')
            return Response({'error': 'Fuel type not found'}, status=status.HTTP_404_NOT_FOUND)
        except FuelStock.DoesNotExist:
            logger.error('Fuel stock not found for the specified station and fuel type')
            return Response({'error': 'Fuel stock not found for the specified station and fuel type'},
                            status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error('Unexpected error: %s', str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def request_refuel(self, station_id, fuel_type_name, pump_id, token, liters=1000):
        try:
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            data = {
                "station_id": station_id,
                "fuel_type_name": fuel_type_name,
                "pump_id": pump_id,
                "liters": liters
            }
            logger.info('Requesting refuel with data: %s', data)

            response = requests.post(f"{settings.REFINERY_API_URL}/refinery/request_refuel/", json=data,
                                     headers=headers)
            response.raise_for_status()
            logger.info('Refuel request sent successfully')
        except requests.RequestException as e:
            logger.error('Failed to request refuel: %s', str(e))
            logger.error('Request Data: %s', data)
            logger.error('Response Status Code: %s', e.response.status_code)
            logger.error('Response Content: %s', e.response.content)

    @action(detail=True, methods=['post'], url_path='cancel_sale')
    def cancel_sale(self, request, pk=None):
        try:
            sale = Sale.objects.get(id=pk)
            if sale.is_canceled:
                return Response({'error': 'Sale already canceled'}, status=status.HTTP_400_BAD_REQUEST)

            stock = FuelStock.objects.get(station=sale.pump.station, fuel_type=sale.fuel_type)
            stock.quantity += sale.quantity
            stock.save()

            sale.is_canceled = True
            sale.save()

            return Response(SaleSerializer(sale).data, status=status.HTTP_200_OK)
        except Sale.DoesNotExist:
            return Response({'error': 'Sale not found'}, status=status.HTTP_404_NOT_FOUND)
        except FuelStock.DoesNotExist:
            return Response({'error': 'Fuel stock not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
