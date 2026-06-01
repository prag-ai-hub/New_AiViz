from rest_framework import serializers


class QuotaLimitSerializer(serializers.Serializer):
    used = serializers.IntegerField()
    limit = serializers.IntegerField(allow_null=True)
    remaining = serializers.IntegerField(allow_null=True)


class QuotaSnapshotSerializer(serializers.Serializer):
    plan_code = serializers.CharField()
    limits = serializers.DictField(child=QuotaLimitSerializer())
