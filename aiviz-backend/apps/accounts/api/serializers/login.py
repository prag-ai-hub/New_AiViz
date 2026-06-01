from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(help_text="Email or E.164 phone")
    password = serializers.CharField(write_only=True)
