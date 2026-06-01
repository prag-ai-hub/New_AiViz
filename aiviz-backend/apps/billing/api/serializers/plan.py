from rest_framework import serializers

from apps.billing.models import Plan


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ("code", "name", "price_inr", "billing_period", "features")
        read_only_fields = fields
