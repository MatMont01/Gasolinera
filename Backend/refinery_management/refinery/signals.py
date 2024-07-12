from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import RouteCheckpoint, FuelType
import requests


def get_access_token():
    url = "http://localhost:8000/api/token/"
    data = {
        "username": "root",
        "password": "root"
    }
    response = requests.post(url, json=data)
    if response.status_code == 200:
        return response.json().get('access')
    return None


@receiver(post_save, sender=RouteCheckpoint)
def notify_checkpoint_change(sender, instance, created, **kwargs):
    token = get_access_token()
    if not token:
        print("Failed to get access token")
        return

    url = "http://localhost:8001/api/stations/update_price/"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    if created and instance.delivered:
        route = instance.route
        data = {
            "station_id": instance.station_id,
            "fuel_type_id": route.fuel_type.id,
            "new_price": float(route.price_per_liter)
        }
        response = requests.post(url, json=data, headers=headers)

        if response.status_code not in [200, 201]:
            print(f"Failed to notify sales API: {response.status_code} {response.content}")


@receiver(post_delete, sender=RouteCheckpoint)
def notify_checkpoint_delete(sender, instance, **kwargs):
    token = get_access_token()
    if not token:
        print("Failed to get access token")
        return

    url = f"http://localhost:8001/api/stations/{instance.station_id}/"
    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = requests.delete(url, headers=headers)

    if response.status_code != 204:
        print(f"Failed to notify sales API: {response.status_code} {response.content}")
