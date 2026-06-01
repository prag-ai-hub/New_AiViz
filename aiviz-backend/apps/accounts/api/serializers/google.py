from rest_framework import serializers


class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField(max_length=4096, trim_whitespace=True)
