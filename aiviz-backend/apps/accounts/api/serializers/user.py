from rest_framework import serializers

from apps.accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "phone",
            "role",
            "first_name",
            "last_name",
            "is_email_verified",
            "is_phone_verified",
            "date_joined",
        )
        read_only_fields = fields
