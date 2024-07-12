import logging
import requests
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import ValidationError
from .models import Truck, Route, RouteCheckpoint, Solicitud, FuelType
from .serializers import TruckSerializer, RouteSerializer, RouteCheckpointSerializer, SolicitudSerializer, \
    FuelTypeSerializer
from .permissions import IsRefineryAdminOrDriver

logger = logging.getLogger(__name__)


class FuelTypeViewSet(viewsets.ModelViewSet):
    queryset = FuelType.objects.all()
    serializer_class = FuelTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class TruckViewSet(viewsets.ModelViewSet):
    queryset = Truck.objects.all()
    serializer_class = TruckSerializer
    permission_classes = [IsRefineryAdminOrDriver]

    def perform_create(self, serializer):
        driver_id = serializer.validated_data.get('driver_id')
        if driver_id:
            try:
                token = self.request.headers.get('Authorization').split(' ')[1]
                headers = {"Authorization": f"Bearer {token}"}
                response = requests.get(f"http://localhost:8000/api/users/role/driver/", headers=headers)
                response.raise_for_status()
                drivers = response.json()
                if not any(driver['id'] == driver_id for driver in drivers):
                    raise ValidationError("Invalid driver ID: The user is not a driver")
            except requests.RequestException as e:
                raise ValidationError(f"Invalid driver ID: {str(e)}")
        plate = serializer.validated_data.get('plate')
        if Truck.objects.filter(plate=plate).exists():
            raise ValidationError("A truck with this plate already exists.")
        serializer.save()

    @action(detail=True, methods=['post'])
    def release_truck(self, request, pk=None):
        truck = self.get_object()
        truck.in_use = False
        truck.save()
        return Response({'status': 'Truck released'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_truck_by_driver(request):
    logger.info(f"Fetching truck for driver ID: {request.user.id}")
    try:
        driver_id = request.user.id
        truck = Truck.objects.get(driver_id=driver_id)
        serializer = TruckSerializer(truck)
        return Response(serializer.data)
    except Truck.DoesNotExist:
        return Response({'error': 'Truck not found'}, status=404)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return Response({'error': 'Unexpected error occurred'}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_station_location(request, station_id):
    logger.info(f"Fetching location for station ID: {station_id}")
    try:
        response = requests.get(f'http://localhost:8001/api/stations/{station_id}/location/')
        response.raise_for_status()
        return Response(response.json(), status=response.status_code)
    except requests.RequestException as e:
        logger.error(f"Failed to fetch station location: {e}")
        return Response({'error': 'Failed to fetch station location'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return Response({'error': 'Unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsRefineryAdminOrDriver])
def mark_checkpoint_delivered(request, checkpoint_id):
    logger.info(f"Marking checkpoint ID {checkpoint_id} as delivered")
    logger.info(f"Request data: {request.data}")
    logger.info(f"Request headers: {request.headers}")
    try:
        checkpoint = RouteCheckpoint.objects.select_related('route__fuel_type').get(id=checkpoint_id)
        if not checkpoint.route or not checkpoint.route.fuel_type:
            logger.error("Missing route or fuel type in checkpoint")
            return Response({'error': 'Missing route or fuel type in checkpoint'}, status=status.HTTP_400_BAD_REQUEST)

        checkpoint.delivered = True
        checkpoint.save()

        token = request.headers.get('Authorization').split(' ')[1]
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        data = {
            "station_id": request.data.get('station_id'),
            "fuel_type_name": request.data.get('fuel_type_name'),
            "quantity": float(request.data.get('quantity'))
        }

        logger.info(f"Sending data to sales API: {data}")

        response = requests.post("http://localhost:8001/api/fuelstocks/add/", json=data, headers=headers)

        if response.status_code not in [200, 201]:
            logger.error(f"Failed to update stock in sales API: {response.status_code} {response.content}")
            return Response({'error': 'Failed to update stock in sales API'}, status=response.status_code)

        checkpoint.route.check_completion()

        logger.info(f"Checkpoint {checkpoint_id} marked as delivered")
        return Response({'status': 'Checkpoint delivered'}, status=status.HTTP_200_OK)
    except RouteCheckpoint.DoesNotExist:
        logger.error("Checkpoint not found")
        return Response({'error': 'Checkpoint not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return Response({'error': 'Unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsRefineryAdminOrDriver]

    def create(self, request, *args, **kwargs):
        truck_id = request.data.get('truck')
        date = request.data.get('date')
        name = request.data.get('name')
        fuel_type_id = request.data.get('fuel_type')
        liters = request.data.get('liters')

        if not truck_id or not date or not name or not fuel_type_id or not liters:
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            truck = Truck.objects.get(id=truck_id)
        except Truck.DoesNotExist:
            return Response({'error': 'Truck not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            fuel_type = FuelType.objects.get(id=fuel_type_id)
        except FuelType.DoesNotExist:
            return Response({'error': 'Fuel type not found'}, status=status.HTTP_404_NOT_FOUND)

        price_per_liter = fuel_type.price_per_liter

        route = Route.objects.create(
            truck=truck,
            date=date,
            name=name,
            fuel_type=fuel_type,
            liters=liters,
            price_per_liter=price_per_liter
        )

        return Response(RouteSerializer(route).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        route = self.get_object()
        route.completed = True
        route.save()
        return Response({'status': 'Route completed'}, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        truck_id = request.query_params.get('truck')
        if truck_id:
            queryset = self.get_queryset().filter(truck_id=truck_id)
        else:
            queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def user_routes(self, request):
        user = request.user
        if user.role == 'driver':
            routes = Route.objects.filter(truck__driver_id=user.id)
        elif user.role == 'refinery_admin':
            routes = Route.objects.all()
        else:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(routes, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_route_by_driver(request):
    logger.info(f"Fetching routes for driver: {request.user.email}")
    try:
        driver_email = request.user.email
        routes = Route.objects.filter(truck__driver__email=driver_email)
        serializer = RouteSerializer(routes, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return Response({'error': 'Unexpected error occurred'}, status=500)


class RouteCheckpointViewSet(viewsets.ModelViewSet):
    queryset = RouteCheckpoint.objects.all()
    serializer_class = RouteCheckpointSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        station_id = request.data.get('station_id')
        if not station_id:
            return Response({'error': 'Station ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = request.headers.get('Authorization').split(' ')[1]
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"http://localhost:8001/api/stations/{station_id}/location/", headers=headers)
            response.raise_for_status()
            station_data = response.json()
            latitude = station_data['latitude']
            longitude = station_data['longitude']
        except requests.RequestException as e:
            logger.error(f"Failed to fetch station location: {e}")
            return Response({'error': 'Failed to fetch station location'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        request.data['latitude'] = latitude
        request.data['longitude'] = longitude

        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def deliver(self, request, pk=None):
        logger.info(f"Marking checkpoint ID {pk} as delivered")
        try:
            checkpoint = self.get_object()
            checkpoint.delivered = True
            checkpoint.save()

            token = request.headers.get('Authorization').split(' ')[1]
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            data = {
                "station_id": checkpoint.station_id,
                "fuel_type_id": checkpoint.route.fuel_type.id if checkpoint.route and checkpoint.route.fuel_type else None,
                "quantity": float(checkpoint.liters_delivered)  # Convertir Decimal a float
            }

            if not data["fuel_type_id"]:
                logger.error("Fuel type ID is missing")
                return Response({'error': 'Fuel type ID is missing'}, status=status.HTTP_400_BAD_REQUEST)

            response = requests.post("http://localhost:8001/api/fuelstocks/add/", json=data, headers=headers)

            if response.status_code not in [200, 201]:
                logger.error(f"Failed to update stock in sales API: {response.status_code} {response.content}")
                return Response({'error': 'Failed to update stock in sales API'}, status=response.status_code)

            checkpoint.route.check_completion()

            logger.info(f"Checkpoint {pk} marked as delivered")
            return Response({'status': 'Checkpoint delivered'}, status=status.HTTP_200_OK)
        except RouteCheckpoint.DoesNotExist:
            logger.error("Checkpoint not found")
            return Response({'error': 'Checkpoint not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return Response({'error': 'Unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_checkpoints_by_route(request, route_id):
    logger.info(f"Fetching checkpoints for route ID: {route_id}")
    try:
        checkpoints = RouteCheckpoint.objects.filter(route_id=route_id)
        if not checkpoints:
            return Response({'error': 'No checkpoints found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = RouteCheckpointSerializer(checkpoints, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return Response({'error': 'Unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_checkpoints_by_route(request, route_id):
    logger.info(f"Fetching checkpoints for route ID: {route_id}")
    try:
        checkpoints = RouteCheckpoint.objects.filter(route_id=route_id)
        if not checkpoints:
            return Response({'error': 'No checkpoints found'}, status=status.HTTP_404_NOT_FOUND)

        station_locations = {}
        token = request.headers.get('Authorization').split(' ')[1]
        headers = {"Authorization": f"Bearer {token}"}

        for checkpoint in checkpoints:
            station_id = checkpoint.station_id
            if station_id not in station_locations:
                try:
                    logger.info(f"Fetching location for station ID: {station_id}")
                    response = requests.get(f"http://localhost:8001/api/stations/{station_id}/location/",
                                            headers=headers)
                    response.raise_for_status()
                    station_location = response.json()
                    station_locations[station_id] = station_location
                    logger.info(f"Station location fetched: {station_location}")
                except requests.RequestException as e:
                    logger.error(f"Failed to fetch station location for station ID {station_id}: {e}")
                    return Response({'error': f'Failed to fetch station location for station ID {station_id}'},
                                    status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            checkpoint.latitude = float(station_locations[station_id]['latitude'])
            checkpoint.longitude = float(station_locations[station_id]['longitude'])
            checkpoint.save()

        serializer = RouteCheckpointSerializer(checkpoints, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return Response({'error': 'Unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SolicitudViewSet(viewsets.ModelViewSet):
    queryset = Solicitud.objects.all()
    serializer_class = SolicitudSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        solicitud = self.get_object()
        logger.info('Approving solicitud with ID: %s', solicitud.id)
        logger.info('Solicitud data: %s', solicitud.__dict__)

        if solicitud.approved:
            logger.warning('Solicitud already approved: %s', solicitud.id)
            return Response({'error': 'Solicitud already approved'}, status=status.HTTP_400_BAD_REQUEST)

        # Buscar una ruta existente que aún no haya salido
        existing_route = Route.objects.filter(fuel_type=solicitud.fuel_type, completed=False).first()

        if existing_route:
            logger.info('Found existing route: %s', existing_route.id)
            RouteCheckpoint.objects.create(
                route=existing_route,
                station_id=solicitud.station_id,
                liters_delivered=solicitud.liters,
                delivered=False
            )
            solicitud.route = existing_route
            solicitud.approved = True
            solicitud.save()
            logger.info('Solicitud approved and assigned to existing route: %s', solicitud.id)
            return Response({'status': 'Solicitud approved and assigned to existing route'}, status=status.HTTP_200_OK)
        else:
            logger.warning('No existing route found for solicitud: %s', solicitud.id)
            return Response({'error': 'No existing route found. Please create a route first.'},
                            status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_refuel(request):
    station_id = request.data.get('station_id')
    fuel_type_name = request.data.get('fuel_type_name')
    pump_id = request.data.get('pump_id')
    liters = request.data.get('liters', 1000)

    logger.info('Received refuel request with data: station_id=%s, fuel_type_name=%s, pump_id=%s, liters=%s',
                station_id, fuel_type_name, pump_id, liters)

    if not station_id or not fuel_type_name or not pump_id:
        logger.warning('All fields are required')
        return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        fuel_type = FuelType.objects.get(name=fuel_type_name)
    except FuelType.DoesNotExist:
        logger.warning('Fuel type not found: %s', fuel_type_name)
        return Response({'error': 'Fuel type not found'}, status=status.HTTP_404_NOT_FOUND)

    solicitud = Solicitud.objects.create(
        station_id=station_id,
        fuel_type=fuel_type,
        pump_id=pump_id,
        liters=liters
    )

    logger.info('Solicitud created successfully: %s', solicitud.id)
    return Response({'status': 'Solicitud created successfully'}, status=status.HTTP_201_CREATED)
