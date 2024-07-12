from django.urls import re_path
from .consumers import TruckLocationConsumer

websocket_urlpatterns = [
    re_path(r'ws/trucks/(?P<truck_id>\d+)/$', TruckLocationConsumer.as_asgi()),
]
