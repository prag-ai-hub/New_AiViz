import re

from rest_framework import serializers

_LETTER = re.compile(r"[A-Za-z]")
_DIGIT = re.compile(r"\d")


def validate_password_strength(value: str) -> str:
    """Min 8 chars, must contain at least one letter and one digit."""
    if len(value) < 8:
        raise serializers.ValidationError(
            "Password must be at least 8 characters.", code="weak_password"
        )
    if not _LETTER.search(value) or not _DIGIT.search(value):
        raise serializers.ValidationError(
            "Password must contain at least one letter and one digit.",
            code="weak_password",
        )
    return value
