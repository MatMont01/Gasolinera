from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from .views import StationViewSet, CustomUserViewSet

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)
router.register(r'stations', StationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('users/assigned_stations/', CustomUserViewSet.as_view({'get': 'get_assigned_stations'}),
         name='assigned_stations'),
]
