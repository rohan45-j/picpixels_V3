from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone

class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # Accept all connections for now; in production restrict to authenticated users
        await self.accept()
        await self.channel_layer.group_add("notifications", self.channel_name)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("notifications", self.channel_name)

    async def receive_json(self, content, **kwargs):
        # Echo back received messages (placeholder behavior)
        await self.send_json({"message": "Received", "data": content})

    async def notify(self, event):
        # Called when a message is sent to the "notifications" group
        await self.send_json(event["message"])
