from rest_framework import serializers

from apps.accounts.constants import QUIZ_QUESTION_COUNT, LearningStyle


class LearningStyleQuizSerializer(serializers.Serializer):
    answers = serializers.ListField(
        child=serializers.ChoiceField(choices=LearningStyle.choices),
        min_length=QUIZ_QUESTION_COUNT,
        max_length=QUIZ_QUESTION_COUNT,
        help_text=f"Exactly {QUIZ_QUESTION_COUNT} chosen styles, one per question.",
    )
