from rest_framework import serializers


class MessageRequestSerializer(serializers.Serializer):
    content = serializers.CharField(
        max_length=8000,
        min_length=1,
        trim_whitespace=True,
    )
