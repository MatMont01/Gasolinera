from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsRefineryAdminOrDriver(BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return request.user.is_authenticated
        return request.user.is_authenticated and (request.user.role in ['refinery_admin', 'driver'])

class IsRefineryAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'refinery_admin'

class IsStationAdminOrSellerAssignedToStation(BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role in ['station_admin', 'seller', 'access_admin']

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and (
                request.user.role == 'access_admin' or obj.station.assigned_users.filter(
            id=request.user.id).exists())

class IsStationAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role in ['station_admin', 'access_admin']


    class IsAuthenticatedOrReadOnly(BasePermission):
        def has_permission(self, request, view):
            if request.method in SAFE_METHODS:
                return request.user.is_authenticated
            return request.user.is_authenticated and (
                        request.user.role in ['refinery_admin', 'driver', 'station_admin'])
