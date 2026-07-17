from rest_framework import serializers
from .models import Order, OrderItem
from .services import calculate_order_price

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    uploaded_files = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Order
        fields = (
            'id', 'profile', 'workflow_template', 'order_type', 'status',
            'turnaround_speed_hours', 'unit_price', 'total_images', 'total_price',
            'special_instructions', 'tracking_number', 'created_at', 'updated_at',
            'items', 'uploaded_files'
        )
        read_only_fields = ('profile', 'unit_price', 'total_images', 'total_price', 'tracking_number')

    def create(self, validated_data):
        profile = self.context['request'].user.profile
        uploaded_files = validated_data.pop('uploaded_files', [])
        
        # Calculate totals
        image_count = len(uploaded_files)
        service_type = validated_data.get('order_type', 'image_editing')
        turnaround = validated_data.get('turnaround_speed_hours', 48)

        active_sub = profile.subscriptions.filter(status='active').first()
        sub_plan_name = active_sub.plan.name if active_sub else 'Solo'

        price_data = calculate_order_price(
            service_type=service_type,
            image_count=image_count,
            turnaround_hours=turnaround,
            subscription_plan_name=sub_plan_name
        )

        order = Order.objects.create(
            profile=profile,
            unit_price=price_data['unit_price'],
            total_images=image_count,
            total_price=price_data['total_price'],
            **validated_data
        )

        for file_data in uploaded_files:
            OrderItem.objects.create(
                order=order,
                filename=file_data.get('filename', 'image.png'),
                original_url=file_data.get('url', 'https://via.placeholder.com/600'),
                file_size=file_data.get('size', 1024),
                width=file_data.get('width'),
                height=file_data.get('height'),
                status='uploaded'
            )

        return order
