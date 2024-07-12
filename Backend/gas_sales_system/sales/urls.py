from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StationViewSet, FuelTypeViewSet, PumpViewSet, FuelStockViewSet, SaleViewSet, get_station_location

router = DefaultRouter()
router.register(r'stations', StationViewSet)
router.register(r'fueltypes', FuelTypeViewSet)
router.register(r'pumps', PumpViewSet)
router.register(r'fuelstocks', FuelStockViewSet)
router.register(r'sales', SaleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('fuelstocks/add/', FuelStockViewSet.as_view({'post': 'add_fuel_stock'}), name='add-fuel-stock'),
    path('sales/<int:pk>/cancel_sale/', SaleViewSet.as_view({'post': 'cancel_sale'}), name='cancel-sale'),
    path('stations/<int:station_id>/location/', get_station_location, name='get_station_location'),

]
