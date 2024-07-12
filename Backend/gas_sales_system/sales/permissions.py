import requests
from rest_framework.permissions import BasePermission, SAFE_METHODS

from gas_sales_system import settings


class IsRefineryAdminOrDriver(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and (request.user.role in ['refinery_admin', 'driver'])


class IsRefineryAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'refinery_admin'


class IsStationAdminOrSellerAssignedToStation(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role in ['station_admin', 'seller']

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        if request.user.role == 'access_admin':
            return True

        for station in obj.stations.all():
            try:
                token = request.headers.get('Authorization').split(' ')[1]
                headers = {"Authorization": f"Bearer {token}"}
                response = requests.get(f"{settings.ACCESS_SYSTEM_URL}/api/stations/{station.id}/assigned_users/",
                                        headers=headers)
                response.raise_for_status()
                assigned_users = response.json()
                if any(user['id'] == request.user.id for user in assigned_users):
                    return True
            except requests.RequestException:
                return False
        return False


class IsStationAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ['station_admin', 'access_admin']
