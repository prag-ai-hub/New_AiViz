from rest_framework import serializers

from apps.billing.models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    plan_code = serializers.CharField(source="plan.code", read_only=True)
    plan_name = serializers.CharField(source="plan.name", read_only=True)

    class Meta:
        model = Subscription
        fields = ("plan_code", "plan_name", "status", "started_at", "ends_at")
        read_only_fields = fields
