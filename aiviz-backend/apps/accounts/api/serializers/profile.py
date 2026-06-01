from rest_framework import serializers

from apps.accounts.models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    # Override the JSONField-backed list fields so PATCH rejects raw strings/objects.
    subjects = serializers.ListField(
        child=serializers.CharField(max_length=64), required=False, allow_empty=True
    )
    goals = serializers.ListField(
        child=serializers.CharField(max_length=64), required=False, allow_empty=True
    )

    class Meta:
        model = Profile
        fields = ("grade", "board", "subjects", "lang", "learning_style", "goals", "updated_at")
        read_only_fields = ("updated_at",)
