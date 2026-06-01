from rest_framework import serializers


class LanguageItemSerializer(serializers.Serializer):
    value = serializers.CharField()
    label = serializers.CharField()


class LanguagesResponseSerializer(serializers.Serializer):
    default = serializers.CharField()
    items = LanguageItemSerializer(many=True)
