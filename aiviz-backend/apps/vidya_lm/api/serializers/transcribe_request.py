from rest_framework import serializers

MAX_AUDIO_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_TYPES = {
    "audio/m4a",
    "audio/x-m4a",
    "audio/mp4",
    "audio/mpeg",
    "audio/webm",
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
}


class TranscribeRequestSerializer(serializers.Serializer):
    audio = serializers.FileField(required=True)

    def validate_audio(self, value):
        if value.size > MAX_AUDIO_BYTES:
            raise serializers.ValidationError("Audio file too large (max 10MB).")
        ctype = (getattr(value, "content_type", "") or "").lower()
        if ctype and ctype not in ALLOWED_TYPES:
            raise serializers.ValidationError(f"Unsupported audio type: {ctype}")
        return value
