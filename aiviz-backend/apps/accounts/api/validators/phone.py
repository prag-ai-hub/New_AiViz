import re

from rest_framework import serializers

_E164 = re.compile(r"^\+[1-9]\d{6,14}$")


def validate_phone_e164(value: str) -> str:
    """Reject anything that isn't strict E.164 (e.g. +919876543210)."""
    if not _E164.match(value):
        raise serializers.ValidationError(
            "Phone must be in E.164 format (e.g. +919876543210).",
            code="invalid_phone",
        )
    return value
