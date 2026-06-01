from rest_framework import serializers

from apps.code_helper.constants import CodeLanguage


class CodeRequestSerializer(serializers.Serializer):
    code = serializers.CharField(
        max_length=20_000,
        min_length=1,
        trim_whitespace=True,
    )
    language = serializers.ChoiceField(choices=CodeLanguage.choices)
    extra = serializers.CharField(
        max_length=4000,
        required=False,
        allow_blank=True,
        default="",
        trim_whitespace=True,
    )
