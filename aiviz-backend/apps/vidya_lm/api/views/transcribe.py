from django.conf import settings
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.vidya_lm.api.serializers import TranscribeRequestSerializer
from apps.vidya_lm.services import OpenAIUnavailable, transcribe_upload


class TranscribeView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if not getattr(settings, "VIDYA_LM", {}).get("OPENAI_API_KEY"):
            raise OpenAIUnavailable()

        serializer = TranscribeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        upload = serializer.validated_data["audio"]

        text = transcribe_upload(upload=upload)
        return Response({"text": text})
