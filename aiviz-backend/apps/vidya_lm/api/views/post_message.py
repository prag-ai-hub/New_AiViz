from django.conf import settings
from django.http import StreamingHttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView

from apps.vidya_lm.api.renderers import ServerSentEventsRenderer
from apps.vidya_lm.api.serializers import MessageRequestSerializer
from apps.vidya_lm.selectors import get_owned_session
from apps.vidya_lm.services import OpenAIUnavailable, append_user_message, stream_assistant_reply
from core.quota import check_quota, increment_quota

TOOL_KEY = "vidya_lm"


class PostMessageView(APIView):
    permission_classes = [IsAuthenticated]
    renderer_classes = [ServerSentEventsRenderer, JSONRenderer]

    def post(self, request, session_pk: int):
        session = get_owned_session(pk=session_pk, user=request.user)

        serializer = MessageRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        content = serializer.validated_data["content"]

        if not getattr(settings, "VIDYA_LM", {}).get("OPENAI_API_KEY"):
            raise OpenAIUnavailable()

        check_quota(request.user, TOOL_KEY, 1)

        append_user_message(session=session, content=content)
        increment_quota(request.user, TOOL_KEY, 1)

        response = StreamingHttpResponse(
            stream_assistant_reply(session=session),
            content_type="text/event-stream",
        )
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response
