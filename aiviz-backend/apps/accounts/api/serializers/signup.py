from rest_framework import serializers

from apps.accounts.api.validators import validate_password_strength, validate_phone_e164
from apps.accounts.constants import SIGNUP_ALLOWED_ROLES, Role


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    phone = serializers.CharField(
        required=False, allow_blank=True, validators=[validate_phone_e164]
    )
    password = serializers.CharField(
        write_only=True, validators=[validate_password_strength]
    )
    role = serializers.ChoiceField(
        choices=[(r.value, r.label) for r in SIGNUP_ALLOWED_ROLES],
        default=Role.STUDENT.value,
    )
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=80)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=80)

    def validate_phone(self, value: str) -> str | None:
        return value or None
