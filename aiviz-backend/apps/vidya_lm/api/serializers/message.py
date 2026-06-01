from rest_framework import serializers

from apps.vidya_lm.models import Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "role", "content", "model", "created_at"]
        read_only_fields = fields
