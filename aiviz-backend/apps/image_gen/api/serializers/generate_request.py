from rest_framework import serializers

from apps.image_gen.constants import StylePreset


def _round_to_64(value: int) -> int:
    return max(512, min(1536, (value // 64) * 64))


class GenerateRequestSerializer(serializers.Serializer):
    prompt = serializers.CharField(
        max_length=1000,
        min_length=1,
        trim_whitespace=True,
    )
    style = serializers.ChoiceField(
        choices=StylePreset.choices,
        required=False,
        allow_blank=True,
        default="",
    )
    width = serializers.IntegerField(default=1024, min_value=512, max_value=1536)
    height = serializers.IntegerField(default=1024, min_value=512, max_value=1536)

    def validate(self, attrs):
        attrs["width"] = _round_to_64(attrs.get("width", 1024))
        attrs["height"] = _round_to_64(attrs.get("height", 1024))
        return attrs
