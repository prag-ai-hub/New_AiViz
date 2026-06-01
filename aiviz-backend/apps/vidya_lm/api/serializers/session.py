from rest_framework import serializers

from apps.vidya_lm.models import Session


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = [
            "id",
            "title",
            "grade_snapshot",
            "board_snapshot",
            "lang_snapshot",
            "system_prompt_version",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "grade_snapshot",
            "board_snapshot",
            "lang_snapshot",
            "system_prompt_version",
            "created_at",
            "updated_at",
        ]
