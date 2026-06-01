from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.selectors.get_profile_for_user import get_profile_for_user
from apps.code_helper.constants import CodeLanguage, default_language_for_grade


class LanguagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_profile_for_user(request.user)
        grade = profile.grade if profile else None
        items = [{"value": value, "label": label} for value, label in CodeLanguage.choices]
        return Response(
            {
                "default": default_language_for_grade(grade),
                "items": items,
            }
        )
