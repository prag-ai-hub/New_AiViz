from rest_framework import serializers


TARGETS = (
    "vidya_lm",
    "image_gen",
    "code_helper",
    "speech_tutor",
    "music_gen",
    "video_gen",
    "avatar",
    "skillguru",
)


class ContinueWithRequestSerializer(serializers.Serializer):
    target = serializers.ChoiceField(choices=[(t, t) for t in TARGETS])
