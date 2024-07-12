from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import CustomUser, Station
from .serializers import CustomUserSerializer, StationSerializer, CustomTokenObtainPairSerializer
from .permissions import IsAccessAdminOrReadOnly
from django.dispatch import Signal
from django.contrib.auth.hashers import make_password

station_changed = Signal()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated, IsAccessAdminOrReadOnly]

    def perform_create(self, serializer):
        station_id = self.request.data.get('assigned_station')
        if station_id:
            try:
                station = Station.objects.get(id=station_id)
                serializer.save(password=make_password(serializer.validated_data['password']), is_active=True,
                                assigned_station=station)
            except Station.DoesNotExist:
                return Response({'error': 'Station not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            serializer.save(password=make_password(serializer.validated_data['password']), is_active=True)

    def perform_update(self, serializer):
        station_id = self.request.data.get('assigned_station')
        if station_id:
            try:
                station = Station.objects.get(id=station_id)
                if 'password' in serializer.validated_data:
                    serializer.save(password=make_password(serializer.validated_data['password']),
                                    assigned_station=station)
                else:
                    serializer.save(assigned_station=station)
            except Station.DoesNotExist:
                return Response({'error': 'Station not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            if 'password' in serializer.validated_data:
                serializer.save(password=make_password(serializer.validated_data['password']))
            else:
                serializer.save()

    @action(detail=False, methods=['get'], url_path='role/(?P<role>[^/.]+)')
    def get_users_by_role(self, request, role=None):
        users = CustomUser.objects.filter(role=role)
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='assigned_stations')
    def get_assigned_stations(self, request):
        user = request.user
        if user.assigned_station:
            serializer = StationSerializer(user.assigned_station, many=False)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'No stations assigned to this user'}, status=status.HTTP_404_NOT_FOUND)


class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer
    permission_classes = [IsAuthenticated, IsAccessAdminOrReadOnly]

    def perform_create(self, serializer):
        instance = serializer.save()

    def perform_update(self, serializer):
        instance = serializer.save()

    def perform_destroy(self, instance):
        instance.delete()

    @action(detail=True, methods=['get'], url_path='assigned_users')
    def assigned_users(self, request, pk=None):
        try:
            station = self.get_object()
            users = station.assigned_users.all()
            serializer = CustomUserSerializer(users, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Station.DoesNotExist:
            return Response({'error': 'Station not found'}, status=status.HTTP_404_NOT_FOUND)
