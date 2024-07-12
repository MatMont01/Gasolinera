from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TruckViewSet, RouteViewSet, RouteCheckpointViewSet, SolicitudViewSet, FuelTypeViewSet, \
    request_refuel, get_station_location, get_truck_by_driver, mark_checkpoint_delivered, \
    get_checkpoints_by_route, get_route_by_driver

router = DefaultRouter()
router.register(r'trucks', TruckViewSet)
router.register(r'routes', RouteViewSet)
router.register(r'routecheckpoints', RouteCheckpointViewSet)
router.register(r'solicitudes', SolicitudViewSet)
router.register(r'fueltypes', FuelTypeViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('refinery/request_refuel/', request_refuel, name='request_refuel'),
    path('solicitudes/<int:pk>/approve/', SolicitudViewSet.as_view({'post': 'approve'}), name='solicitud-approve'),
    path('routecheckpoints/<int:pk>/deliver/', RouteCheckpointViewSet.as_view({'post': 'deliver'}), name='routecheckpoint-deliver'),
    path('stations/<int:station_id>/location/', get_station_location, name='get_station_location'),
    path('truck/location/', get_truck_by_driver, name='get_truck_by_driver'),
    path('route/<int:route_id>/checkpoints/', get_checkpoints_by_route, name='get_checkpoints_by_route'),
    path('routecheckpoints/<int:checkpoint_id>/deliver/', mark_checkpoint_delivered, name='mark-checkpoint-delivered'),
    path('routes/', get_route_by_driver, name='get_route_by_driver'),
]
