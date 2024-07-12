# signals.py
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, post_delete, post_migrate
from django.dispatch import receiver
from .models import Station
import requests


def get_access_token():
    url = "http://localhost:8000/api/token/"
    data = {
        "email": "root@gmail.com",
        "password": "root"
    }
    response = requests.post(url, json=data)
    if response.status_code == 200:
        return response.json().get('access')
    return None


@receiver(post_save, sender=Station)
def notify_station_change(sender, instance, created, **kwargs):
    token = get_access_token()
    if not token:
        print("Failed to get access token")
        return

    url = "http://localhost:8001/api/stations/"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    data = {
        "id": instance.id,
        "name": instance.name,
        "latitude": str(instance.latitude),
        "longitude": str(instance.longitude)
    }

    if created:
        response = requests.post(url, json=data, headers=headers)
    else:
        response = requests.put(f"{url}{instance.id}/", json=data, headers=headers)

    if response.status_code not in [200, 201]:
        print(f"Failed to notify sales API: {response.status_code} {response.content}")


@receiver(post_delete, sender=Station)
def notify_station_delete(sender, instance, **kwargs):
    token = get_access_token()
    if not token:
        print("Failed to get access token")
        return

    url = f"http://localhost:8001/api/stations/{instance.id}/"
    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = requests.delete(url, headers=headers)

    if response.status_code != 204:
        print(f"Failed to notify sales API: {response.status_code} {response.content}")


@receiver(post_migrate)
def create_default_access_admin(sender, **kwargs):
    User = get_user_model()
    if not User.objects.filter(email='root@gmail.com').exists():
        User.objects.create_superuser(
            username='root',
            password='root',
            email='root@gmail.com',
            role='access_admin'
        )
