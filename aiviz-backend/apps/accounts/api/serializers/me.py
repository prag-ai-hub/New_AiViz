from rest_framework import serializers

from apps.accounts.selectors.get_profile_for_user import get_profile_for_user

from .profile import ProfileSerializer
from .user import UserSerializer


class MeSerializer(serializers.Serializer):
    user = UserSerializer(source="*")
    profile = serializers.SerializerMethodField()

    def get_profile(self, instance) -> dict | None:
        profile = get_profile_for_user(instance)
        return ProfileSerializer(profile).data if profile else None
