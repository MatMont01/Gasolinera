import json
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from refinery.models import Truck

class TruckLocationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.truck_id = self.scope['url_route']['kwargs']['truck_id']
        self.truck_group_name = f'truck_{self.truck_id}'

        await self.channel_layer.group_add(
            self.truck_group_name,
            self.channel_name
        )
        await self.accept()

        self.send_task = asyncio.create_task(self.send_location_periodically())

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.truck_group_name,
            self.channel_name
        )
        self.send_task.cancel()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        location = text_data_json['location']

        await self.update_truck_location(location)

        await self.channel_layer.group_send(
            self.truck_group_name,
            {
                'type': 'truck_location',
                'location': location
            }
        )

    async def truck_location(self, event):
        location = event['location']
        await self.send(text_data=json.dumps({
            'location': location
        }))

    async def send_location_periodically(self):
        while True:
            await asyncio.sleep(30)
            location = await self.get_truck_location()
            await self.send(text_data=json.dumps({
                'location': location
            }))

    async def update_truck_location(self, location):
        truck = await database_sync_to_async(Truck.objects.get)(id=self.truck_id)
        truck.latitude = location['latitude']
        truck.longitude = location['longitude']
        await database_sync_to_async(truck.save)()

    async def get_truck_location(self):
        truck = await database_sync_to_async(Truck.objects.get)(id=self.truck_id)
        return {
            'latitude': truck.latitude,
            'longitude': truck.longitude
        }
