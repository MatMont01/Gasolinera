import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'refinery_management.settings')

# Importa get_asgi_application() y llama a django.setup() implícitamente
django_asgi_app = get_asgi_application()

# Ahora es seguro importar tus modelos y consumidores
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import refinery.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            refinery.routing.websocket_urlpatterns
        )
    ),
})