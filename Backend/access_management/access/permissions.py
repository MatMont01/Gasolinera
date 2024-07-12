from rest_framework.permissions import BasePermission


class IsAccessAdminOrReadOnly(BasePermission):

    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return request.user.is_authenticated

        return request.user.is_authenticated and request.user.role == 'access_admin'

    def has_object_permission(self, request, view, obj):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return request.user.is_authenticated

        return request.user.is_authenticated and request.user.role == 'access_admin'
