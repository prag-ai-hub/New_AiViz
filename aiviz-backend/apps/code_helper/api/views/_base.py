from django.conf import settings
from django.http import StreamingHttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView

from apps.code_helper.api.serializers import CodeRequestSerializer
from apps.code_helper.constants import CodeAction
from apps.code_helper.services import stream_code_response
from apps.vidya_lm.api.renderers import ServerSentEventsRenderer
from apps.vidya_lm.services import OpenAIUnavailable
from core.quota import check_quota, increment_quota

TOOL_KEY = "code_helper"


class BaseCodeActionView(APIView):
    """Shared SSE view for all four /code/* actions.

    Subclasses set `action: CodeAction`.
    """

    permission_classes = [IsAuthenticated]
    renderer_classes = [ServerSentEventsRenderer, JSONRenderer]
    action: CodeAction = None  # type: ignore[assignment]

    def post(self, request):
        if not getattr(settings, "VIDYA_LM", {}).get("OPENAI_API_KEY"):
            raise OpenAIUnavailable()

        serializer = CodeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        check_quota(request.user, TOOL_KEY, 1)
        increment_quota(request.user, TOOL_KEY, 1)

        response = StreamingHttpResponse(
            stream_code_response(
                user=request.user,
                action=self.action,
                language=payload["language"],
                code=payload["code"],
                extra=payload.get("extra", ""),
            ),
            content_type="text/event-stream",
        )
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response
