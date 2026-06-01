from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.selectors.get_profile_for_user import get_profile_for_user
from apps.image_gen.constants import StylePreset, styles_for_grade

_LABELS = dict(StylePreset.choices)


class StylesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_profile_for_user(request.user)
        grade = profile.grade if profile else None
        allowed = styles_for_grade(grade)
        items = [{"value": value, "label": _LABELS.get(value, value)} for value in allowed]
        return Response({"items": items})
