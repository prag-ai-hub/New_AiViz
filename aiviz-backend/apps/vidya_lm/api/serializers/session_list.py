from rest_framework import serializers

from apps.vidya_lm.models import Session


class SessionListSerializer(serializers.ModelSerializer):
    message_count = serializers.IntegerField(read_only=True)
    last_message_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Session
        fields = [
            "id",
            "title",
            "grade_snapshot",
            "board_snapshot",
            "lang_snapshot",
            "message_count",
            "last_message_at",
            "created_at",
            "updated_at",
        ]
