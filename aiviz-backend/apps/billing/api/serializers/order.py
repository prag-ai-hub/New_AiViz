from rest_framework import serializers

from apps.billing.models import RazorpayOrder


class OrderRequestSerializer(serializers.Serializer):
    plan_code = serializers.ChoiceField(choices=["pro", "family", "institution"])


class OrderResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = RazorpayOrder
        fields = (
            "razorpay_order_id",
            "razorpay_payment_link_id",
            "payment_link_short_url",
            "amount_inr",
            "currency",
            "status",
            "plan_code",
            "receipt_id",
            "created_at",
        )
        read_only_fields = fields
