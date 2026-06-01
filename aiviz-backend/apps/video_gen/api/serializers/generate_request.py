from rest_framework import serializers


class GenerateVideoRequestSerializer(serializers.Serializer):
    prompt = serializers.CharField(max_length=500, min_length=2, trim_whitespace=True)
